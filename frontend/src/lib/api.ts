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
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
        ...init,
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
    poster_image_url?: string | null;
    speakers?: string | null;
    organizers?: string | null;
    status?: string | null;
    featured: boolean;
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

export function getPublicEvents(limit = 20, offset = 0) {
    return request<ListResponse<PublicEvent>>(`/user/events${buildQuery({ limit, offset })}`);
}

export function submitJoinApplication(payload: JoinPayload) {
    return request<{ success: boolean; message: string; application_id: number }>("/user/join", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}