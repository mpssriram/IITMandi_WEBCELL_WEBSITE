import { useEffect, useState, useCallback, memo } from "react";
import { 
    Bell, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Calendar, 
    Tag, 
    Pin, 
    Trash2,
    Edit3,
    ArrowRight
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getAdminAnnouncements, type AdminAnnouncement, deleteAdminAnnouncement } from "@/lib/api";

const AnnouncementRow = memo(({ announcement, onDelete }: { announcement: AdminAnnouncement, onDelete: (id: number) => void }) => {
    return (
        <tr className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.04]">
            <td className="px-4 py-3">
                <div className="flex items-start gap-3">
                    {announcement.is_pinned && <Pin className="mt-1 h-3.5 w-3.5 text-cyan-400 rotate-45" />}
                    <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-slate-200">{announcement.title}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{announcement.content}</span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Tag className="h-3 w-3" />
                    {announcement.category || "General"}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(announcement.date).toLocaleDateString()}
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-300">
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(announcement.id)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default function AdminAnnouncementsPage() {
    const { token } = useAuth();
    const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchAnnouncements = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await getAdminAnnouncements(token, 50, 0, { search_title: search });
            setAnnouncements(result.items || []);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    }, [token, search]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchAnnouncements(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchAnnouncements]);

    const handleDelete = async (id: number) => {
        if (!token || !window.confirm("Delete this announcement?")) return;
        try {
            await deleteAdminAnnouncement(token, id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            alert("Failed to delete announcement");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white">Announcements</h1>
                    <p className="mt-1 text-[13px] text-slate-400">Broadcast updates, news, and critical alerts to members.</p>
                </div>
                <button className="flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-[#030711] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.02]">
                    <Plus className="h-4 w-4" />
                    New Announcement
                </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search broadcasts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 w-full bg-transparent pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                </div>
                <div className="h-4 w-px bg-white/[0.06]" />
                <button className="flex h-9 items-center gap-2 px-3 text-[12px] font-semibold text-slate-400 hover:text-slate-200">
                    <Filter className="h-4 w-4" />
                    All Categories
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#050b18]/40 shadow-2xl backdrop-blur-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Content</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Category</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 border-b border-white/[0.06]">Date</th>
                            <th className="border-b border-white/[0.06]" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-500 italic text-[13px]">Syncing broadcast channel...</td></tr>
                        ) : announcements.length > 0 ? (
                            announcements.map((a) => (
                                <AnnouncementRow key={a.id} announcement={a} onDelete={handleDelete} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Bell className="h-8 w-8 text-slate-700" />
                                        <span className="text-slate-600 text-sm italic">No active announcements. Broadcast your first message.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
