"""SQLAlchemy models will be defined here."""

from app.models.enums import UserRole, HackathonStatus, RegistrationStatus, SubmissionStatus
from app.models.user import User
from app.models.hackathon import Hackathon
from app.models.problem_statement import ProblemStatement
from app.models.registration import Registration
from app.models.submission import Submission
from app.models.team import Team, TeamMember, TeamInvitation
from app.models.evaluation import Evaluation

__all__ = [
    "UserRole",
    "HackathonStatus",
    "RegistrationStatus",
    "SubmissionStatus",
    "User",
    "Hackathon",
    "ProblemStatement",
    "Registration",
    "Submission",
    "Team",
    "TeamMember",
    "TeamInvitation",
    "Evaluation"
]
