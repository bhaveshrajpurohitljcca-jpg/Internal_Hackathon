from datetime import datetime, timezone
from typing import Optional, Generic, TypeVar
from pydantic import BaseModel, Field, model_validator, computed_field
import uuid

from app.models.enums import HackathonStatus, HackathonMode

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int

class HackathonBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    
    registration_start_date: datetime
    registration_end_date: datetime
    submission_deadline: datetime
    
    max_teams: Optional[int] = Field(None, ge=1)
    is_featured: bool = False
    banner_image: Optional[str] = None
    location: str = "LJ University"
    mode: HackathonMode = HackathonMode.OFFLINE

class HackathonCreate(HackathonBase):
    @model_validator(mode="after")
    def validate_dates(self) -> "HackathonCreate":
        if self.registration_end_date <= self.registration_start_date:
            raise ValueError("Registration end date must be after start date")
        if self.submission_deadline <= self.registration_end_date:
            raise ValueError("Submission deadline must be after registration end date")
        return self

class HackathonUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10)
    
    registration_start_date: Optional[datetime] = None
    registration_end_date: Optional[datetime] = None
    submission_deadline: Optional[datetime] = None
    
    status: Optional[HackathonStatus] = None
    
    max_teams: Optional[int] = Field(None, ge=1)
    is_featured: Optional[bool] = None
    banner_image: Optional[str] = None
    location: Optional[str] = None
    mode: Optional[HackathonMode] = None

    @model_validator(mode="after")
    def validate_dates(self) -> "HackathonUpdate":
        if self.registration_start_date and self.registration_end_date:
            if self.registration_end_date <= self.registration_start_date:
                raise ValueError("Registration end date must be after start date")
        if self.registration_end_date and self.submission_deadline:
            if self.submission_deadline <= self.registration_end_date:
                raise ValueError("Submission deadline must be after registration end date")
        return self

class HackathonResponse(HackathonBase):
    id: uuid.UUID
    slug: str
    status: HackathonStatus
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def is_registration_open(self) -> bool:
        now = datetime.now(timezone.utc)
        return self.registration_start_date <= now <= self.registration_end_date

    class Config:
        from_attributes = True
