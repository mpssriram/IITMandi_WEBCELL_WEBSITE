import type { PublicEvent, PublicProject, PublicResource, PublicTeamMember } from "@/lib/api";

function normalizeText(value?: string | number | null) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function safeKey(parts: Array<string | number | null | undefined>) {
    return parts.map((part) => normalizeText(part)).filter(Boolean).join("|");
}

export function uniqueBy<T>(items: T[], keyBuilder: (item: T) => string) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = keyBuilder(item);
        if (!key || seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

export function normalizeExternalUrl(value?: string | null) {
    const raw = (value || "").trim();
    if (!raw) {
        return null;
    }

    if (raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) {
        return raw;
    }

    if (/^https?:\/\//i.test(raw)) {
        return raw;
    }

    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) {
        return null;
    }

    return `https://${raw}`;
}

export function projectIdentity(project: PublicProject) {
    const semantic = safeKey(["project", project.title, project.live_url, project.github_url]);
    if (semantic) {
        return semantic;
    }
    return project.id ? `project:${project.id}` : "";
}

export function eventIdentity(eventItem: PublicEvent) {
    const semantic = safeKey(["event", eventItem.title, eventItem.date, eventItem.venue, eventItem.type]);
    if (semantic) {
        return semantic;
    }
    return eventItem.id ? `event:${eventItem.id}` : "";
}

export function resourceIdentity(resource: PublicResource) {
    const semantic = safeKey(["resource", resource.title, resource.url, resource.category, resource.type]);
    if (semantic) {
        return semantic;
    }
    return resource.id ? `resource:${resource.id}` : "";
}

export function teamIdentity(member: PublicTeamMember) {
    const semantic = safeKey(["team", member.full_name, member.email, member.role]);
    if (semantic) {
        return semantic;
    }
    return member.id ? `team:${member.id}` : "";
}

export function dedupeProjects(items: PublicProject[]) {
    return uniqueBy(items, projectIdentity);
}

export function dedupeEvents(items: PublicEvent[]) {
    return uniqueBy(items, eventIdentity);
}

export function dedupeResources(items: PublicResource[]) {
    return uniqueBy(items, resourceIdentity);
}

export function dedupeTeamMembers(items: PublicTeamMember[]) {
    return uniqueBy(items, teamIdentity);
}
