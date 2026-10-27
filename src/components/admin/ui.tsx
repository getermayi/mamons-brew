import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Admin primitives: calm, app-like, light/dark aware via --a-* tokens. Not the public brand styling. */

export const aBtn = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-[background-color,color,box-shadow,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-a-accent text-a-accent-ink shadow-sm hover:opacity-90",
        secondary: "border border-a-line bg-a-panel text-a-text hover:bg-a-hover",
        ghost: "text-a-text hover:bg-a-hover",
        danger: "bg-[#b42318] text-white hover:bg-[#912018]",
        "danger-ghost": "text-[#d92d20] hover:bg-[#d92d20]/10",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-12 px-5 text-base", icon: "size-9" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export function AButton({ className, variant, size, ...props }: ComponentProps<"button"> & VariantProps<typeof aBtn>) {
  return <button type="button" className={cn(aBtn({ variant, size }), className)} {...props} />;
}

export function ALink({ className, variant, size, ...props }: ComponentProps<typeof Link> & VariantProps<typeof aBtn>) {
  return <Link className={cn(aBtn({ variant, size }), className)} {...props} />;
}

const field = "w-full rounded-xl border border-a-line bg-a-panel px-3 text-sm text-a-text outline-none transition-shadow placeholder:text-a-muted/70 focus:border-a-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--a-accent)_22%,transparent)] disabled:opacity-60 aria-[invalid=true]:border-[#d92d20]";

export const AInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(function AInput({ className, ...p }, ref) {
  return <input ref={ref} className={cn(field, "h-10", className)} {...p} />;
});
export const ATextarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function ATextarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(field, "min-h-24 resize-y py-2.5 leading-relaxed", className)} {...p} />;
});
export const ASelect = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function ASelect({ className, ...p }, ref) {
  return <select ref={ref} className={cn(field, "h-10 pr-8", className)} {...p} />;
});

export function ASwitch({ checked, onChange, label, id, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; id?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50", checked ? "bg-a-accent" : "bg-a-line")}
    >
      <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

export function ALabel({ htmlFor, children, hint, error, required }: { htmlFor?: string; children: ReactNode; hint?: string; error?: string; required?: boolean }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-a-text">{children}{required ? <span className="text-[#d92d20]"> *</span> : null}</label>
      {error ? <span className="text-xs text-[#d92d20]" role="alert">{error}</span> : hint ? <span className="text-right text-xs text-a-muted">{hint}</span> : null}
    </div>
  );
}

export function Card({ className, children, title, description, actions }: { className?: string; children: ReactNode; title?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-a-line bg-a-panel", className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-a-line px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-a-muted">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? <Link href={back.href} className="mb-2 inline-flex text-sm text-a-muted hover:text-a-text">← {back.label}</Link> : null}
        <h1 className="truncate font-sans text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-a-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

const badgeTones = {
  gray: "bg-a-hover text-a-muted",
  green: "bg-[#12b76a]/12 text-[#067647] dark:text-[#75e0a7]",
  blue: "bg-[#2e90fa]/12 text-[#175cd3] dark:text-[#84caff]",
  amber: "bg-[#f79009]/14 text-[#b54708] dark:text-[#fec84b]",
  red: "bg-[#f04438]/12 text-[#b42318] dark:text-[#fda29b]",
  purple: "bg-[#7a5af8]/12 text-[#5925dc] dark:text-[#bdb4fe]",
} as const;
export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "gray", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", badgeTones[tone], className)}>{children}</span>;
}

export function AEmpty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-a-line px-6 py-16 text-center">
      <svg viewBox="0 0 40 40" className="size-10 text-a-muted" aria-hidden><circle cx="14" cy="26" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="27" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="29" cy="29" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
      <p className="mt-4 font-medium">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-sm text-a-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "up" | "down" }) {
  return (
    <div className="rounded-2xl border border-a-line bg-a-panel p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-a-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint ? <p className={cn("mt-1 text-xs", tone === "up" ? "text-[#067647] dark:text-[#75e0a7]" : tone === "down" ? "text-[#b42318]" : "text-a-muted")}>{hint}</p> : null}
    </div>
  );
}
