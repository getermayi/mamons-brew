"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useMotionLevel } from "@/components/motion/motion-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart, type CartLine } from "./cart-store";

type Props = {
  item: Omit<CartLine, "key" | "quantity">;
  quantity?: number;
  disabled?: boolean;
  disabledLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "red" | "ink" | "tint" | "cream";
  className?: string;
  label?: string;
  openDrawer?: boolean;
};

/** Add-to-cart with a little burst of bubbles in the flavour's colour. */
export function AddToCart({ item, quantity = 1, disabled, disabledLabel = "Sold out", size = "md", variant = "primary", className, label = "Add to cart", openDrawer = false }: Props) {
  const { add, setOpen } = useCart();
  const level = useMotionLevel();
  const [burst, setBurst] = useState(0);
  const [added, setAdded] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={disabled}
        className="w-full"
        onClick={() => {
          add(item, quantity);
          setBurst((b) => b + 1);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
          if (openDrawer) window.setTimeout(() => setOpen(true), level === "full" ? 380 : 0);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={added ? "added" : "add"} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }} className="inline-flex items-center gap-2">
            {disabled ? disabledLabel : added ? (
              <>
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Added
              </>
            ) : label}
          </motion.span>
        </AnimatePresence>
      </Button>
      <span className="sr-only" aria-live="polite">{added ? `${item.name} added to cart` : ""}</span>
      {level === "full" && burst > 0 ? <Burst key={burst} color={item.accent} /> : null}
    </span>
  );
}

function Burst({ color }: { color: string }) {
  // Deterministic "random" spread so render stays pure.
  const bubbles = Array.from({ length: 12 }, (_, i) => {
    const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    const angle = (i / 12) * Math.PI * 2 + r(1) * 0.4;
    const dist = 44 + r(2) * 40;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 18, size: 5 + r(3) * 9, delay: r(4) * 0.06 };
  });
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border-2"
          style={{ width: b.size, height: b.size, borderColor: color, marginLeft: -b.size / 2, marginTop: -b.size / 2 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: b.x, y: b.y, opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8, delay: b.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </span>
  );
}
