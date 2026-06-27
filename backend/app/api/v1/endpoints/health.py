from fastapi import APIRouter

from app.core.config import settings
from app.schemas.health import HealthData
from app.schemas.response import ApiResponse, success_response

router = APIRouter()


@router.get(
    "/health",
    response_model=ApiResponse[HealthData],
    tags=["health"],
    summary="Health check",
)
def health_check() -> dict:
    data = HealthData(
        status="ok",
        service=settings.service_name,
        environment=settings.app_env,
        version=settings.app_version,
    )
    return success_response(data=data.model_dump(), message="Service is healthy")
