import ReactBitsFaultyTerminal, { type FaultyTerminalProps as ReactBitsFaultyTerminalProps } from "@/components/reactbits/FaultyTerminal";

type FaultyTerminalProps = Omit<ReactBitsFaultyTerminalProps, "className"> & {
    className?: string;
};

export function FaultyTerminal({ className = "", ...props }: FaultyTerminalProps) {
    return (
        <ReactBitsFaultyTerminal
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
            scale={1.35}
            digitSize={1.22}
            timeScale={0.44}
            scanlineIntensity={0.64}
            curvature={0.11}
            tint="#8de6ee"
            mouseReact={false}
            noiseAmp={0.9}
            brightness={0.6}
            {...props}
        />
    );
}

export default FaultyTerminal;
