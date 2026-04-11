import { useEffect, useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import { LoginHyperspeed } from "@/components/LoginHyperspeed";
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
import { ArrowRight, LogIn, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const getFirebaseErrorDetails = (error: unknown) => {
        const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : "";
        const errorMessage = typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message || "") : "";
        const customData = typeof error === "object" && error && "customData" in error ? (error as { customData?: unknown }).customData : undefined;

        return { code, errorMessage, customData };
    };

    const normalizeAuthError = (error: unknown, fallback: string) => {
        const { code, errorMessage } = getFirebaseErrorDetails(error);

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
        if (code === "auth/configuration-not-found") {
            return "Google sign-in is not enabled in the current Firebase project.";
        }

        if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
            return "Invalid email or password. Please try again.";
        }
        if (code === "auth/user-not-found") {
            return "No account found for this email. Redirecting to sign up...";
        }
        if (code === "auth/user-disabled") {
            return "This account is disabled. Contact the administrator.";
        }
        if (code === "auth/too-many-requests") {
            return "Too many failed attempts. Please wait and try again.";
        }
        if (code === "auth/operation-not-allowed") {
            return "Email/password sign-in is disabled in Firebase Console.";
        }
        if (code === "auth/internal-error") {
            return "Firebase returned an internal error. Verify Firebase Email/Password provider and project configuration.";
        }

        if (errorMessage) {
            return errorMessage;
        }

        return fallback;
    };

    const parseBackendError = async (response: Response) => {
        try {
            const payload = (await response.json()) as { detail?: string; message?: string };
            const detail = payload?.detail || payload?.message;

            if (!detail) {
                return "Login completed, but we could not start your session. Please try again.";
            }

            if (detail.toLowerCase().includes("firebase") || detail.toLowerCase().includes("token")) {
                return "We could not verify your session. Please sign in again.";
            }

            return "We could not complete sign-in right now. Please try again.";
        } catch {
            return "We could not complete sign-in right now. Please try again.";
        }
    };

    const verifySessionAndRedirect = async (token: string) => {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const safeMessage = await parseBackendError(response);
            throw new Error(safeMessage);
        }

        const payload = (await response.json()) as {
            onboarding_required?: boolean;
            user?: {
                admin?: boolean;
                role?: string;
                roll_number?: string | null;
            };
        };

        const isAdmin = Boolean(payload?.user?.admin) || payload?.user?.role === "admin";
        const destination = isAdmin ? "/admin/dashboard" : "/user/dashboard";

        setMessage({ type: "success", text: "Login successful. Redirecting..." });
        navigate(destination, { replace: true });
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

        const normalizedEmail = email.trim();
        console.info("[auth] email/password submit started", {
            email: normalizedEmail,
            provider: "password",
            hasPassword: Boolean(password),
        });

        try {
            console.info("[auth] calling signInWithEmailAndPassword");
            const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            console.info("[auth] signInWithEmailAndPassword success", {
                uid: credential.user?.uid,
                email: credential.user?.email,
            });

            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);
            await verifySessionAndRedirect(token);
        } catch (error) {
            const fallback = "Login failed. Please try again.";
            const details = getFirebaseErrorDetails(error);
            console.error("[auth] signInWithEmailAndPassword error", {
                code: details.code,
                message: details.errorMessage,
                customData: details.customData,
            });

            if (details.code === "auth/user-not-found") {
                setMessage({ type: "error", text: normalizeAuthError(error, fallback) });
                navigate("/signup", {
                    replace: true,
                    state: { prefillEmail: normalizedEmail },
                });
                return;
            }

            setMessage({ type: "error", text: normalizeAuthError(error, fallback) });
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
        <div className="relative isolate min-h-screen overflow-hidden bg-ink-950 text-white">
            <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
                <LoginHyperspeed density={36} className="opacity-100" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_74%_36%,rgba(96,165,250,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.1),transparent_30%),linear-gradient(180deg,rgba(4,8,20,0.52)_0%,rgba(6,16,31,0.36)_54%,rgba(5,8,22,0.62)_100%)]" />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-club-grid bg-[size:52px_52px] opacity-[0.03] lg:opacity-[0.06]" />

            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[90rem] items-center px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,18,37,0.62),rgba(4,10,20,0.4))] shadow-[0_35px_120px_-45px_rgba(8,145,178,0.45)] backdrop-blur-[8px]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_22%),linear-gradient(115deg,rgba(34,211,238,0.08),transparent_36%,transparent_62%,rgba(59,130,246,0.1))]" />
                    <div className="pointer-events-none absolute inset-y-0 left-[44%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(103,232,249,0.28),transparent)] lg:block" />
                    <div className="pointer-events-none absolute left-[42%] top-[18%] hidden h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl lg:block" />
                    <div className="pointer-events-none absolute right-[8%] top-[16%] hidden h-52 w-52 rounded-full bg-sky-400/12 blur-3xl lg:block" />

                    <div className="relative grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="flex items-center p-5 sm:p-8 lg:p-10 xl:p-12">
                            <div className="w-full max-w-xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    IIT Mandi Dev Cell
                                </div>

                                <ElectricCard intensity="soft" className="rounded-[1.9rem] border-white/12 bg-[#071429]/94 p-6 shadow-[0_26px_80px_-38px_rgba(34,211,238,0.38)] sm:p-8">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Member Login</p>
                                    <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                        Enter the workspace where ideas
                                        <span className="mt-1 block bg-gradient-to-r from-cyan-100 via-cyan-200 to-sky-200 bg-clip-text text-transparent">
                                            ship with intent.
                                        </span>
                                    </h1>
                                    <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
                                        Sign in with your Dev Cell account to continue to internal workflows, event activity, project updates, and member tools.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
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
                                                placeholder="Enter password"
                                                required
                                                autoComplete="current-password"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {submitting ? "Signing in..." : "Sign in"}
                                            <LogIn className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            disabled={submitting}
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-70"
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

                                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                            Secure Firebase login
                                        </div>
                                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
                                            Back to website
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </ElectricCard>
                            </div>
                        </div>

                        <div className="relative hidden min-h-[42rem] items-center justify-center overflow-hidden lg:flex lg:px-6 xl:px-10">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_42%)]" />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.03)_28%,rgba(96,165,250,0.04)_64%,transparent)]" />

                            <div className="relative w-full max-w-[50rem]">
                                <div className="absolute inset-x-[8%] bottom-[-2.2rem] h-12 rounded-full bg-cyan-400/16 blur-3xl" />
                                <div className="absolute inset-0 rounded-[2.4rem] border border-cyan-300/8 bg-cyan-300/[0.03] backdrop-blur-[1px]" />
                                <div className="absolute right-[6%] top-[8%] h-24 w-24 rounded-full border border-cyan-300/12 bg-cyan-300/8 blur-xl" />

                                <div className="relative mx-auto">
                                    <div className="mx-auto w-full rounded-[2rem] border border-slate-600/70 bg-[linear-gradient(180deg,rgba(22,32,48,0.96)_0%,rgba(11,17,29,0.98)_100%)] p-4 shadow-[0_48px_140px_-55px_rgba(34,211,238,0.52)]">
                                        <div className="relative overflow-hidden rounded-[1.35rem] border border-cyan-300/10 bg-[#050816] px-8 py-7">
                                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />
                                            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
                                            <div className="pointer-events-none absolute right-10 top-8 h-24 w-24 rounded-full border border-cyan-300/10 bg-cyan-300/6 blur-2xl" />

                                            <div className="relative">
                                                <div className="mb-5 flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                                                </div>

                                                <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(6,15,28,0.94),rgba(4,9,18,0.98))] px-8 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                                    <div className="flex min-h-[23rem] flex-col">
                                                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Dev Cell Workflow</p>
                                                        <div className="mt-6 h-[5.6rem] overflow-hidden">
                                                            <TextType
                                                                as="h2"
                                                                text={["Build", "Ship", "Design", "Deploy", "Create"]}
                                                                typingSpeed={78}
                                                                deletingSpeed={44}
                                                                pauseDuration={1100}
                                                                className="font-display text-[4.2rem] font-semibold leading-[1.05] text-cyan-100"
                                                                cursorClassName="text-cyan-300"
                                                                startOnVisible={true}
                                                            />
                                                        </div>

                                                        <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                                                            One environment for members to design interfaces, review event activity, manage resources, and keep real work moving.
                                                        </p>

                                                        <div className="mt-auto grid gap-4 pt-10">
                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                                                                    <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/65">Mode</p>
                                                                    <p className="mt-2 text-sm font-semibold text-white">Review, iterate, deploy</p>
                                                                </div>
                                                                <div className="rounded-[1.25rem] border border-cyan-300/16 bg-cyan-400/8 p-4">
                                                                    <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/65">Signal</p>
                                                                    <p className="mt-2 text-sm font-semibold text-white">Live workflows with motion</p>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(34,211,238,0.06))] p-5">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/65">Workspace</p>
                                                                        <p className="mt-2 text-sm text-slate-300">Internal tools, event updates, project movement, and member coordination.</p>
                                                                    </div>
                                                                    <div className="h-11 w-11 rounded-2xl border border-cyan-300/18 bg-cyan-300/10" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mx-auto mt-3 h-2.5 w-[90%] rounded-full bg-[#3b4655]" />
                                    <div className="mx-auto mt-1 h-6 w-[24%] rounded-b-xl border-x border-b border-slate-600/60 bg-[#101722]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
