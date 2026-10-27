import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-2xl border border-line bg-paper px-4 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/40 focus:border-forest focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--sky)_70%,transparent)] aria-[invalid=true]:border-brand";

export function Field({ label, error, hint, children, htmlFor, className, optional }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor: string; className?: string; optional?: boolean }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-medium">
        {label}
        {optional ? <span className="text-xs font-normal text-muted">Optional</span> : null}
      </label>
      {children}
      {error ? <p id={`${htmlFor}-error`} role="alert" className="text-sm text-brand">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, "h-13 min-h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, "min-h-32 resize-y py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(base, "h-13 min-h-12 appearance-none pr-10", className)} {...props}>{children}</select>
      <svg viewBox="0 0 12 12" className="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2" aria-hidden><path d="M3 4.5l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
    </div>
  );
});

/** Invisible field bots love to fill in. */
export function Honeypot(props: ComponentProps<"input">) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>Leave this empty<input type="text" tabIndex={-1} autoComplete="off" {...props} /></label>
    </div>
  );
}

export function Choice({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className={cn("relative flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-center text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand", checked ? "border-ink bg-ink text-cream" : "border-line bg-paper hover:border-ink/40")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {children}
    </label>
  );
}
