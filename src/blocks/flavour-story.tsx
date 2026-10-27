"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { Bottle } from "@/components/brand/bottle";
import { AddToCart } from "@/components/cart/add-to-cart";
import { useMotionLevel } from "@/components/motion/motion-provider";
import { ArrowIcon } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { cn, formatINR, readableOn } from "@/lib/utils";

export type StoryFlavour = {
  slug: string;
  name: string;
  tagline: string;
  accent: string;
  tags: string[];
  notes: string[];
  price: number | null;
  variantId: string | null;
  variantLabel: string;
  available: boolean;
  statusLabel: string | null;
  image: { url: string; alt: string } | null;
};

function setTint(accent: string | null) {
  const root = document.documentElement;
  if (!accent) {
    root.style.removeProperty("--page-bg");
    root.style.removeProperty("--tint");
    root.style.removeProperty("--tint-ink");
    return;
  }
  root.style.setProperty("--page-bg", `color-mix(in oklab, ${accent} 34%, var(--cream))`);
  root.style.setProperty("--tint", accent);
  root.style.setProperty("--tint-ink", readableOn(accent));
}

/** As each flavour scrolls into the middle of the screen, the whole page re-tints to its colour. */
export function FlavourStory({ flavours }: { flavours: StoryFlavour[] }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-accent]"));
    const panelObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setTint((e.target as HTMLElement).dataset.accent ?? null);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    panels.forEach((p) => panelObs.observe(p));
    const outer = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setTint(null); }, { rootMargin: "-40% 0px -40% 0px" });
    outer.observe(el);
    return () => {
      panelObs.disconnect();
      outer.disconnect();
      setTint(null);
    };
  }, []);

  return (
    <div ref={wrap}>
      {flavours.map((f, i) => <Panel key={f.slug} f={f} index={i} total={flavours.length} />)}
    </div>
  );
}

function Panel({ f, index, total }: { f: StoryFlavour; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const level = useMotionLevel();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const on = level === "full";
  const y = useTransform(scrollYProgress, [0, 1], on ? ["18%", "-18%"] : ["0%", "0%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], on ? [index % 2 ? 10 : -10, index % 2 ? -6 : 6] : [0, 0]);
  const wordX = useTransform(scrollYProgress, [0, 1], on ? ["8%", "-12%"] : ["0%", "0%"]);
  const flip = index % 2 === 1;

  return (
    <article ref={ref} data-accent={f.accent} className="relative flex items-center overflow-hidden py-14 md:min-h-[92vh] md:py-16" aria-labelledby={`fl-${f.slug}`}>
      <motion.p aria-hidden style={{ x: wordX }} className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display text-[24vw] italic leading-none tracking-[-0.05em] text-ink/[0.06]">
        {f.name}
      </motion.p>
      <div className={cn("container-x relative grid items-center gap-10 md:grid-cols-2 md:gap-16")}>
        <div className={cn("relative mx-auto flex aspect-[4/5] w-full max-w-[17rem] items-center justify-center sm:max-w-sm md:max-w-md", flip && "md:order-2")}>
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: f.accent, opacity: 0.85 }} />
          <motion.div style={{ y, rotate }} className="relative w-[46%]">
            {f.image ? (
              <div className="relative aspect-[3/4] w-[200%] -translate-x-1/4 overflow-hidden rounded-[var(--radius)]">
                <MediaImage src={f.image.url} alt={f.image.alt} fill sizes="(min-width:768px) 30vw, 70vw" className="object-cover" />
              </div>
            ) : (
              <Bottle color={f.accent} label={f.name} className="w-full drop-shadow-[0_40px_40px_rgba(20,22,19,0.28)]" />
            )}
          </motion.div>
        </div>
        <div className={cn(flip && "md:order-1")}>
          <p className="text-eyebrow text-ink/60"><span className="tabular-nums">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>{f.tags[0] ? <> · {f.tags[0]}</> : null}</p>
          <h3 id={`fl-${f.slug}`} className="mt-4 text-display">{f.name}</h3>
          <p className="mt-5 max-w-md text-lead text-ink/75">{f.tagline}</p>
          {f.notes.length ? (
            <ul className="mt-7 flex flex-wrap gap-2">
              {f.notes.map((n) => <li key={n} className="rounded-full border border-ink/20 bg-cream/40 px-4 py-1.5 text-sm backdrop-blur-sm">{n}</li>)}
            </ul>
          ) : null}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <span className="font-display text-4xl tabular-nums">{formatINR(f.price)}</span>
            {f.available && f.variantId && f.price !== null ? (
              <AddToCart variant="ink" size="lg" item={{ kind: "variant", id: f.variantId, name: f.name, label: f.variantLabel, price: f.price, accent: f.accent, href: `/flavours/${f.slug}` }} />
            ) : (
              <span className="rounded-full bg-ink/10 px-4 py-2 text-sm font-medium">{f.statusLabel ?? "Coming soon"}</span>
            )}
            <Link href={`/flavours/${f.slug}`} className="group/btn inline-flex items-center gap-2 font-medium underline decoration-ink/30 underline-offset-[6px] hover:decoration-ink" data-cursor-label="Taste">
              Discover {f.name} <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
