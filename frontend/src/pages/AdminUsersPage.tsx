import { useEffect, useState, useCallback, memo } from "react";
import { UserPlus, Search, Filter, Mail, CheckCircle2, Clock, Trash2, ShieldOff, ShieldCheck, CalendarDays, AlertCircle, Loader2, Users as UsersIcon, ShieldAlert } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ElectricCard } from "@/components/ElectricCard";
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
    <th className={`px-4 py-3 text-${align} text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/[0.05] bg-[#0d121c]`}>
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
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Legend</span>
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
                <tr className="border-b border-white/[0.03]">
                    <td colSpan={6} className="px-4 py-2 bg-rose-500/5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            <ShieldAlert className="h-3 w-3" />
                            ACCESS_ERROR: {rowError.toUpperCase()}
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

    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getAdminUsers(token, 100, 0, { 
                search: search || undefined,
                role: roleFilter === "all" ? undefined : roleFilter
            });
            setUsers(result.items || []);
        } catch (err: any) {
            setError(err?.message || "Registry Sync Failed");
        } finally {
            setLoading(false);
        }
    }, [token, search, roleFilter]);

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

    const adminCount = users.filter(u => String(u.role).toLowerCase() === 'admin').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Metric Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <ElectricCard className="p-4 bg-[#090d16]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Registry</span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">{users.length}</span>
                            <span className="text-[10px] text-emerald-400">Synced</span>
                        </div>
                    </div>
                </ElectricCard>
                <ElectricCard className="p-4 bg-[#090d16]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Nodes</span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-cyan-400">{adminCount}</span>
                            <span className="text-[10px] text-cyan-500/50">Privileged</span>
                        </div>
                    </div>
                </ElectricCard>
                <ElectricCard className="p-4 bg-[#090d16]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Access</span>
                        <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-400">{users.filter(u => !!u.firebase_uid).length}</span>
                            <span className="text-[10px] text-emerald-500/50">Identified</span>
                        </div>
                    </div>
                </ElectricCard>
            </div>

            {/* Operational Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/[0.05] bg-[#090d16] p-4">
                <div className="flex flex-1 items-center gap-3 w-full max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="QUERY USER_REGISTRY (NAME, EMAIL, ROLL)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-white/[0.05] bg-[#070b12] pl-9 pr-4 text-[12px] font-mono text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <div className="h-8 w-px bg-white/[0.05]" />
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-slate-500" />
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="h-10 bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 cursor-pointer hover:text-cyan-400 transition-colors"
                        >
                            <option value="all" className="bg-[#0d121c]">ALL_TIERS</option>
                            <option value="admin" className="bg-[#0d121c]">ADMIN_ONLY</option>
                            <option value="user" className="bg-[#0d121c]">DEFAULT_USER</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setSubmitError(null); setModalOpen(true); }}
                    className="flex h-10 items-center gap-2 rounded-lg bg-cyan-500 px-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/20"
                >
                    <UserPlus className="h-4 w-4" />
                    PROVISION_USER
                </button>
            </div>

            {/* Registry Table */}
            <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-[#090d16] shadow-xl">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <TH label="Member / Identity" />
                            <TH label="Credential Alias" />
                            <TH label="Access Tier" />
                            <TH label="Sync State" />
                            <TH label="Provisioned At" />
                            <TH label="Control" align="right" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {loading && users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Streaming Records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-rose-500" />
                                        <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">{error}</span>
                                        <button onClick={fetchUsers} className="mt-2 text-[10px] font-black underline underline-offset-4 text-cyan-400">RE-INIT SYNC</button>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <UserRow key={user.id} user={user} onRefresh={fetchUsers} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">REGISTRY_VACANT: ZERO_RECORDS_FOUND</span>
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
