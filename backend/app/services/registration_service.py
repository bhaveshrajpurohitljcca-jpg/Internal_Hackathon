import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.registration import Registration
from app.models.submission import Submission
from app.models.hackathon import Hackathon
from app.models.problem_statement import ProblemStatement
from app.models.enums import RegistrationStatus, HackathonStatus, SubmissionStatus
from app.schemas.registration import RegistrationCreate, RegistrationUpdate, RegistrationListResponse

class RegistrationService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[Registration]:
        return db.execute(select(Registration).where(Registration.id == id)).scalar_one_or_none()

    def get_by_user_and_hackathon(self, db: Session, user_id: uuid.UUID, hackathon_id: uuid.UUID) -> Optional[Registration]:
        return db.execute(
            select(Registration).where(
                Registration.user_id == user_id,
                Registration.hackathon_id == hackathon_id
            )
        ).scalar_one_or_none()

    def create(self, db: Session, *, obj_in: RegistrationCreate, user_id: uuid.UUID) -> Registration:
        from app.models.team import Team, TeamMember
        
        # 0. Get user's active team for this hackathon
        team = db.execute(
            select(Team)
            .join(TeamMember)
            .where(
                TeamMember.user_id == user_id, 
                Team.hackathon_id == obj_in.hackathon_id
            )
        ).scalars().first()
        if not team:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You must create or join a team for this hackathon first")
            
        if team.leader_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the team leader can register the team for a hackathon")

        # 1. Validate Hackathon
        hackathon = db.execute(select(Hackathon).where(Hackathon.id == obj_in.hackathon_id)).scalar_one_or_none()
        if not hackathon:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hackathon not found")
        
        now = datetime.now(timezone.utc)
        if now < hackathon.registration_start_date or now > hackathon.registration_end_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hackathon registration is closed")

        # 2. Validate Team Members (Min, Max, Female Count, Departments)
        member_count = len(team.members)
        if member_count < hackathon.min_team_members:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Minimum {hackathon.min_team_members} members required")
        if member_count > hackathon.max_team_members:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Maximum {hackathon.max_team_members} members allowed")
            
        if not hackathon.allow_individual and member_count == 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Individual participation is not allowed")

        female_count = sum(1 for m in team.members if m.user.gender and m.user.gender.lower() == 'female')
        if hackathon.min_female_members > 0 and female_count < hackathon.min_female_members:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Minimum {hackathon.min_female_members} female member(s) required")
        if hackathon.max_female_members is not None and female_count > hackathon.max_female_members:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Maximum {hackathon.max_female_members} female member(s) allowed")
            
        if not hackathon.allow_cross_department:
            departments = set(m.user.department for m in team.members if m.user.department)
            if len(departments) > 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cross-department teams are not allowed")

        # 3. Check maximum teams for hackathon
        if hackathon.max_teams is not None:
            team_count = db.execute(select(func.count(Registration.id)).where(Registration.hackathon_id == hackathon.id)).scalar()
            if team_count >= hackathon.max_teams:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hackathon has reached maximum team capacity")

        # 4. Validate Problem Statement
        problem = db.execute(select(ProblemStatement).where(ProblemStatement.id == obj_in.problem_statement_id)).scalar_one_or_none()
        if not problem or problem.hackathon_id != obj_in.hackathon_id or not problem.is_published:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or unpublished problem statement")

        # 5. Check for duplicate registration (Team already registered)
        existing_reg = db.execute(
            select(Registration).where(
                Registration.team_id == team.id,
                Registration.hackathon_id == obj_in.hackathon_id
            )
        ).scalar_one_or_none()
        if existing_reg:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your team has already registered for this hackathon")

        # 6. Check if multiple teams per student is allowed (this check is implicitly handled because they can only have ONE team per hackathon now, but we keep it safe)
        if not hackathon.allow_multiple_teams_per_student:
            for member in team.members:
                # Does this member have ANY registration in this hackathon via ANY team?
                member_reg = db.execute(
                    select(Registration)
                    .join(Team, Team.id == Registration.team_id)
                    .join(TeamMember, TeamMember.team_id == Team.id)
                    .where(
                        TeamMember.user_id == member.user_id,
                        Registration.hackathon_id == obj_in.hackathon_id,
                        Team.id != team.id
                    )
                ).scalar_one_or_none()
                if member_reg:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Member {member.user.full_name} is already registered in another team for this hackathon")

        # 7. Create Registration
        db_obj = Registration(
            hackathon_id=obj_in.hackathon_id,
            user_id=user_id,
            leader_id=user_id,
            team_id=team.id,
            problem_statement_id=obj_in.problem_statement_id,
            status=RegistrationStatus.PENDING
        )
        db.add(db_obj)
        db.flush() # flush to get db_obj.id

        # 6. Create Draft Submission
        db_sub = Submission(
            registration_id=db_obj.id,
            problem_statement_id=obj_in.problem_statement_id,
            status=SubmissionStatus.DRAFT
        )
        db.add(db_sub)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Registration, obj_in: RegistrationUpdate) -> Registration:
        db_obj.status = obj_in.status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def approve(self, db: Session, *, db_obj: Registration, admin_id: uuid.UUID) -> Registration:
        db_obj.status = RegistrationStatus.APPROVED
        db_obj.approved_by = admin_id
        db_obj.approved_at = datetime.now(timezone.utc)
        db_obj.admin_remarks = None
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def reject(self, db: Session, *, db_obj: Registration, remarks: Optional[str]) -> Registration:
        db_obj.status = RegistrationStatus.REJECTED
        db_obj.admin_remarks = remarks
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_all(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        hackathon_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        status: Optional[RegistrationStatus] = None
    ) -> dict:
        query = select(Registration)

        if search:
            query = query.filter(Registration.team_name.ilike(f"%{search}%"))
        
        if hackathon_id:
            query = query.filter(Registration.hackathon_id == hackathon_id)
            
        if user_id:
            query = query.filter(Registration.user_id == user_id)
            
        if status:
            query = query.filter(Registration.status == status)

        query = query.order_by(desc(Registration.created_at))

        total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        items = db.execute(query).scalars().all()
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

registration_service = RegistrationService()
