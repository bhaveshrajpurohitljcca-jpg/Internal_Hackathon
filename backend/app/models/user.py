from typing import TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.registration import Registration

class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(default=UserRole.STUDENT)
    
    # Student specific fields (nullable for Admin)
    team_name: Mapped[str | None] = mapped_column(String)
    enrollment_number: Mapped[str | None] = mapped_column(String, unique=True, index=True)
    branch: Mapped[str | None] = mapped_column(String)
    department: Mapped[str | None] = mapped_column(String)
    semester: Mapped[int | None] = mapped_column()
    gender: Mapped[str | None] = mapped_column(String)

    # Relationships
    registrations: Mapped[list["Registration"]] = relationship(foreign_keys="[Registration.user_id]", back_populates="user", cascade="all, delete-orphan")
