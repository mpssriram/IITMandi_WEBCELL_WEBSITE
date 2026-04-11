import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App";
import "./index.css";

const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const UserDashboardPage = lazy(() => import("./pages/UserDashboardPage").then((module) => ({ default: module.UserDashboardPage })));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/user/dashboard" element={<UserDashboardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    </React.StrictMode>,
);