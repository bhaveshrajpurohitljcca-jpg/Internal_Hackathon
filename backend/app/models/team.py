import uuid
from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.registration import Registration

class TeamRole(str, enum.Enum):
    LEADER = "LEADER"
    MEMBER = "MEMBER"

class InvitationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class Team(Base):
    __tablename__ = "teams"

    name: Mapped[str] = mapped_column(String, index=True)
    leader_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    hackathon_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    banner_url: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Relationships
    leader: Mapped["User"] = relationship(foreign_keys=[leader_id])
    hackathon: Mapped["Hackathon"] = relationship(back_populates="teams")
    members: Mapped[list["TeamMember"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    invitations: Mapped[list["TeamInvitation"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    registrations: Mapped[list["Registration"]] = relationship(back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    role: Mapped[TeamRole] = mapped_column(SAEnum(TeamRole), default=TeamRole.MEMBER)

    # Relationships
    team: Mapped["Team"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(foreign_keys=[user_id])


class TeamInvitation(Base):
    __tablename__ = "team_invitations"

    team_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    invitee_email: Mapped[str] = mapped_column(String, index=True)
    status: Mapped[InvitationStatus] = mapped_column(SAEnum(InvitationStatus), default=InvitationStatus.PENDING)

    # Relationships
    team: Mapped["Team"] = relationship(back_populates="invitations")
