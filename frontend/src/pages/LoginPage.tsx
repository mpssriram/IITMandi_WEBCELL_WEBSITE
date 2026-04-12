import { useEffect, useState } from "react";

import { ArrowLeft, ArrowRight, KeyRound, LogIn, Mail } from "lucide-react";
import {
    GoogleAuthProvider,
    getRedirectResult,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    signOut,
} from "firebase/auth";
import { Link, useNavigate, useLocation, type Location } from "react-router-dom";

import { AuthInput, AuthMessage, AuthDivider } from "@/components/AuthCard";
import { Hyperspeed } from "@/components/Hyperspeed";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

// ─── constants ───────────────────────────────────────────────────────────────

const SESSION_NETWORK_ERROR = "__SESSION_NETWORK_ERROR__";
const SESSION_PROFILE_ERROR = "__SESSION_PROFILE_ERROR__";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getFirebaseCode(error: unknown): string {
    return typeof error === "object" && error && "code" in error
        ? String((error as { code?: string }).code || "")
        : "";
}

function normalizeFirebaseError(error: unknown, fallback: string): string {
    const code = getFirebaseCode(error);
    const msg =
        typeof error === "object" && error && "message" in error
            ? String((error as { message?: string }).message || "")
            : "";
    const resolved = code || msg;

    if (resolved === SESSION_NETWORK_ERROR) return "Network error. Check your connection.";
    if (resolved === SESSION_PROFILE_ERROR) return "Signed in, but could not load your profile. Try refreshing.";
    if (code === "auth/popup-blocked") return "Popup blocked. Falling back to redirect…";
    if (code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
    if (code === "auth/unauthorized-domain") return "This domain is not authorised in Firebase Console.";
    if (code === "auth/configuration-not-found") return "Google sign-in is not enabled for this project.";
    if (code === "auth/operation-not-allowed") return "This sign-in method is disabled.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password")
        return "Incorrect password. Please try again.";
    if (code === "auth/user-not-found") return "No account found with this email.";
    if (code === "auth/user-disabled") return "This account has been disabled.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
    if (code === "auth/network-request-failed") return "Network error. Check your connection.";
    if (code === "auth/internal-error") return "Something went wrong. Please try again.";
    return fallback;
}

// ─── component ───────────────────────────────────────────────────────────────

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, isAdmin, loading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

    const from = (location.state as { from?: Location } | null)?.from;
    const intendedPath = from?.pathname && from.pathname !== "/login" ? from.pathname : null;
    const isAuthenticated = Boolean(user && token);

    useEffect(() => {
        localStorage.removeItem("devcell_force_logout");
    }, []);

    // Redirect if already authenticated. If Firebase still has a user but our app
    // token is gone, clear that stale session so the login page remains usable.
    useEffect(() => {
        if (authLoading) return;

        if (user && !token) {
            void signOut(auth).catch(() => undefined);
            return;
        }

        if (!isAuthenticated) return;

        const destination = intendedPath || (isAdmin ? "/admin/dashboard" : "/user/dashboard");
        navigate(destination, { replace: true });
    }, [authLoading, intendedPath, isAdmin, isAuthenticated, navigate, token, user]);

    // Handle Google redirect result (mobile popup-blocked fallback)
    useEffect(() => {
        let active = true;
        const finish = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!active || !result?.user) return;
                setSubmitting(true);
                const token = await result.user.getIdToken();
                localStorage.setItem("devcell_id_token", token);
                await verifyAndRoute(token);
            } catch (error) {
                if (!active) return;
                setMessage({ type: "error", text: normalizeFirebaseError(error, "Sign-in failed. Please try again.") });
            } finally {
                if (active) setSubmitting(false);
            }
        };
        void finish();
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const verifyAndRoute = (_token: string) => {
        // With the new backend-driven AuthContext, we don't need to manually verify here.
        // The AuthContext's onAuthStateChanged -> resolveBackendSession will handle it.
        // We just show a success message; the useEffect will handle the redirection.
        setMessage({ type: "success", text: "Signed in. Resolving session…" });
    };

    const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setSubmitting(true);

        const normalizedEmail = email.trim();
        try {
            const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            await verifyAndRoute(token);
        } catch (error) {
            const code = getFirebaseCode(error);
            if (code === "auth/user-not-found") {
                navigate("/signup", { replace: true, state: { prefillEmail: normalizedEmail } });
                return;
            }
            setMessage({ type: "error", text: normalizeFirebaseError(error, "Sign-in failed. Please try again.") });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setMessage(null);
        setSubmitting(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const credential = await signInWithPopup(auth, provider);
            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            await verifyAndRoute(token);
        } catch (error) {
            const code = getFirebaseCode(error);
            if (code === "auth/popup-blocked") {
                setMessage({ type: "info", text: "Popup blocked. Redirecting to Google sign-in…" });
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: "select_account" });
                    await signInWithRedirect(auth, provider);
                    return;
                } catch (redirectError) {
                    setMessage({ type: "error", text: normalizeFirebaseError(redirectError, "Redirect sign-in failed.") });
                    return;
                }
            }
            setMessage({ type: "error", text: normalizeFirebaseError(error, "Google sign-in failed. Please try again.") });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── render ──────────────────────────────────────────────────────────────

    return (
        <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12 text-white sm:px-6">
            <div className="fixed inset-0 -z-30 bg-[#030912]" />
            <Hyperspeed className="-z-20 opacity-40" />
            
            {/* ── Ambient background — one subtle radial, no animation ─── */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.07),transparent)]"
            />
            {/* Fine dot grid for depth — very faint */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-club-grid bg-[size:40px_40px] opacity-[0.022]"
            />

            {/* ── Wordmark / brand ─────────────────────────────────────── */}
            <div className="relative z-10 mb-10 text-center">
                <Link to="/" className="inline-flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030912] rounded-lg">
                    {/* Dot + name mark */}
                    <span className="inline-flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-white">
                            IIT Mandi Dev Cell
                        </span>
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-slate-600">
                        Member workspace
                    </span>
                </Link>
            </div>

            {/* ── Login card ───────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-[22rem] sm:max-w-[24rem]">
                {/* Subtle card glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 [background:radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.08),transparent_60%)]"
                />

                <div className="rounded-2xl border border-white/[0.07] bg-[rgba(9,16,30,0.92)] p-7 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:p-8">
                    {/* Card header */}
                    <div className="mb-7">
                        <h1 className="font-display text-[1.55rem] font-semibold tracking-[-0.035em] text-white">
                            Sign in
                        </h1>
                        <p className="mt-1.5 text-[13.5px] leading-[1.6] text-slate-500">
                            Enter your credentials or continue with Google.
                        </p>
                    </div>

                    {/* Google sign-in — top position for discoverability */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={submitting}
                        className="mb-5 inline-flex h-[2.85rem] w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[13.5px] font-medium text-slate-200 transition hover:border-white/[0.12] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        {/* Google G icon */}
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <AuthDivider label="or" />

                    {/* Email / password form */}
                    <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4" noValidate>
                        <AuthInput
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            placeholder="you@iitmandi.ac.in"
                            autoComplete="email"
                            onChange={setEmail}
                            icon={Mail}
                            variant="member"
                        />
                        <AuthInput
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            onChange={setPassword}
                            icon={KeyRound}
                            variant="member"
                        />

                        {/* Status message */}
                        {message && (
                            <AuthMessage type={message.type} text={message.text} />
                        )}

                        {/* CTA */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-1 inline-flex h-[2.85rem] w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#38bdf8,#60a5fa)] text-[13.5px] font-semibold text-[#030912] shadow-[0_8px_24px_-10px_rgba(56,189,248,0.4)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030912] disabled:cursor-not-allowed disabled:opacity-55"
                        >
                            {submitting ? "Signing in…" : "Sign in"}
                            <LogIn className="h-[15px] w-[15px]" />
                        </button>
                    </form>
                </div>

                {/* ── Footer links ─────────────────────────────────────── */}
                <div className="mt-5 flex items-center justify-between px-1 text-[12.5px]">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-400 focus-visible:outline-none"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to website
                    </Link>
                    <Link
                        to="/admin/login"
                        className="inline-flex items-center gap-1 text-slate-600 transition hover:text-slate-400 focus-visible:outline-none"
                    >
                        Admin login
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
