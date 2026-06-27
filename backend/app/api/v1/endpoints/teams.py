import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_active_admin
from app.models.user import User
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamInvitationCreate,
    TeamInvitationResponse,
    TeamListResponse
)
from app.services.team_service import team_service

router = APIRouter()

@router.get("", response_model=TeamListResponse)
def get_all_teams(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve all teams. Admin only.
    """
    teams_data = team_service.get_all(
        db,
        page=page,
        page_size=page_size,
        search=search,
    )
    
    # Format the teams correctly to match TeamResponse structure including relationships
    formatted_items = [get_team_by_id_formatted(db, team.id) for team in teams_data["items"]]
    
    return {
        "items": formatted_items,
        "total": teams_data["total"],
        "page": teams_data["page"],
        "page_size": teams_data["page_size"],
        "total_pages": teams_data["total_pages"],
    }

@router.get("/my", response_model=List[TeamResponse])
def get_my_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all teams the current user belongs to.
    """
    teams = team_service.get_teams_for_user(db, current_user.id)
    
    response_data = []
    for team in teams:
        response_data.append({
            "id": team.id,
            "name": team.name,
            "leader_id": team.leader_id,
            "hackathon_id": team.hackathon_id,
            "logo_url": team.logo_url,
            "banner_url": team.banner_url,
            "created_at": team.created_at,
            "members": [
                {
                    "id": m.id,
                    "team_id": m.team_id,
                    "user_id": m.user_id,
                    "role": m.role,
                    "user_name": m.user.full_name,
                    "user_email": m.user.email,
                    "user_department": m.user.department,
                    "user_gender": m.user.gender,
                    "created_at": m.created_at
                }
                for m in team.members
            ],
            "invitations": [
                {
                    "id": inv.id,
                    "team_id": inv.team_id,
                    "invitee_email": inv.invitee_email,
                    "status": inv.status,
                    "team_name": team.name,
                    "hackathon_name": team.hackathon.title if team.hackathon else None,
                    "created_at": inv.created_at
                }
                for inv in team.invitations
            ]
        })
    return response_data


@router.post("", response_model=TeamResponse)
def create_team(
    *,
    db: Session = Depends(get_db),
    team_in: TeamCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new team.
    """
    team = team_service.create(db, obj_in=team_in, leader_id=current_user.id)
    # Re-fetch with details
    return get_team_by_id_formatted(db, team.id)


@router.patch("/{id}", response_model=TeamResponse)
def update_team(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    team_in: TeamUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a team.
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team leader can update the team")
        
    team = team_service.update(db, db_obj=team, obj_in=team_in)
    return get_team_by_id_formatted(db, team.id)


@router.post("/{id}/invitations", response_model=TeamInvitationResponse)
def invite_member(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    invite_in: TeamInvitationCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Invite a member to the team.
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team leader can invite members")
        
    return team_service.invite_member(db, team, invite_in)


@router.get("/invitations/my", response_model=List[TeamInvitationResponse])
def get_my_invitations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get invitations sent to the current user.
    """
    invitations = team_service.get_my_invitations(db, current_user.email)
    
    result = []
    for inv in invitations:
        result.append({
            "id": inv.id,
            "team_id": inv.team_id,
            "invitee_email": inv.invitee_email,
            "status": inv.status,
            "team_name": inv.team.name,
            "hackathon_name": inv.team.hackathon.title if inv.team.hackathon else None,
            "created_at": inv.created_at
        })
    return result


@router.post("/invitations/{invite_id}/respond", response_model=TeamInvitationResponse)
def respond_to_invitation(
    *,
    db: Session = Depends(get_db),
    invite_id: uuid.UUID = Path(...),
    accept: bool,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Accept or reject a team invitation.
    """
    return team_service.respond_to_invite(db, invite_id, current_user, accept)


@router.delete("/{id}/members/{user_id}")
def remove_member(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    user_id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove a member from the team.
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.leader_id != current_user.id and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to remove this member")
        
    team_service.remove_member(db, team, user_id)
    return {"message": "Member removed successfully"}

@router.delete("/{id}")
def delete_team(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete the team (leader only).
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team leader can delete the team")
        
    team_service.delete(db, id=id)
    return {"message": "Team deleted successfully"}


@router.post("/{id}/transfer-leadership/{new_leader_id}")
def transfer_leadership(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    new_leader_id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Transfer leadership to another member.
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.leader_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only team leader can transfer leadership")
        
    team_service.transfer_leadership(db, team, new_leader_id)
    return {"message": "Leadership transferred successfully"}

@router.delete("/{id}/leave")
def leave_team(
    *,
    db: Session = Depends(get_db),
    id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Leave a team.
    """
    team = team_service.get(db, id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
        
    team_service.leave_team(db, team, current_user.id)
    return {"message": "Left team successfully"}

def get_team_by_id_formatted(db: Session, team_id: uuid.UUID):
    team = team_service.get(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return {
        "id": team.id,
        "name": team.name,
        "leader_id": team.leader_id,
        "hackathon_id": team.hackathon_id,
        "logo_url": team.logo_url,
        "banner_url": team.banner_url,
        "created_at": team.created_at,
        "members": [
            {
                "id": m.id,
                "team_id": m.team_id,
                "user_id": m.user_id,
                "role": m.role,
                "user_name": m.user.full_name,
                "user_email": m.user.email,
                "user_department": m.user.department,
                "user_gender": m.user.gender,
                "created_at": m.created_at
            }
            for m in team.members
        ],
        "invitations": [
            {
                "id": inv.id,
                "team_id": inv.team_id,
                "invitee_email": inv.invitee_email,
                "status": inv.status,
                "team_name": team.name,
                "hackathon_name": team.hackathon.title if team.hackathon else None,
                "created_at": inv.created_at
            }
            for inv in team.invitations
        ]
    }
