"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import { Bottle } from "@/components/brand/bottle";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { useCart } from "./cart-store";

export function CartDrawer({ freeDeliveryAbove }: { freeDeliveryAbove: number | null }) {
  const { lines, open, setOpen, subtotal, setQuantity, remove, count } = useCart();
  const toFree = freeDeliveryAbove ? Math.max(0, freeDeliveryAbove - subtotal) : null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.aside
                data-lenis-prevent
                className="fixed inset-y-0 right-0 z-[85] flex w-full max-w-[28rem] flex-col bg-cream text-ink shadow-2xl sm:rounded-l-[calc(var(--radius)*1.4)]"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
              >
                <header className="flex items-center justify-between border-b border-line px-6 py-5">
                  <Dialog.Title className="font-display text-2xl">Your cart {count ? <span className="text-muted">({count})</span> : null}</Dialog.Title>
                  <Dialog.Close className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:bg-ink hover:text-cream" aria-label="Close cart">
                    <svg viewBox="0 0 20 20" className="size-4" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </Dialog.Close>
                </header>

                {lines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                    <Bottle color="#9CCBE4" label="Empty?" className="w-20 opacity-80" />
                    <p className="font-display text-3xl leading-tight">Nothing fermenting <em className="accent">here</em> yet.</p>
                    <p className="text-muted">Your cart is as empty as a jar on brew day. Let&apos;s fix that.</p>
                    <ButtonLink href="/flavours" onClick={() => setOpen(false)}>Browse flavours <ArrowIcon /></ButtonLink>
                  </div>
                ) : (
                  <>
                    {toFree !== null ? (
                      <div className="border-b border-line px-6 py-4 text-sm">
                        <p>{toFree > 0 ? <>Add <strong>{formatINR(toFree)}</strong> more for free delivery</> : <>You&apos;ve unlocked <strong>free delivery</strong> 🍀</>}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                          <motion.div className="h-full origin-left rounded-full bg-forest" initial={false} animate={{ scaleX: Math.min(1, subtotal / (freeDeliveryAbove ?? 1)) }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                        </div>
                      </div>
                    ) : null}
                    <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                      <AnimatePresence initial={false}>
                        {lines.map((l) => (
                          <motion.li key={l.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0 }} className="flex gap-4 py-5">
                            <div className="grid h-24 w-16 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${l.accent} 28%, var(--cream))` }}>
                              <Bottle color={l.accent} label={l.name.split(" ")[0]} className="h-20 w-auto" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <Link href={l.href} onClick={() => setOpen(false)} className="font-display text-lg leading-tight hover:underline">{l.name}</Link>
                              <span className="text-sm text-muted">{l.label} · {formatINR(l.price)}</span>
                              <div className="mt-auto flex items-center justify-between pt-3">
                                <div className="inline-flex items-center rounded-full border border-line">
                                  <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-ink/5" onClick={() => setQuantity(l.key, l.quantity - 1)} aria-label={`One less ${l.name}`}>−</button>
                                  <span className="w-7 text-center tabular-nums" aria-live="polite">{l.quantity}</span>
                                  <button type="button" className="grid size-9 place-items-center rounded-full hover:bg-ink/5" onClick={() => setQuantity(l.key, l.quantity + 1)} aria-label={`One more ${l.name}`}>+</button>
                                </div>
                                <span className="font-medium tabular-nums">{formatINR(l.price * l.quantity)}</span>
                              </div>
                            </div>
                            <button type="button" onClick={() => remove(l.key)} className="self-start text-xs text-muted underline-offset-2 hover:underline" aria-label={`Remove ${l.name}`}>Remove</button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                    <footer className="space-y-4 border-t border-line bg-paper px-6 py-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted">Subtotal</span>
                        <span className="font-display text-3xl tabular-nums">{formatINR(subtotal)}</span>
                      </div>
                      <p className="text-xs text-muted">Delivery and any discount are worked out at checkout. We confirm every order on WhatsApp.</p>
                      <ButtonLink href="/checkout" size="lg" className="w-full" onClick={() => setOpen(false)}>Checkout <ArrowIcon /></ButtonLink>
                    </footer>
                  </>
                )}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
