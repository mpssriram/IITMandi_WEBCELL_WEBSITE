from fastapi import APIRouter, Body, HTTPException, Query, status

from Backend_user.Database import Database
from ..admin.ResourceManagement import ResourceManagement
from .schemas import (
    JoinApplicationRequest,
    PublicJoinResponse,
    PublicListEventsResponse,
    PublicListFormerLeadsResponse,
    PublicListProjectsResponse,
    PublicListTeamResponse,
)


router = APIRouter(
    prefix="/user",
    tags=["user"],
)


def _extract_items(result: dict, key: str):
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Request failed"),
        )

    data = result.get("data", {})
    if isinstance(data, dict) and "items" in data:
        return data.get("items") or []

    return result.get(key) or []


def _fetch_items(query: str, params: tuple = ()): 
    db = Database()
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute(query, params)
        return cursor.fetchall() or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch data: {str(exc)}",
        ) from exc
    finally:
        if cursor:
            cursor.close()
        db.close()


@router.get("/projects", response_model=PublicListProjectsResponse)
def get_public_projects(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items = _fetch_items(
        """
        SELECT
            id,
            title,
            short_description,
            full_description,
            tech_stack,
            github_url,
            live_url,
            image_url,
            status,
            current_lead,
            former_leads,
            contributors,
            featured,
            display_order
        FROM projects
        ORDER BY featured DESC, display_order ASC, id DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )

    return {
        "success": True,
        "items": items,
        "count": len(items),
    }


@router.get("/team", response_model=PublicListTeamResponse)
def get_public_team(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    public_items = _fetch_items(
        """
        SELECT
            id,
            full_name,
            role,
            team_domain,
            year,
            bio,
            skills,
            photo_url,
            linkedin_url,
            github_url,
            email,
            active,
            display_order
        FROM team_members
        WHERE active = 1
        ORDER BY display_order ASC, id DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )

    return {
        "success": True,
        "items": public_items,
        "count": len(public_items),
    }


@router.get("/former-leads", response_model=PublicListFormerLeadsResponse)
def get_public_former_leads(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    items = _fetch_items(
        """
        SELECT
            id,
            full_name,
            role_title,
            tenure_start,
            tenure_end,
            handled_projects,
            linkedin_url,
            github_url,
            photo_url,
            short_note,
            visible_on_site
        FROM former_leads
        WHERE visible_on_site = 1
        ORDER BY tenure_end DESC, id DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )

    return {
        "success": True,
        "items": items,
        "count": len(items),
    }


@router.get("/events", response_model=PublicListEventsResponse)
def get_public_events(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    public_items = _fetch_items(
        """
        SELECT
            id,
            title,
            type,
            description,
            DATE_FORMAT(date, '%Y-%m-%d') AS date,
            venue,
            registration_link,
            poster_image_url,
            speakers,
            organizers,
            status,
            featured
        FROM website_events
        ORDER BY featured DESC, date DESC, id DESC
        LIMIT %s OFFSET %s
        """,
        (limit, offset),
    )

    return {
        "success": True,
        "items": public_items,
        "count": len(public_items),
    }


@router.get("/resources")
def get_public_resources(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    service = ResourceManagement()
    result = service.get_all_resources(limit=limit, offset=offset)
    resources = _extract_items(result, "resources")

    public_items = [
        {
            "id": resource.get("id"),
            "title": resource.get("title"),
            "description": resource.get("description"),
            "type": resource.get("type"),
            "url": resource.get("url"),
            "category": resource.get("category"),
            "uploaded_by": resource.get("uploaded_by"),
        }
        for resource in resources
    ]

    return {
        "success": True,
        "items": public_items,
        "count": len(public_items),
    }


@router.post("/join", response_model=PublicJoinResponse, status_code=status.HTTP_201_CREATED)
def submit_join_application(payload: JoinApplicationRequest = Body(...)):
    name = payload.name.strip()
    email = payload.email.strip().lower()
    year = (payload.year or "").strip() or None
    interest = (payload.interest or "").strip() or None
    message = (payload.message or "").strip() or None

    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="name is required")

    if not email or "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="valid email is required")

    db = Database()
    cursor = None
    try:
        cursor = db.get_cursor()
        cursor.execute(
            """
            INSERT INTO join_applications (name, email, year, interest, message, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """,
            (name, email, year, interest, message),
        )
        db.commit()
        application_id = cursor.lastrowid

        return {
            "success": True,
            "message": "Application submitted successfully",
            "application_id": application_id,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(exc)}",
        ) from exc
    finally:
        if cursor:
            cursor.close()
        db.close()
