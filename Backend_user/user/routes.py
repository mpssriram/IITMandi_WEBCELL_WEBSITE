from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from ..auth import auth_dependencies
from ..models.event import EventRegistrationResponse, EventResponse
from ..models.news import NewsResponse
from ..models.user import AuthResponse
from .schemas import UserLoginRequest, UserRegisterRequest, UserResponse, UserUpdateRequest
from .service import UserService


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register", response_model=AuthResponse)
def register_user(payload: UserRegisterRequest):
    service = UserService()
    return service.register_user(payload)


@router.post("/login", response_model=AuthResponse)
def login_user(payload: UserLoginRequest):
    service = UserService()
    return service.login_user(payload)


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    service = UserService()
    return service.get_profile(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdateRequest,
    current_user: dict = Depends(auth_dependencies.get_current_local_user),
):
    service = UserService()
    return service.update_profile(current_user["id"], payload)


@router.get("/events")
def list_events(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
    search_title: Optional[str] = None,
    search_organizer: Optional[str] = None,
    search_location: Optional[str] = None,
):
    service = UserService()
    return service.list_public_events(
        limit=limit,
        offset=offset,
        search_title=search_title,
        search_organizer=search_organizer,
        search_location=search_location,
    )


@router.get("/events/{event_id}")
def get_event(event_id: int):
    service = UserService()
    return service.get_public_event(event_id)


@router.post("/events/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_event(
    event_id: int,
    current_user: dict = Depends(auth_dependencies.get_current_local_user),
):
    service = UserService()
    return service.register_for_event(event_id, current_user)


@router.get("/resources")
def list_resources(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
    search_title: Optional[str] = None,
    search_category: Optional[str] = None,
    search_uploaded_by: Optional[str] = None,
    search_type: Optional[str] = None,
):
    service = UserService()
    return service.list_public_resources(
        limit=limit,
        offset=offset,
        search_title=search_title,
        search_category=search_category,
        search_uploaded_by=search_uploaded_by,
        search_type=search_type,
    )


@router.get("/resources/{resource_id}", response_model=NewsResponse)
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
