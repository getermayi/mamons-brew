"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductCard, type CardProduct } from "./product-card";

export function ProductGrid({ products, showFilters }: { products: CardProduct[]; showFilters: boolean }) {
  const tags = Array.from(new Set(products.flatMap((p) => p.tags))).sort();
  const [active, setActive] = useState<string>("all");
  const visible = active === "all" ? products : products.filter((p) => p.tags.includes(active));

  return (
    <div>
      {showFilters && tags.length > 1 ? (
        <div role="group" aria-label="Filter by taste" className="mb-10 flex flex-wrap gap-2">
          {["all", ...tags].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={active === t}
              onClick={() => setActive(t)}
              className={cn("relative h-11 rounded-full border px-5 text-sm capitalize transition-colors", active === t ? "border-ink text-cream" : "border-line hover:border-ink/40")}
            >
              {active === t ? <motion.span layoutId="filter-pill" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 30 }} /> : null}
              <span className="relative">{t === "all" ? `All flavours (${products.length})` : t}</span>
            </button>
          ))}
        </div>
      ) : null}
      <motion.ul layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.li key={p.slug} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
              <ProductCard p={p} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
