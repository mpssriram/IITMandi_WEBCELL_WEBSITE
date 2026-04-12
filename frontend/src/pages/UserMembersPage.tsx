import { useEffect, useState } from "react";

import { Github, Linkedin, Mail, Search, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { Reveal } from "@/components/Reveal";
import { UserAvatar } from "@/components/UserAvatar";
import { getPublicTeam, type PublicTeamMember } from "@/lib/api";
import { normalizeExternalUrl } from "@/lib/collections";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";

function domainColor(domain?: string | null) {
    const d = (domain || "").toLowerCase();
    if (d.includes("frontend") || d.includes("ui")) return "border-cyan-300/25 bg-cyan-400/10 text-cyan-200";
    if (d.includes("backend") || d.includes("api")) return "border-emerald-300/25 bg-emerald-400/10 text-emerald-200";
    if (d.includes("design") || d.includes("motion")) return "border-violet-300/25 bg-violet-400/10 text-violet-200";
    if (d.includes("product") || d.includes("ops")) return "border-amber-300/25 bg-amber-400/10 text-amber-200";
    return "border-slate-300/20 bg-slate-400/10 text-slate-300";
}

export function UserMembersPage() {
    const { token } = useOutletContext<UserAreaContext>();

    const [members, setMembers] = useState<PublicTeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeDomain, setActiveDomain] = useState("All");

    useEffect(() => {
        let mounted = true;
        getPublicTeam(100, 0)
            .then((res) => {
                if (!mounted) return;
                setMembers((res.items || []).filter((m) => m.active));
            })
            .catch(() => {
                if (mounted) setMembers([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, [token]);

    // Build unique domain list for filter tabs
    const domains = [
        "All",
        ...Array.from(
            new Set(
                members
                    .map((m) => m.team_domain || "")
                    .filter(Boolean)
            )
        ).sort(),
    ];

    const filtered = members.filter((m) => {
        const matchesDomain = activeDomain === "All" || m.team_domain === activeDomain;
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            m.full_name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            (m.team_domain || "").toLowerCase().includes(q) ||
            (m.skills || "").toLowerCase().includes(q);
        return matchesDomain && matchesSearch;
    });

    const skillTags = (raw?: string | null) =>
        (raw || "")
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 4);

    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                                <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
                            </div>
                        </div>
                        <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/10" />
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
                            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Team</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                                Member Directory
                            </h1>
                            <p className="mt-2 text-sm leading-7 text-slate-400">
                                {members.length} active member{members.length !== 1 ? "s" : ""} across the club.
                            </p>
                        </div>

                        <div className="group relative w-full sm:w-72">
                            <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-500 transition group-focus-within:text-cyan-300" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search members…"
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/10"
                            />
                        </div>
                    </div>

                    {/* Domain filter pills */}
                    {domains.length > 2 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {domains.map((domain) => (
                                <button
                                    key={domain}
                                    type="button"
                                    onClick={() => setActiveDomain(domain)}
                                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                                        activeDomain === domain
                                            ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                                            : "border-white/10 bg-white/5 text-slate-400 hover:border-cyan-300/25 hover:text-slate-200"
                                    }`}
                                >
                                    {domain}
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </Reveal>

            {!filtered.length ? (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-slate-400">
                    {search || activeDomain !== "All"
                        ? "No members match the current filter."
                        : "No members have been published yet."}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((member, i) => {
                        const github = normalizeExternalUrl(member.github_url || "");
                        const linkedin = normalizeExternalUrl(member.linkedin_url || "");
                        const email = member.email ? `mailto:${member.email}` : "";
                        const tags = skillTags(member.skills);
                        const domainCls = domainColor(member.team_domain);

                        return (
                            <Reveal key={member.id} delay={i * 0.025}>
                                <ElectricCard className="flex h-full flex-col p-5">
                                    {/* Avatar + name */}
                                    <div className="flex items-start gap-4">
                                        <UserAvatar name={member.full_name} photoUrl={member.photo_url} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-white">{member.full_name}</p>
                                            <p className="mt-0.5 truncate text-sm text-slate-400">{member.role}</p>
                                            {member.year && (
                                                <p className="mt-0.5 text-xs text-slate-600">{member.year}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Domain badge */}
                                    {member.team_domain && (
                                        <div className="mt-3">
                                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${domainCls}`}>
                                                {member.team_domain}
                                            </span>
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {member.bio && (
                                        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-400">
                                            {member.bio}
                                        </p>
                                    )}

                                    {/* Skills */}
                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-500"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Social links */}
                                    {(github || linkedin || email) && (
                                        <div className="mt-4 flex gap-2 border-t border-white/8 pt-4">
                                            {github && (
                                                <a
                                                    href={github}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="GitHub"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                                                >
                                                    <Github className="h-4 w-4" />
                                                </a>
                                            )}
                                            {linkedin && (
                                                <a
                                                    href={linkedin}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="LinkedIn"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                                                >
                                                    <Linkedin className="h-4 w-4" />
                                                </a>
                                            )}
                                            {email && (
                                                <a
                                                    href={email}
                                                    aria-label="Email"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                                                >
                                                    <Mail className="h-4 w-4" />
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

export default UserMembersPage;
