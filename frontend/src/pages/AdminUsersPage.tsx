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
    CalendarDays,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
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

const TH = ({ label, align = "left" }: { label: string; align?: "left" | "right" | "center" }) => (
    <th className={`px-4 py-3 text-${align} text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.05] bg-white/[0.02]`}>
        {label}
    </th>
);

type UserRowProps = { user: AdminUser; onRefresh: () => void };

const UserRow = memo(({ user, onRefresh }: UserRowProps) => {
    const { token } = useAuth();
    const isLinked = !!user.firebase_uid;
    const isAdmin = String(user.role).toLowerCase() === "admin";
    const [rowError, setRowError] = useState<string | null>(null);
    const [working, setWorking] = useState(false);

    const handleDelete = async () => {
        if (!token || !window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
        setWorking(true);
        setRowError(null);
        try {
            await deleteAdminUser(token, user.id);
            onRefresh();
        } catch (err: any) {
            setRowError(err?.message || "Failed to delete user");
        } finally {
            setWorking(false);
        }
    };

    const handleRoleChange = async () => {
        if (!token) return;
        const newRole = isAdmin ? "user" : "admin";
        if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
        setWorking(true);
        setRowError(null);
        try {
            await updateAdminUser(token, user.id, { role: newRole });
            onRefresh();
        } catch (err: any) {
            setRowError(err?.message || "Failed to update role");
        } finally {
            setWorking(false);
        }
    };

    return (
        <React.Fragment>
            <tr className="group border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] last:border-0">
                {/* Member Identity */}
                <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-[10px] font-black ${
                                isAdmin
                                    ? "bg-cyan-500 text-slate-900"
                                    : "bg-slate-800 text-slate-400"
                            }`}
                        >
                            {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-200 leading-none">{user.name}</span>
                        </div>
                    </div>
                </td>

                {/* Registry Details (Email + Roll) */}
                <td className="px-4 py-2">
                    <div className="flex flex-col gap-0.5 font-mono">
                        <span className="text-[11px] text-slate-300 truncate max-w-[180px]">{user.email || "NO_ALIAS"}</span>
                        <span className="text-[10px] text-slate-500">{user.roll_number || "NO_UID"}</span>
                    </div>
                </td>

                {/* Access Tier */}
                <td className="px-4 py-2">
                    <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                            isAdmin ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-slate-800/50 text-slate-500 border border-slate-700/50"
                        }`}
                    >
                        {user.role}
                    </span>
                </td>

                {/* Sync State */}
                <td className="px-4 py-2">
                    {isLinked ? (
                        <div className="flex items-center gap-1.5 text-emerald-500">
                            <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Legacy</span>
                        </div>
                    )}
                </td>

                {/* Date Created */}
                <td className="px-4 py-2">
                    <span className="text-[11px] font-mono text-slate-500">
                        {formatDate(user.created_at)}
                    </span>
                </td>

                {/* Control Actions */}
                <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                        {working ? (
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
                        ) : (
                            <>
                                <button
                                    onClick={handleRoleChange}
                                    title={isAdmin ? "Demote Privilege" : "Elevate Privilege"}
                                    className={`rounded h-7 w-7 flex items-center justify-center transition-all ${
                                        isAdmin ? "text-slate-500 hover:text-amber-400 hover:bg-amber-400/10" : "text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10"
                                    }`}
                                >
                                    {isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    title="De-provision Entity"
                                    className="rounded h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>
            {rowError && (
                <tr>
                    <td colSpan={6} className="px-4 py-2 bg-rose-500/5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            Error: {rowError}
                        </p>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
});

// ─── Page Components ──────────────────────────────────────────────────────────

type FormState = { name: string; email: string; roll_number: string; role: "user" | "admin" };
const EMPTY_FORM: FormState = { name: "", email: "", roll_number: "", role: "user" };

import React from "react";

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
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
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-bold text-slate-900 transition-all hover:bg-cyan-400"
                >
                    <UserPlus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0d121c]/50 p-2">
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
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex h-9 items-center gap-2 px-3 text-[12px] font-semibold text-slate-500">
                    <Filter className="h-4 w-4" />
                    All Roles
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d121c] shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-800/20">
                            <TH label="Member" />
                            <TH label="Email" />
                            <TH label="Role" />
                            <TH label="Firebase Status" />
                            <TH label="Created" />
                            <th className="border-b border-slate-800" />
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
                                            className="mt-2 rounded-md bg-slate-800 px-4 py-1.5 text-[12px] text-slate-300 hover:bg-slate-700"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d121c] p-8 shadow-2xl">
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
                                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#070b12] px-4 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verification Email</label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="h-10 w-full rounded-lg border border-white/[0.05] bg-[#070b12] px-4 text-[13px] text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                                    placeholder="user@university.edu"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity UID</label>
                                    <input
                                        value={form.roll_number}
                                        onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-white/[0.05] bg-[#070b12] px-4 text-[13px] text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                                        placeholder="ROLL_ID_X"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Tier</label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}
                                        className="h-10 w-full appearance-none rounded-lg border border-white/[0.05] bg-[#070b12] px-4 text-[13px] text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-bold uppercase"
                                    >
                                        <option value="user">DEFAULT USER</option>
                                        <option value="admin">CORE ADMIN</option>
                                    </select>
                                </div>
                            </div>
                            {submitError && (
                                <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] font-bold text-rose-500 border border-rose-500/20">{submitError}</p>
                            )}
                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 h-11 rounded-lg border border-white/[0.05] font-bold text-[11px] uppercase tracking-widest text-slate-500 hover:bg-white/[0.02] transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-11 rounded-lg bg-cyan-500 font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 disabled:opacity-60 transition-all hover:bg-cyan-400 active:scale-95"
                                >
                                    {submitting ? "PROVISIONING..." : "COMMIT ENTITY"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
