import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import verify_password
from app.services.auth_service import authenticate_user

db = SessionLocal()
user = db.query(User).filter_by(email='admin@hackathon.com').first()
print(f'User Exists: {user is not None}')
if user:
    print(f'Role: {user.role}')
    print(f'Hashed Password: {user.hashed_password}')
    print(f'Is Active: {getattr(user, "is_active", "No is_active field")}')
    # the default password in the codebase might be adminpassword
    print(f'Password check (adminpassword): {verify_password("adminpassword", user.hashed_password)}')
    print(f'Password check (admin123): {verify_password("admin123", user.hashed_password)}')
    auth_u = authenticate_user(db, 'admin@hackathon.com', 'adminpassword')
    print(f'authenticate_user check: {auth_u is not None}')
