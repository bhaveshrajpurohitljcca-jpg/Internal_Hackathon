from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.middleware.request_validation import RequestValidationMiddleware
from app.schemas.response import success_response

logger = get_logger(__name__)


from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    logger.info("Starting %s [%s]", settings.app_name, settings.app_env)
    
    # Create default admin if not exists
    with SessionLocal() as db:
        admin_email = "admin@hackathon.com"
        admin_user = db.execute(select(User).where(User.email == admin_email)).scalar_one_or_none()
        if not admin_user:
            logger.info("Creating default admin user...")
            db_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@123"),
                full_name="System Administrator",
                role=UserRole.ADMIN
            )
            db.add(db_admin)
            db.commit()
    
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(RequestValidationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_v1_prefix)

import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", tags=["root"])
def root() -> dict:
    return success_response(
        data={
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
            "metadata": f"{settings.api_v1_prefix}/metadata",
        },
        message="Welcome to the College Internal Hackathon Portal API",
    )
