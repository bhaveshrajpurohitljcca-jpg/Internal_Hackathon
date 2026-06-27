import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc, asc
from fastapi import HTTPException
from slugify import slugify

from app.models.hackathon import Hackathon
from app.models.enums import HackathonStatus
from app.schemas.hackathon import HackathonCreate, HackathonUpdate, PaginatedResponse

def get_hackathon_by_slug(db: Session, slug: str) -> Optional[Hackathon]:
    return db.execute(select(Hackathon).where(Hackathon.slug == slug)).scalar_one_or_none()

def get_hackathon_by_id(db: Session, hackathon_id: uuid.UUID) -> Optional[Hackathon]:
    return db.execute(select(Hackathon).where(Hackathon.id == hackathon_id)).scalar_one_or_none()

def generate_unique_slug(db: Session, title: str) -> str:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while get_hackathon_by_slug(db, slug):
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug

def create_hackathon(db: Session, hackathon_in: HackathonCreate, user_id: uuid.UUID) -> Hackathon:
    # Check uniqueness of title implicitly via slug
    slug = generate_unique_slug(db, hackathon_in.title)
    
    db_hackathon = Hackathon(
        **hackathon_in.model_dump(),
        slug=slug,
        created_by=user_id,
        status=HackathonStatus.UPCOMING
    )
    db.add(db_hackathon)
    db.commit()
    db.refresh(db_hackathon)
    return db_hackathon

def validate_status_transition(current_status: HackathonStatus, new_status: HackathonStatus):
    flow = {
        HackathonStatus.UPCOMING: [HackathonStatus.REGISTRATION_OPEN],
        HackathonStatus.REGISTRATION_OPEN: [HackathonStatus.SUBMISSION_OPEN],
        HackathonStatus.SUBMISSION_OPEN: [HackathonStatus.CLOSED],
        HackathonStatus.CLOSED: []
    }
    
    if new_status not in flow.get(current_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from {current_status} to {new_status}"
        )

def update_hackathon(db: Session, hackathon_id: uuid.UUID, hackathon_in: HackathonUpdate) -> Hackathon:
    db_hackathon = get_hackathon_by_id(db, hackathon_id)
    if not db_hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    update_data = hackathon_in.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] != db_hackathon.status:
        validate_status_transition(db_hackathon.status, update_data["status"])

    if "title" in update_data and update_data["title"] != db_hackathon.title:
        update_data["slug"] = generate_unique_slug(db, update_data["title"])

    for field, value in update_data.items():
        setattr(db_hackathon, field, value)

    # Re-validate dates if they changed
    if db_hackathon.registration_end_date <= db_hackathon.registration_start_date:
        raise HTTPException(status_code=400, detail="Registration end date must be after start date")
    if db_hackathon.submission_deadline <= db_hackathon.registration_end_date:
        raise HTTPException(status_code=400, detail="Submission deadline must be after registration end date")

    db.commit()
    db.refresh(db_hackathon)
    return db_hackathon

def delete_hackathon(db: Session, hackathon_id: uuid.UUID) -> None:
    db_hackathon = get_hackathon_by_id(db, hackathon_id)
    if not db_hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    try:
        db.delete(db_hackathon)
        db.commit()
    except Exception as e:
        db.rollback()
        import sqlalchemy.exc
        if isinstance(e, sqlalchemy.exc.IntegrityError):
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete this hackathon because it has active registrations, submissions, or problem statements linked to it."
            )
        raise e

def get_hackathons(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    status: Optional[HackathonStatus] = None,
    sort_by: str = "latest"  # 'latest' or 'deadline'
):
    query = select(Hackathon)

    if search:
        query = query.where(Hackathon.title.ilike(f"%{search}%"))
    if status:
        query = query.where(Hackathon.status == status)

    if sort_by == "deadline":
        query = query.order_by(Hackathon.submission_deadline.asc())
    else:
        query = query.order_by(Hackathon.created_at.desc())

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    items = db.execute(query).scalars().all()
    
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }
