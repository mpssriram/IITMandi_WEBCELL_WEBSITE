from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..auth import auth_dependencies
from .schemas import (
    EventRegistrationResponse,
    JoinApplicationRequest,
    PublicJoinResponse,
    PublicListEventsResponse,
    PublicListFormerLeadsResponse,
    PublicListProjectsResponse,
    PublicListTeamResponse,
    UserResponse,
    UserUpdateRequest,
)
from .service import UserService


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register")
def register_user():
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Local register is disabled. Use Firebase Authentication from the frontend.",
    )


@router.post("/login")
def login_user():
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Local login is disabled. Use Firebase Authentication from the frontend.",
    )


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(auth_dependencies.get_current_user)):
    service = UserService()
    return service.get_profile(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdateRequest,
    current_user: dict = Depends(auth_dependencies.get_current_user),
):
    service = UserService()
    return service.update_profile(current_user, payload)


@router.get("/projects", response_model=PublicListProjectsResponse)
def get_public_projects(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    service = UserService()
    return service.list_public_projects(limit=limit, offset=offset)


@router.get("/team", response_model=PublicListTeamResponse)
def get_public_team(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    service = UserService()
    return service.list_public_team(limit=limit, offset=offset)


@router.get("/former-leads", response_model=PublicListFormerLeadsResponse)
def get_public_former_leads(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    service = UserService()
    return service.list_public_former_leads(limit=limit, offset=offset)


@router.get("/events", response_model=PublicListEventsResponse)
def get_public_events(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search_title: Optional[str] = None,
    search_organizer: Optional[str] = None,
    search_location: Optional[str] = None,
):
    # Keep query arguments accepted for compatibility; public listing currently ignores filters.
    _ = (search_title, search_organizer, search_location)
    service = UserService()
    return service.list_public_events(limit=limit, offset=offset)


@router.get("/events/{event_id}")
def get_event(event_id: int):
    service = UserService()
    return service.get_public_event(event_id)


@router.post("/events/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_event(
    event_id: int,
    current_user: dict = Depends(auth_dependencies.get_current_user),
):
    service = UserService()
    return service.register_for_event(event_id, current_user)


@router.get("/resources")
def list_resources(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search_title: Optional[str] = None,
    search_category: Optional[str] = None,
    search_uploaded_by: Optional[str] = None,
    search_type: Optional[str] = None,
):
    _ = (search_title, search_category, search_uploaded_by, search_type)
    service = UserService()
    return service.list_public_resources(limit=limit, offset=offset)


@router.get("/resources/{resource_id}")
def get_resource(resource_id: int):
    service = UserService()
    return service.get_public_resource(resource_id)


@router.get("/members")
def list_members(
    limit: int = Query(default=50, ge=1),
    offset: int = Query(default=0, ge=0),
):
    service = UserService()
    return service.list_public_members(limit=limit, offset=offset)


@router.post("/join", response_model=PublicJoinResponse)
def submit_join_application(payload: JoinApplicationRequest):
    service = UserService()
    return service.submit_join_application(payload)
