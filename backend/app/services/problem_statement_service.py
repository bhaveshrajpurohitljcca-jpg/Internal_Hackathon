import math
import uuid
from typing import Any, Dict, Optional, Tuple

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.problem_statement import ProblemStatement
from app.schemas.problem_statement import ProblemStatementCreate, ProblemStatementUpdate, ProblemStatementListResponse

class ProblemStatementService:
    def get(self, db: Session, id: uuid.UUID) -> Optional[ProblemStatement]:
        return db.execute(select(ProblemStatement).filter(ProblemStatement.id == id)).scalar_one_or_none()
        
    def get_by_code(self, db: Session, problem_code: str) -> Optional[ProblemStatement]:
        return db.execute(select(ProblemStatement).filter(ProblemStatement.problem_code == problem_code)).scalar_one_or_none()

    def get_all(
        self, 
        db: Session, 
        page: int = 1, 
        page_size: int = 10, 
        search: Optional[str] = None,
        hackathon_id: Optional[uuid.UUID] = None,
        is_published: Optional[bool] = None,
    ) -> Dict[str, Any]:
        query = select(ProblemStatement)

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (ProblemStatement.title.ilike(search_filter)) |
                (ProblemStatement.problem_code.ilike(search_filter)) |
                (ProblemStatement.category.ilike(search_filter))
            )
            
        if hackathon_id:
            query = query.filter(ProblemStatement.hackathon_id == hackathon_id)
            
        if is_published is not None:
            query = query.filter(ProblemStatement.is_published == is_published)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar_one()

        # Get paginated items
        query = query.order_by(ProblemStatement.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        items = db.execute(query).scalars().all()

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    def create(self, db: Session, obj_in: ProblemStatementCreate) -> ProblemStatement:
        if self.get_by_code(db, obj_in.problem_code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Problem code already exists",
            )
            
        db_obj = ProblemStatement(
            hackathon_id=obj_in.hackathon_id,
            problem_code=obj_in.problem_code,
            title=obj_in.title,
            description=obj_in.description,
            difficulty=obj_in.difficulty,
            category=obj_in.category,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: ProblemStatement, obj_in: ProblemStatementUpdate
    ) -> ProblemStatement:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: uuid.UUID) -> ProblemStatement:
        db_obj = self.get(db, id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem statement not found")
        db.delete(db_obj)
        db.commit()
        return db_obj
        
    def set_publish_status(self, db: Session, id: uuid.UUID, is_published: bool) -> ProblemStatement:
        db_obj = self.get(db, id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem statement not found")
            
        db_obj.is_published = is_published
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

problem_statement_service = ProblemStatementService()
