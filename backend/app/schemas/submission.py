from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.enums import SubmissionStatus

class SubmissionBase(BaseModel):
    repository_url: Optional[str] = Field(None, max_length=2048)
    demo_video_url: Optional[str] = Field(None, max_length=2048)
    ppt_url: Optional[str] = Field(None, max_length=2048)
    zip_url: Optional[str] = Field(None, max_length=2048)
    project_description: Optional[str] = None
    tech_stack: Optional[str] = None
    notes: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(SubmissionBase):
    pass

class SubmissionAdminUpdate(BaseModel):
    status: Optional[SubmissionStatus] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    remarks: Optional[str] = None

class SubmissionResponse(SubmissionBase):
    id: UUID
    registration_id: UUID
    problem_statement_id: UUID
    status: SubmissionStatus
    score: Optional[float] = None
    feedback: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubmissionListResponse(BaseModel):
    items: list[SubmissionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
