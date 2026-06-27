from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.core.security import verify_password, get_password_hash

router = APIRouter()

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    team_name: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

@router.put("/me")
def update_profile(profile_in: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if profile_in.full_name:
        current_user.full_name = profile_in.full_name
    if profile_in.team_name is not None:
        current_user.team_name = profile_in.team_name
    if profile_in.branch is not None:
        current_user.branch = profile_in.branch
    if profile_in.semester is not None:
        current_user.semester = profile_in.semester
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def update_password(password_in: PasswordUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}
