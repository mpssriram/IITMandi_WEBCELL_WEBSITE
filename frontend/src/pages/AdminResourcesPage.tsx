import { useEffect, useState, useCallback } from "react";
import {
    Library,
    Plus,
    Search,
    Link as LinkIcon,
    FileText,
    ExternalLink,
    Trash2,
    Tag,
    User,
    X,
    AlertCircle,
    Edit3,
    Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
    getAdminResources,
    createAdminResource,
    updateAdminResource,
    deleteAdminResource,
    type PublicResource,
} from "@/lib/api";

// ─── Constant ─────────────────────────────────────────────────────────────────

const RESOURCE_TYPES = ["link", "pdf", "article", "video", "doc", "other"] as const;
type ResourceType = typeof RESOURCE_TYPES[number];

type ResourceForm = {
    title: string;
    description: string;
    type: ResourceType;
    url: string;
    category: string;
    uploaded_by: string;
};

const EMPTY_FORM: ResourceForm = {
    title: "",
    description: "",
    type: "link",
    url: "",
    category: "",
    uploaded_by: "",
};

const INPUT_CLS = "h-10 w-full rounded-lg border border-white/[0.05] bg-[#070b12] px-4 text-[13px] text-white focus:outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-slate-600 appearance-none";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminResourcesPage() {
    const { token } = useAuth();
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
    const [form, setForm] = useState<ResourceForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchResources = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminResources(token, 100, 0, {
                search_title: search || undefined,
            });
            setResources(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load resources");
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const t = setTimeout(fetchResources, 300);
        return () => clearTimeout(t);
    }, [fetchResources]);

    const handleDelete = async (id: number) => {
        if (!token || !window.confirm("Permanently de-provision this resource? This operation is immediate.")) return;
        setDeletingId(id);
        setDeleteError(null);
        try {
            await deleteAdminResource(token, id);
            await fetchResources();
        } catch (err: any) {
            setDeleteError(err?.message || "Purge operation failed.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenEdit = (res: PublicResource) => {
        setEditingResourceId(res.id);
        setForm({
            title: res.title || "",
            description: res.description || "",
            type: (res.type as any) || "link",
            url: res.url || "",
            category: res.category || "",
            uploaded_by: res.uploaded_by || "",
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            if (editingResourceId) {
                await updateAdminResource(token, editingResourceId, form);
            } else {
                await createAdminResource(token, form);
            }
            setModalOpen(false);
            await fetchResources();
        } catch (err: any) {
            setSubmitError(err?.message || "Storage operation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Registry Control Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-[#090d16] p-4 font-mono">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Archived Nodes</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white tracking-tight">{resources.length}</span>
                            <span className="text-[10px] text-emerald-400">Sync Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-2 max-w-md w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="QUERY REPOSITORY..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-white/[0.05] bg-[#070b12] pl-9 pr-4 text-[12px] text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingResourceId(null);
                            setForm(EMPTY_FORM);
                            setModalOpen(true);
                        }}
                        className="flex h-9 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-[11px] font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-cyan-400 active:scale-95"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        REGISTER_ENTITY
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {deleteError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-2 text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>OPS_FAILURE: {deleteError}</span>
                    <button onClick={() => setDeleteError(null)}><X className="h-3.5 w-3.5" /></button>
                </div>
            )}

            {/* Document Library Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-[#090d16] shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0d121c] border-b border-white/[0.05]">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Resource Ident</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alias / Metadata</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tier</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Protocol</th>
                            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading && resources.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Streaming Records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[12px] font-bold text-rose-400 uppercase tracking-widest">{error}</span>
                                        <button onClick={fetchResources} className="mt-2 text-[10px] font-black underline underline-offset-4 text-cyan-400">RE-INIT SYNC</button>
                                    </div>
                                </td>
                            </tr>
                        ) : resources.length > 0 ? (
                            resources.map((res) => (
                                <tr key={res.id} className="group transition-all hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400">
                                                {res.type === 'pdf' ? <FileText className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-slate-200 leading-tight">{res.title}</span>
                                                <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">{res.url}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col font-mono">
                                            <div className="flex items-center gap-2 text-[11px] text-slate-300">
                                                <Tag className="h-3 w-3 text-cyan-500/50" />
                                                {res.category || "UNSPECIFIED"}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <User className="h-3 w-3 text-slate-600" />
                                                {res.uploaded_by || "IDENTITY_TBD"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-[11px] font-mono text-slate-400">
                                            ID: {String(res.id).padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                                            res.type === 'pdf' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' :
                                            res.type === 'link' ? 'bg-violet-400/10 text-violet-400 border-violet-400/20' :
                                            'bg-slate-800/50 text-slate-500 border-slate-700/50'
                                        }`}>
                                            {res.type || "OTHER"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {deletingId === res.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                                            ) : (
                                                <>
                                                    <a
                                                        href={res.url || undefined}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all"
                                                        title="OPEN_REMOTE"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleOpenEdit(res)}
                                                        className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20 transition-all font-black text-[10px]"
                                                        title="EDIT_ENTITY"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(res.id)}
                                                        className="h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all font-black text-[10px]"
                                                        title="PURGE_ENTITY"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">LIBRARY_VACANT: ZERO_RECORDS_FOUND</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Resource Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0d121c] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Library className="h-32 w-32 text-cyan-400" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <h2 className="text-[16px] font-black uppercase tracking-[0.2em] text-white">
                                {editingResourceId ? "EDIT_ENTITY_CFG" : "REGISTER_NEW_RESOURCE"}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative z-10 font-mono">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">ENTITY_TITLE *</label>
                                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} placeholder="IDENTIFIER" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">RESOURCE_TYPE *</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={INPUT_CLS}>
                                        {RESOURCE_TYPES.map((t) => (<option key={t} value={t}>{t.toUpperCase()}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CATEGORY *</label>
                                    <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={INPUT_CLS} placeholder="TAG" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">PROTOCOL_URL *</label>
                                <input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={INPUT_CLS} placeholder="https://..." />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">OWNER_IDENT *</label>
                                <input required value={form.uploaded_by} onChange={(e) => setForm({ ...form, uploaded_by: e.target.value })} className={INPUT_CLS} placeholder="IDENTITY" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">RESOURCE_BRIEF *</label>
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
        </div>
    );
}
