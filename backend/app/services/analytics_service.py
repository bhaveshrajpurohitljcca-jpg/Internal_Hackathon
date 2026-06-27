import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, text
from datetime import datetime, timezone, timedelta

from app.models.hackathon import Hackathon
from app.models.registration import Registration
from app.models.submission import Submission
from app.models.team import Team, TeamMember
from app.models.user import User

class AnalyticsService:
    def get_dashboard_stats(self, db: Session) -> Dict[str, Any]:
        """
        Global stats for Admin Dashboard
        """
        total_hackathons = db.execute(select(func.count(Hackathon.id))).scalar() or 0
        total_teams = db.execute(select(func.count(Team.id))).scalar() or 0
        total_registrations = db.execute(select(func.count(Registration.id))).scalar() or 0
        total_submissions = db.execute(select(func.count(Submission.id))).scalar() or 0
        
        # Trend over last 7 days (mock logic, ideally group by date)
        # We can just fetch count for last 7 days vs previous 7 days
        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        fourteen_days_ago = now - timedelta(days=14)
        
        recent_regs = db.execute(select(func.count(Registration.id)).where(Registration.created_at >= seven_days_ago)).scalar() or 0
        prev_regs = db.execute(select(func.count(Registration.id)).where(Registration.created_at >= fourteen_days_ago, Registration.created_at < seven_days_ago)).scalar() or 0
        
        trend = 0
        if prev_regs > 0:
            trend = ((recent_regs - prev_regs) / prev_regs) * 100
        elif recent_regs > 0:
            trend = 100

        return {
            "total_hackathons": total_hackathons,
            "total_teams": total_teams,
            "total_registrations": total_registrations,
            "total_submissions": total_submissions,
            "registration_trend_percentage": round(trend, 1)
        }

    def get_hackathon_analytics(self, db: Session, hackathon_id: uuid.UUID) -> Dict[str, Any]:
        """
        Specific hackathon analytics for charts
        """
        # Department Distribution
        dept_data = db.execute(
            select(
                func.coalesce(User.department, 'Unknown').label('name'),
                func.count(User.id).label('value')
            )
            .select_from(Registration)
            .join(Team, Team.id == Registration.team_id)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .join(User, User.id == TeamMember.user_id)
            .where(Registration.hackathon_id == hackathon_id)
            .group_by(func.coalesce(User.department, 'Unknown'))
        ).all()
        
        # Gender Distribution
        gender_data = db.execute(
            select(
                func.coalesce(User.gender, 'Unknown').label('name'),
                func.count(User.id).label('value')
            )
            .select_from(Registration)
            .join(Team, Team.id == Registration.team_id)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .join(User, User.id == TeamMember.user_id)
            .where(Registration.hackathon_id == hackathon_id)
            .group_by(func.coalesce(User.gender, 'Unknown'))
        ).all()
        
        # Daily Registrations (last 14 days)
        # Just generating a raw SQL approach for simplicity across dialects
        daily_regs = db.execute(
            select(
                func.date(Registration.created_at).label('date'),
                func.count(Registration.id).label('count')
            )
            .where(Registration.hackathon_id == hackathon_id)
            .group_by(func.date(Registration.created_at))
            .order_by(func.date(Registration.created_at))
        ).all()

        return {
            "department_distribution": [{"name": d[0], "value": d[1]} for d in dept_data],
            "gender_distribution": [{"name": d[0], "value": d[1]} for d in gender_data],
            "daily_registrations": [{"date": str(d[0]), "count": d[1]} for d in daily_regs]
        }

analytics_service = AnalyticsService()
