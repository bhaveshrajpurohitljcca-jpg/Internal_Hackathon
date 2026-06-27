import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, Path

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.schemas.problem_statement import (
    ProblemStatementCreate,
    ProblemStatementUpdate,
    ProblemStatementResponse,
    ProblemStatementListResponse,
)
from app.services.problem_statement_service import problem_statement_service

router = APIRouter()

@router.get("", response_model=ProblemStatementListResponse)
def get_problem_statements(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_active_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    hackathon_id: Optional[uuid.UUID] = None,
    is_published: Optional[bool] = None,
) -> Any:
    """
    Retrieve all problem statements. Admin only.
    """
    return problem_statement_service.get_all(
        db, 
        page=page, 
        page_size=page_size, 
        search=search, 
        hackathon_id=hackathon_id,
        is_published=is_published,
    )

@router.get("/{id}", response_model=ProblemStatementResponse)
def get_problem_statement(
    id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Get a specific problem statement. Admin only.
    """
    problem = problem_statement_service.get(db, id)
    if not problem:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem statement not found")
    return problem

@router.post("", response_model=ProblemStatementResponse)
def create_problem_statement(
    *,
    db: Session = Depends(get_db),
    problem_in: ProblemStatementCreate,
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Create new problem statement. Admin only.
    """
    return problem_statement_service.create(db, obj_in=problem_in)

@router.put("/{id}", response_model=ProblemStatementResponse)
def update_problem_statement(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    problem_in: ProblemStatementUpdate,
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Update an existing problem statement. Admin only.
    """
    problem = problem_statement_service.get(db, id)
    if not problem:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem statement not found")
    return problem_statement_service.update(db, db_obj=problem, obj_in=problem_in)

@router.delete("/{id}", response_model=ProblemStatementResponse)
def delete_problem_statement(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Delete a problem statement. Admin only.
    """
    return problem_statement_service.delete(db, id)

@router.patch("/{id}/publish", response_model=ProblemStatementResponse)
def publish_problem_statement(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Publish a problem statement. Admin only.
    """
    return problem_statement_service.set_publish_status(db, id, is_published=True)

@router.patch("/{id}/unpublish", response_model=ProblemStatementResponse)
def unpublish_problem_statement(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    current_admin=Depends(get_current_active_admin),
) -> Any:
    """
    Unpublish a problem statement. Admin only.
    """
    return problem_statement_service.set_publish_status(db, id, is_published=False)
