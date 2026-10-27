import type { ReactNode } from "react";
import { SplitWords } from "@/components/motion/split-words";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import type { Tone } from "./definitions";

export const toneClass: Record<Tone, string> = {
  forest: "bg-forest text-cream [--muted:color-mix(in_oklab,var(--cream)_72%,var(--forest))] [--line:color-mix(in_oklab,var(--cream)_18%,transparent)]",
  red: "bg-brand text-cream [--muted:color-mix(in_oklab,var(--cream)_78%,var(--brand-red))] [--line:color-mix(in_oklab,var(--cream)_22%,transparent)]",
  cream: "bg-transparent text-ink",
  ink: "bg-ink text-cream [--muted:color-mix(in_oklab,var(--cream)_68%,var(--ink))] [--line:color-mix(in_oklab,var(--cream)_16%,transparent)]",
  sky: "bg-sky text-ink [--muted:color-mix(in_oklab,var(--ink)_70%,var(--sky))]",
};

export function isDark(tone: Tone) {
  return tone === "forest" || tone === "red" || tone === "ink";
}

export function SectionHeading({ eyebrow, title, intro, align = "left", className, children }: { eyebrow?: string; title?: string; intro?: string; align?: "left" | "center" | "split"; className?: string; children?: ReactNode }) {
  if (!eyebrow && !title && !intro) return null;
  if (align === "split") {
    return (
      <div className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
        <div className="md:col-span-7">
          {eyebrow ? <Reveal><p className="text-eyebrow text-brand [.text-cream_&]:text-sky">{eyebrow}</p></Reveal> : null}
          {title ? <SplitWords as="h2" onView text={title} className="mt-4 text-h2" /> : null}
        </div>
        <div className="md:col-span-5 md:pb-2">
          {intro ? <Reveal delay={0.15}><p className="text-lead text-muted">{intro}</p></Reveal> : null}
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      {eyebrow ? <Reveal><p className="text-eyebrow text-brand [.text-cream_&]:text-sky">{eyebrow}</p></Reveal> : null}
      {title ? <SplitWords as="h2" onView text={title} className="mt-4 text-h2" /> : null}
      {intro ? <Reveal delay={0.15}><p className="mt-5 text-lead text-muted">{intro}</p></Reveal> : null}
      {children}
    </div>
  );
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {text.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="rounded-[calc(var(--radius)*1.4)] border border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-3xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}
