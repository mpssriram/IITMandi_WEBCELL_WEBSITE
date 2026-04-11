import { useEffect, useMemo, useState } from "react";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    Globe2,
    ListChecks,
    MapPin,
    Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { Prism } from "@/components/Prism";
import { getPublicEvent, type PublicEvent } from "@/lib/api";
import { normalizeExternalUrl } from "@/lib/collections";

type ParsedEventContent = {
    overview: string[];
    highlights: string[];
    agenda: string[];
    prerequisites: string[];
};

const SECTION_LABELS: Record<Exclude<keyof ParsedEventContent, "overview">, RegExp> = {
    highlights: /^(highlights?|key\s+points?|what\s+to\s+expect)\s*[:\-]?\s*(.*)$/i,
    agenda: /^(agenda|schedule|plan)\s*[:\-]?\s*(.*)$/i,
    prerequisites: /^(prerequisites?|requirements?|before\s+you\s+come)\s*[:\-]?\s*(.*)$/i,
};

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

function parseStructuredContent(description?: string | null): ParsedEventContent {
    const empty: ParsedEventContent = {
        overview: [],
        highlights: [],
        agenda: [],
        prerequisites: [],
    };

    const raw = (description || "").trim();
    if (!raw) {
        return empty;
    }

    const lines = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    let currentSection: keyof ParsedEventContent = "overview";

    lines.forEach((line) => {
        let matchedSection: keyof ParsedEventContent | null = null;
        let inlineValue = "";

        (Object.keys(SECTION_LABELS) as Array<Exclude<keyof ParsedEventContent, "overview">>).forEach((key) => {
            if (matchedSection) {
                return;
            }
            const match = line.match(SECTION_LABELS[key]);
            if (match) {
                matchedSection = key;
                inlineValue = (match[2] || "").trim();
            }
        });

        if (matchedSection) {
            currentSection = matchedSection;
            if (inlineValue) {
                empty[currentSection].push(inlineValue);
            }
            return;
        }

        const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
            empty[currentSection].push(bulletMatch[1].trim());
            return;
        }

        empty[currentSection].push(line);
    });

    return empty;
}

function splitParagraphs(text?: string | null) {
    return (text || "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
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

    const parsedContent = useMemo(() => parseStructuredContent(eventItem?.description), [eventItem?.description]);
    const descriptionParagraphs = useMemo(() => splitParagraphs(eventItem?.description), [eventItem?.description]);

    if (loading) {
        return <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">Loading event details...</div>;
    }

    if (!eventItem) {
        return (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300">
                Event details could not be loaded.{" "}
                <Link to="/user/events" className="font-semibold text-cyan-100">
                    Go back to events
                </Link>
                .
            </div>
        );
    }

    const registrationUrl = normalizeExternalUrl(eventItem.registration_link || eventItem.registration_url);
    const posterUrl = normalizeExternalUrl(eventItem.poster_image_url || "");
    const hosts = [eventItem.organizers, eventItem.speakers].filter(Boolean).join(" | ") || null;
    const statusLabel = (eventItem.status || "upcoming").replace(/_/g, " ");

    return (
        <div className="relative space-y-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_25%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.8),rgba(5,8,22,0))]">
                <Prism className="absolute inset-0 opacity-55" />
            </div>

            <Link to="/user/events" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-cyan-50">
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </Link>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <ElectricCard className="overflow-hidden p-0">
                        <div className="relative min-h-[18rem] overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(6,17,35,0.95),rgba(4,10,22,0.88))] p-6 sm:p-7">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_80%_28%,rgba(124,58,237,0.14),transparent_26%)]" />
                            <div className="relative flex h-full flex-col justify-between gap-8 lg:flex-row">
                                <div className="max-w-3xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                                            {eventItem.type || "event"}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                            {statusLabel}
                                        </span>
                                        {eventItem.featured ? (
                                            <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                                                Featured
                                            </span>
                                        ) : null}
                                    </div>

                                    <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold text-white sm:text-4xl">{eventItem.title}</h1>
                                    <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                                        {parsedContent.overview[0] || eventItem.description || "Detailed event description will be published soon."}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {eventItem.date ? (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                                {formatEventDate(eventItem.date)}
                                            </span>
                                        ) : null}
                                        {eventItem.venue ? (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                                {eventItem.venue}
                                            </span>
                                        ) : null}
                                        {hosts ? (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                                {hosts}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {posterUrl ? (
                                    <div className="relative min-h-[13rem] w-full max-w-[18rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-900/40 shadow-[0_28px_90px_-40px_rgba(34,211,238,0.45)] lg:min-h-full lg:w-[18rem]">
                                        <img src={posterUrl} alt={eventItem.title} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.72))]" />
                                    </div>
                                ) : (
                                    <div className="flex w-full max-w-[18rem] items-center justify-center rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.04] p-6 text-center text-sm text-slate-300">
                                        Poster not available.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-0 border-t border-white/10 md:grid-cols-3">
                            <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r md:border-white/10">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">Highlights</p>
                                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                                    {parsedContent.highlights.length ? (
                                        parsedContent.highlights.map((item) => (
                                            <div key={item} className="flex gap-3">
                                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                                                <p>{item}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No highlights published yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-b border-white/10 p-6 md:border-b-0 md:border-r md:border-white/10">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">Agenda</p>
                                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                                    {parsedContent.agenda.length ? (
                                        parsedContent.agenda.map((item, index) => (
                                            <div key={item} className="flex gap-3">
                                                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-[10px] font-semibold text-cyan-100">
                                                    {index + 1}
                                                </span>
                                                <p>{item}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Agenda will be announced by the organizers.</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">Prerequisites</p>
                                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                                    {parsedContent.prerequisites.length ? (
                                        parsedContent.prerequisites.map((item) => (
                                            <div key={item} className="flex gap-3">
                                                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                                                <p>{item}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No prerequisites listed yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ElectricCard>

                    <ElectricCard className="p-6 sm:p-7">
                        <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4 text-cyan-200" />
                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Full overview</p>
                        </div>
                        <div className="mt-4 space-y-4 text-sm leading-8 text-slate-300">
                            {descriptionParagraphs.length ? descriptionParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>Detailed content is not available yet.</p>}
                        </div>
                    </ElectricCard>
                </div>

                <div className="space-y-4">
                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Schedule</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-300">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-4 w-4 text-cyan-300" />
                                <span>{formatEventDate(eventItem.date)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-cyan-300" />
                                <span>{eventItem.venue || "Venue TBA"}</span>
                            </div>
                        </div>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Hosts</p>
                        <p className="mt-4 text-sm leading-7 text-slate-300">{hosts || "Host details are not published yet."}</p>
                    </ElectricCard>

                    <ElectricCard intensity="soft" className="p-5">
                        <div className="flex items-center gap-3 text-cyan-200">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-sm font-semibold text-white">Registration</p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                            {registrationUrl
                                ? "Registration is open. Use the official link below."
                                : "Registration link is not published yet. Check back soon."}
                        </p>

                        {registrationUrl ? (
                            <a
                                href={registrationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300"
                            >
                                Open registration
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400"
                            >
                                Registration opening soon
                                <Globe2 className="h-4 w-4" />
                            </button>
                        )}
                    </ElectricCard>
                </div>
            </section>
        </div>
    );
}

export default UserEventDetailPage;

