from fastapi import APIRouter

from app.core.config import settings
from app.schemas.metadata import ProjectMetadata
from app.schemas.response import ApiResponse, success_response

router = APIRouter()


@router.get(
    "/metadata",
    response_model=ApiResponse[ProjectMetadata],
    tags=["metadata"],
    summary="Project metadata",
)
def get_metadata() -> dict:
    data = ProjectMetadata(
        **settings.project_metadata(),
        docs_url="/docs",
        health_url=f"{settings.api_v1_prefix}/health",
    )
    return success_response(data=data.model_dump(), message="Project metadata retrieved")
