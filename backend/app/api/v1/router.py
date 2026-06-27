from fastapi import APIRouter

from app.api.v1.endpoints import health, metadata, auth, dashboard, hackathons, problem_statements, registrations, submissions, users, upload, teams, evaluations, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(hackathons.router, prefix="/hackathons", tags=["hackathons"])
api_router.include_router(problem_statements.router, prefix="/problem-statements", tags=["problem statements"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(health.router)
api_router.include_router(metadata.router)
