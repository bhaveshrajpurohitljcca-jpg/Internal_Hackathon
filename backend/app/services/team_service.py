import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, or_
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.team import Team, TeamMember, TeamInvitation, TeamRole, InvitationStatus
from app.models.user import User
from app.schemas.team import TeamCreate, TeamUpdate, TeamInvitationCreate

class TeamService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[Team]:
        return db.execute(select(Team).where(Team.id == id)).scalar_one_or_none()

    def get_all(self, db: Session, page: int = 1, page_size: int = 10, search: Optional[str] = None):
        query = select(Team)
        if search:
            query = query.where(Team.name.ilike(f"%{search}%"))
        
        total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        query = query.order_by(desc(Team.created_at)).offset((page - 1) * page_size).limit(page_size)
        
        items = db.execute(query).scalars().all()
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "items": items
        }

    def get_teams_for_user(self, db: Session, user_id: uuid.UUID) -> List[Team]:
        members = db.execute(select(TeamMember).where(TeamMember.user_id == user_id)).scalars().all()
        return [m.team for m in members]
        
    def get_team_for_hackathon(self, db: Session, user_id: uuid.UUID, hackathon_id: uuid.UUID) -> Optional[Team]:
        member = db.execute(
            select(TeamMember)
            .join(Team, Team.id == TeamMember.team_id)
            .where(TeamMember.user_id == user_id, Team.hackathon_id == hackathon_id)
        ).scalars().first()
        if member:
            return member.team
        return None

    def create(self, db: Session, *, obj_in: TeamCreate, leader_id: uuid.UUID) -> Team:
        if obj_in.hackathon_id:
            if self.get_team_for_hackathon(db, leader_id, obj_in.hackathon_id):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a team for this hackathon")

        db_obj = Team(
            name=obj_in.name,
            leader_id=leader_id,
            hackathon_id=obj_in.hackathon_id
        )
        db.add(db_obj)
        db.flush()

        leader_member = TeamMember(
            team_id=db_obj.id,
            user_id=leader_id,
            role=TeamRole.LEADER
        )
        db.add(leader_member)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Team, obj_in: TeamUpdate) -> Team:
        if obj_in.name:
            db_obj.name = obj_in.name
        if obj_in.logo_url:
            db_obj.logo_url = obj_in.logo_url
        if obj_in.banner_url:
            db_obj.banner_url = obj_in.banner_url
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: uuid.UUID) -> Team:
        obj = self.get(db, id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def invite_member(self, db: Session, team: Team, invite_in: TeamInvitationCreate) -> TeamInvitation:
        # Check if user exists
        user = db.execute(select(User).where(User.email == invite_in.invitee_email)).scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found. They must register first.")
        
        # Check if already in this team
        existing_member = db.execute(select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == user.id)).scalar_one_or_none()
        if existing_member:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already in the team")
            
        # Check if they are already in another team for this same hackathon
        if team.hackathon_id and self.get_team_for_hackathon(db, user.id, team.hackathon_id):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already in another team for this hackathon")
        
        # Check if already invited
        existing_invite = db.execute(
            select(TeamInvitation).where(
                TeamInvitation.team_id == team.id, 
                TeamInvitation.invitee_email == invite_in.invitee_email,
                TeamInvitation.status == InvitationStatus.PENDING
            )
        ).scalar_one_or_none()
        
        if existing_invite:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already has a pending invitation")

        invite = TeamInvitation(
            team_id=team.id,
            invitee_email=invite_in.invitee_email,
            status=InvitationStatus.PENDING
        )
        db.add(invite)
        db.commit()
        db.refresh(invite)
        return invite

    def respond_to_invite(self, db: Session, invite_id: uuid.UUID, user: User, accept: bool) -> TeamInvitation:
        invite = db.execute(select(TeamInvitation).where(TeamInvitation.id == invite_id)).scalar_one_or_none()
        if not invite:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
        
        if invite.invitee_email != user.email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to respond to this invitation")
            
        if invite.status != InvitationStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation already processed")

        if accept:
            # Check if user is already in another team for this hackathon
            if invite.team.hackathon_id and self.get_team_for_hackathon(db, user.id, invite.team.hackathon_id):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already in a team for this hackathon. Leave your current team first.")
            
            invite.status = InvitationStatus.ACCEPTED
            member = TeamMember(
                team_id=invite.team_id,
                user_id=user.id,
                role=TeamRole.MEMBER
            )
            db.add(member)
        else:
            invite.status = InvitationStatus.REJECTED
            
        db.commit()
        db.refresh(invite)
        return invite

    def remove_member(self, db: Session, team: Team, user_id: uuid.UUID) -> None:
        if team.leader_id == user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot remove the team leader. Transfer leadership or delete the team.")
            
        member = db.execute(select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == user_id)).scalar_one_or_none()
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found in this team")
            
        db.delete(member)
        db.commit()

    def transfer_leadership(self, db: Session, team: Team, new_leader_id: uuid.UUID) -> Team:
        if team.leader_id == new_leader_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already the leader")
            
        new_leader_member = db.execute(select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == new_leader_id)).scalar_one_or_none()
        if not new_leader_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="New leader must be a member of the team")
            
        current_leader_member = db.execute(select(TeamMember).where(TeamMember.team_id == team.id, TeamMember.user_id == team.leader_id)).scalar_one_or_none()
        
        team.leader_id = new_leader_id
        new_leader_member.role = TeamRole.LEADER
        if current_leader_member:
            current_leader_member.role = TeamRole.MEMBER
            db.add(current_leader_member)
            
        db.add(team)
        db.add(new_leader_member)
        db.commit()
        db.refresh(team)
        return team
        
    def leave_team(self, db: Session, team: Team, user_id: uuid.UUID) -> None:
        if team.leader_id == user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Leader cannot leave directly. Transfer leadership or delete the team.")
        self.remove_member(db, team, user_id)

    def get_my_invitations(self, db: Session, email: str) -> List[TeamInvitation]:
        return db.execute(
            select(TeamInvitation).where(
                TeamInvitation.invitee_email == email,
                TeamInvitation.status == InvitationStatus.PENDING
            ).order_by(desc(TeamInvitation.created_at))
        ).scalars().all()

team_service = TeamService()
