import type { ElementType, ReactNode } from "react";
import { Hyperspeed } from "@/components/Hyperspeed";

/* ─────────────────────────────────────────────
   Shared auth shell — used by both login pages.
   Left panel:  branding / copy (hidden on mobile)
   Right panel: the actual form
───────────────────────────────────────────── */

export type AuthVariant = "member" | "admin";

type AuthCardProps = {
    variant: AuthVariant;
    left: ReactNode;
    right: ReactNode;
};

/** Top-level full-screen shell with subtle dark background. */
export function AuthShell({ variant, left, right }: AuthCardProps) {
    const accentClass =
        variant === "admin"
            ? "bg-[radial-gradient(ellipse_at_top_left,rgba(251,191,36,0.06),transparent_36%),radial-gradient(ellipse_at_80%_20%,rgba(34,211,238,0.06),transparent_34%)]"
            : "bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.08),transparent_36%),radial-gradient(ellipse_at_80%_20%,rgba(96,165,250,0.08),transparent_34%)]";

    return (
        <div className={`relative isolate min-h-screen overflow-hidden text-white`}>
            {/* Ambient background */}
            <div className="fixed inset-0 -z-30 bg-[#030811]" />
            <Hyperspeed className="-z-20 opacity-40" />
            <div className={`pointer-events-none absolute inset-0 -z-10 ${accentClass}`} />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,8,17,0),rgba(3,8,17,0.55)_100%)]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-club-grid bg-[size:52px_52px] opacity-[0.028]" />

            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[90rem] items-center px-4 py-8 sm:px-6 lg:px-8">
                <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[rgba(7,13,25,0.88)] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.8)] backdrop-blur-[18px] lg:min-h-[42rem] lg:grid-cols-[1fr_1fr]">
                    {/* Left — info panel */}
                    <div className="hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-12 xl:px-12">
                        {left}
                    </div>

                    {/* Right — form panel */}
                    <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
                        {right}
                    </div>
                </section>
            </main>
        </div>
    );
}

/** Eyebrow badge shown above the heading on both sides. */
export function AuthBadge({ children, variant }: { children: ReactNode; variant: AuthVariant }) {
    const cls =
        variant === "admin"
            ? "border-amber-300/20 bg-amber-400/10 text-amber-100/90"
            : "border-cyan-300/16 bg-cyan-400/10 text-cyan-100/82";

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${cls}`}
        >
            {children}
        </span>
    );
}

/** Reusable input field with icon slot and consistent styling. */
export function AuthInput({
    id,
    label,
    type,
    value,
    placeholder,
    autoComplete,
    onChange,
    icon: Icon,
    variant,
}: {
    id: string;
    label: string;
    type: string;
    value: string;
    placeholder: string;
    autoComplete: string;
    onChange: (value: string) => void;
    icon: ElementType;
    variant: AuthVariant;
}) {
    const focusRing =
        variant === "admin"
            ? "focus:border-amber-300/35 focus:ring-amber-300/10"
            : "focus:border-cyan-300/35 focus:ring-cyan-300/10";

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
                {label}
            </label>
            <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-500 transition group-focus-within:text-slate-300">
                    <Icon className="h-4 w-4" />
                </div>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`min-h-[3.1rem] w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-[14px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-slate-600 focus:border-cyan-transparent focus:outline-none focus:ring-2 ${focusRing}`}
                    placeholder={placeholder}
                    required
                    autoComplete={autoComplete}
                />
            </div>
        </div>
    );
}

/** Primary CTA button. */
export function AuthButton({
    children,
    submitting,
    disabled,
    variant,
    type = "submit",
    ...props
}: {
    children: ReactNode;
    submitting?: boolean;
    disabled?: boolean;
    variant: AuthVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const gradient =
        variant === "admin"
            ? "bg-[linear-gradient(135deg,#fde68a,#fbbf24,#f59e0b)] text-[#1a0d00] shadow-[0_16px_40px_-20px_rgba(251,191,36,0.5)]"
            : "bg-[linear-gradient(135deg,#67e8f9,#60a5fa,#818cf8)] text-[#040e1c] shadow-[0_16px_40px_-20px_rgba(96,165,250,0.5)]";

    return (
        <button
            type={type}
            disabled={submitting || disabled}
            className={`inline-flex min-h-[3.1rem] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030811] disabled:cursor-not-allowed disabled:opacity-60 ${gradient} ${props.className || ""}`}
            {...props}
        >
            {children}
        </button>
    );
}

/** Inline status/error message box. */
export function AuthMessage({
    type,
    text,
}: {
    type: "success" | "error" | "info";
    text: string;
}) {
    const cls =
        type === "success"
            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
            : type === "error"
              ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
              : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";

    return (
        <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${cls}`} aria-live="polite">
            {text}
        </div>
    );
}

/** Thin divider with optional label. */
export function AuthDivider({ label }: { label?: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            {label && <span className="text-xs uppercase tracking-[0.2em] text-slate-600">{label}</span>}
            <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
    );
}
