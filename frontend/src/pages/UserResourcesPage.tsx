import { useEffect, useMemo, useState } from "react";

import { ArrowUpRight, BookOpen, Code2, FileText, Megaphone, Search, Video } from "lucide-react";

import { ElectricCard } from "@/components/ElectricCard";
import { GlassIcons, type GlassIconsItem } from "@/components/GlassIcons";
import { getPublicResources, type PublicResource } from "@/lib/api";
import { dedupeResources, normalizeExternalUrl, resourceIdentity } from "@/lib/collections";

type ResourceBucket = "all" | "tutorials" | "coding" | "docs" | "links" | "announcements";

type BucketMeta = {
    label: string;
    description: string;
    icon: typeof BookOpen;
    color: string;
    keywords: string[];
};

const BUCKETS: Record<Exclude<ResourceBucket, "all">, BucketMeta> = {
    tutorials: {
        label: "Tutorials & Blogs",
        description: "Walkthroughs, explainers, videos, and blog posts for learning.",
        icon: Video,
        color: "linear-gradient(hsl(223, 94%, 58%), hsl(207, 95%, 58%))",
        keywords: ["tutorial", "blog", "video", "recording", "article", "session"],
    },
    coding: {
        label: "Coding Resources",
        description: "Practical references for frontend, backend, APIs, and dev workflows.",
        icon: Code2,
        color: "linear-gradient(hsl(193, 96%, 52%), hsl(219, 95%, 56%))",
        keywords: ["code", "frontend", "backend", "api", "programming", "development"],
    },
    docs: {
        label: "Docs",
        description: "Official docs, technical notes, setup guides, and specs.",
        icon: FileText,
        color: "linear-gradient(hsl(253, 92%, 58%), hsl(273, 90%, 60%))",
        keywords: ["docs", "documentation", "spec", "guide", "manual"],
    },
    links: {
        label: "Useful Links",
        description: "Curated tools, references, and external links used by members.",
        icon: BookOpen,
        color: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
        keywords: ["link", "tool", "library", "framework", "reference"],
    },
    announcements: {
        label: "Announcements",
        description: "News, notices, and important updates from the club.",
        icon: Megaphone,
        color: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
        keywords: ["announcement", "notice", "news", "update", "ops", "operations"],
    },
};

function normalized(value?: string | null) {
    return (value || "").trim().toLowerCase();
}

function classifyResource(resource: PublicResource): Exclude<ResourceBucket, "all"> {
    const haystack = normalized([resource.title, resource.description, resource.category, resource.type, resource.uploaded_by].filter(Boolean).join(" "));

    if (BUCKETS.announcements.keywords.some((keyword) => haystack.includes(keyword))) {
        return "announcements";
    }
    if (BUCKETS.tutorials.keywords.some((keyword) => haystack.includes(keyword))) {
        return "tutorials";
    }
    if (BUCKETS.coding.keywords.some((keyword) => haystack.includes(keyword))) {
        return "coding";
    }
    if (BUCKETS.docs.keywords.some((keyword) => haystack.includes(keyword))) {
        return "docs";
    }
    return "links";
}

export function UserResourcesPage() {
    const [query, setQuery] = useState("");
    const [activeBucket, setActiveBucket] = useState<ResourceBucket>("all");
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getPublicResources(120, 0)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setResources(dedupeResources(response.items || []));
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

    const iconItems = useMemo<GlassIconsItem[]>(
        () => [
            {
                icon: <BookOpen className="h-5 w-5 text-white" />,
                color: "linear-gradient(hsl(193, 96%, 52%), hsl(219, 95%, 56%))",
                label: "All",
                value: "all",
            },
            ...Object.entries(BUCKETS).map(([key, meta]) => ({
                icon: <meta.icon className="h-5 w-5 text-white" />,
                color: meta.color,
                label: meta.label,
                value: key,
            })),
        ],
        [],
    );

    const activeIndex = useMemo(() => iconItems.findIndex((item) => item.value === activeBucket), [activeBucket, iconItems]);

    const filteredResources = useMemo(() => {
        const q = normalized(query);

        return resources.filter((resource) => {
            const bucket = classifyResource(resource);
            const bucketMatch = activeBucket === "all" ? true : bucket === activeBucket;
            if (!bucketMatch) {
                return false;
            }
            if (!q) {
                return true;
            }
            return [resource.title, resource.description, resource.category, resource.type, resource.uploaded_by]
                .filter(Boolean)
                .some((value) => normalized(String(value)).includes(q));
        });
    }, [activeBucket, query, resources]);

    const groupedResources = useMemo(() => {
        const grouped = new Map<Exclude<ResourceBucket, "all">, PublicResource[]>();
        filteredResources.forEach((resource) => {
            const bucket = classifyResource(resource);
            const current = grouped.get(bucket) || [];
            current.push(resource);
            grouped.set(bucket, current);
        });
        return grouped;
    }, [filteredResources]);

    const visibleBuckets = useMemo(() => {
        if (activeBucket !== "all") {
            return [activeBucket];
        }

        return (Object.keys(BUCKETS) as Array<Exclude<ResourceBucket, "all">>).filter((bucket) => (groupedResources.get(bucket) || []).length > 0);
    }, [activeBucket, groupedResources]);

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#051120] p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_38%),radial-gradient(circle_at_80%_25%,rgba(96,165,250,0.18),transparent_38%),linear-gradient(180deg,rgba(3,8,18,0.48),rgba(3,8,18,0.86))]" />

                <div className="relative grid gap-6">
                    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Resources</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Resource library</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                                Compact, categorized resource navigation for tutorials, coding material, docs, useful links, and announcements.
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

                    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-3 sm:px-5">
                        <GlassIcons
                            className="grid-cols-3 gap-6 py-4 sm:grid-cols-6"
                            items={iconItems}
                            activeIndex={activeIndex}
                            onItemClick={(item) => setActiveBucket((item.value as ResourceBucket) || "all")}
                        />
                    </div>
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

            {!loading && visibleBuckets.length ? (
                <section className="grid gap-5">
                    {visibleBuckets.map((bucket) => {
                        const meta = BUCKETS[bucket];
                        const bucketItems = groupedResources.get(bucket) || [];
                        return (
                            <ElectricCard key={bucket} className="p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-200">
                                                <meta.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">{meta.label}</p>
                                                <h2 className="mt-1 font-display text-2xl font-semibold text-white">{meta.label}</h2>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm text-slate-300">{meta.description}</p>
                                    </div>

                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                        {bucketItems.length} items
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                    {bucketItems.map((resource) => {
                                        const resourceUrl = normalizeExternalUrl(resource.url);
                                        return (
                                            <article key={resourceIdentity(resource)} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
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
                                                <p className="mt-4 break-all text-xs text-slate-400">{resource.url || "Not available yet"}</p>

                                                {resourceUrl ? (
                                                    <a
                                                        href={resourceUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-cyan-50"
                                                    >
                                                        Open link
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                                                        Not available yet
                                                    </span>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            </ElectricCard>
                        );
                    })}
                </section>
            ) : null}

            {!loading && !filteredResources.length ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                    No resources matched your search and filters. Try a different keyword or category.
                </div>
            ) : null}
        </div>
    );
}

export default UserResourcesPage;

