import { useEffect, useState, useCallback, memo } from "react";
import {
    FolderKanban,
    Plus,
    Search,
    Github,
    ExternalLink,
    Trash2,
    Edit3,
    Star,
    Layout,
    X,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getAdminProjects, createAdminProject, deleteAdminProject, type AdminProject } from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TH = ({ label }: { label: string }) => (
    <th className="border-b border-white/[0.06] px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
    </th>
);

// ─── Row ─────────────────────────────────────────────────────────────────────

const ProjectRow = memo(
    ({ project, onDelete }: { project: AdminProject; onDelete: (id: number) => void }) => (
        <tr className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] text-slate-500">
                        {project.image_url ? (
                            <img src={project.image_url} className="h-full w-full object-cover" />
                        ) : (
                            <Layout className="h-5 w-5" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-200">{project.title}</span>
                            {project.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                        </div>
                        <span className="line-clamp-1 text-[11px] text-slate-500">
                            {project.short_description || "No description"}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        project.status === "active"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-white/5 text-slate-500"
                    }`}
                >
                    {project.status || "—"}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col gap-1 text-[12px]">
                    <span className="font-medium text-slate-300">
                        {project.current_lead || "TBD"}
                    </span>
                    <span className="truncate max-w-[160px] text-[11px] text-slate-500">
                        {project.tech_stack || "—"}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 transition-colors hover:text-white"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                    )}
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 transition-colors hover:text-cyan-400"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => onDelete(project.id)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    )
);

// ─── Page ─────────────────────────────────────────────────────────────────────

type ProjectForm = {
    title: string;
    short_description: string;
    github_url: string;
    live_url: string;
    tech_stack: string;
    current_lead: string;
    status: string;
};

const EMPTY_FORM: ProjectForm = {
    title: "",
    short_description: "",
    github_url: "",
    live_url: "",
    tech_stack: "",
    current_lead: "",
    status: "active",
};

export default function AdminProjectsPage() {
    const { token } = useAuth();
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminProjects(token, 50, 0, {
                search_title: search || undefined,
            });
            setProjects(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load projects");
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const t = setTimeout(fetchProjects, 300);
        return () => clearTimeout(t);
    }, [fetchProjects]);

    const handleDelete = async (id: number) => {
        if (!token || !window.confirm("Delete this project? This cannot be undone.")) return;
        try {
            await deleteAdminProject(token, id);
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch {
            alert("Failed to delete project");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await createAdminProject(token, {
                title: form.title,
                short_description: form.short_description || undefined,
                github_url: form.github_url || undefined,
                live_url: form.live_url || undefined,
                tech_stack: form.tech_stack || undefined,
                current_lead: form.current_lead || undefined,
                status: form.status,
                featured: false,
                display_order: 0,
            });
            setModalOpen(false);
            setForm(EMPTY_FORM);
            fetchProjects();
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create project");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">Project Library</h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        Manage the club's portfolio of projects.
                    </p>
                </div>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitError(null); setModalOpen(true); }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02]"
                >
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search projects..."
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
                            <TH label="Project" />
                            <TH label="Status" />
                            <TH label="Lead / Tech" />
                            <TH label="Links" />
                            <th className="border-b border-white/[0.06]" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-[13px] italic text-slate-500">
                                    Loading projects...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[13px] text-rose-400">{error}</span>
                                        <button
                                            onClick={fetchProjects}
                                            className="mt-2 rounded-md bg-white/5 px-4 py-1.5 text-[12px] text-slate-300 hover:bg-white/10"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : projects.length > 0 ? (
                            projects.map((p) => (
                                <ProjectRow key={p.id} project={p} onDelete={handleDelete} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <FolderKanban className="h-8 w-8 text-slate-700" />
                                        <span className="text-sm italic text-slate-600">
                                            No projects yet. Add the first one.
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Project Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-white">New Project</h2>
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
                                    placeholder="e.g. Dev Cell Website"
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>
                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Short Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.short_description}
                                    onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                                    placeholder="One-line summary"
                                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none resize-none"
                                />
                            </div>
                            {/* Tech stack + Lead */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Tech Stack
                                    </label>
                                    <input
                                        value={form.tech_stack}
                                        onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                                        placeholder="React, FastAPI, MySQL"
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Current Lead
                                    </label>
                                    <input
                                        value={form.current_lead}
                                        onChange={(e) => setForm({ ...form, current_lead: e.target.value })}
                                        placeholder="Name or roll number"
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                            {/* GitHub + Live */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.github_url}
                                        onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                                        placeholder="https://github.com/..."
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Live URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.live_url}
                                        onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                                        placeholder="https://..."
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Status
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#0d121f] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="paused">Paused</option>
                                    <option value="archived">Archived</option>
                                </select>
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
                                    {submitting ? "Creating..." : "Create Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
