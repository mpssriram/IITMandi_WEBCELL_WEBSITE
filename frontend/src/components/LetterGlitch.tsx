import type { PropsWithChildren } from "react";

import ReactBitsLetterGlitch from "@/components/reactbits/LetterGlitch";

type LetterGlitchProps = PropsWithChildren<{
    className?: string;
    glitchColors?: string[];
    glitchSpeed?: number;
    centerVignette?: boolean;
    outerVignette?: boolean;
    smooth?: boolean;
    characters?: string;
}>;

export function LetterGlitch({
    className = "",
    children,
    glitchColors = ["#103446", "#67e8f9", "#7dd3fc"],
    glitchSpeed = 55,
    centerVignette = false,
    outerVignette = true,
    smooth = true,
    characters,
}: LetterGlitchProps) {
    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`}>
            <ReactBitsLetterGlitch
                glitchColors={glitchColors}
                glitchSpeed={glitchSpeed}
                centerVignette={centerVignette}
                outerVignette={outerVignette}
                smooth={smooth}
                characters={characters || "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"}
            />
            {children ? <div className="pointer-events-none absolute inset-0">{children}</div> : null}
        </div>
    );
}

export default LetterGlitch;
