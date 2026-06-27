from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import UserCreate
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()

def get_user_by_enrollment(db: Session, enrollment_number: str) -> User | None:
    return db.execute(select(User).where(User.enrollment_number == enrollment_number)).scalar_one_or_none()

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_user(db: Session, user_in: UserCreate) -> User:
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_enrollment(db, user_in.enrollment_number):
        raise HTTPException(status_code=400, detail="Enrollment number already registered")
    
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        team_name=user_in.team_name,
        enrollment_number=user_in.enrollment_number,
        branch=user_in.branch,
        semester=user_in.semester,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
