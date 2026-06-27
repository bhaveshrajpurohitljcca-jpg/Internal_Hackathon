from pydantic import BaseModel


class ProjectMetadata(BaseModel):
    name: str
    description: str
    version: str
    environment: str
    service: str
    api_version: str
    docs_url: str
    health_url: str
