import uuid
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    team_name: str = Field(..., min_length=2, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    enrollment_number: str = Field(..., min_length=5, max_length=50)
    branch: str = Field(..., min_length=2, max_length=100)
    semester: int = Field(..., ge=1, le=10)
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: str
    team_name: str | None = None
    enrollment_number: str | None = None
    branch: str | None = None
    semester: int | None = None

    class Config:
        from_attributes = True
