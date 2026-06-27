import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Path

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_active_admin
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse, EvaluationListResponse
from app.services.evaluation_service import evaluation_service

router = APIRouter()

def check_evaluator_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.JUDGE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and judges can evaluate submissions"
        )
    return current_user

@router.post("", response_model=EvaluationResponse)
def evaluate_submission(
    *,
    db: Session = Depends(get_db),
    eval_in: EvaluationCreate,
    current_user: User = Depends(check_evaluator_role),
) -> Any:
    """
    Evaluate a submission. If evaluated by the same judge, it updates the existing evaluation.
    """
    return evaluation_service.evaluate(db, eval_in=eval_in, judge_id=current_user.id)

@router.post("/declare-winners/{problem_statement_id}")
def declare_winners(
    *,
    db: Session = Depends(get_db),
    problem_statement_id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_active_admin),
) -> Any:
    """
    Automatically calculate and declare 1st, 2nd, and 3rd place winners based on highest total scores.
    """
    evaluation_service.declare_winners(db, problem_statement_id=problem_statement_id)
    return {"message": "Winners declared successfully"}
