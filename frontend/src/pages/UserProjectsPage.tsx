import { useEffect, useState } from "react";

import { ExternalLink, Github, Layers, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { Reveal } from "@/components/Reveal";
import { getPublicProjects, type PublicProject } from "@/lib/api";
import { normalizeExternalUrl } from "@/lib/collections";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";

function techTags(raw?: string | null): string[] {
    if (!raw) return [];
    return raw
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);
}

function statusVariant(status?: string | null) {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "ongoing") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-200";
    if (s === "completed" || s === "done") return "border-sky-300/25 bg-sky-400/10 text-sky-200";
    if (s === "archived") return "border-slate-300/20 bg-slate-400/10 text-slate-400";
    return "border-cyan-300/20 bg-cyan-400/10 text-cyan-200";
}

export function UserProjectsPage() {
    const { token } = useOutletContext<UserAreaContext>();

    const [projects, setProjects] = useState<PublicProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let mounted = true;
        getPublicProjects(50, 0)
            .then((res) => {
                if (!mounted) return;
                setProjects(res.items || []);
            })
            .catch(() => {
                if (mounted) setProjects([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, [token]);

    const filtered = projects.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            p.title.toLowerCase().includes(q) ||
            (p.short_description || "").toLowerCase().includes(q) ||
            (p.tech_stack || "").toLowerCase().includes(q) ||
            (p.current_lead || "").toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                        <div className="mt-3 h-5 w-48 animate-pulse rounded-full bg-white/10" />
                        <div className="mt-3 h-12 animate-pulse rounded-xl bg-white/10" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-7">
            <Reveal>
                <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,40,0.96),rgba(6,14,27,0.9))] p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Projects</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                                Project Showcase
                            </h1>
                            <p className="mt-2 text-sm leading-7 text-slate-400">
                                {projects.length} project{projects.length !== 1 ? "s" : ""} built by the club.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="group relative w-full sm:w-72">
                            <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-500 transition group-focus-within:text-cyan-300" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects…"
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/10"
                            />
                        </div>
                    </div>
                </section>
            </Reveal>

            {!filtered.length ? (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-slate-400">
                    {search ? `No projects match "${search}".` : "No projects have been published yet."}
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((project, i) => {
                        const githubUrl = normalizeExternalUrl(project.github_url || "");
                        const liveUrl = normalizeExternalUrl(project.live_url || "");
                        const tags = techTags(project.tech_stack);
                        const statusCls = statusVariant(project.status);

                        return (
                            <Reveal key={project.id} delay={i * 0.03}>
                                <ElectricCard className="flex h-full flex-col p-5 sm:p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.featured && (
                                                <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
                                                    Featured
                                                </span>
                                            )}
                                            {project.status && (
                                                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusCls}`}>
                                                    {project.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title + description */}
                                    <div className="mt-4 flex-1">
                                        <h2 className="font-display text-lg font-semibold text-white leading-tight">
                                            {project.title}
                                        </h2>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                                            {project.short_description || project.full_description || "No description available."}
                                        </p>
                                    </div>

                                    {/* Meta */}
                                    {(project.current_lead || project.contributors) && (
                                        <div className="mt-4 space-y-1 text-xs text-slate-500">
                                            {project.current_lead && (
                                                <p>Lead: <span className="text-slate-300">{project.current_lead}</span></p>
                                            )}
                                            {project.contributors && (
                                                <p>Contributors: <span className="text-slate-300">{project.contributors}</span></p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tech tags */}
                                    {tags.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-400"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Links */}
                                    {(githubUrl || liveUrl) && (
                                        <div className="mt-5 flex gap-2 border-t border-white/8 pt-4">
                                            {githubUrl && (
                                                <a
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                                                >
                                                    <Github className="h-3.5 w-3.5" />
                                                    GitHub
                                                </a>
                                            )}
                                            {liveUrl && (
                                                <a
                                                    href={liveUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-400/10 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Live
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </ElectricCard>
                            </Reveal>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default UserProjectsPage;
