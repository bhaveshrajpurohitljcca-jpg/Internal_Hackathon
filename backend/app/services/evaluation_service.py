import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.models.evaluation import Evaluation
from app.models.submission import Submission
from app.models.enums import SubmissionStatus
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate

class EvaluationService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[Evaluation]:
        return db.execute(select(Evaluation).where(Evaluation.id == id)).scalar_one_or_none()

    def get_by_submission_and_judge(self, db: Session, submission_id: uuid.UUID, judge_id: uuid.UUID) -> Optional[Evaluation]:
        return db.execute(
            select(Evaluation).where(
                Evaluation.submission_id == submission_id,
                Evaluation.judge_id == judge_id
            )
        ).scalar_one_or_none()

    def calculate_total(self, eval_in: EvaluationCreate | EvaluationUpdate) -> float:
        return (
            eval_in.innovation_score +
            eval_in.technical_score +
            eval_in.presentation_score +
            eval_in.impact_score +
            eval_in.ui_ux_score +
            eval_in.documentation_score
        )

    def evaluate(self, db: Session, *, eval_in: EvaluationCreate, judge_id: uuid.UUID) -> Evaluation:
        submission = db.execute(select(Submission).where(Submission.id == eval_in.submission_id)).scalar_one_or_none()
        if not submission:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        
        if submission.status not in [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission is not ready for review")

        existing_eval = self.get_by_submission_and_judge(db, eval_in.submission_id, judge_id)
        
        total_score = self.calculate_total(eval_in)

        if existing_eval:
            # Update existing
            existing_eval.innovation_score = eval_in.innovation_score
            existing_eval.technical_score = eval_in.technical_score
            existing_eval.presentation_score = eval_in.presentation_score
            existing_eval.impact_score = eval_in.impact_score
            existing_eval.ui_ux_score = eval_in.ui_ux_score
            existing_eval.documentation_score = eval_in.documentation_score
            existing_eval.remarks = eval_in.remarks
            existing_eval.total_score = total_score
            db_obj = existing_eval
        else:
            # Create new
            db_obj = Evaluation(
                submission_id=eval_in.submission_id,
                judge_id=judge_id,
                innovation_score=eval_in.innovation_score,
                technical_score=eval_in.technical_score,
                presentation_score=eval_in.presentation_score,
                impact_score=eval_in.impact_score,
                ui_ux_score=eval_in.ui_ux_score,
                documentation_score=eval_in.documentation_score,
                remarks=eval_in.remarks,
                total_score=total_score
            )
            db.add(db_obj)
            
        submission.status = SubmissionStatus.UNDER_REVIEW
        db.commit()
        db.refresh(db_obj)
        
        # Update submission average score
        self.update_submission_score(db, submission.id)
        
        return db_obj

    def update_submission_score(self, db: Session, submission_id: uuid.UUID) -> None:
        submission = db.execute(select(Submission).where(Submission.id == submission_id)).scalar_one_or_none()
        if submission:
            avg_score = db.execute(
                select(func.avg(Evaluation.total_score)).where(Evaluation.submission_id == submission_id)
            ).scalar()
            submission.score = float(avg_score) if avg_score else 0.0
            db.commit()

    def generate_leaderboard(self, db: Session, problem_statement_id: uuid.UUID) -> List[Submission]:
        # Sort submissions by score descending
        submissions = db.execute(
            select(Submission)
            .where(Submission.problem_statement_id == problem_statement_id, Submission.score > 0)
            .order_by(desc(Submission.score))
        ).scalars().all()
        return list(submissions)
        
    def declare_winners(self, db: Session, problem_statement_id: uuid.UUID) -> None:
        submissions = self.generate_leaderboard(db, problem_statement_id)
        
        # Reset all placements for this problem statement
        db.execute(
            select(Submission).where(Submission.problem_statement_id == problem_statement_id)
        ).scalars().all() # Just to fetch them if needed
        # Or just update directly
        
        for idx, sub in enumerate(submissions):
            if idx == 0:
                sub.placement = 1
                sub.status = SubmissionStatus.ACCEPTED
            elif idx == 1:
                sub.placement = 2
                sub.status = SubmissionStatus.ACCEPTED
            elif idx == 2:
                sub.placement = 3
                sub.status = SubmissionStatus.ACCEPTED
            else:
                sub.placement = None
                sub.status = SubmissionStatus.REJECTED
        db.commit()

evaluation_service = EvaluationService()
