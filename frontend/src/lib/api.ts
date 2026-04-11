const defaultBaseUrl = "http://localhost:5000";

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultBaseUrl;

function buildQuery(params?: Record<string, string | number | boolean | undefined>) {
    if (!params) {
        return "";
    }

    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            search.set(key, String(value));
        }
    });

    const query = search.toString();
    return query ? `?${query}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    if (!response.ok) {
        const raw = await response.text();
        try {
            const parsed = JSON.parse(raw) as { detail?: string };
            throw new Error(parsed.detail || `Request failed with status ${response.status}`);
        } catch {
            throw new Error(raw || `Request failed with status ${response.status}`);
        }
    }

    return response.json() as Promise<T>;
}

export function getHealth() {
    return request<{ status: string; app: string }>("/health");
}

export type PublicTeamMember = {
    id: number;
    full_name: string;
    role: string;
    team_domain?: string | null;
    year?: string | null;
    bio?: string | null;
    skills?: string | null;
    photo_url?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    email?: string | null;
    active: boolean;
    display_order: number;
};

export type PublicProject = {
    id: number;
    title: string;
    short_description?: string | null;
    full_description?: string | null;
    tech_stack?: string | null;
    github_url?: string | null;
    live_url?: string | null;
    image_url?: string | null;
    status?: string | null;
    current_lead?: string | null;
    former_leads?: string | null;
    contributors?: string | null;
    featured: boolean;
    display_order: number;
};

export type PublicFormerLead = {
    id: number;
    full_name: string;
    role_title?: string | null;
    tenure_start?: string | null;
    tenure_end?: string | null;
    handled_projects?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    photo_url?: string | null;
    short_note?: string | null;
    visible_on_site: boolean;
};

export type PublicEvent = {
    id: number;
    title: string;
    type?: string | null;
    description?: string | null;
    date?: string | null;
    venue?: string | null;
    registration_link?: string | null;
    registration_url?: string | null;
    poster_image_url?: string | null;
    speakers?: string | null;
    organizers?: string | null;
    status?: string | null;
    featured: boolean;
};

export type PublicResource = {
    id: number;
    title: string;
    description?: string | null;
    type?: string | null;
    url: string;
    category?: string | null;
    uploaded_by?: string | null;
};

export type PublicEventQuery = {
    search_title?: string;
    search_organizer?: string;
    search_location?: string;
};

export type PublicResourceQuery = {
    search_title?: string;
    search_category?: string;
    search_uploaded_by?: string;
    search_type?: string;
};

export type AdminDashboardCounts = {
    total_events: number;
    upcoming_events: number;
    past_events: number;
    total_resources: number;
    total_team_members: number;
    total_public_team_members: number;
    total_projects: number;
    total_join_applications: number;
    total_registrations: number;
    full_events: number;
    events_with_no_registrations: number;
};

export type AdminDashboardEvent = {
    id: number;
    title: string;
    date?: string | null;
    time?: string | null;
    location?: string | null;
    organizer?: string | null;
    registered_count?: number;
    seats_left?: number | null;
};

export type AdminDashboardResource = {
    id: number;
    title: string;
    type?: string | null;
    category?: string | null;
    uploaded_by?: string | null;
};

export type AdminDashboardProject = {
    id: number;
    title: string;
    short_description?: string | null;
    status?: string | null;
    current_lead?: string | null;
    featured?: boolean;
};

export type AdminDashboardTeamMember = {
    id: number;
    name: string;
    roll_no: string;
    role: string;
    url?: string | null;
};

export type AdminDashboardJoinApplication = {
    id: number;
    name: string;
    email: string;
    year?: string | null;
    interest?: string | null;
    message?: string | null;
};

export type AdminDashboardData = {
    counts: AdminDashboardCounts;
    recent_events: AdminDashboardEvent[];
    recent_resources: AdminDashboardResource[];
    recent_projects: AdminDashboardProject[];
    recent_team_members: AdminDashboardTeamMember[];
    recent_join_applications: AdminDashboardJoinApplication[];
};

export type UserProfile = {
    id: number;
    firebase_uid?: string | null;
    name: string;
    email?: string | null;
    roll_number?: string | null;
    role: string;
    created_at?: string | null;
    updated_at?: string | null;
};

export type UserProfileUpdatePayload = {
    name?: string;
    roll_number?: string;
};

export type JoinPayload = {
    name: string;
    email: string;
    year?: string;
    interest?: string;
    message?: string;
};

type ListResponse<T> = {
    success: boolean;
    items: T[];
    count: number;
};

export function getPublicTeam(limit = 100, offset = 0) {
    return request<ListResponse<PublicTeamMember>>(`/user/team${buildQuery({ limit, offset })}`);
}

export function getPublicProjects(limit = 20, offset = 0) {
    return request<ListResponse<PublicProject>>(`/user/projects${buildQuery({ limit, offset })}`);
}

export function getPublicFormerLeads(limit = 20, offset = 0) {
    return request<ListResponse<PublicFormerLead>>(`/user/former-leads${buildQuery({ limit, offset })}`);
}

export function getPublicEvents(limit = 20, offset = 0, filters: PublicEventQuery = {}) {
    return request<ListResponse<PublicEvent>>(`/user/events${buildQuery({ limit, offset, ...filters })}`);
}

export function getPublicEvent(eventId: number) {
    return request<PublicEvent>(`/user/events/${eventId}`);
}

export function getPublicResources(limit = 20, offset = 0, filters: PublicResourceQuery = {}) {
    return request<ListResponse<PublicResource>>(`/user/resources${buildQuery({ limit, offset, ...filters })}`);
}

export function submitJoinApplication(payload: JoinPayload) {
    return request<{ success: boolean; message: string; application_id: number }>("/user/join", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

function authedRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
    return request<T>(path, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(init?.headers || {}),
        },
    });
}

export function getUserProfile(token: string) {
    return authedRequest<UserProfile>("/user/profile", token);
}

export function updateUserProfile(token: string, payload: UserProfileUpdatePayload) {
    return authedRequest<UserProfile>("/user/profile", token, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function registerForEvent(token: string, eventId: number) {
    return authedRequest<{ success: boolean; message: string; event_id: number; user_id: number }>(
        `/user/events/${eventId}/register`,
        token,
        {
            method: "POST",
        },
    );
}

export function getAdminDashboard(token: string, limit = 5) {
    return authedRequest<{ success: boolean; data: AdminDashboardData }>(
        `/admin/dashboard${buildQuery({ limit })}`,
        token,
    );
}
