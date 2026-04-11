type UserAvatarProps = {
    name?: string | null;
    email?: string | null;
    className?: string;
    textClassName?: string;
};

function getInitials(name?: string | null, email?: string | null) {
    const base = (name || email || "Dev Cell").trim();
    const parts = base.split(/\s+/).filter(Boolean);

    if (!parts.length) {
        return "DC";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export function UserAvatar({ name, email, className = "", textClassName = "" }: UserAvatarProps) {
    return (
        <div
            className={`grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-transparent shadow-[0_14px_32px_-20px_rgba(34,211,238,0.65)] ${className}`}
            aria-hidden
        >
            <span className={`font-display text-sm font-semibold text-cyan-50 ${textClassName}`}>
                {getInitials(name, email)}
            </span>
        </div>
    );
}
