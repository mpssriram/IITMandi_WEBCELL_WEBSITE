import { useEffect, useState } from "react";

import { CircularGallery } from "@/components/CircularGallery";
import { ElectricCard } from "@/components/ElectricCard";
import { Antigravity } from "@/components/Antigravity";
import { Stack } from "@/components/Stack";
import { API_BASE_URL } from "@/lib/api";
import { BookOpen, FolderKanban, Link2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const resourceCards = [
    { id: "r1", title: "Frontend checklist", caption: "Responsive QA and accessibility baseline." },
    { id: "r2", title: "API style guide", caption: "Naming, validation, and status conventions." },
    { id: "r3", title: "Launch template", caption: "Release notes and handover checklist." },
];

const galleryItems = [
    {
        id: "g1",
        title: "Demo evening",
        caption: "Showcase snapshots",
        image: "https://images.unsplash.com/photo-1515165562835-c4c90bc9f2bb?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "g2",
        title: "Build sprint",
        caption: "Pair-programming sessions",
        image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "g3",
        title: "Whiteboard pass",
        caption: "Architecture planning",
        image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "g4",
        title: "Deployment bay",
        caption: "Ship day mood",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
    },
];

export function UserDashboardPage() {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem("devcell_id_token");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const validate = async () => {
            const response = await fetch(`${API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!mounted) {
                return;
            }

            if (!response.ok) {
                localStorage.removeItem("devcell_id_token");
                navigate("/login", { replace: true });
                return;
            }

            setAuthorized(true);
        };

        validate().catch(() => {
            if (!mounted) {
                return;
            }
            localStorage.removeItem("devcell_id_token");
            navigate("/login", { replace: true });
        });

        return () => {
            mounted = false;
        };
    }, [navigate]);

    if (!authorized) {
        return <div className="min-h-screen bg-ink-950" />;
    }

    return (
        <div className="relative min-h-screen bg-ink-950 text-white">
            <header className="relative overflow-hidden border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8">
                <Antigravity className="-z-10" />
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">User dashboard</p>
                    <h1 className="mt-3 font-display text-4xl font-semibold text-white">Build resources and progress</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        A practical member workspace for references, modules, and project highlights.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
                <section>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Resources</p>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-white">Stacked essentials</h2>
                    <Stack
                        className="mt-6"
                        items={resourceCards.map((item) => ({
                            id: item.id,
                            content: (
                                <div>
                                    <BookOpen className="h-5 w-5 text-cyan-300" />
                                    <p className="mt-3 font-display text-lg font-semibold text-white">{item.title}</p>
                                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.caption}</p>
                                </div>
                            ),
                        }))}
                    />
                </section>

                <section>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Events & photos</p>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-white">Circular highlights</h2>
                    <CircularGallery className="mt-6" items={galleryItems} />
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <ElectricCard intensity="soft" className="p-5">
                        <FolderKanban className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 font-semibold text-white">Current project board</p>
                        <p className="mt-2 text-sm text-slate-300">Track active tasks and release goals.</p>
                    </ElectricCard>
                    <ElectricCard intensity="soft" className="p-5">
                        <Link2 className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 font-semibold text-white">Useful links</p>
                        <p className="mt-2 text-sm text-slate-300">Quick jump to docs, repos, and recordings.</p>
                    </ElectricCard>
                    <ElectricCard intensity="soft" className="p-5">
                        <Star className="h-5 w-5 text-cyan-300" />
                        <p className="mt-3 font-semibold text-white">Recommended next action</p>
                        <p className="mt-2 text-sm text-slate-300">Pick one module and ship by tonight.</p>
                    </ElectricCard>
                </section>
            </main>
        </div>
    );
}
