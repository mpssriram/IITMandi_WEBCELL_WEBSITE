from pydantic import BaseModel


class PublicProject(BaseModel):
    id: int
    title: str
    short_description: str | None = None
    full_description: str | None = None
    tech_stack: str | None = None
    github_url: str | None = None
    live_url: str | None = None
    image_url: str | None = None
    status: str | None = None
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
    type: str | None = None
    description: str | None = None
    date: str | None = None
    venue: str | None = None
    registration_link: str | None = None
    poster_image_url: str | None = None
    speakers: str | None = None
    organizers: str | None = None
    status: str | None = None
    featured: bool = False


class PublicJoinResponse(BaseModel):
    success: bool
    message: str
    application_id: int


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
