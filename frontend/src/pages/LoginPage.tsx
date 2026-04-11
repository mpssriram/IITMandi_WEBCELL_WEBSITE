import { useEffect, useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import LiquidEther from "@/components/LiquidEther";
import TextType from "@/components/TextType";
import { API_BASE_URL } from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
    GoogleAuthProvider,
    getRedirectResult,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
} from "firebase/auth";
import { ArrowRight, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const normalizeAuthError = (error: unknown, fallback: string) => {
        const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";

        if (code === "auth/popup-blocked") {
            return "Popup was blocked by the browser. Redirecting to Google sign-in...";
        }
        if (code === "auth/popup-closed-by-user") {
            return "Google popup was closed before sign-in completed.";
        }
        if (code === "auth/unauthorized-domain") {
            return "This domain is not authorized in Firebase Auth. Add localhost in Firebase Console > Authentication > Settings.";
        }
        if (code === "auth/operation-not-allowed") {
            return "Google sign-in is disabled in Firebase Console. Enable Google provider in Authentication > Sign-in method.";
        }

        if (error instanceof Error && error.message) {
            return error.message;
        }

        return fallback;
    };

    const verifySessionAndRedirect = async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Login succeeded, but backend session check failed.");
        }

        const payload = (await response.json()) as {
            user?: {
                admin?: boolean;
                role?: string;
            };
        };

        const isAdmin = Boolean(payload?.user?.admin) || payload?.user?.role === "admin";
        const destination = isAdmin ? "/admin/dashboard" : "/user/dashboard";

        setMessage({ type: "success", text: "Login successful. Redirecting..." });
        window.setTimeout(() => navigate(destination), 700);
    };

    useEffect(() => {
        let active = true;

        const completeRedirectSignIn = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!active || !result?.user) {
                    return;
                }

                setSubmitting(true);
                const token = await result.user.getIdToken();
                localStorage.setItem("devcell_id_token", token);
                await verifySessionAndRedirect(token);
            } catch (error) {
                if (!active) {
                    return;
                }
                setMessage({ type: "error", text: normalizeAuthError(error, "Google sign-in failed. Please try again.") });
            } finally {
                if (active) {
                    setSubmitting(false);
                }
            }
        };

        completeRedirectSignIn();

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setSubmitting(true);

        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            await verifySessionAndRedirect(token);
        } catch (error) {
            const fallback = "Login failed. Check credentials and try again.";
            const text = error instanceof Error ? error.message : fallback;
            setMessage({ type: "error", text: text || fallback });
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
            await verifySessionAndRedirect(token);
        } catch (error) {
            const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";

            if (code === "auth/popup-blocked") {
                try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: "select_account" });
                    await signInWithRedirect(auth, provider);
                    return;
                } catch (redirectError) {
                    setMessage({ type: "error", text: normalizeAuthError(redirectError, "Google sign-in failed. Please try again.") });
                    return;
                }
            }

            setMessage({ type: "error", text: normalizeAuthError(error, "Google sign-in failed. Please try again.") });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-75">
                <LiquidEther
                    colors={["#0b1220", "#0f2a44", "#123955", "#184e77"]}
                    resolution={0.35}
                    mouseForce={16}
                    cursorSize={85}
                    autoDemo={true}
                    autoSpeed={0.4}
                    autoIntensity={1.8}
                    style={{ position: "absolute", inset: 0 }}
                />
            </div>
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),transparent_30%)]" />

            <main className="mx-auto grid min-h-screen w-full max-w-[84rem] items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-8">
                <section className="relative z-10 mx-auto w-full max-w-xl lg:mx-0">
                    <ElectricCard intensity="soft" className="rounded-3xl p-6 backdrop-blur-xl sm:p-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">IIT Mandi Dev Cell</p>
                            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Welcome back
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-slate-300">
                                Sign in with your club account to continue to internal workflows and dashboards.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-200">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                        placeholder="you@iitmandi.ac.in"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-200">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                        placeholder="Enter password"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {submitting ? "Signing in..." : "Sign in"}
                                    <LogIn className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={submitting}
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-900">G</span>
                                    Continue with Google
                                </button>

                                {message ? (
                                    <p className={`text-sm ${message.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>
                                        {message.text}
                                    </p>
                                ) : null}
                            </form>

                            <div className="mt-6 border-t border-white/10 pt-4">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-cyan-50"
                                >
                                    Back to website
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </ElectricCard>
                </section>

                <section className="relative hidden lg:flex lg:items-center lg:justify-center">
                    <div className="pointer-events-none absolute -z-10 h-56 w-56 rounded-full bg-cyan-500/18 blur-3xl" />

                    <div className="w-full max-w-[34rem]">
                        <div className="relative mx-auto h-[22rem] w-full rounded-[1.6rem] border border-slate-700/70 bg-gradient-to-b from-slate-800 to-slate-900 p-3 shadow-[0_25px_80px_-35px_rgba(56,189,248,0.45)]">
                            <div className="relative h-full w-full rounded-[1rem] border border-slate-700/80 bg-[#050816] px-8 py-8">
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                </div>

                                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Dev Cell Workflow</p>
                                <TextType
                                    as="h2"
                                    text={["Build", "Ship", "Design", "Deploy", "Create"]}
                                    typingSpeed={80}
                                    deletingSpeed={45}
                                    pauseDuration={1100}
                                    className="mt-5 font-display text-5xl font-semibold leading-tight text-cyan-100"
                                    cursorClassName="text-cyan-300"
                                    startOnVisible={true}
                                />
                                <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
                                    Student teams crafting polished interfaces, robust APIs, and production-minded workflows.
                                </p>
                            </div>
                        </div>

                        <div className="mx-auto mt-3 h-2 w-[90%] rounded-full bg-slate-700/70" />
                        <div className="mx-auto mt-1 h-5 w-[20%] rounded-b-xl border-x border-b border-slate-700/70 bg-slate-800" />
                    </div>
                </section>
            </main>
        </div>
    );
}
