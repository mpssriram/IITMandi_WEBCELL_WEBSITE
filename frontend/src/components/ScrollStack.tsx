import { ReactNode } from "react";

interface ScrollStackItem {
    id: string | number;
    content: ReactNode;
}

interface ScrollStackProps {
    items: ScrollStackItem[];
    className?: string;
}

export function ScrollStack({ items, className = "" }: ScrollStackProps) {
    return (
        <div className={`space-y-5 ${className}`}>
            {items.map((item, index) => (
                <article
                    key={item.id}
                    className="sticky top-24 rounded-[1.5rem] border border-white/10 bg-[#081328]/88 p-5 backdrop-blur-md transition"
                    style={{
                        zIndex: 20 + index,
                        transform: `scale(${1 - index * 0.02})`,
                    }}
                >
                    {item.content}
                </article>
            ))}
        </div>
    );
}
