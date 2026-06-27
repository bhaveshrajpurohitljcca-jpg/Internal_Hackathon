import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import SubmissionStatus

if TYPE_CHECKING:
    from app.models.registration import Registration
    from app.models.problem_statement import ProblemStatement
    from app.models.evaluation import Evaluation

class Submission(Base):
    __tablename__ = "submissions"

    registration_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("registrations.id", ondelete="CASCADE"), unique=True)
    problem_statement_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("problem_statements.id", ondelete="RESTRICT"))
    repository_url: Mapped[str | None] = mapped_column(String)
    demo_video_url: Mapped[str | None] = mapped_column(String)
    ppt_url: Mapped[str | None] = mapped_column(String)
    zip_url: Mapped[str | None] = mapped_column(String)
    
    project_description: Mapped[str | None] = mapped_column(Text)
    tech_stack: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    
    score: Mapped[float | None] = mapped_column()
    feedback: Mapped[str | None] = mapped_column(Text)
    remarks: Mapped[str | None] = mapped_column(Text)
    
    status: Mapped[SubmissionStatus] = mapped_column(default=SubmissionStatus.DRAFT)
    placement: Mapped[int | None] = mapped_column()

    # Relationships
    registration: Mapped["Registration"] = relationship(back_populates="submission")
    problem_statement: Mapped["ProblemStatement"] = relationship(back_populates="submissions")
    evaluations: Mapped[list["Evaluation"]] = relationship(back_populates="submission", cascade="all, delete-orphan")
