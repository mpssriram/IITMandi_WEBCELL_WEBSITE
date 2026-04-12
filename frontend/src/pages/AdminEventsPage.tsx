import { useEffect, useState, useCallback } from "react";
import {
    Calendar,
    Plus,
    Search,
    MapPin,
    Clock,
    Users,
    Edit3,
    Trash2,
    Globe,
    X,
    AlertCircle,
    Eye,
    Download,
    Loader2,
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
    type EventRegistration,
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

const INPUT_CLS =
    "h-11 w-full rounded-lg border border-slate-800 bg-[#070b12] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

export default function AdminEventsPage() {
    const { token } = useAuth();
    const [events, setEvents] = useState<PublicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [form, setForm] = useState<EventForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Delete inline error
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Registrations Drawer
    const [registrationsOpen, setRegistrationsOpen] = useState(false);
    const [activeEventId, setActiveEventId] = useState<number | null>(null);
    const [activeEventTitle, setActiveEventTitle] = useState("");
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loadingRegs, setLoadingRegs] = useState(false);
    const [regsError, setRegsError] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const fetchEvents = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminEvents(token, 100, 0, { search_title: search || undefined });
            setEvents(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load events.");
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const timer = setTimeout(fetchEvents, 300);
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
        const [h, m] = (event.time || "10:00").split(":");
        setForm({
            title: event.title || "",
            description: event.description || "",
            date: event.date?.split("T")[0] || "",
            time: `${h}:${m}`,
            location: (event as any).location || event.venue || "",
            organizer: event.organizer || "Dev Cell",
            max_participants: String(event.max_participants || ""),
        });
        setSubmitError(null);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!token || !window.confirm("Permanently delete this event? This will also purge registration records.")) return;
        setDeletingId(id);
        setDeleteError(null);
        try {
            await deleteAdminEvent(token, id);
            await fetchEvents();
        } catch (err: any) {
            setDeleteError(err?.message || "Purge failed.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            if (editingEventId) {
                await updateAdminEvent(token, editingEventId, form);
            } else {
                await createAdminEvent(token, form);
            }
            setModalOpen(false);
            await fetchEvents();
        } catch (err: any) {
            setSubmitError(err?.message || "Storage operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const viewRegistrations = async (id: number, title: string) => {
        setActiveEventId(id);
        setActiveEventTitle(title);
        setRegistrationsOpen(true);
        setLoadingRegs(true);
        setRegsError(null);
        try {
            const result = await getAdminEventRegistrations(token!, id);
            setRegistrations(result.items || []);
        } catch (err: any) {
            setRegsError(err?.message || "Data retrieval failed.");
        } finally {
            setLoadingRegs(false);
        }
    };

    const handleExportCSV = async () => {
        if (!token || !activeEventId) return;
        setExporting(true);
        setExportError(null);
        try {
            const result = await exportAdminEventRegistrations(token, activeEventId);
            if (result.success && result.data.csv_data) {
                const blob = new Blob([result.data.csv_data], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', result.data.filename || `event_${activeEventId}_registrations.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error("Repository returned null payload.");
            }
        } catch (err: any) {
            setExportError(err?.message || "Export pipeline failed.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Pipeline Control Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-[#090d16] p-4 font-mono">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scheduled Nodes</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white tracking-tight">{events.length}</span>
                            <span className="text-[10px] text-cyan-400">Pipeline Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-2 max-w-md w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="QUERY PIPELINE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-white/[0.05] bg-[#070b12] pl-9 pr-4 text-[12px] text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex h-9 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-[11px] font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-cyan-400 active:scale-95"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        NEW_EVENT
                    </button>
                </div>
            </div>

            {/* Error State */}
            {deleteError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between">
                    <span>OPS_FAILURE: {deleteError}</span>
                    <button onClick={() => setDeleteError(null)}><X className="h-3.5 w-3.5" /></button>
                </div>
            )}

            {/* Data Pipeline Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-[#090d16] shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0d121c] border-b border-white/[0.05]">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Event Identity</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timeline/Node</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Participants</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Lifecycle</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading && events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Polling Pipeline...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[12px] font-bold text-rose-400 uppercase tracking-widest">{error}</span>
                                        <button onClick={fetchEvents} className="mt-2 text-[10px] font-black underline underline-offset-4 text-cyan-400">RE-INIT HANDSHAKE</button>
                                    </div>
                                </td>
                            </tr>
                        ) : events.length > 0 ? (
                            events.map((event) => {
                                const isFull = (event as any).registered_count >= (event as any).max_participants && (event as any).max_participants > 0;
                                const isPast = new Date(event.date!) < new Date();
                                
                                return (
                                    <tr key={event.id} className="group transition-all hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-slate-200">{event.title}</span>
                                                <span className="text-[10px] font-mono text-slate-500">{event.organizer}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 font-mono">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                                                    <Clock className="h-3 w-3 text-cyan-500/50" />
                                                    {event.date} @ {event.time}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                    <MapPin className="h-3 w-3 text-slate-600" />
                                                    {(event as any).location || event.venue || "LOCATION_UNSPECIFIED"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button 
                                                onClick={() => viewRegistrations(event.id, event.title!)}
                                                className="flex flex-col gap-1 hover:text-cyan-400 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 text-slate-500" />
                                                    <span className="text-[13px] font-bold text-slate-200 font-mono">
                                                        {(event as any).registered_count ?? 0}
                                                    </span>
                                                </div>
                                                <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all ${isFull ? 'bg-amber-500' : 'bg-cyan-500'}`} 
                                                        style={{ width: `${Math.min(100, ((event as any).registered_count / (event.max_participants || 100)) * 100)}%` }} 
                                                    />
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                                                isPast ? 'bg-slate-800/40 text-slate-600 border-slate-700/50' :
                                                isFull ? 'bg-amber-400/10 text-amber-500 border-amber-500/20' :
                                                'bg-emerald-400/10 text-emerald-500 border-emerald-500/20'
                                            }`}>
                                                {isPast ? 'COMPLETED' : isFull ? 'NODE_FULL' : 'ACTIVE_UPCOMING'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {deletingId === event.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => viewRegistrations(event.id, event.title!)}
                                                            className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all font-black text-[10px]"
                                                            title="VIEW_REGS"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEdit(event)}
                                                            className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20 transition-all"
                                                            title="EDIT_NODE"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(event.id)}
                                                            className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
                                                            title="DELETE_NODE"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">EVENT_PIPELINE_VACANT: ZERO_RECORDS_PROVISIONED</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Event Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0d121c] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Calendar className="h-32 w-32 text-cyan-400" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h2 className="text-[16px] font-black uppercase tracking-[0.2em] text-white">
                                {editingEventId ? "EDIT_NODE_CONFIG" : "PROVISION_NEW_EVENT"}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative z-10">
                            <div className="space-y-1.5 font-mono">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">EVENT_TITLE *</label>
                                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} placeholder="IDENTIFIER" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 font-mono">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">TIMELINE_DATE *</label>
                                    <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={INPUT_CLS} />
                                </div>
                                <div className="space-y-1.5 font-mono">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">TIMELINE_CLOCK *</label>
                                    <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={INPUT_CLS} />
                                </div>
                            </div>

                            <div className="space-y-1.5 font-mono">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GRID_LOCATION *</label>
                                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={INPUT_CLS} placeholder="STATION / COORDINATES" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 font-mono">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ORIGIN_IDENT *</label>
                                    <input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} className={INPUT_CLS} />
                                </div>
                                <div className="space-y-1.5 font-mono">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">NODE_CAPACITY</label>
                                    <input type="number" min={1} value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} placeholder="INF" className={INPUT_CLS} />
                                </div>
                            </div>

                            <div className="space-y-1.5 font-mono">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">NODE_BRIEF *</label>
                                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full resize-none rounded-lg border border-white/[0.05] bg-[#070b12] px-4 py-3 text-[13px] text-white focus:outline-none focus:border-cyan-500 transition-all font-medium" />
                            </div>

                            {submitError && (
                                <p className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-[11px] font-bold text-rose-500 font-mono uppercase tracking-wider">{submitError}</p>
                            )}

                            <div className="mt-8 flex gap-3">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-11 border border-white/[0.05] rounded-lg font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-white/[0.02]">ABORT</button>
                                <button type="submit" disabled={submitting} className="flex-1 h-11 bg-cyan-500 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/20">{submitting ? "STAGING..." : "COMMIT_CHANGES"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Registrations Drawer - Redesigned */}
            {registrationsOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#090d16] h-full shadow-2xl border-l border-white/[0.05] flex flex-col slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-[#0d121c]">
                            <div>
                                <h2 className="text-[14px] font-black uppercase tracking-[0.15em] text-white">Participant Registry</h2>
                                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{activeEventTitle}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExportCSV}
                                    disabled={exporting || loadingRegs}
                                    className="h-8 flex items-center gap-2 rounded bg-emerald-500/10 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                    EXPORT_CSV
                                </button>
                                <button onClick={() => setRegistrationsOpen(false)} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-slate-500 transition-all"><X className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono">
                            {loadingRegs ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">STREAMING_PARTICIPANTS...</span>
                                </div>
                            ) : regsError ? (
                                <div className="flex flex-col items-center gap-2 py-20 px-4 text-center">
                                    <AlertCircle className="h-8 w-8 text-rose-500/30" />
                                    <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">{regsError}</span>
                                </div>
                            ) : registrations.length > 0 ? (
                                registrations.map((reg) => (
                                    <div key={reg.id} className="relative group overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.02] p-4 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[13px] font-bold text-slate-200 uppercase tracking-tight leading-none">{reg.full_name}</span>
                                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                <span className="text-slate-600 font-black">DIR_EMAIL:</span> {reg.email}
                                            </div>
                                            {(reg.roll_no || reg.roll_number) && (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <span className="text-slate-600 font-black">DIR_UID:</span> {reg.roll_no || reg.roll_number}
                                                </div>
                                            )}
                                            {reg.branch && (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <span className="text-slate-600 font-black">DIR_BRNCH:</span> {reg.branch}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full border border-dashed border-slate-800 flex items-center justify-center"><Users className="h-6 w-6 text-slate-800" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">ENTITY_STORE_EMPTY: ZERO_PARTICIPANTS</span>
                                </div>
                            )}
                        </div>

                        {!loadingRegs && registrations.length > 0 && (
                            <div className="p-4 bg-[#0d121c] border-t border-white/[0.05] font-mono text-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    TOTAL_ENTITIES_SYNCED: {registrations.length}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
