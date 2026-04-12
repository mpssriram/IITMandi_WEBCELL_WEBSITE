import { useEffect, useState } from "react";
import { ArrowRight, Bell, BookOpen, CalendarClock, Layers, TicketCheck, UserCircle2, Users } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { Reveal } from "@/components/Reveal";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";

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
    const { token, profile, previewEvents, previewResources, unreadCount, openNotifications, openProfile } =
        useOutletContext<UserAreaContext>();

    const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(true);

    useEffect(() => {
        let mounted = true;
        import("@/lib/api").then(({ getMyRegistrations }) => {
            getMyRegistrations(token, 5)
                .then((res) => {
                    if (mounted) setMyRegistrations(res.items || []);
                })
                .catch(() => {
                    if (mounted) setMyRegistrations([]);
                })
                .finally(() => {
                    if (mounted) setLoadingRegistrations(false);
                });
        });
        return () => { mounted = false; };
    }, [token]);

    const upcomingEvents = previewEvents.slice(0, 3);
    const resources = previewResources.slice(0, 4);

    return (
        <div className="space-y-8">
            <Reveal>
                <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,19,40,0.96),rgba(6,14,27,0.9))] p-6 sm:p-8">
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Dashboard</p>
                    <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
                        Welcome back, {(profile?.name || "Member").split(" ")[0]}
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        Keep events, resources, and profile actions in one clean workspace.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Events</p>
                            <p className="mt-2 font-display text-2xl font-semibold text-white">{upcomingEvents.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Resources</p>
                            <p className="mt-2 font-display text-2xl font-semibold text-white">{resources.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Unread</p>
                            <p className="mt-2 font-display text-2xl font-semibold text-white">{unreadCount}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Profile</p>
                            <p className="mt-2 font-display text-2xl font-semibold text-white">
                                {profile?.roll_number ? "Ready" : "Pending"}
                            </p>
                        </div>
                    </div>
                </section>
            </Reveal>

            <section className="grid gap-6 xl:grid-cols-2">
                <Reveal delay={0.05}>
                    <ElectricCard className="h-full p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Upcoming events</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Your next sessions</h2>
                            </div>
                            <Link to="/user/events" className="text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
                                View all
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-3">
                            {upcomingEvents.map((eventItem) => (
                                <Link
                                    key={eventItem.id}
                                    to={`/user/events/${eventItem.id}`}
                                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                                >
                                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{formatEventDate(eventItem.date)}</p>
                                    <p className="mt-2 font-semibold text-white">{eventItem.title}</p>
                                    <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                                        {eventItem.description || eventItem.venue || "Details available on the events page."}
                                    </p>
                                </Link>
                            ))}

                            {!upcomingEvents.length ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                    Upcoming events will appear here once they are published.
                                </div>
                            ) : null}
                        </div>
                    </ElectricCard>
                </Reveal>

                <Reveal delay={0.1}>
                    <ElectricCard className="h-full p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Quick actions</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Workspace controls</h2>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3">
                            <Link to="/user/resources" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <BookOpen className="h-4 w-4 text-cyan-300" />
                                    Resources
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </Link>

                            <button type="button" onClick={openNotifications} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <Bell className="h-4 w-4 text-cyan-300" />
                                    Notifications
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </button>

                            <button type="button" onClick={openProfile} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <UserCircle2 className="h-4 w-4 text-cyan-300" />
                                    Edit profile
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </button>

                            <Link to="/user/events" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <CalendarClock className="h-4 w-4 text-cyan-300" />
                                    Event board
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </Link>

                            <Link to="/user/projects" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <Layers className="h-4 w-4 text-cyan-300" />
                                    Project showcase
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </Link>

                            <Link to="/user/members" className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/35 hover:bg-cyan-400/10">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                    <Users className="h-4 w-4 text-cyan-300" />
                                    Member directory
                                </span>
                                <ArrowRight className="h-4 w-4 text-cyan-100" />
                            </Link>
                        </div>
                    </ElectricCard>
                </Reveal>
            </section>

            {/* My Registrations Section */}
            <Reveal delay={0.15}>
                <ElectricCard className="p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                            <TicketCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-semibold text-white">My Registrations</h2>
                            <p className="text-sm text-slate-400">Events you are currently attending</p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loadingRegistrations ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                            ))
                        ) : myRegistrations.length > 0 ? (
                            myRegistrations.map((reg) => (
                                <Link
                                    key={reg.id}
                                    to={`/user/events/${reg.id}`}
                                    className="group rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-4 transition hover:border-emerald-300/40 hover:bg-emerald-400/10"
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/70">
                                        {formatEventDate(reg.date)}
                                    </p>
                                    <p className="mt-1.5 font-semibold text-white leading-tight">
                                        {reg.title}
                                    </p>
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200">
                                        <TicketCheck className="h-3.5 w-3.5" />
                                        Registered
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
                                You haven't registered for any upcoming events yet.
                                <div className="mt-2">
                                    <Link to="/user/events" className="font-semibold text-cyan-200 hover:underline">
                                        Browse the event board
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </ElectricCard>
            </Reveal>
        </div>
    );
}

export default UserDashboardPage;
