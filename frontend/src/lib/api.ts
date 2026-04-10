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