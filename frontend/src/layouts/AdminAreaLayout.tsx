import { Suspense, useMemo } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Library, 
    LogOut,
    ChevronRight,
    UserCircle
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import Orb from "@/components/reactbits/Orb";

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    end?: boolean;
}

function NavItem({ to, icon: Icon, label, end }: NavItemProps) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                        ? "bg-cyan-400/10 text-cyan-300 shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`
            }
        >
            <Icon className="h-4.5 w-4.5 shrink-0 transition-colors group-hover:text-cyan-300" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-all -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0 group-[.active]:opacity-20" />
        </NavLink>
    );
}

export function AdminAreaLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };

    const breadcrumbs = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1));
    }, [location.pathname]);

    return (
        <div className="relative flex min-h-screen bg-[#06080f] text-slate-200">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-60 shrink-0 border-r border-white/[0.05] bg-[#090d16] shadow-2xl">
                <div className="flex h-full flex-col">
                    {/* Brand Section */}
                    <div className="flex h-14 items-center border-b border-white/[0.05] px-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                            <span className="font-display text-[14px] font-bold tracking-tight text-white uppercase">Dev Cell</span>
                        </Link>
                    </div>

                    {/* Navigation Groups */}
                    <div className="flex-1 overflow-y-auto py-6 px-3">
                        <div className="mb-6">
                            <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</h3>
                            <div className="space-y-0.5">
                                <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" end />
                                <NavItem to="/admin/users" icon={Users} label="Users" />
                                <NavItem to="/admin/events" icon={Calendar} label="Events" />
                                <NavItem to="/admin/resources" icon={Library} label="Resources" />
                            </div>
                        </div>

                        {/* Future sections like 'System' could go here */}
                    </div>

                    {/* Profile Footer */}
                    <div className="border-t border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="group relative flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <UserCircle className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-[12px] font-semibold text-slate-200">{user?.displayName || "Admin"}</span>
                                <span className="truncate text-[10px] text-slate-500">{user?.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Clean Top Bar */}
                <header className="flex h-14 items-center justify-between border-b border-white/[0.05] bg-[#090d16]/50 backdrop-blur-md px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                        {breadcrumbs.map((part, i) => (
                            <span key={part} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
                                <span className={i === breadcrumbs.length - 1 ? "text-cyan-400" : "text-slate-500"}>
                                    {part}
                                </span>
                            </span>
                        ))}
                    </div>
                    {/* No dead icons here - pure operational header */}
                </header>

                {/* Content Viewport */}
                <main className="flex-1 p-8">
                    <div className="mx-auto max-w-7xl">
                        <Suspense fallback={
                            <div className="flex h-64 items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}

