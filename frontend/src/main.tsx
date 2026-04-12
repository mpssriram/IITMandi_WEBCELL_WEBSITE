import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from "react-router-dom";

import App from "@/App";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedAdminRoute } from "@/routes/ProtectedAdminRoute";
import { ProtectedUserRoute } from "@/routes/ProtectedUserRoute";
import SignupPage from "@/pages/SignupPage";
import "./index.css";

const LoginPage = lazy(() => import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const AdminLoginPage = lazy(() => import("@/pages/AdminLogin"));
const AdminAreaLayout = lazy(() => import("@/layouts/AdminAreaLayout").then((module) => ({ default: module.AdminAreaLayout })));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminEventsPage = lazy(() => import("@/pages/AdminEventsPage"));
const AdminProjectsPage = lazy(() => import("@/pages/AdminProjectsPage"));
const AdminResourcesPage = lazy(() => import("@/pages/AdminResourcesPage"));
const AdminAnnouncementsPage = lazy(() => import("@/pages/AdminAnnouncementsPage"));

// ─── User Side Components ──────────────────────────────────────────────────
const UserAreaLayout = lazy(() => import("@/layouts/UserAreaLayout").then((module) => ({ default: module.UserAreaLayout })));
const UserDashboardPage = lazy(() => import("@/pages/UserDashboardPage"));
const UserEventsPage = lazy(() => import("@/pages/UserEventsPage"));
const UserEventDetailPage = lazy(() => import("@/pages/UserEventDetailPage"));
const UserNotificationsPage = lazy(() => import("@/pages/UserNotificationsPage"));
const UserResourcesPage = lazy(() => import("@/pages/UserResourcesPage"));
const UserProjectsPage = lazy(() => import("@/pages/UserProjectsPage"));
const UserMembersPage = lazy(() => import("@/pages/UserMembersPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));


function AppRouter() {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location } | null;
    const backgroundLocation = state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route path="/" element={<App />} />
                <Route path="/join" element={<Navigate to="/#join" replace />} />
                <Route path="/projects" element={<Navigate to="/#projects" replace />} />
                <Route path="/events" element={<Navigate to="/#events" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                <Route path="/admin" element={<ProtectedAdminRoute />}>
                    <Route element={<AdminAreaLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="events" element={<AdminEventsPage />} />
                        <Route path="projects" element={<AdminProjectsPage />} />
                        <Route path="resources" element={<AdminResourcesPage />} />
                        <Route path="announcements" element={<AdminAnnouncementsPage />} />
                    </Route>
                </Route>

                <Route path="/user" element={<ProtectedUserRoute />}>
                    <Route element={<UserAreaLayout />}>
                        <Route index element={<Navigate to="/user/dashboard" replace />} />
                        <Route path="dashboard" element={<UserDashboardPage />} />
                        <Route path="events" element={<UserEventsPage />} />
                        <Route path="events/:id" element={<UserEventDetailPage />} />
                        <Route path="notifications" element={<UserNotificationsPage />} />
                        <Route path="resources" element={<UserResourcesPage />} />
                        <Route path="projects" element={<UserProjectsPage />} />
                        <Route path="members" element={<UserMembersPage />} />
                    </Route>
                </Route>
                <Route path="/user/profile" element={<ProtectedUserRoute />}>
                    <Route index element={<UserProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {backgroundLocation ? (
                <Routes>
                    <Route path="/user/profile" element={<UserProfilePage modal />} />
                </Routes>
            ) : null}

        </>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
                    <AppRouter />
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);
