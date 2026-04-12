import { useEffect, useMemo, useState } from "react";

import { CalendarClock, Clock3, MapPin, Search, Sparkles, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { getPublicEvents, type PublicEvent } from "@/lib/api";
import { dedupeEvents, eventIdentity } from "@/lib/collections";

type EventTab = "upcoming" | "past";

function parseEventDate(dateValue?: string | null) {
    if (!dateValue) {
        return null;
    }
    const parsed = new Date(`${dateValue}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isUpcoming(eventItem: PublicEvent) {
    const parsed = parseEventDate(eventItem.date);
    if (!parsed) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed >= today;
}

function formatEventDate(dateValue?: string | null) {
    const parsed = parseEventDate(dateValue);
    if (!parsed) {
        return dateValue || "Date TBA";
    }
    return parsed.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function EventCard({ eventItem }: { eventItem: PublicEvent }) {
    return (
        <Link
            to={`/user/events/${eventItem.id}`}
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-cyan-400/10"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(135deg,transparent,rgba(59,130,246,0.04))] opacity-0 transition group-hover:opacity-100" />
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                    {eventItem.type || "event"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                    {(eventItem.status || (isUpcoming(eventItem) ? "upcoming" : "completed")).replace(/_/g, " ")}
                </span>
            </div>

            <h2 className="mt-4 font-display text-2xl font-semibold text-white">{eventItem.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-300">
                {eventItem.description || "Event details will be available on the full event page."}
            </p>

            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-cyan-300" />
                    {formatEventDate(eventItem.date)}
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-300" />
                    <span className="truncate">{eventItem.venue || "Venue TBA"}</span>
                </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-cyan-100 transition group-hover:text-cyan-50">
                Open details
                <Clock3 className="h-4 w-4" />
            </div>
        </Link>
    );
}

export function UserEventsPage() {
    const [tab, setTab] = useState<EventTab>("upcoming");
    const [query, setQuery] = useState("");
    const [events, setEvents] = useState<PublicEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getPublicEvents(80, 0)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setEvents(dedupeEvents(response.items || []));
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setEvents([]);
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const filteredEvents = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const matching = dedupeEvents(events).filter((eventItem) => {
            const matchesTab = tab === "upcoming" ? isUpcoming(eventItem) : !isUpcoming(eventItem);
            if (!matchesTab) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return [eventItem.title, eventItem.description, eventItem.venue, eventItem.type, eventItem.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery));
        });

        return matching.sort((left, right) => {
            const leftDate = parseEventDate(left.date)?.getTime() || 0;
            const rightDate = parseEventDate(right.date)?.getTime() || 0;
            return tab === "upcoming" ? leftDate - rightDate : rightDate - leftDate;
        });
    }, [events, query, tab]);

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,18,36,0.95),rgba(4,10,22,0.95))] p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(96,165,250,0.2),transparent_32%),radial-gradient(circle_at_50%_85%,rgba(99,102,241,0.14),transparent_30%)]" />
                <div className="pointer-events-none absolute right-[-3.5rem] top-[-3.5rem] rounded-full border border-cyan-300/20 bg-cyan-400/10 p-6">
                    <Ticket className="h-8 w-8 text-cyan-100/75" />
                </div>
                <div className="pointer-events-none absolute left-[-2.5rem] bottom-[-2.5rem] rounded-full border border-blue-300/20 bg-blue-400/10 p-5">
                    <Sparkles className="h-6 w-6 text-blue-100/75" />
                </div>

                <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Events</p>
                        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Upcoming and past events</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                            Search, filter, and open event details with clear status and registration visibility.
                        </p>
                    </div>

                    <ElectricCard intensity="soft" className="p-4">
                        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <Search className="h-4 w-4 text-cyan-300" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search title, venue, type, or status"
                                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                            />
                        </label>
                    </ElectricCard>
                </div>

                <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                    {(["upcoming", "past"] as EventTab[]).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setTab(item)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                                tab === item ? "bg-cyan-400 text-ink-950" : "text-slate-300 hover:text-white"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                              <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                              <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-white/10" />
                              <div className="mt-3 h-16 animate-pulse rounded bg-white/10" />
                          </div>
                      ))
                    : null}

                {!loading && filteredEvents.map((eventItem) => <EventCard key={eventIdentity(eventItem)} eventItem={eventItem} />)}

                {!loading && !filteredEvents.length ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300 md:col-span-2">
                        No {tab} events matched your current search. Try a different keyword or switch tabs.
                    </div>
                ) : null}
            </section>
        </div>
    );
}

export default UserEventsPage;

