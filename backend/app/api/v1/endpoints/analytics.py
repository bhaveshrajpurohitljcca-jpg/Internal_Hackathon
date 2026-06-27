import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/global", response_model=Dict[str, Any])
def get_global_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),
) -> Any:
    """
    Get global analytics for admin dashboard.
    """
    return analytics_service.get_dashboard_stats(db)

@router.get("/hackathon/{hackathon_id}", response_model=Dict[str, Any])
def get_hackathon_analytics(
    hackathon_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin),
) -> Any:
    """
    Get detailed analytics for a specific hackathon.
    """
    return analytics_service.get_hackathon_analytics(db, hackathon_id)
