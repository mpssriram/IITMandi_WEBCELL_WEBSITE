import { useEffect, useState } from "react";

import { PencilLine, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ElectricCard } from "@/components/ElectricCard";
import { UserAvatar } from "@/components/UserAvatar";
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/api";

type UserProfilePageProps = {
    modal?: boolean;
};

export function UserProfilePage({ modal = false }: UserProfilePageProps) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        let mounted = true;
        const token = localStorage.getItem("devcell_id_token");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        getUserProfile(token)
            .then((response) => {
                if (!mounted) {
                    return;
                }
                setProfile(response);
                setName(response.name || "");
                setRollNumber(response.roll_number || "");
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) {
                    return;
                }
                setLoading(false);
                navigate("/login", { replace: true });
            });

        return () => {
            mounted = false;
        };
    }, [navigate]);

    const closeProfile = () => {
        if (modal) {
            navigate(-1);
            return;
        }
        navigate("/user/dashboard", { replace: true });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const token = localStorage.getItem("devcell_id_token");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const nextProfile = await updateUserProfile(token, {
                name: name.trim() || undefined,
                roll_number: rollNumber.trim() || undefined,
            });
            setProfile(nextProfile);
            setName(nextProfile.name || "");
            setRollNumber(nextProfile.roll_number || "");
            setMessage({ type: "success", text: "Profile updated successfully." });
        } catch (error) {
            const text = error instanceof Error ? error.message : "Failed to update profile.";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const shellClassName = modal
        ? "fixed inset-0 z-[70] flex items-center justify-end bg-[#020712]/72 backdrop-blur-md"
        : "min-h-screen bg-ink-950 px-4 py-8 sm:px-6 lg:px-8";

    const panelClassName = modal
        ? "h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#071225]/96 p-4 sm:p-6"
        : "mx-auto max-w-2xl";

    return (
        <div className={shellClassName}>
            <div className={panelClassName}>
                <ElectricCard className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <UserAvatar name={profile?.name} email={profile?.email} className="h-16 w-16 rounded-[1.6rem]" textClassName="text-lg" />
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Profile</p>
                                <h1 className="mt-2 font-display text-3xl font-semibold text-white">Member details</h1>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeProfile}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/35 hover:bg-cyan-400/10"
                            aria-label="Close profile"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="mt-8 text-sm text-slate-300">Loading profile...</div>
                    ) : (
                        <>
                            <div className="mt-8 grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Name</p>
                                    <p className="mt-2 text-sm text-white">{profile?.name || "Not available"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Email</p>
                                    <p className="mt-2 break-all text-sm text-white">{profile?.email || "Not available"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Roll number</p>
                                    <p className="mt-2 text-sm text-white">{profile?.roll_number || "Not added yet"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Role</p>
                                    <p className="mt-2 text-sm text-white">{profile?.role || "member"}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#05101f]/90 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-200">
                                        <PencilLine className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Edit profile</p>
                                        <p className="text-sm text-slate-300">Update the fields already supported by the backend.</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4">
                                    <label className="grid gap-2 text-sm text-slate-300">
                                        Name
                                        <input
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                            placeholder="Your name"
                                        />
                                    </label>

                                    <label className="grid gap-2 text-sm text-slate-300">
                                        Roll number
                                        <input
                                            value={rollNumber}
                                            onChange={(event) => setRollNumber(event.target.value)}
                                            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-white placeholder:text-slate-400 focus:border-cyan-300/40 focus:outline-none"
                                            placeholder="Roll number"
                                        />
                                    </label>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {saving ? "Saving..." : "Save changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeProfile}
                                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-cyan-400/10"
                                    >
                                        Close
                                    </button>
                                </div>

                                {message ? (
                                    <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-300" : "text-rose-300"}`}>
                                        {message.text}
                                    </p>
                                ) : null}
                            </form>
                        </>
                    )}
                </ElectricCard>
            </div>
        </div>
    );
}

export default UserProfilePage;
