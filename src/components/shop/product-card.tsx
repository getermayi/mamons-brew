"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Bottle } from "@/components/brand/bottle";
import { AddToCart } from "@/components/cart/add-to-cart";
import { useMotionLevel } from "@/components/motion/motion-provider";
import { MediaImage } from "@/components/ui/media-image";
import { formatINR } from "@/lib/utils";

export type CardProduct = {
  slug: string;
  name: string;
  tagline: string;
  accent: string;
  tags: string[];
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT" | "COMING_SOON";
  price: number | null;
  variantId: string | null;
  variantLabel: string;
  image: { url: string; alt: string } | null;
};

const statusBadge: Record<CardProduct["stockStatus"], { label: string; cls: string } | null> = {
  IN_STOCK: null,
  LOW_STOCK: { label: "Almost gone", cls: "bg-brand text-cream" },
  SOLD_OUT: { label: "Sold out", cls: "bg-ink text-cream" },
  COMING_SOON: { label: "Coming soon", cls: "bg-cream text-ink" },
};

/** Flavour card with a gentle 3D tilt toward the pointer and quick add. */
export function ProductCard({ p, priority = false }: { p: CardProduct; priority?: boolean }) {
  const level = useMotionLevel();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 200, damping: 20 });
  const bottleX = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });
  const tilt = level === "full";
  const badge = statusBadge[p.stockStatus];
  const orderable = (p.stockStatus === "IN_STOCK" || p.stockStatus === "LOW_STOCK") && p.price !== null && p.variantId;

  return (
    <motion.article
      className="group relative flex h-full flex-col [perspective:1000px]"
      onPointerMove={(e) => {
        if (!tilt || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
    >
      <motion.div style={tilt ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined} className="relative">
        <Link href={`/flavours/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*1.3)]" style={{ background: `color-mix(in oklab, ${p.accent} 55%, var(--cream))` }} data-cursor-label="View" aria-label={`${p.name} — ${p.tagline}`}>
          <span aria-hidden className="absolute left-1/2 top-[14%] aspect-square w-[70%] -translate-x-1/2 rounded-full transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-110" style={{ background: p.accent }} />
          {p.image ? (
            <MediaImage src={p.image.url} alt={p.image.alt} fill priority={priority} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <motion.div style={tilt ? { x: bottleX, translateZ: 40 } : undefined} className="absolute inset-x-0 bottom-[6%] mx-auto w-[34%] transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-2">
              <Bottle color={p.accent} label={p.name} className="w-full drop-shadow-[0_28px_24px_rgba(20,22,19,0.28)]" />
            </motion.div>
          )}
          {badge ? <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span> : null}
          {p.tags[0] ? <span className="absolute right-4 top-4 rounded-full bg-cream/70 px-3 py-1 text-xs capitalize backdrop-blur">{p.tags[0]}</span> : null}
        </Link>
      </motion.div>
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-h3"><Link href={`/flavours/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
          <span className="shrink-0 font-medium tabular-nums">{formatINR(p.price)}</span>
        </div>
        <p className="mt-1.5 text-muted">{p.tagline}</p>
        <div className="mt-auto pt-5">
          {orderable ? (
            <AddToCart size="md" variant="primary" className="w-full" label="Quick add" item={{ kind: "variant", id: p.variantId!, name: p.name, label: p.variantLabel, price: p.price!, accent: p.accent, href: `/flavours/${p.slug}` }} />
          ) : (
            <Link href={`/flavours/${p.slug}`} className="flex h-12 w-full items-center justify-center rounded-full border border-line text-sm font-medium hover:bg-ink/5">
              {p.stockStatus === "SOLD_OUT" ? "Sold out — see details" : "Coming soon — get notified"}
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
