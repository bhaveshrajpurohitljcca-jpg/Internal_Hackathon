import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.enums import ProblemDifficulty

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.hackathon import Hackathon
    from app.models.submission import Submission

class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    hackathon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("hackathons.id", ondelete="CASCADE"))
    problem_code: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    difficulty: Mapped["ProblemDifficulty"] = mapped_column(Enum(ProblemDifficulty))
    category: Mapped[str] = mapped_column(String, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship(back_populates="problem_statements")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="problem_statement", cascade="all, delete-orphan")
