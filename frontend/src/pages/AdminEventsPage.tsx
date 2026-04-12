import { useEffect, useState, useCallback } from "react";
import { 
    Calendar, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    MapPin, 
    Clock, 
    Users,
    Edit3,
    Trash2,
    Globe,
    X,
    AlertCircle,
    Eye,
    Download
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { 
    getAdminEvents, 
    createAdminEvent,
    updateAdminEvent,
    deleteAdminEvent,
    getAdminEventRegistrations,
    exportAdminEventRegistrations,
    type PublicEvent,
    type EventRegistration
} from "@/lib/api";

type EventForm = {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    max_participants: string;
};

const EMPTY_FORM: EventForm = {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizer: "Dev Cell",
    max_participants: "",
};

export default function AdminEventsPage() {
    const { token } = useAuth();
    const [events, setEvents] = useState<PublicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Modal States
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [form, setForm] = useState<EventForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Registrations Viewer State
    const [registrationsOpen, setRegistrationsOpen] = useState(false);
    const [activeEventTitle, setActiveEventTitle] = useState("");
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loadingRegs, setLoadingRegs] = useState(false);

    const fetchEvents = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminEvents(token, 50, 0, { search_title: search });
            setEvents(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load events.");
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchEvents(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchEvents]);

    const handleOpenCreate = () => {
        setEditingEventId(null);
        setForm(EMPTY_FORM);
        setSubmitError(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (event: PublicEvent) => {
        setEditingEventId(event.id);
        const [h, m] = event.time ? event.time.split(":") : ["00", "00"];
        setForm({
            title: event.title || "",
            description: event.description || "",
            date: event.date?.split("T")[0] || "",
            time: `${h}:${m}`,
            location: event.venue || event.location || "",
            organizer: event.organizers || event.organizer || "",
            max_participants: (event as any).max_participants?.toString() || ""
        });
        setSubmitError(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!token || !window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await deleteAdminEvent(token, id, true); // force_delete = true
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (err: any) {
            alert(err?.message || "Failed to delete event.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                date: form.date,
                time: form.time,
                location: form.location,
                organizer: form.organizer,
                max_participants: form.max_participants ? parseInt(form.max_participants) : undefined
            };

            if (editingEventId) {
                await updateAdminEvent(token, editingEventId, payload);
            } else {
                await createAdminEvent(token, payload);
            }
            
            setModalOpen(false);
            fetchEvents();
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to save event.");
        } finally {
            setSubmitting(false);
        }
    };

    const viewRegistrations = async (eventId: number, title: string) => {
        if (!token) return;
        setActiveEventTitle(title);
        setEditingEventId(eventId); // Reuse this to track active event for export
        setRegistrationsOpen(true);
        setLoadingRegs(true);
        setRegistrations([]);
        try {
            const res = await getAdminEventRegistrations(token, eventId, 50, 0);
            setRegistrations(res.items || []);
        } catch (err) {
            alert("Failed to load registrations.");
        } finally {
            setLoadingRegs(false);
        }
    };

    const handleExportCSV = async () => {
        if (!token || !editingEventId) return;
        try {
            const res = await exportAdminEventRegistrations(token, editingEventId);
            if (res.data?.csv_data) {
                const blob = new Blob([res.data.csv_data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', res.data.filename || `export_${editingEventId}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (err: any) {
            alert(err?.message || "Export failed.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">Event Pipeline</h1>
                    <p className="mt-1 text-[13px] text-slate-400">Manage all club sessions and participant lists.</p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02]"
                >
                    <Plus className="h-4 w-4" />
                    New Event
                </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Filter events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full bg-transparent pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                </div>
                <div className="h-4 w-px bg-white/[0.06]" />
                <button className="flex h-9 items-center gap-2 px-3 text-[12px] font-semibold text-slate-400 hover:text-slate-200">
                    <Filter className="h-4 w-4" />
                    Upcoming
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#050b18]/40 shadow-2xl backdrop-blur-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Event</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Date & Venue</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Stats</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Visibility</th>
                            <th className="border-b border-white/[0.06]" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic text-[13px]">Syncing event registry...</td></tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[13px] text-rose-400">{error}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : events.length > 0 ? (
                            events.map((event) => (
                                <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.04]">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-slate-200">{event.title}</span>
                                            <span className="text-[11px] text-slate-500">{event.type || "Club Event"}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[12px] text-slate-300">
                                                <Clock className="h-3 w-3 text-cyan-400/60" />
                                                {event.date || "TBD"}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <MapPin className="h-3 w-3" />
                                                {(event as any).location || event.venue || "TBD"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => viewRegistrations(event.id, event.title!)}
                                                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                                            >
                                                <Users className="h-3.5 w-3.5 text-slate-500" />
                                                <span className="text-[12px] font-medium text-slate-300">
                                                    {(event as any).registered_count || 0}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            true ? "bg-emerald-400/10 text-emerald-400" : "bg-white/5 text-slate-500"
                                        }`}>
                                            <Globe className="h-3 w-3" />
                                            {event.status || "Published"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => viewRegistrations(event.id, event.title!)}
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-emerald-300"
                                                title="View Registrations"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenEdit(event)}
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                                                title="Edit Event"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(event.id)}
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400"
                                                title="Delete Event"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="py-20 text-center text-slate-600">No events found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Event Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingEventId ? "Edit Event" : "Create Event"}</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title *</label>
                                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date (YYYY-MM-DD) *</label>
                                    <input required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="2024-10-31" className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Time (HH:MM) *</label>
                                    <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="18:30" className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location *</label>
                                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Organizer *</label>
                                    <input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Capacity (Optional)</label>
                                    <input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} placeholder="Leave blank for none" className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</label>
                                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none" />
                            </div>

                            {submitError && <p className="text-[12px] text-rose-400 bg-rose-500/10 p-2 rounded-lg">{submitError}</p>}

                            <div className="mt-6 flex gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="h-11 flex-1 rounded-lg font-semibold text-slate-400 hover:bg-white/5">Cancel</button>
                                <button type="submit" disabled={submitting} className="h-11 flex-1 rounded-lg bg-cyan-400 font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-60">
                                    {submitting ? "Saving..." : "Save Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Registrations Drawer / Modal */}
            {registrationsOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#050b18] h-full shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-white">Event Registrations</h2>
                                <p className="text-xs text-slate-400 mt-1">{activeEventTitle}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleExportCSV} title="Export CSV" className="flex items-center gap-2 p-2 text-emerald-400 hover:text-emerald-300 rounded-md hover:bg-emerald-400/10 font-bold text-xs uppercase transition-colors">
                                    <Download className="h-4 w-4" /> Export
                                </button>
                                <button onClick={() => setRegistrationsOpen(false)} className="p-2 text-slate-500 hover:text-white rounded-md hover:bg-white/5">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingRegs ? (
                                <p className="text-center text-slate-500 text-sm">Loading participants...</p>
                            ) : registrations.length > 0 ? (
                                registrations.map(reg => (
                                    <div key={reg.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                        <div className="font-bold text-sm text-slate-200">{reg.full_name}</div>
                                        <div className="text-xs text-slate-500 mt-1.5 space-y-1">
                                            <p>{reg.email}</p>
                                            {reg.roll_no && <p>Roll: {reg.roll_no}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 text-sm mt-10">
                                    No registrations yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
