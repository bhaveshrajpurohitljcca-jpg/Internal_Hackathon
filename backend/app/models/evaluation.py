import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.submission import Submission
    from app.models.user import User

class Evaluation(Base):
    __tablename__ = "evaluations"

    submission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"), index=True)
    judge_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    innovation_score: Mapped[float] = mapped_column(Float, default=0.0)
    technical_score: Mapped[float] = mapped_column(Float, default=0.0)
    presentation_score: Mapped[float] = mapped_column(Float, default=0.0)
    impact_score: Mapped[float] = mapped_column(Float, default=0.0)
    ui_ux_score: Mapped[float] = mapped_column(Float, default=0.0)
    documentation_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    total_score: Mapped[float] = mapped_column(Float, default=0.0)
    remarks: Mapped[str | None] = mapped_column(Text)

    # Relationships
    submission: Mapped["Submission"] = relationship(back_populates="evaluations")
    judge: Mapped["User"] = relationship(foreign_keys=[judge_id])
