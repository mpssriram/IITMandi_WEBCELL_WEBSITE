from typing import Literal

from pydantic import BaseModel, field_validator


ProjectStatus = Literal["active", "maintenance", "completed", "archived", "planned"]
EventStatus = Literal["upcoming", "ongoing", "completed", "cancelled"]
EventType = Literal["workshop", "hackathon", "talk", "bootcamp", "showcase", "other"]


class PublicProject(BaseModel):
    id: int
    title: str
    short_description: str | None = None
    full_description: str | None = None
    tech_stack: str | None = None
    github_url: str | None = None
    live_url: str | None = None
    image_url: str | None = None
    status: ProjectStatus = "active"
    current_lead: str | None = None
    former_leads: str | None = None
    contributors: str | None = None
    featured: bool = False
    display_order: int = 0


class PublicTeamMember(BaseModel):
    id: int
    full_name: str
    role: str
    team_domain: str | None = None
    year: str | None = None
    bio: str | None = None
    skills: str | None = None
    photo_url: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    email: str | None = None
    active: bool = True
    display_order: int = 0


class PublicFormerLead(BaseModel):
    id: int
    full_name: str
    role_title: str | None = None
    tenure_start: str | None = None
    tenure_end: str | None = None
    handled_projects: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    photo_url: str | None = None
    short_note: str | None = None
    visible_on_site: bool = True


class PublicEvent(BaseModel):
    id: int
    title: str
    type: EventType | None = None
    description: str | None = None
    date: str | None = None
    venue: str | None = None
    registration_link: str | None = None
    poster_image_url: str | None = None
    speakers: str | None = None
    organizers: str | None = None
    status: EventStatus = "upcoming"
    featured: bool = False

    @field_validator("type", mode="before")
    @classmethod
    def normalize_type(cls, value):
        if value is None:
            return None
        normalized = str(value).strip().lower()
        if normalized in {"workshop", "hackathon", "talk", "bootcamp", "showcase", "other"}:
            return normalized
        return "other"

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, value):
        normalized = str(value or "").strip().lower()
        if normalized in {"upcoming", "ongoing", "completed", "cancelled"}:
            return normalized
        return "upcoming"


class PublicJoinResponse(BaseModel):
    success: bool
    message: str
    application_id: int


class JoinApplicationRequest(BaseModel):
    name: str
    email: str
    year: str | None = None
    interest: str | None = None
    message: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def validate_name(cls, value):
        name = str(value or "").strip()
        if len(name) < 2:
            raise ValueError("name must be at least 2 characters")
        return name

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        email = str(value or "").strip().lower()
        if not email or "@" not in email:
            raise ValueError("valid email is required")
        return email

    @field_validator("year", "interest", "message", mode="before")
    @classmethod
    def normalize_optional_text(cls, value):
        if value is None:
            return None
        cleaned = str(value).strip()
        return cleaned or None


class PublicListProjectsResponse(BaseModel):
    success: bool
    items: list[PublicProject]
    count: int


class PublicListTeamResponse(BaseModel):
    success: bool
    items: list[PublicTeamMember]
    count: int


class PublicListFormerLeadsResponse(BaseModel):
    success: bool
    items: list[PublicFormerLead]
    count: int


class PublicListEventsResponse(BaseModel):
    success: bool
    items: list[PublicEvent]
    count: int
