from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.enums import ProblemDifficulty

class ProblemStatementBase(BaseModel):
    problem_code: str = Field(..., description="Unique problem code (e.g., PS-001)")
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    difficulty: ProblemDifficulty
    category: str = Field(..., min_length=2, max_length=50)

class ProblemStatementCreate(ProblemStatementBase):
    hackathon_id: UUID

class ProblemStatementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10)
    difficulty: Optional[ProblemDifficulty] = None
    category: Optional[str] = Field(None, min_length=2, max_length=50)

class ProblemStatementResponse(ProblemStatementBase):
    id: UUID
    hackathon_id: UUID
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProblemStatementListResponse(BaseModel):
    items: list[ProblemStatementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
