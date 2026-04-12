import { useEffect, useState } from "react";

import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { Link, useNavigate, useLocation, type Location } from "react-router-dom";

import {
    AuthBadge,
    AuthButton,
    AuthInput,
    AuthMessage,
    AuthShell,
} from "@/components/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

// ─── helpers ────────────────────────────────────────────────────────────────

function normalizeAdminAuthError(error: unknown): string {
    const code =
        typeof error === "object" && error && "code" in error
            ? String((error as { code?: string }).code || "")
            : "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password")
        return "Incorrect password. Please try again.";
    if (code === "auth/user-not-found") return "No account found for this email.";
    if (code === "auth/network-request-failed") return "Network error. Check your connection.";
    if (code === "auth/user-disabled") return "This account is disabled.";
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/operation-not-allowed") return "This sign-in method is disabled.";
    if (code === "auth/internal-error") return "Something went wrong. Please try again.";
    return "Authentication failed. Please try again.";
}

// ─── component ──────────────────────────────────────────────────────────────

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, isAdmin, loading: authLoading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [awaitingRole, setAwaitingRole] = useState(false);
    const [error, setError] = useState("");

    // Where to send the admin once verified.
    const from = (location.state as { from?: Location } | null)?.from;
    const redirectTarget =
        from?.pathname && from.pathname !== "/admin/login"
            ? `${from.pathname}${from.search || ""}${from.hash || ""}`
            : "/admin/dashboard";
    const isAuthenticated = Boolean(user && token);

    // If already authenticated AND admin -> redirect immediately.
    // If Firebase still has a user but our app token is gone, clear that stale
    // session so the admin login form keeps working reliably.
    useEffect(() => {
        if (authLoading) return;

        if (user && !token) {
            void signOut(auth).catch(() => undefined);
            return;
        }

        if (isAuthenticated && isAdmin) {
            navigate(redirectTarget, { replace: true });
            return;
        }

        if (isAuthenticated && !isAdmin && awaitingRole) {
            // Firebase sign-in succeeded but the account has no admin role.
            setError(
                "This account does not have admin access. Contact the club administrator if you believe this is a mistake.",
            );
            setAwaitingRole(false);
        }
    }, [authLoading, awaitingRole, isAdmin, isAuthenticated, navigate, redirectTarget, token, user]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        setAwaitingRole(false);

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            // AuthContext's onAuthStateChanged will now run resolveAdminAccess.
            // We set this flag so the useEffect above knows to check the result.
            setAwaitingRole(true);
        } catch (err) {
            setError(normalizeAdminAuthError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setSubmitting(true);
        setAwaitingRole(false);

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const credential = await signInWithPopup(auth, provider);
            // Assuming we check via token for DevCell similarly to the user process
            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            setAwaitingRole(true);
        } catch (error) {
            const code =
                typeof error === "object" && error && "code" in error
                    ? String((error as { code?: string }).code || "")
                    : "";
                    
            if (code === "auth/popup-blocked") {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: "select_account" });
                    await signInWithRedirect(auth, provider);
                    return;
                } catch (redirectError) {
                    setError(normalizeAdminAuthError(redirectError));
                    return;
                }
            }
            setError(normalizeAdminAuthError(error));
        } finally {
            setSubmitting(false);
        }
    };

    // ── render ───────────────────────────────────────────────────────────────

    const leftPanel = (
        <div className="max-w-[22rem]">
            <AuthBadge variant="admin">
                <LockKeyhole className="h-3.5 w-3.5" />
                Restricted access
            </AuthBadge>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Admin portal
            </p>
            <h1 className="mt-3 font-display text-[2.4rem] font-semibold leading-[1.0] tracking-[-0.045em] text-white">
                Authorised&nbsp;admins only.
            </h1>
            <p className="mt-5 text-sm leading-[1.8] text-slate-400">
                This portal is reserved for accounts explicitly mapped to the admin role.
                Credentials are verified through Firebase, then the role is confirmed
                against the application's user data.
            </p>

            <div className="mt-9 space-y-px rounded-xl border border-white/[0.06] overflow-hidden">
                {[
                    { label: "Auth provider", value: "Firebase email/password" },
                    { label: "Role gate", value: "Admin row required in user data" },
                    { label: "Route policy", value: "Protected — admin-only access" },
                ].map((row, i, arr) => (
                    <div
                        key={row.label}
                        className={`flex items-center justify-between gap-4 bg-white/[0.025] px-4 py-3 ${i < arr.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                    >
                        <p className="text-xs text-slate-500">{row.label}</p>
                        <p className="text-xs font-semibold text-slate-300">{row.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-300/15 bg-amber-400/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">
                    Notice
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                    If credentials succeed but access is still blocked, the account exists
                    without an admin role in the local user mapping. Contact the club
                    lead to resolve this.
                </p>
            </div>
        </div>
    );

    const statusMessage = awaitingRole
        ? { type: "info" as const, text: "Credentials accepted. Verifying admin role…" }
        : error
          ? { type: "error" as const, text: error }
          : null;

    const rightPanel = (
        <div className="w-full max-w-[28rem]">
            <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
                    <ShieldAlert className="h-5 w-5" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Dev Cell Admin
                </p>
                <h2 className="mt-3 font-display text-[1.85rem] font-semibold tracking-[-0.04em] text-white">
                    Enter the admin portal.
                </h2>
                <p className="mt-3 text-sm leading-[1.75] text-slate-400">
                    Sign in with your admin credentials. Role verification runs
                    automatically after authentication.
                </p>
            </div>

            <div className="mt-8">
                <AuthButton
                    type="button"
                    variant="admin"
                    onClick={handleGoogleSignIn}
                    disabled={submitting || awaitingRole}
                    className="mb-6 flex w-full items-center justify-center gap-3 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                >
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                </AuthButton>

                <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">or use admin keys</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    id="admin-email"
                    label="Admin email"
                    type="email"
                    value={email}
                    placeholder="admin@iitmandi.ac.in"
                    autoComplete="email"
                    onChange={setEmail}
                    icon={Mail}
                    variant="admin"
                />
                <AuthInput
                    id="admin-password"
                    label="Password"
                    type="password"
                    value={password}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    onChange={setPassword}
                    icon={KeyRound}
                    variant="admin"
                />

                {statusMessage && <AuthMessage type={statusMessage.type} text={statusMessage.text} />}

                <AuthButton variant="admin" submitting={submitting} disabled={awaitingRole}>
                    {awaitingRole
                        ? "Verifying admin role…"
                        : submitting
                          ? "Authenticating…"
                          : "Enter admin portal"}
                    <ArrowRight className="h-4 w-4" />
                </AuthButton>
            </form>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Not an admin?</p>
                    <Link
                        to="/login"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition hover:text-slate-200"
                    >
                        Member login instead
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <Link to="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-400">
                    ← Back to website
                </Link>
            </div>
        </div>
    </div>
);

    return <AuthShell variant="admin" left={leftPanel} right={rightPanel} />;
}
