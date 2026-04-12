import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Guards all /user/* routes at the router level.
 *
 * - Not authenticated  → redirects to /login (passes 'from' so the user returns
 *   to the intended page after signing in).
 * - Authenticated admin → allowed (they can browse the user area too).
 * - Authenticated user  → allowed.
 *
 * Heavy per-page checks (e.g. token refresh, profile loading) still run inside
 * UserAreaLayout; this wrapper only catches unauthenticated visitors early so
 * they never see a flash of the protected UI.
 */
export function ProtectedUserRoute() {
    const location = useLocation();
    const { user, token, loading } = useAuth();
    const isAuthenticated = Boolean(user && token);

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-[#030811] px-4 text-center text-slate-400">
                <p className="text-sm">Checking session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
