from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.registration import Registration
from app.models.submission import Submission
from app.api.deps import get_current_active_admin, get_current_user
from app.schemas.response import success_response
from app.models.enums import HackathonStatus, RegistrationStatus, SubmissionStatus, UserRole

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Get live statistics for the Admin Dashboard.
    """
    total_hackathons = db.execute(select(func.count(Hackathon.id))).scalar_one()
    total_students = db.execute(select(func.count(User.id)).where(User.role == UserRole.STUDENT)).scalar_one()
    total_teams = db.execute(select(func.count(func.distinct(Registration.team_id)))).scalar_one()
    
    pending_registrations = db.execute(select(func.count(Registration.id)).where(Registration.status == RegistrationStatus.PENDING)).scalar_one()
    approved_registrations = db.execute(select(func.count(Registration.id)).where(Registration.status == RegistrationStatus.APPROVED)).scalar_one()
    rejected_registrations = db.execute(select(func.count(Registration.id)).where(Registration.status == RegistrationStatus.REJECTED)).scalar_one()
    
    total_submissions = db.execute(select(func.count(Submission.id))).scalar_one()
    accepted_projects = db.execute(select(func.count(Submission.id)).where(Submission.status == SubmissionStatus.ACCEPTED)).scalar_one()
    rejected_projects = db.execute(select(func.count(Submission.id)).where(Submission.status == SubmissionStatus.REJECTED)).scalar_one()

    # Get top 5 submissions (leaderboard)
    top_submissions = db.execute(
        select(Submission)
        .where(Submission.score > 0)
        .order_by(Submission.score.desc())
        .limit(5)
    ).scalars().all()

    leaderboard = [
        {
            "id": str(sub.id),
            "team_name": sub.registration.team.name if sub.registration and sub.registration.team else "Unknown",
            "score": sub.score,
            "placement": sub.placement,
            "problem_code": sub.problem_statement.problem_code if sub.problem_statement else "N/A"
        }
        for sub in top_submissions
    ]

    return success_response(data={
        "total_hackathons": total_hackathons,
        "total_students": total_students,
        "total_teams": total_teams,
        "registrations": {
            "pending": pending_registrations,
            "approved": approved_registrations,
            "rejected": rejected_registrations,
        },
        "submissions": {
            "total": total_submissions,
            "accepted": accepted_projects,
            "rejected": rejected_projects,
        },
        "leaderboard": leaderboard
    })

@router.get("/student-stats")
def get_student_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get live statistics for the Student Dashboard.
    """
    active_registrations = db.execute(
        select(Registration).where(Registration.user_id == current_user.id).order_by(Registration.created_at.desc()).limit(5)
    ).scalars().all()
    
    registered_hackathons = len(active_registrations)
    
    # Extract statuses for recent registrations
    recent_registration_statuses = [
        {"team_name": r.team.name if r.team else "Individual", "status": r.status} for r in active_registrations
    ]

    my_submissions = db.execute(
        select(Submission).join(Registration, Submission.registration_id == Registration.id).where(Registration.user_id == current_user.id)
    ).scalars().all()

    submission_statuses = [
        {"id": s.id, "status": s.status} for s in my_submissions
    ]

    # Upcoming Deadlines for registered hackathons
    upcoming_deadlines = db.execute(
        select(Hackathon.title, Hackathon.submission_deadline)
        .join(Registration, Registration.hackathon_id == Hackathon.id)
        .where(Registration.user_id == current_user.id)
        .where(Hackathon.submission_deadline > func.now())
        .order_by(Hackathon.submission_deadline.asc())
        .limit(3)
    ).all()

    return success_response(data={
        "registered_hackathons": registered_hackathons,
        "recent_registrations": recent_registration_statuses,
        "submission_statuses": submission_statuses,
        "upcoming_deadlines": [{"title": d[0], "deadline": d[1]} for d in upcoming_deadlines],
        "notifications": [
            {"id": 1, "message": "Welcome to the hackathon portal!"}
        ]
    })
