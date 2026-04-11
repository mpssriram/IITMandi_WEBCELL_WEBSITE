import { useMemo, useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import { API_BASE_URL } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type SignupLocationState = {
    prefillEmail?: string;
};

export function SignupPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = (location.state || {}) as SignupLocationState;

    const [email, setEmail] = useState(state.prefillEmail || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const canSubmit = useMemo(() => {
        return Boolean(email.trim()) && Boolean(password) && Boolean(confirmPassword);
    }, [email, password, confirmPassword]);

    const parseBackendError = async (response: Response) => {
        try {
            const payload = (await response.json()) as { detail?: string; message?: string };
            const detail = payload?.detail || payload?.message;
            return detail || "Account created, but we could not start your session.";
        } catch {
            return "Account created, but we could not start your session.";
        }
    };

    const verifySessionAndRedirect = async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const detail = await parseBackendError(response);
            throw new Error(detail);
        }

        const payload = (await response.json()) as {
            user?: { role?: string; admin?: boolean; roll_number?: string | null };
            onboarding_required?: boolean;
        };

        const isAdmin = Boolean(payload?.user?.admin) || payload?.user?.role === "admin";
        const needsOnboarding = Boolean(payload?.onboarding_required) || !payload?.user?.roll_number;

        if (isAdmin) {
            navigate("/admin/dashboard", { replace: true });
            return;
        }

        navigate(needsOnboarding ? "/user/profile" : "/user/dashboard", { replace: true });
    };

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);

        const normalizedEmail = email.trim();

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters." });
            return;
        }

        setSubmitting(true);
        console.info("[auth] signup submit started", { email: normalizedEmail, provider: "password" });

        try {
            console.info("[auth] calling createUserWithEmailAndPassword");
            const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            console.info("[auth] createUserWithEmailAndPassword success", {
                uid: credential.user?.uid,
                email: credential.user?.email,
            });

            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            await verifySessionAndRedirect(token);
        } catch (error) {
            const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : "";
            const errMessage = typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message || "") : "";
            const customData = typeof error === "object" && error && "customData" in error ? (error as { customData?: unknown }).customData : undefined;

            console.error("[auth] createUserWithEmailAndPassword error", {
                code,
                message: errMessage,
                customData,
            });

            if (code === "auth/email-already-in-use") {
                setMessage({ type: "error", text: "This email already has an account. Please sign in instead." });
            } else if (code === "auth/invalid-email") {
                setMessage({ type: "error", text: "Invalid email address." });
            } else if (code === "auth/weak-password") {
                setMessage({ type: "error", text: "Password is too weak. Use at least 6 characters." });
            } else if (code === "auth/operation-not-allowed") {
                setMessage({ type: "error", text: "Email/password signup is disabled in Firebase Console." });
            } else if (code === "auth/internal-error") {
                setMessage({ type: "error", text: "Firebase returned an internal error. Check Firebase Email/Password provider configuration." });
            } else {
                setMessage({ type: "error", text: errMessage || "Signup failed. Please try again." });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative isolate min-h-screen overflow-hidden bg-ink-950 text-white">
            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[90rem] items-center px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,18,37,0.62),rgba(4,10,20,0.4))] shadow-[0_35px_120px_-45px_rgba(8,145,178,0.45)] backdrop-blur-[8px]">
                    <div className="relative grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="flex items-center p-5 sm:p-8 lg:p-10 xl:p-12">
                            <div className="w-full max-w-xl">
                                <ElectricCard intensity="soft" className="rounded-[1.9rem] border-white/12 bg-[#071429]/94 p-6 shadow-[0_26px_80px_-38px_rgba(34,211,238,0.38)] sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Create Account</p>
                                    <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                        Start your Dev Cell workspace account
                                    </h1>
                                    <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                                        Set up your Firebase email/password account. After signup, you will continue to profile completion.
                                    </p>

                                    <form onSubmit={handleSignup} className="mt-7 space-y-4">
                                        <div>
                                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                className="min-h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                                placeholder="you@iitmandi.ac.in"
                                                required
                                                autoComplete="email"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                className="min-h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                                placeholder="At least 6 characters"
                                                required
                                                autoComplete="new-password"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">
                                                Confirm password
                                            </label>
                                            <input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                className="min-h-12 w-full rounded-2xl border border-white/12 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                                placeholder="Re-enter password"
                                                required
                                                autoComplete="new-password"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!canSubmit || submitting}
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {submitting ? "Creating account..." : "Create account"}
                                            <UserPlus className="h-4 w-4" />
                                        </button>

                                        {message ? (
                                            <p className={`text-sm ${message.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>
                                                {message.text}
                                            </p>
                                        ) : null}
                                    </form>

                                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Firebase Email/Password signup</div>
                                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
                                            Back to login
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </ElectricCard>
                            </div>
                        </div>
                        <div className="hidden lg:block" />
                    </div>
                </section>
            </main>
        </div>
    );
}

export default SignupPage;
