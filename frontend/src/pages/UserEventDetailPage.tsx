import { useEffect, useState } from "react";

import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { getPublicEvent, type PublicEvent } from "@/lib/api";

function formatEventDate(dateValue?: string | null) {
    if (!dateValue) {
        return "Date TBA";
    }

    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return dateValue;
    }

    return parsed.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function UserEventDetailPage() {
    const params = useParams();
    const [eventItem, setEventItem] = useState<PublicEvent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const id = Number(params.id);

        if (!Number.isFinite(id)) {
            setLoading(false);
            return;
        }

        getPublicEvent(id)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setEventItem(response);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setEventItem(null);
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [params.id]);

    if (loading) {
        return <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">Loading event details...</div>;
    }

    if (!eventItem) {
        return (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                Event details could not be loaded. <Link to="/user/events" className="font-semibold text-cyan-100">Go back to events</Link>.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/user/events" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </Link>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <ElectricCard className="p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                            {eventItem.type || "event"}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                            {eventItem.status || "upcoming"}
                        </span>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{eventItem.title}</h1>
                    <p className="mt-4 text-sm leading-8 text-slate-300">
                        {eventItem.description || "More details for this event will be shared soon."}
                    </p>
                </ElectricCard>

                <div className="space-y-4">
                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Schedule</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-4 w-4 text-cyan-300" />
                                {formatEventDate(eventItem.date)}
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-cyan-300" />
                                {eventItem.venue || "Venue TBA"}
                            </div>
                        </div>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Hosts</p>
                        <p className="mt-4 text-sm text-slate-300">{eventItem.organizers || eventItem.speakers || "Organizer details will be added here."}</p>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <div className="flex items-center gap-3 text-cyan-200">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-sm font-semibold text-white">Next step</p>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">
                            Use the event link below for the live registration flow whenever one is available.
                        </p>
                        {eventItem.registration_link ? (
                            <a
                                href={eventItem.registration_link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300"
                            >
                                Open registration
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                Registration link will appear here once it is published.
                            </div>
                        )}
                    </ElectricCard>
                </div>
            </section>
        </div>
    );
}

export default UserEventDetailPage;
