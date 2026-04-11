import { useEffect, useMemo, useState } from "react";

import { ArrowRight, Bell, CalendarClock, FolderKanban, Link2, UserCircle2 } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";
import { getPublicProjects, type PublicProject } from "@/lib/api";

function formatEventDate(dateValue?: string | null) {
    if (!dateValue) {
        return "Date TBA";
    }

    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

export function UserDashboardPage() {
    const { profile, previewEvents, previewResources, notifications, openProfile } = useOutletContext<UserAreaContext>();
    const [projects, setProjects] = useState<PublicProject[]>([]);

    useEffect(() => {
        let mounted = true;

        getPublicProjects(3, 0)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setProjects(response.items || []);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setProjects([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const upcomingEvents = useMemo(
        () =>
            previewEvents.filter((eventItem) => {
                if (!eventItem.date) {
                    return false;
                }
                const parsed = new Date(`${eventItem.date}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !Number.isNaN(parsed.getTime()) && parsed >= today;
            }),
        [previewEvents],
    );

    return (
        <div className="space-y-8">
            <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <ElectricCard className="p-6 sm:p-7">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Dashboard</p>
                    <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Your Dev Cell hub</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        Stay on top of upcoming events, fresh resources, profile tasks, and the quickest paths into the rest of the workspace.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Upcoming</p>
                            <p className="mt-2 font-display text-3xl font-semibold text-white">{upcomingEvents.length}</p>
                            <p className="mt-2 text-sm text-slate-300">Events ready to explore</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Resources</p>
                            <p className="mt-2 font-display text-3xl font-semibold text-white">{previewResources.length}</p>
                            <p className="mt-2 text-sm text-slate-300">Useful links and guides</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Alerts</p>
                            <p className="mt-2 font-display text-3xl font-semibold text-white">{notifications.length}</p>
                            <p className="mt-2 text-sm text-slate-300">Actionable notifications</p>
                        </div>
                    </div>
                </ElectricCard>

                <ElectricCard intensity="soft" className="p-6">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Quick access</p>
                    <div className="mt-4 grid gap-3">
                        <Link
                            to="/user/events"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                        >
                            <span className="flex items-center gap-3">
                                <CalendarClock className="h-4 w-4 text-cyan-300" />
                                Events
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/user/resources"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                        >
                            <span className="flex items-center gap-3">
                                <Link2 className="h-4 w-4 text-cyan-300" />
                                Resources
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/user/notifications"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                        >
                            <span className="flex items-center gap-3">
                                <Bell className="h-4 w-4 text-cyan-300" />
                                Notifications
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={openProfile}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                        >
                            <span className="flex items-center gap-3">
                                <UserCircle2 className="h-4 w-4 text-cyan-300" />
                                Profile
                            </span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </ElectricCard>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <ElectricCard className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Upcoming events</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Preview only</h2>
                        </div>
                        <Link to="/user/events" className="text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                            View all
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {upcomingEvents.slice(0, 2).map((eventItem) => (
                            <Link
                                key={eventItem.id}
                                to={`/user/events/${eventItem.id}`}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                            >
                                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{formatEventDate(eventItem.date)}</p>
                                <p className="mt-2 font-semibold text-white">{eventItem.title}</p>
                                <p className="mt-2 line-clamp-2 text-sm text-slate-300">{eventItem.description || eventItem.venue || "Details available on the events page."}</p>
                            </Link>
                        ))}
                        {!upcomingEvents.length ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                Upcoming events will appear here once they are published.
                            </div>
                        ) : null}
                    </div>
                </ElectricCard>

                <ElectricCard className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Resources</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Useful links preview</h2>
                        </div>
                        <Link to="/user/resources" className="text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                            Browse all
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {previewResources.slice(0, 3).map((resource) => (
                            <a
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-cyan-400/10"
                            >
                                <p className="font-semibold text-white">{resource.title}</p>
                                <p className="mt-2 line-clamp-2 text-sm text-slate-300">{resource.description || resource.category || "Open resource"}</p>
                            </a>
                        ))}
                        {!previewResources.length ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                Resources will show up here once they are published.
                            </div>
                        ) : null}
                    </div>
                </ElectricCard>
            </section>

            <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                <ElectricCard intensity="soft" className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Notifications</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white">What needs attention</h2>
                        </div>
                        <Link to="/user/notifications" className="text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                            Open panel
                        </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                        {notifications.slice(0, 3).map((item) => (
                            <Link key={item.id} to={item.href} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-cyan-400/10">
                                <p className="font-semibold text-white">{item.title}</p>
                                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                            </Link>
                        ))}
                        {!notifications.length ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                No unread notifications right now.
                            </div>
                        ) : null}
                    </div>
                </ElectricCard>

                <ElectricCard className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Projects & registrations</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white">Keep moving, not scrolling</h2>
                        </div>
                        <FolderKanban className="h-5 w-5 text-cyan-300" />
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {projects.slice(0, 2).map((project) => (
                            <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{project.status || "active"}</p>
                                <p className="mt-2 font-semibold text-white">{project.title}</p>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-300">{project.short_description || "Project overview available from the public project feed."}</p>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-dashed border-cyan-300/20 bg-cyan-400/8 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Registrations</p>
                            <p className="mt-2 font-semibold text-white">Event sign-ups stay with each event</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Use the dedicated events pages to view details and follow each event registration flow.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                        Signed in as <span className="font-semibold text-white">{profile?.name || profile?.email || "Dev Cell member"}</span>.
                    </div>
                </ElectricCard>
            </section>
        </div>
    );
}
