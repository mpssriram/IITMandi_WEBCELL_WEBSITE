type UserAvatarProps = {
    name?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    size?: "sm" | "md" | "lg";
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

const sizeMap = {
    sm: "h-8 w-8 rounded-xl text-xs",
    md: "h-11 w-11 rounded-2xl text-sm",
    lg: "h-14 w-14 rounded-2xl text-base",
} as const;

export function UserAvatar({ name, email, photoUrl, size = "md", className = "", textClassName = "" }: UserAvatarProps) {
    const sizeClass = sizeMap[size];
    const normalizedUrl = photoUrl?.trim() || "";

    if (normalizedUrl) {
        return (
            <div
                className={`${sizeClass} shrink-0 overflow-hidden border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-transparent shadow-[0_14px_32px_-20px_rgba(34,211,238,0.65)] ${className}`}
                aria-hidden
            >
                <img
                    src={normalizedUrl}
                    alt={name || "Avatar"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        // Hide broken image and show nothing (container bg gradient acts as fallback)
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`grid ${sizeClass} shrink-0 place-items-center border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-transparent shadow-[0_14px_32px_-20px_rgba(34,211,238,0.65)] ${className}`}
            aria-hidden
        >
            <span className={`font-display font-semibold text-cyan-50 ${textClassName}`}>
                {getInitials(name, email)}
            </span>
        </div>
    );
}
