import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.team import TeamRole, InvitationStatus

class TeamMemberBase(BaseModel):
    user_id: uuid.UUID
    role: TeamRole

class TeamMemberResponse(TeamMemberBase):
    id: uuid.UUID
    team_id: uuid.UUID
    user_name: str
    user_email: str
    user_department: Optional[str] = None
    user_gender: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TeamInvitationBase(BaseModel):
    invitee_email: EmailStr

class TeamInvitationCreate(TeamInvitationBase):
    pass

class TeamInvitationResponse(TeamInvitationBase):
    id: uuid.UUID
    team_id: uuid.UUID
    status: InvitationStatus
    team_name: Optional[str] = None
    hackathon_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    hackathon_id: Optional[uuid.UUID] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None

class TeamResponse(TeamBase):
    id: uuid.UUID
    leader_id: uuid.UUID
    hackathon_id: Optional[uuid.UUID] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    created_at: datetime
    members: List[TeamMemberResponse] = []
    invitations: List[TeamInvitationResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TeamListResponse(BaseModel):
    items: List[TeamResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
