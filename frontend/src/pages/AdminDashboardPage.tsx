import { useEffect, useMemo, useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import { FaultyTerminal } from "@/components/FaultyTerminal";
import { GridMotion } from "@/components/GridMotion";
import { LetterGlitch } from "@/components/LetterGlitch";
import { ScrollStack } from "@/components/ScrollStack";
import { Stack } from "@/components/Stack";
import {
    API_BASE_URL,
    getAdminDashboard,
    type AdminDashboardData,
} from "@/lib/api";
import { Activity, ArrowRight, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const emptyDashboard: AdminDashboardData = {
    counts: {
        total_events: 0,
        upcoming_events: 0,
        past_events: 0,
        total_resources: 0,
        total_team_members: 0,
        total_public_team_members: 0,
        total_projects: 0,
        total_join_applications: 0,
        total_registrations: 0,
        full_events: 0,
        events_with_no_registrations: 0,
    },
    recent_events: [],
    recent_resources: [],
    recent_projects: [],
    recent_team_members: [],
    recent_join_applications: [],
};

export function AdminDashboardPage() {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<AdminDashboardData>(emptyDashboard);

    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem("devcell_id_token");
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }

        const validateAndLoad = async () => {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!mounted) {
                return;
            }

            if (!response.ok) {
                localStorage.removeItem("devcell_id_token");
                navigate("/admin/login", { replace: true });
                return;
            }

            const payload = (await response.json()) as {
                user?: {
                    role?: string;
                };
            };

            const isAdmin = payload?.user?.role === "admin";
            if (!isAdmin) {
                localStorage.removeItem("devcell_id_token");
                navigate("/admin/login", { replace: true });
                return;
            }

            const dashboardResponse = await getAdminDashboard(token, 5);
            if (!mounted) {
                return;
            }

            setDashboard(dashboardResponse.data || emptyDashboard);
            setAuthorized(true);
            setLoading(false);
        };

        validateAndLoad().catch(() => {
            if (!mounted) {
                return;
            }
            localStorage.removeItem("devcell_id_token");
            setLoading(false);
            navigate("/admin/login", { replace: true });
        });

        return () => {
            mounted = false;
        };
    }, [navigate]);

    const stats = useMemo(
        () => [
            { label: "Join submissions", value: String(dashboard.counts.total_join_applications) },
            { label: "Published projects", value: String(dashboard.counts.total_projects) },
            { label: "Upcoming events", value: String(dashboard.counts.upcoming_events) },
            { label: "Registrations", value: String(dashboard.counts.total_registrations) },
        ],
        [dashboard],
    );

    const workflowItems = useMemo(() => {
        const applicationCards = dashboard.recent_join_applications.slice(0, 2).map((application) => ({
            id: `app-${application.id}`,
            content: (
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Moderation</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white">{application.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                        {application.interest || "General interest"} | {application.year || "Year not shared"}
                    </p>
                </div>
            ),
        }));

        const projectCards = dashboard.recent_projects.slice(0, 1).map((project) => ({
            id: `project-${project.id}`,
            content: (
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Content ops</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white">{project.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                        {project.short_description || `${project.status || "active"} project ready for review.`}
                    </p>
                </div>
            ),
        }));

        const eventCards = dashboard.recent_events.slice(0, 1).map((eventItem) => ({
            id: `event-${eventItem.id}`,
            content: (
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Event pipeline</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-white">{eventItem.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                        {eventItem.location || "Venue TBD"} | {eventItem.registered_count || 0} registrations
                    </p>
                </div>
            ),
        }));

        return [...applicationCards, ...projectCards, ...eventCards];
    }, [dashboard]);

    const moduleItems = useMemo(
        () => [
            {
                id: "m1",
                content: (
                    <div>
                        <ClipboardList className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 text-sm font-semibold text-white">
                            {dashboard.recent_join_applications[0]?.name || "Applications queue"}
                        </p>
                    </div>
                ),
            },
            {
                id: "m2",
                content: (
                    <div>
                        <BarChart3 className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 text-sm font-semibold text-white">
                            {dashboard.recent_projects[0]?.title || "Project insights"}
                        </p>
                    </div>
                ),
            },
            {
                id: "m3",
                content: (
                    <div>
                        <Activity className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 text-sm font-semibold text-white">
                            {dashboard.recent_events[0]?.title || "Event pulse"}
                        </p>
                    </div>
                ),
            },
        ],
        [dashboard],
    );

    if (!authorized) {
        return (
            <div className="grid min-h-screen place-items-center bg-ink-950 px-4 text-center text-slate-300">
                <p className="text-sm">{loading ? "Loading admin dashboard..." : "Redirecting to admin login..."}</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-ink-950 text-white">
            <header className="relative overflow-hidden border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0 opacity-40">
                    <FaultyTerminal mouseReact={false} chromaticAberration={0.2} scanlineIntensity={0.48} glitchAmount={0.7} />
                </div>
                <GridMotion className="-z-10" />
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Admin dashboard</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-white">Operations overview</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        Manage public content, approvals, and workflow health from one place.
                    </p>
                    <div className="mt-4 h-8 w-56 overflow-hidden rounded-md border border-cyan-300/25">
                        <LetterGlitch className="h-full w-full" glitchSpeed={62} outerVignette={false}>
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/90">
                                LIVE OPS FEED
                            </span>
                        </LetterGlitch>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <ElectricCard key={stat.label} intensity="soft" className="p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">{stat.label}</p>
                            <p className="mt-3 font-display text-3xl font-semibold text-white">{stat.value}</p>
                        </ElectricCard>
                    ))}
                </section>

                <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Activity workflow</p>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Stacked admin actions</h2>
                        <div className="mt-6">
                            <ScrollStack items={workflowItems.length ? workflowItems : moduleItems} />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Module previews</p>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Quick modules</h2>
                        <Stack className="mt-6" items={moduleItems} />
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Recent resources</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                            {dashboard.recent_resources.length ? (
                                dashboard.recent_resources.slice(0, 3).map((resource) => (
                                    <p key={resource.id}>{resource.title}</p>
                                ))
                            ) : (
                                <p>No resources available.</p>
                            )}
                        </div>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Recent projects</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                            {dashboard.recent_projects.length ? (
                                dashboard.recent_projects.slice(0, 3).map((project) => (
                                    <p key={project.id}>
                                        {project.title}
                                        {project.status ? ` | ${project.status}` : ""}
                                    </p>
                                ))
                            ) : (
                                <p>No projects available.</p>
                            )}
                        </div>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Core team snapshot</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                            {dashboard.recent_team_members.length ? (
                                dashboard.recent_team_members.slice(0, 3).map((member) => (
                                    <p key={member.id}>
                                        {member.name} | {member.role}
                                    </p>
                                ))
                            ) : (
                                <p>No team data available.</p>
                            )}
                        </div>
                    </ElectricCard>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Security</p>
                            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Permission-aware access</h3>
                        </div>
                        <ShieldCheck className="h-7 w-7 text-cyan-300" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        Admin routes are unlocked only when Firebase login succeeds and the mapped local user row has role set to admin.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
                    >
                        Refresh admin data
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </section>
            </main>
        </div>
    );
}
