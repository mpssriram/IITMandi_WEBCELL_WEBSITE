import { ReactNode } from "react";

interface StackItem {
    id: string | number;
    content: ReactNode;
}

interface StackProps {
    items: StackItem[];
    className?: string;
}

export function Stack({ items, className = "" }: StackProps) {
    return (
        <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="rounded-[1.35rem] border border-white/10 bg-[#071327]/90 p-4 shadow-[0_18px_44px_-30px_rgba(34,211,238,0.45)]"
                    style={{ transform: `translateY(${index * -2}px)` }}
                >
                    {item.content}
                </div>
            ))}
        </div>
    );
}
