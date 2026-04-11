import { useMemo } from "react";

import { ArrowRight, Bell, CalendarClock, Link2, UserCircle2 } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { PixelBlast } from "@/components/PixelBlast";
import { Reveal } from "@/components/Reveal";
import type { UserAreaContext } from "@/layouts/UserAreaLayout";
import { dedupeEvents, dedupeResources, eventIdentity, normalizeExternalUrl, resourceIdentity } from "@/lib/collections";

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
    const { profile, previewEvents, previewResources, openProfile, openNotifications } = useOutletContext<UserAreaContext>();

    const cleanEvents = useMemo(() => dedupeEvents(previewEvents), [previewEvents]);
    const cleanResources = useMemo(() => dedupeResources(previewResources), [previewResources]);

    const upcomingEvents = useMemo(
        () =>
            cleanEvents
                .filter((eventItem) => {
                    if (!eventItem.date) {
                        return false;
                    }
                    const parsed = new Date(`${eventItem.date}T00:00:00`);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return !Number.isNaN(parsed.getTime()) && parsed >= today;
                })
                .slice(0, 3),
        [cleanEvents],
    );

    return (
        <div className="space-y-10 lg:space-y-12">
            <Reveal>
                <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                    <ElectricCard className="relative overflow-hidden p-6 sm:p-8">
                        <div className="pointer-events-none absolute inset-0 opacity-40">
                            <PixelBlast
                                className="h-full w-full"
                                color="#7cc3ff"
                                variant="diamond"
                                pixelSize={3}
                                patternDensity={0.86}
                                patternScale={2.35}
                                rippleIntensityScale={0.88}
                                edgeFade={0.34}
                                speed={0.34}
                                liquid={false}
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_32%),linear-gradient(160deg,rgba(5,13,27,0.54),rgba(5,12,24,0.76))]" />

                        <div className="relative">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Dashboard</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Welcome back, {profile?.name?.split(" ")[0] || "Member"}</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                                Club workspace entry point for your next actions. Jump into events, resources, and profile upkeep without clutter.
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/85">
                                Build with the team this week
                            </div>
                        </div>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5 sm:p-6">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Quick access</p>
                        <div className="mt-4 grid gap-2.5">
                            <Link
                                to="/user/events"
                                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            >
                                <span className="flex items-center gap-3">
                                    <CalendarClock className="h-4 w-4 text-cyan-300" />
                                    Events
                                </span>
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </Link>

                            <Link
                                to="/user/resources"
                                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            >
                                <span className="flex items-center gap-3">
                                    <Link2 className="h-4 w-4 text-cyan-300" />
                                    Resources
                                </span>
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </Link>

                            <button
                                type="button"
                                onClick={openNotifications}
                                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            >
                                <span className="flex items-center gap-3">
                                    <Bell className="h-4 w-4 text-cyan-300" />
                                    Notifications
                                </span>
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </button>

                            <button
                                type="button"
                                onClick={openProfile}
                                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            >
                                <span className="flex items-center gap-3">
                                    <UserCircle2 className="h-4 w-4 text-cyan-300" />
                                    Profile
                                </span>
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </ElectricCard>
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
                                    key={eventIdentity(eventItem)}
                                    to={`/user/events/${eventItem.id}`}
                                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
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
                </Reveal>

                <Reveal delay={0.1}>
                    <ElectricCard className="h-full p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Resources</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Recently shared</h2>
                            </div>
                            <Link to="/user/resources" className="text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
                                Browse all
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {cleanResources.slice(0, 4).map((resource) => {
                                const resourceUrl = normalizeExternalUrl(resource.url);
                                return resourceUrl ? (
                                    <a
                                        key={resourceIdentity(resource)}
                                        href={resourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-cyan-400/10"
                                    >
                                        <p className="font-semibold text-white">{resource.title}</p>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-300">{resource.description || resource.category || "Open resource"}</p>
                                    </a>
                                ) : (
                                    <div key={resourceIdentity(resource)} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-400">
                                        <p className="font-semibold text-slate-200">{resource.title}</p>
                                        <p className="mt-2 line-clamp-2 text-sm">{resource.description || "Link unavailable"}</p>
                                    </div>
                                );
                            })}

                            {!cleanResources.length ? (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                    Resources will show up here once they are published.
                                </div>
                            ) : null}
                        </div>
                    </ElectricCard>
                </Reveal>
            </section>
        </div>
    );
}

export default UserDashboardPage;
