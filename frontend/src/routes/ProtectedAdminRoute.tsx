import { AccessDenied } from "@/components/AccessDenied";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedAdminRoute() {
    const location = useLocation();
    const { user, token, isAdmin, loading } = useAuth();
    const isAuthenticated = Boolean(user && token);

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-ink-950 px-4 text-center text-slate-300">
                <p className="text-sm">Checking admin session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-ink-950 text-white">
                <AccessDenied message="You are signed in, but this account is not authorized to access the admin panel." />
            </div>
        );
    }

    return <Outlet />;
}
