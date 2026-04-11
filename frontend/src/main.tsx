import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from "react-router-dom";

import App from "./App";
import SignupPage from "@/pages/SignupPage";
import "./index.css";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const UserAreaLayout = lazy(() => import("./layouts/UserAreaLayout").then((module) => ({ default: module.UserAreaLayout })));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage").then((module) => ({ default: module.UserDashboardPage })));
const UserEventsPage = lazy(() => import("./pages/UserEventsPage").then((module) => ({ default: module.UserEventsPage })));
const UserEventDetailPage = lazy(() => import("./pages/UserEventDetailPage").then((module) => ({ default: module.UserEventDetailPage })));
const UserResourcesPage = lazy(() => import("./pages/UserResourcesPage").then((module) => ({ default: module.UserResourcesPage })));
const UserNotificationsPage = lazy(() => import("./pages/UserNotificationsPage").then((module) => ({ default: module.UserNotificationsPage })));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage").then((module) => ({ default: module.UserProfilePage })));

function AppRouter() {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location } | null;
    const backgroundLocation = state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route path="/" element={<App />} />
                <Route path="/join" element={<Navigate to="/#join" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/user" element={<UserAreaLayout />}>
                    <Route index element={<Navigate to="/user/dashboard" replace />} />
                    <Route path="dashboard" element={<UserDashboardPage />} />
                    <Route path="events" element={<UserEventsPage />} />
                    <Route path="events/:id" element={<UserEventDetailPage />} />
                    <Route path="resources" element={<UserResourcesPage />} />
                    <Route path="notifications" element={<UserNotificationsPage />} />
                </Route>
                <Route path="/user/profile" element={<UserProfilePage />} />
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
        <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
                <AppRouter />
            </Suspense>
        </BrowserRouter>
    </React.StrictMode>,
);
