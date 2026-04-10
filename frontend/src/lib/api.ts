const defaultBaseUrl = "http://localhost:5000";

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultBaseUrl;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
        ...init,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
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

export function getPublicTeam() {
    return request<ListResponse<PublicTeamMember>>("/user/team");
}

export function getPublicProjects() {
    return request<ListResponse<PublicProject>>("/user/projects");
}

export function getPublicFormerLeads() {
    return request<ListResponse<PublicFormerLead>>("/user/former-leads");
}

export function getPublicEvents() {
    return request<ListResponse<PublicEvent>>("/user/events");
}

export function submitJoinApplication(payload: JoinPayload) {
    return request<{ success: boolean; message: string; application_id: number }>("/user/join", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}