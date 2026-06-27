from typing import Optional
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.enums import HackathonStatus
from app.schemas.hackathon import (
    HackathonCreate,
    HackathonUpdate,
    HackathonResponse,
    PaginatedResponse
)
from app.schemas.problem_statement import ProblemStatementListResponse, ProblemStatementResponse
from app.api.deps import get_current_user, get_current_active_admin
from app.services import hackathon_service
from app.schemas.response import success_response

router = APIRouter()

@router.get("", response_model=PaginatedResponse[HackathonResponse])
def read_hackathons(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[HackathonStatus] = None,
    sort_by: str = Query("latest", regex="^(latest|deadline)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Students and Admins can view
):
    """
    Retrieve hackathons with pagination, filtering, and sorting.
    """
    result = hackathon_service.get_hackathons(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        sort_by=sort_by
    )
    return result

@router.get("/{slug}", response_model=HackathonResponse)
def read_hackathon_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific hackathon by its slug.
    """
    hackathon = hackathon_service.get_hackathon_by_slug(db, slug)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return hackathon

@router.post("", response_model=HackathonResponse, status_code=status.HTTP_201_CREATED)
def create_hackathon(
    hackathon_in: HackathonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Create a new hackathon (Admin only).
    """
    return hackathon_service.create_hackathon(db, hackathon_in, user_id=current_user.id)

@router.put("/{hackathon_id}", response_model=HackathonResponse)
def update_hackathon(
    hackathon_id: uuid.UUID,
    hackathon_in: HackathonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Update a hackathon (Admin only).
    """
    return hackathon_service.update_hackathon(db, hackathon_id, hackathon_in)

@router.delete("/{hackathon_id}")
def delete_hackathon(
    hackathon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Delete a hackathon (Admin only).
    """
    hackathon_service.delete_hackathon(db, hackathon_id)
    return success_response(message="Hackathon deleted successfully")

@router.get("/{slug}/problem-statements", response_model=ProblemStatementListResponse)
def get_hackathon_problem_statements(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get published problem statements for a specific hackathon. Open to all students.
    """
    hackathon = hackathon_service.get_hackathon_by_slug(db, slug)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    from app.services.problem_statement_service import problem_statement_service
    return problem_statement_service.get_all(
        db, 
        page=page, 
        page_size=page_size, 
        hackathon_id=hackathon.id,
        is_published=True,
    )

@router.get("/{slug}/problem-statements/{problem_id}", response_model=ProblemStatementResponse)
def get_hackathon_problem_statement_details(
    slug: str,
    problem_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific published problem statement. Open to all students.
    """
    hackathon = hackathon_service.get_hackathon_by_slug(db, slug)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
        
    from app.services.problem_statement_service import problem_statement_service
    problem = problem_statement_service.get(db, problem_id)
    
    if not problem or problem.hackathon_id != hackathon.id or not problem.is_published:
        raise HTTPException(status_code=404, detail="Problem statement not found")
        
    return problem

