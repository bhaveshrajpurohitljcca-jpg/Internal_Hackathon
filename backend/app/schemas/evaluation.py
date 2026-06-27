import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EvaluationBase(BaseModel):
    innovation_score: float = 0.0
    technical_score: float = 0.0
    presentation_score: float = 0.0
    impact_score: float = 0.0
    ui_ux_score: float = 0.0
    documentation_score: float = 0.0
    remarks: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    submission_id: uuid.UUID

class EvaluationUpdate(EvaluationBase):
    pass

class EvaluationResponse(EvaluationBase):
    id: uuid.UUID
    submission_id: uuid.UUID
    judge_id: uuid.UUID
    total_score: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvaluationListResponse(BaseModel):
    items: List[EvaluationResponse]
    total: int
