from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.enums import RegistrationStatus

class RegistrationBase(BaseModel):
    hackathon_id: UUID

class RegistrationCreate(RegistrationBase):
    problem_statement_id: UUID

class RegistrationUpdate(BaseModel):
    status: RegistrationStatus

class RegistrationApproveReject(BaseModel):
    admin_remarks: Optional[str] = None

class RegistrationResponse(RegistrationBase):
    id: UUID
    hackathon_id: UUID
    user_id: UUID
    leader_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    team_name: Optional[str] = None
    problem_statement_id: Optional[UUID] = None
    status: RegistrationStatus
    admin_remarks: Optional[str] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RegistrationListResponse(BaseModel):
    items: list[RegistrationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
