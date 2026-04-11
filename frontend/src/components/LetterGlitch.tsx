import { useEffect, useMemo, useState } from "react";

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface LetterGlitchProps {
    text: string;
    className?: string;
}

export function LetterGlitch({ text, className = "" }: LetterGlitchProps) {
    const chars = useMemo(() => text.split(""), [text]);
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        let frame = 0;
        const id = window.setInterval(() => {
            frame += 1;
            if (frame > 7) {
                setDisplay(text);
                window.clearInterval(id);
                return;
            }

            setDisplay(
                chars
                    .map((char, index) => (index < frame ? char : glyphs[(index * 7 + frame * 3) % glyphs.length]))
                    .join(""),
            );
        }, 42);

        return () => window.clearInterval(id);
    }, [chars, text]);

    return <span className={className}>{display}</span>;
}
