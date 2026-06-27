from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import API_VERSION, SERVICE_NAME


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application metadata
    app_name: str = "College Internal Hackathon Portal"
    app_description: str = (
        "Internal hackathon management platform for college events, "
        "registrations, submissions, and judging."
    )
    app_version: str = "0.1.0"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/hackathon_portal"

    # Security
    secret_key: str = "change-me-to-a-long-random-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Logging
    log_level: str = "DEBUG"
    
    # Cloudinary Integration
    cloudinary_url: str = ""

    @field_validator("app_env", mode="before")
    @classmethod
    def normalize_env(cls, value: str) -> str:
        return str(value).lower()

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def service_name(self) -> str:
        return SERVICE_NAME

    @property
    def api_version(self) -> str:
        return API_VERSION

    def project_metadata(self) -> dict[str, str]:
        return {
            "name": self.app_name,
            "description": self.app_description,
            "version": self.app_version,
            "environment": self.app_env,
            "service": self.service_name,
            "api_version": self.api_version,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
