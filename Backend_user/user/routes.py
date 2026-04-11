<<<<<<< Updated upstream
=======
<<<<<<< HEAD
from fastapi import APIRouter, Depends, Query

from ..auth import auth_dependencies
from .schemas import AuthResponse, EventRegistrationResponse, ProjectPayload, UserLoginRequest, UserRegisterRequest, UserResponse, UserUpdateRequest
=======
>>>>>>> Stashed changes
from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from ..auth import auth_dependencies
from ..models.event import EventRegistrationResponse, EventResponse
from ..models.news import NewsResponse
from ..models.user import AuthResponse
from .schemas import UserLoginRequest, UserRegisterRequest, UserResponse, UserUpdateRequest
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
from .service import UserService


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register", response_model=AuthResponse)
def register_user(payload: UserRegisterRequest):
<<<<<<< Updated upstream
    service = UserService()
    return service.register_user(payload)
=======
<<<<<<< HEAD
    return UserService().register_user(payload)
=======
    service = UserService()
    return service.register_user(payload)
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


@router.post("/login", response_model=AuthResponse)
def login_user(payload: UserLoginRequest):
<<<<<<< Updated upstream
    service = UserService()
    return service.login_user(payload)
=======
<<<<<<< HEAD
    return UserService().login_user(payload)
=======
    service = UserService()
    return service.login_user(payload)
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(auth_dependencies.get_current_local_user)):
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return UserService().get_profile(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(payload: UserUpdateRequest, current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().update_profile(current_user["id"], payload)
=======
>>>>>>> Stashed changes
    service = UserService()
    return service.get_profile(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdateRequest,
    current_user: dict = Depends(auth_dependencies.get_current_local_user),
):
    service = UserService()
    return service.update_profile(current_user["id"], payload)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


@router.get("/events")
def list_events(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    search_title: str | None = None,
    search_organizer: str | None = None,
    search_location: str | None = None,
):
    return UserService().list_events(
=======
>>>>>>> Stashed changes
    search_title: Optional[str] = None,
    search_organizer: Optional[str] = None,
    search_location: Optional[str] = None,
):
    service = UserService()
    return service.list_public_events(
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        limit=limit,
        offset=offset,
        search_title=search_title,
        search_organizer=search_organizer,
        search_location=search_location,
    )


@router.get("/events/{event_id}")
def get_event(event_id: int):
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return UserService().get_event(event_id)


@router.post("/events/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_event(event_id: int, current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().register_for_event(event_id, current_user)
=======
>>>>>>> Stashed changes
    service = UserService()
    return service.get_public_event(event_id)


@router.post("/events/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_event(
    event_id: int,
    current_user: dict = Depends(auth_dependencies.get_current_local_user),
):
    service = UserService()
    return service.register_for_event(event_id, current_user)
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


@router.get("/resources")
def list_resources(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    search_title: str | None = None,
    search_category: str | None = None,
    search_uploaded_by: str | None = None,
    search_type: str | None = None,
):
    return UserService().list_resources(
=======
>>>>>>> Stashed changes
    search_title: Optional[str] = None,
    search_category: Optional[str] = None,
    search_uploaded_by: Optional[str] = None,
    search_type: Optional[str] = None,
):
    service = UserService()
    return service.list_public_resources(
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
        limit=limit,
        offset=offset,
        search_title=search_title,
        search_category=search_category,
        search_uploaded_by=search_uploaded_by,
        search_type=search_type,
    )


<<<<<<< Updated upstream
=======
<<<<<<< HEAD
@router.get("/resources/{resource_id}")
def get_resource(resource_id: int):
    return UserService().get_resource(resource_id)


@router.get("/announcements")
def list_announcements(limit: int = Query(default=10, ge=1), offset: int = Query(default=0, ge=0)):
    return UserService().list_announcements(limit=limit, offset=offset)


@router.get("/members")
def list_members(limit: int = Query(default=50, ge=1), offset: int = Query(default=0, ge=0)):
    return UserService().list_members(limit=limit, offset=offset)


@router.get("/projects")
def list_projects(current_user: dict | None = Depends(auth_dependencies.get_current_local_user)):
    return UserService().list_projects(mine=True, user_id=current_user["id"])


@router.post("/projects")
def create_project(payload: ProjectPayload, current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().create_project(current_user["id"], payload)


@router.put("/projects/{project_id}")
def update_project(project_id: int, payload: ProjectPayload, current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().update_project(project_id, current_user["id"], payload)


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().delete_project(project_id, current_user["id"])


@router.get("/notifications")
def list_notifications(current_user: dict = Depends(auth_dependencies.get_current_local_user)):
    return UserService().list_notifications(current_user["id"])
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
