import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, Path

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin, get_current_user
from app.models.user import User
from app.models.enums import SubmissionStatus
from app.schemas.submission import (
    SubmissionUpdate,
    SubmissionAdminUpdate,
    SubmissionResponse,
    SubmissionListResponse,
)
from app.services.submission_service import submission_service

router = APIRouter()

@router.get("", response_model=SubmissionListResponse)
def get_all_submissions(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_active_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    registration_id: Optional[uuid.UUID] = None,
    problem_statement_id: Optional[uuid.UUID] = None,
    status: Optional[SubmissionStatus] = None,
) -> Any:
    """
    Retrieve all submissions. Admin only.
    """
    return submission_service.get_all(
        db, 
        page=page, 
        page_size=page_size, 
        registration_id=registration_id,
        problem_statement_id=problem_statement_id,
        status=status,
    )

@router.get("/{id}", response_model=SubmissionResponse)
def get_submission(
    id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific submission.
    """
    submission = submission_service.get(db, id)
    if not submission:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        
    from app.services.registration_service import registration_service
    from app.models.enums import UserRole
    registration = registration_service.get(db, submission.registration_id)
    if not registration or (current_user.role != UserRole.ADMIN and registration.user_id != current_user.id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this submission")
        
    return submission

@router.get("/by-registration/{registration_id}", response_model=SubmissionResponse)
def get_submission_by_registration(
    registration_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific submission by registration ID.
    """
    submission = submission_service.get_by_registration(db, registration_id)
    if not submission:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
        
    from app.services.registration_service import registration_service
    from app.models.enums import UserRole
    registration = registration_service.get(db, registration_id)
    if not registration or (current_user.role != UserRole.ADMIN and registration.user_id != current_user.id):
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this submission")
        
    return submission

@router.put("/{id}", response_model=SubmissionResponse)
def update_submission(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    submission_in: SubmissionUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a submission. Students only (checked by service).
    """
    return submission_service.update_by_student(db, id, obj_in=submission_in, user_id=current_user.id)

@router.patch("/{id}/admin", response_model=SubmissionResponse)
def admin_update_submission(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    submission_in: SubmissionAdminUpdate,
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Update submission status. Admin only.
    """
    return submission_service.admin_update(db, id, obj_in=submission_in)
