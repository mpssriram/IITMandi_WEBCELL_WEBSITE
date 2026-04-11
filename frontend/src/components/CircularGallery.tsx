import { useMemo, useState } from "react";

interface CircularGalleryItem {
    id: string | number;
    title: string;
    caption: string;
    image?: string;
    href?: string;
}

interface CircularGalleryProps {
    items: CircularGalleryItem[];
    className?: string;
}

export function CircularGallery({ items, className = "" }: CircularGalleryProps) {
    const [failedImages, setFailedImages] = useState<Record<string, true>>({});
    const visibleItems = items.slice(0, 6);
    const radius = useMemo(() => {
        if (visibleItems.length <= 4) {
            return 104;
        }
        return 118;
    }, [visibleItems.length]);

    const hasImage = (item: CircularGalleryItem) => {
        const key = String(item.id);
        return Boolean(item.image) && !failedImages[key];
    };

    const markImageFailed = (item: CircularGalleryItem) => {
        const key = String(item.id);
        setFailedImages((current) => {
            if (current[key]) {
                return current;
            }
            return { ...current, [key]: true };
        });
    };

    return (
        <div className={`relative mx-auto h-[18rem] w-full max-w-[44rem] sm:h-[20rem] lg:h-[22rem] ${className}`}>
            <div className="absolute left-1/2 top-1/2 grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/30 bg-cyan-400/10 text-center backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/85">Highlights</p>
            </div>

            {visibleItems.map((item, index) => {
                const angle = (index / visibleItems.length) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <article
                        key={item.id}
                        className="group absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-ink-900/85 shadow-[0_20px_45px_-30px_rgba(34,211,238,0.45)] transition hover:scale-105"
                        style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                    >
                        {hasImage(item) ? (
                            <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover opacity-70 transition group-hover:opacity-95"
                                loading="lazy"
                                onError={() => markImageFailed(item)}
                            />
                        ) : (
                            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.35),transparent_48%),linear-gradient(180deg,rgba(8,16,35,0.92),rgba(5,9,22,0.96))]" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2">
                            {item.href ? (
                                <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-[10px] font-semibold tracking-wide text-cyan-100 hover:text-cyan-50"
                                    title={item.caption || item.title}
                                >
                                    <span className="block truncate">{item.title}</span>
                                </a>
                            ) : (
                                <p className="block truncate text-[10px] font-semibold tracking-wide text-cyan-100" title={item.caption || item.title}>
                                    {item.title}
                                </p>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
