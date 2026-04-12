import { useEffect, useState, useCallback, memo } from "react";
import {
    UserPlus,
    Search,
    Filter,
    Mail,
    CheckCircle2,
    Clock,
    Trash2,
    ShieldOff,
    ShieldCheck,
    UserCircle2,
    CalendarDays,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    toggleAdminUserStatus,
    deleteAdminUser,
    type AdminUser,
} from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw?: string | null) {
    if (!raw) return "—";
    try {
        return new Date(raw).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TH = ({ label }: { label: string }) => (
    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">
        {label}
    </th>
);

type UserRowProps = { user: AdminUser & { active?: boolean }; onRefresh: () => void };

const UserRow = memo(({ user, onRefresh }: UserRowProps) => {
    const { token } = useAuth();
    const isLinked = !!user.firebase_uid;
    const isAdmin = String(user.role).toLowerCase() === "admin";
    const isActive = user.active !== false;

    const handleToggleStatus = async () => {
        if (!token) return;
        try {
            await toggleAdminUserStatus(token, user.id, !isActive);
            onRefresh();
        } catch {
            alert("Failed to toggle status");
        }
    };

    const handleDelete = async () => {
        if (!token || !window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
        try {
            await deleteAdminUser(token, user.id);
            onRefresh();
        } catch {
            alert("Failed to delete user");
        }
    };

    const handleRoleChange = async () => {
        if (!token) return;
        const newRole = isAdmin ? "user" : "admin";
        if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
        try {
            await updateAdminUser(token, user.id, { role: newRole });
            onRefresh();
        } catch {
            alert("Failed to update role");
        }
    };

    return (
        <tr
            className={`group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${
                !isActive ? "opacity-50 grayscale" : ""
            }`}
        >
            {/* Member */}
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isAdmin
                                ? "border border-violet-400/20 bg-violet-400/10 text-violet-300"
                                : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                        }`}
                    >
                        {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-200">{user.name}</span>
                        <span className="text-[11px] text-slate-500">{user.roll_number || "—"}</span>
                    </div>
                </div>
            </td>

            {/* Email */}
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-2 text-[12px] text-slate-300">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    <span className="truncate max-w-[180px]">{user.email || "—"}</span>
                </div>
            </td>

            {/* Role */}
            <td className="px-4 py-2.5">
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin ? "bg-violet-400/10 text-violet-300" : "bg-slate-800 text-slate-400"
                    }`}
                >
                    {user.role}
                </span>
            </td>

            {/* Auth Status */}
            <td className="px-4 py-2.5">
                {isLinked ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">Linked</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-amber-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium">Pending</span>
                    </div>
                )}
            </td>

            {/* Created Date */}
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                    {formatDate(user.created_at)}
                </div>
            </td>

            {/* Actions */}
            <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={handleRoleChange}
                        title={isAdmin ? "Demote to User" : "Promote to Admin"}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300"
                    >
                        {isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleToggleStatus}
                        title={isActive ? "Deactivate" : "Activate"}
                        className={`rounded-md p-1.5 text-slate-500 hover:bg-white/5 ${
                            isActive ? "hover:text-amber-400" : "hover:text-emerald-400"
                        }`}
                    >
                        <UserCircle2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        title="Delete permanently"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

type FormState = { name: string; email: string; roll_number: string; role: "user" | "admin" };

const EMPTY_FORM: FormState = { name: "", email: "", roll_number: "", role: "user" };

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<(AdminUser & { active?: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminUsers(token, 100, 0, { search: search || undefined });
            setUsers(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const t = setTimeout(fetchUsers, 300);
        return () => clearTimeout(t);
    }, [fetchUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await createAdminUser(token, form);
            setModalOpen(false);
            setForm(EMPTY_FORM);
            fetchUsers();
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">User Management</h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        Provision accounts and manage administrative access.
                    </p>
                </div>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitError(null); setModalOpen(true); }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02]"
                >
                    <UserPlus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, roll number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full bg-transparent pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                </div>
                <div className="h-4 w-px bg-white/[0.06]" />
                <button className="flex h-9 items-center gap-2 px-3 text-[12px] font-semibold text-slate-400 hover:text-slate-200">
                    <Filter className="h-4 w-4" />
                    All Roles
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#050b18]/40 shadow-2xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <TH label="Member" />
                            <TH label="Email" />
                            <TH label="Role" />
                            <TH label="Auth Status" />
                            <TH label="Created" />
                            <th className="border-b border-white/[0.06]" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-[13px] italic text-slate-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[13px] text-rose-400">{error}</span>
                                        <button
                                            onClick={fetchUsers}
                                            className="mt-2 rounded-md bg-white/5 px-4 py-1.5 text-[12px] text-slate-300 hover:bg-white/10"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <UserRow key={user.id} user={user} onRefresh={fetchUsers} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-20 text-center text-slate-600 text-sm">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl">
                        <h2 className="text-xl font-bold tracking-tight text-white">Add User</h2>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Full Name *
                                </label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Email Address *
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Roll Number
                                    </label>
                                    <input
                                        value={form.roll_number}
                                        onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                                        className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        Role
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}
                                        className="h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#0d121f] px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
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
                                    className="flex-1 h-11 rounded-lg font-semibold text-slate-400 hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-11 rounded-lg bg-cyan-400 font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-60"
                                >
                                    {submitting ? "Adding..." : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
