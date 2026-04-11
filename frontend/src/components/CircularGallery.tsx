interface CircularGalleryItem {
    id: string | number;
    title: string;
    caption: string;
    image: string;
}

interface CircularGalleryProps {
    items: CircularGalleryItem[];
    className?: string;
}

export function CircularGallery({ items, className = "" }: CircularGalleryProps) {
    const visibleItems = items.slice(0, 6);

    return (
        <div className={`relative mx-auto h-[22rem] w-full max-w-[44rem] ${className}`}>
            <div className="absolute left-1/2 top-1/2 grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/30 bg-cyan-400/10 text-center backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/85">Highlights</p>
            </div>

            {visibleItems.map((item, index) => {
                const angle = (index / visibleItems.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 132;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                    <article
                        key={item.id}
                        className="group absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-ink-900/85 shadow-[0_20px_45px_-30px_rgba(34,211,238,0.45)] transition hover:scale-105"
                        style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                    >
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover opacity-70 transition group-hover:opacity-95" loading="lazy" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="truncate text-[10px] font-semibold tracking-wide text-cyan-100">{item.title}</p>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
