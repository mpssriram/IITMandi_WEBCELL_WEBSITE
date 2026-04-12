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
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
    getAdminResources,
    createAdminResource,
    deleteAdminResource,
    type PublicResource,
} from "@/lib/api";

// ─── Constant ─────────────────────────────────────────────────────────────────

const RESOURCE_TYPES = ["link", "pdf", "article", "video", "doc", "other"] as const;
type ResourceType = typeof RESOURCE_TYPES[number];

// ─── Page ─────────────────────────────────────────────────────────────────────

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

export default function AdminResourcesPage() {
    const { token } = useAuth();
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<ResourceForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const fetchResources = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminResources(token, 50, 0, {
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
        if (!token || !window.confirm("Delete this resource?")) return;
        try {
            await deleteAdminResource(token, id);
            setResources((prev) => prev.filter((r) => r.id !== id));
        } catch {
            alert("Failed to delete resource");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await createAdminResource(token, {
                title: form.title,
                description: form.description || undefined,
                type: form.type,
                url: form.url,
                category: form.category || undefined,
                uploaded_by: form.uploaded_by || undefined,
            });
            setModalOpen(false);
            setForm(EMPTY_FORM);
            fetchResources();
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create resource");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">Resource Library</h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        Manage internal docs, study guides, and toolkits.
                    </p>
                </div>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitError(null); setModalOpen(true); }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02]"
                >
                    <Plus className="h-4 w-4" />
                    Add Resource
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search library..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full bg-transparent pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#050b18]/40 shadow-2xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="border-b border-white/[0.06] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                Resource
                            </th>
                            <th className="border-b border-white/[0.06] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                Category & Type
                            </th>
                            <th className="border-b border-white/[0.06] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                Uploader
                            </th>
                            <th className="border-b border-white/[0.06] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-[13px] italic text-slate-500">
                                    Loading library...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[13px] text-rose-400">{error}</span>
                                        <button
                                            onClick={fetchResources}
                                            className="mt-2 rounded-md bg-white/5 px-4 py-1.5 text-[12px] text-slate-300 hover:bg-white/10"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : resources.length > 0 ? (
                            resources.map((resource) => (
                                <tr
                                    key={resource.id}
                                    className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-slate-500">
                                                {resource.type?.toLowerCase().includes("pdf") ? (
                                                    <FileText className="h-4 w-4" />
                                                ) : (
                                                    <LinkIcon className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-slate-200">
                                                    {resource.title}
                                                </span>
                                                <span className="line-clamp-1 max-w-[200px] text-[11px] text-slate-500">
                                                    {resource.description || "No description"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                                <Tag className="h-3 w-3" />
                                                {resource.category || "General"}
                                            </span>
                                            <span className="text-white/[0.06]">|</span>
                                            <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
                                                {resource.type || "Link"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-[12px] text-slate-300">
                                            <User className="h-3.5 w-3.5 text-slate-500" />
                                            {resource.uploaded_by || "System"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(resource.id)}
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-slate-600">
                                    No resources found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Resource Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-white">Add Resource</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Title *
                                </label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. React Docs, DSA Guide"
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>

                            {/* URL */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    URL *
                                </label>
                                <input
                                    required
                                    type="url"
                                    value={form.url}
                                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                                    placeholder="https://..."
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>

                            {/* Type + Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Type *
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                                        className="h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#0d121f] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                    >
                                        {RESOURCE_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Category
                                    </label>
                                    <input
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        placeholder="e.g. DSA, Web, AI"
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief description of the resource"
                                    className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>

                            {/* Uploaded by */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Uploaded By
                                </label>
                                <input
                                    value={form.uploaded_by}
                                    onChange={(e) => setForm({ ...form, uploaded_by: e.target.value })}
                                    placeholder="Name or roll number"
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>

                            {submitError && (
                                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-[12px] text-rose-400">
                                    {submitError}
                                </p>
                            )}
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="h-11 flex-1 rounded-lg font-semibold text-slate-400 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-11 flex-1 rounded-lg bg-cyan-400 font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-60"
                                >
                                    {submitting ? "Adding..." : "Add Resource"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
