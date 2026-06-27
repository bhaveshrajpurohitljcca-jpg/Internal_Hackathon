import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.submission import Submission
from app.models.registration import Registration
from app.models.hackathon import Hackathon
from app.models.enums import SubmissionStatus
from app.schemas.submission import SubmissionUpdate, SubmissionAdminUpdate, SubmissionListResponse

class SubmissionService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[Submission]:
        return db.execute(select(Submission).where(Submission.id == id)).scalar_one_or_none()

    def get_by_registration(self, db: Session, registration_id: uuid.UUID) -> Optional[Submission]:
        return db.execute(select(Submission).where(Submission.registration_id == registration_id)).scalar_one_or_none()

    def update_by_student(self, db: Session, id: uuid.UUID, obj_in: SubmissionUpdate, user_id: uuid.UUID) -> Submission:
        submission = self.get(db, id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

        registration = db.execute(select(Registration).where(Registration.id == submission.registration_id)).scalar_one()
        if registration.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this submission")
            
        from app.models.enums import RegistrationStatus
        if registration.status != RegistrationStatus.APPROVED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration must be approved before you can submit")

        hackathon = db.execute(select(Hackathon).where(Hackathon.id == registration.hackathon_id)).scalar_one()
        now = datetime.now(timezone.utc)
        if now > hackathon.submission_deadline:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission deadline has passed")

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(submission, field, value)
            
        submission.status = SubmissionStatus.SUBMITTED

        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission

    def admin_update(self, db: Session, id: uuid.UUID, obj_in: SubmissionAdminUpdate) -> Submission:
        submission = self.get(db, id)
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(submission, field, value)

        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission

    def get_all(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 10,
        registration_id: Optional[uuid.UUID] = None,
        problem_statement_id: Optional[uuid.UUID] = None,
        status: Optional[SubmissionStatus] = None
    ) -> dict:
        query = select(Submission)

        if registration_id:
            query = query.filter(Submission.registration_id == registration_id)
            
        if problem_statement_id:
            query = query.filter(Submission.problem_statement_id == problem_statement_id)
            
        if status:
            query = query.filter(Submission.status == status)

        query = query.order_by(desc(Submission.created_at))

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

submission_service = SubmissionService()
