from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from .DashboardManagement import DashboardManagement
from .Event_Registration import EventRegistration
from .ResourceManagement import ResourceManagement
from .Teammanagement import TeamManagement

from ..auth import auth_dependencies


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(auth_dependencies.get_current_admin)],
)


def _handle_service_result(result):
    if result.get("success"):
        return result

    error = result.get("error", "Request failed")
    error_text = str(error).lower()

    if "not found" in error_text:
        http_status = status.HTTP_404_NOT_FOUND
    elif any(
        text in error_text
        for text in [
            "invalid",
            "missing",
            "required",
            "cannot",
            "must be",
            "already exists",
            "no valid fields",
        ]
    ):
        http_status = status.HTTP_400_BAD_REQUEST
    else:
        http_status = status.HTTP_500_INTERNAL_SERVER_ERROR

    raise HTTPException(status_code=http_status, detail=error)


@router.get("/dashboard/counts")
def get_dashboard_counts():
    dashboard = DashboardManagement()
    return _handle_service_result(dashboard.get_dashboard_counts())


@router.get("/dashboard")
def get_admin_dashboard(limit: int = Query(default=5, ge=1, le=20)):
    dashboard = DashboardManagement()
    return _handle_service_result(dashboard.get_admin_dashboard(recent_limit=limit))


@router.get("/events")
def get_events(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
    search_title: str | None = None,
    search_organizer: str | None = None,
    search_location: str | None = None,
):
    event_admin = EventRegistration()
    return _handle_service_result(
        event_admin.get_all_events(
            limit=limit,
            offset=offset,
            search_title=search_title,
            search_organizer=search_organizer,
            search_location=search_location,
        )
    )


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(event_data: dict = Body(...)):
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.EventCreation(event_data))


@router.get("/events/stats")
def get_event_stats():
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.get_event_stats())


@router.get("/events/registration-counts")
def get_all_event_registration_counts():
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.get_all_event_registration_counts())


@router.get("/events/{event_id}")
def get_event(event_id: int):
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.get_event_by_id(event_id))


@router.patch("/events/{event_id}")
def update_event(event_id: int, event_data: dict = Body(...)):
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.update_event(event_id, event_data))


@router.delete("/events/{event_id}")
def delete_event(event_id: int, force_delete: bool = False):
    event_admin = EventRegistration()
    return _handle_service_result(
        event_admin.delete_event(event_id, force_delete=force_delete)
    )


@router.get("/events/{event_id}/registration-count")
def get_event_registration_count(event_id: int):
    event_admin = EventRegistration()
    return _handle_service_result(event_admin.get_event_registration_count(event_id))


@router.get("/events/{event_id}/registrations")
def get_event_registrations(
    event_id: int,
    limit: int = Query(default=50, ge=1),
    offset: int = Query(default=0, ge=0),
):
    event_admin = EventRegistration()
    return _handle_service_result(
        event_admin.get_event_registrations(event_id, limit=limit, offset=offset)
    )


@router.get("/team-members")
def get_team_members(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
    search_name: str | None = None,
    search_roll_no: str | None = None,
    search_role: str | None = None,
):
    team_admin = TeamManagement()
    return _handle_service_result(
        team_admin.get_all_team_members(
            limit=limit,
            offset=offset,
            search_name=search_name,
            search_roll_no=search_roll_no,
            search_role=search_role,
        )
    )


@router.post("/team-members", status_code=status.HTTP_201_CREATED)
def create_team_member(member_data: dict = Body(...)):
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.create_member(member_data))


@router.get("/team-members/stats")
def get_team_stats():
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.get_team_stats())


@router.get("/team-members/grouped")
def get_grouped_team_members():
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.get_team_members_grouped_by_role())


@router.get("/team-members/{member_id}")
def get_team_member(member_id: int):
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.get_team_member(member_id))


@router.patch("/team-members/{member_id}")
def update_team_member(member_id: int, member_data: dict = Body(...)):
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.update_team_member(member_id, member_data))


@router.delete("/team-members/{member_id}")
def delete_team_member(member_id: int):
    team_admin = TeamManagement()
    return _handle_service_result(team_admin.delete_team_member(member_id))


@router.get("/resources")
def get_resources(
    limit: int = Query(default=10, ge=1),
    offset: int = Query(default=0, ge=0),
    search_title: str | None = None,
    search_category: str | None = None,
    search_uploaded_by: str | None = None,
    search_type: str | None = None,
):
    resource_admin = ResourceManagement()
    return _handle_service_result(
        resource_admin.get_all_resources(
            limit=limit,
            offset=offset,
            search_title=search_title,
            search_category=search_category,
            search_uploaded_by=search_uploaded_by,
            search_type=search_type,
        )
    )


@router.post("/resources", status_code=status.HTTP_201_CREATED)
def create_resource(resource_data: dict = Body(...)):
    resource_admin = ResourceManagement()
    return _handle_service_result(resource_admin.create_resource(resource_data))


@router.get("/resources/stats")
def get_resource_stats():
    resource_admin = ResourceManagement()
    return _handle_service_result(resource_admin.get_resource_stats())


@router.get("/resources/{resource_id}")
def get_resource(resource_id: int):
    resource_admin = ResourceManagement()
    return _handle_service_result(resource_admin.get_resource_by_id(resource_id))


@router.patch("/resources/{resource_id}")
def update_resource(resource_id: int, resource_data: dict = Body(...)):
    resource_admin = ResourceManagement()
    return _handle_service_result(resource_admin.update_resource(resource_id, resource_data))


@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: int):
    resource_admin = ResourceManagement()
    return _handle_service_result(resource_admin.delete_resource(resource_id))
