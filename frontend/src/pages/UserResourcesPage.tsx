import { useEffect, useMemo, useState } from "react";

import { ArrowUpRight, BookOpen, Megaphone, Search, SquareCode, Video } from "lucide-react";

import { ElectricCard } from "@/components/ElectricCard";
import { getPublicResources, type PublicResource } from "@/lib/api";

function normalize(value?: string | null) {
    return (value || "").trim().toLowerCase();
}

function matchesAny(value: string, checks: string[]) {
    return checks.some((item) => value.includes(item));
}

function getResourceBucket(resource: PublicResource) {
    const category = normalize(resource.category);
    const type = normalize(resource.type);
    const title = normalize(resource.title);
    const description = normalize(resource.description);
    const merged = `${category} ${type} ${title} ${description}`;

    if (matchesAny(merged, ["announcement", "operations", "notice"])) {
        return "Announcements";
    }
    if (matchesAny(merged, ["video", "tutorial", "blog", "article", "recording"])) {
        return "Tutorials & Blogs";
    }
    if (matchesAny(merged, ["code", "frontend", "backend", "api", "development", "programming"])) {
        return "Coding Resources";
    }
    return "Useful Links";
}

const bucketMeta = {
    "Useful Links": { icon: BookOpen, description: "Reference links, docs, and practical starting points." },
    "Coding Resources": { icon: SquareCode, description: "Hands-on references for building and shipping." },
    "Tutorials & Blogs": { icon: Video, description: "Recordings, explainers, tutorials, and learning material." },
    Announcements: { icon: Megaphone, description: "Operational notes, announcements, and fresh updates." },
} as const;

export function UserResourcesPage() {
    const [query, setQuery] = useState("");
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getPublicResources(60, 0)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setResources(response.items || []);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setResources([]);
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const filteredResources = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return resources.filter((resource) => {
            if (!normalizedQuery) {
                return true;
            }

            return [resource.title, resource.description, resource.category, resource.type, resource.uploaded_by]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });
    }, [query, resources]);

    const groupedResources = useMemo(() => {
        const groups = new Map<string, PublicResource[]>();
        filteredResources.forEach((resource) => {
            const bucket = getResourceBucket(resource);
            const current = groups.get(bucket) || [];
            current.push(resource);
            groups.set(bucket, current);
        });
        return Array.from(groups.entries());
    }, [filteredResources]);

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#061224] p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.08)_1px,transparent_1px)] bg-[size:36px_36px] opacity-35" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_38%)]" />
                <div className="resource-scan-line pointer-events-none absolute inset-x-0 top-0 h-24" />

                <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Resources</p>
                        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Grid-scan resource library</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                            Explore practical links, coding references, tutorials, and announcement-style updates in a layout that stays readable and ready for future filtering.
                        </p>
                    </div>

                    <ElectricCard intensity="soft" className="p-4">
                        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <Search className="h-4 w-4 text-cyan-300" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search title, category, uploader, or type"
                                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                            />
                        </label>
                    </ElectricCard>
                </div>
            </section>

            {loading ? (
                <section className="grid gap-4 lg:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                            <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
                            <div className="mt-4 h-20 animate-pulse rounded bg-white/10" />
                        </div>
                    ))}
                </section>
            ) : null}

            {!loading && groupedResources.length ? (
                <section className="grid gap-5">
                    {groupedResources.map(([bucket, items]) => {
                        const meta = bucketMeta[bucket as keyof typeof bucketMeta] || bucketMeta["Useful Links"];
                        const Icon = meta.icon;

                        return (
                            <ElectricCard key={bucket} className="p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-200">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">{bucket}</p>
                                                <h2 className="mt-1 font-display text-2xl font-semibold text-white">{bucket}</h2>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm text-slate-300">{meta.description}</p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                        {items.length} items
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                    {items.map((resource) => (
                                        <a
                                            key={resource.id}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block rounded-[1.4rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                                                    {resource.type || "resource"}
                                                </span>
                                                {resource.category ? (
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                        {resource.category}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <h3 className="mt-4 font-semibold text-white">{resource.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-slate-300">{resource.description || "Open resource to read more."}</p>
                                            <p className="mt-4 break-all text-xs text-slate-400">{resource.url}</p>
                                            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                                                Open link
                                                <ArrowUpRight className="h-4 w-4" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </ElectricCard>
                        );
                    })}
                </section>
            ) : null}

            {!loading && !groupedResources.length ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                    No resources matched your search. Try a different keyword and the grid will refill.
                </div>
            ) : null}
        </div>
    );
}

export default UserResourcesPage;
