"use client";

import { useState } from "react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { SmartLink, WhatsAppIcon } from "@/components/site/smart-link";
import { cn, formatINR } from "@/lib/utils";

type Variant = { id: string; label: string; price: number | null; compareAt: number | null };

export function BuyBox({ product, variants, orderable, statusLabel }: { product: { slug: string; name: string; accent: string }; variants: Variant[]; orderable: boolean; statusLabel: string | null }) {
  const [vid, setVid] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const v = variants.find((x) => x.id === vid) ?? variants[0];
  const canBuy = orderable && v && v.price !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-5xl tabular-nums">{formatINR(v?.price)}</span>
        {v?.compareAt ? <s className="text-lg text-ink/50">{formatINR(v.compareAt)}</s> : null}
      </div>
      {variants.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Size</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => (
              <label key={x.id} className={cn("cursor-pointer rounded-full border px-5 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand", vid === x.id ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink/50")}>
                <input type="radio" name="variant" value={x.id} checked={vid === x.id} onChange={() => setVid(x.id)} className="sr-only" />
                {x.label} · {formatINR(x.price)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      {canBuy ? (
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex h-14 items-center rounded-full border border-ink/20 bg-cream/50">
            <button type="button" className="grid size-14 place-items-center text-xl" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span className="w-8 text-center text-lg tabular-nums" aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</span>
            <button type="button" className="grid size-14 place-items-center text-xl" onClick={() => setQty((q) => Math.min(48, q + 1))} aria-label="Increase quantity">+</button>
          </div>
          <AddToCart size="lg" variant="ink" className="min-w-52 flex-1" quantity={qty} openDrawer item={{ kind: "variant", id: v.id, name: product.name, label: v.label, price: v.price!, accent: product.accent, href: `/flavours/${product.slug}` }} />
        </div>
      ) : (
        <div className="rounded-[var(--radius)] bg-cream/60 p-5">
          <p className="font-display text-2xl">{statusLabel ?? "Not available right now"}</p>
          <p className="mt-1 text-sm text-ink/70">Message us and we&apos;ll tell you the moment the next batch is ready.</p>
        </div>
      )}
      <SmartLink href="whatsapp" message={`Hi! I'd like to ask about ${product.name} kombucha 🍀`} className="inline-flex items-center gap-2 text-sm font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
        <WhatsAppIcon className="size-4" /> {canBuy ? "Questions? Ask on WhatsApp" : "Notify me on WhatsApp"}
      </SmartLink>
    </div>
  );
}
