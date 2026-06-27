import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RegistrationStatus

if TYPE_CHECKING:
    from app.models.hackathon import Hackathon
    from app.models.user import User
    from app.models.submission import Submission
    from app.models.problem_statement import ProblemStatement
    from app.models.team import Team

class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint("hackathon_id", "user_id", name="uq_hackathon_user"),
    )

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathons.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[RegistrationStatus] = mapped_column(default=RegistrationStatus.PENDING)

    leader_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    team_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    problem_statement_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("problem_statements.id", ondelete="SET NULL"))
    
    admin_remarks: Mapped[str | None] = mapped_column(String)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship(back_populates="registrations")
    user: Mapped["User"] = relationship(foreign_keys=[user_id], back_populates="registrations")
    leader: Mapped["User"] = relationship(foreign_keys=[leader_id])
    approver: Mapped["User"] = relationship(foreign_keys=[approved_by])
    problem_statement: Mapped["ProblemStatement"] = relationship()
    submission: Mapped["Submission"] = relationship(back_populates="registration", uselist=False, cascade="all, delete-orphan")
    team: Mapped["Team"] = relationship(back_populates="registrations")
