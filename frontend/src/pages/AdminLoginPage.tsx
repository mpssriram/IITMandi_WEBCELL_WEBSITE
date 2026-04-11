import { useState } from "react";

import { ElectricCard } from "@/components/ElectricCard";
import { FaultyTerminal } from "@/components/FaultyTerminal";
import { LetterGlitch } from "@/components/LetterGlitch";
import { API_BASE_URL } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorText, setErrorText] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorText("");
        setSubmitting(true);

        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const token = await credential.user.getIdToken();
            localStorage.setItem("devcell_id_token", token);

            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Session validation failed.");
            }

            const payload = (await response.json()) as {
                user?: {
                    admin?: boolean;
                    role?: string;
                };
            };

            const isAdmin = Boolean(payload?.user?.admin) || payload?.user?.role === "admin";
            if (!isAdmin) {
                localStorage.removeItem("devcell_id_token");
                throw new Error("Admin access required for this dashboard.");
            }

            navigate("/admin/dashboard");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Admin login failed.";
            setErrorText(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
            <FaultyTerminal className="-z-10" />

            <main className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-4 sm:px-6 lg:px-8">
                <ElectricCard intensity="soft" className="w-full max-w-lg p-6 sm:p-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/75">Admin Access</p>
                    <h1 className="mt-3 font-display text-3xl font-semibold text-white">Control Panel Login</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        Restricted route for admin workflows.
                        <span className="ml-2 text-cyan-200/85">
                            <LetterGlitch text="AUTHORIZED NODES ONLY" className="text-xs uppercase tracking-[0.18em]" />
                        </span>
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                            placeholder="admin@iitmandi.ac.in"
                            required
                            autoComplete="email"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                        />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {submitting ? "Authenticating..." : "Enter admin dashboard"}
                        </button>

                        {errorText ? <p className="text-sm text-rose-300">{errorText}</p> : null}
                    </form>

                    <div className="mt-6 border-t border-white/10 pt-4">
                        <Link to="/" className="text-sm font-semibold text-cyan-100 transition hover:text-cyan-50">
                            Back to public site
                        </Link>
                    </div>
                </ElectricCard>
            </main>
        </div>
    );
}
