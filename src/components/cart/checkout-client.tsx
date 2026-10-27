"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import { confirmRazorpayPayment, createOrder, previewTotals, type OrderCreated } from "@/app/actions/public";
import { Bottle } from "@/components/brand/bottle";
import { Choice, Field, Honeypot, Input, Select, Textarea } from "@/components/forms/fields";
import { useSite } from "@/components/site/site-context";
import { WhatsAppIcon } from "@/components/site/smart-link";
import { ArrowIcon, Button, ButtonLink } from "@/components/ui/button";
import { checkoutSchema } from "@/lib/schemas";
import { track } from "@/lib/track-client";
import { formatINR } from "@/lib/utils";
import { useCart } from "./cart-store";

type Values = z.input<typeof checkoutSchema>;
type Totals = Awaited<ReturnType<typeof previewTotals>>;

type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
declare global {
  interface Window { Razorpay?: RazorpayCtor }
}

const LAST_ORDER = "mamon-last-order";

export function CheckoutClient({ onlinePayments, razorpayKey }: { onlinePayments: boolean; razorpayKey: string }) {
  const site = useSite();
  const { lines, ready, clear } = useCart();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<(OrderCreated & { paid?: boolean }) | null>(null);

  const zones = site.deliveryZones;
  const defaultFulfilment = site.deliveryEnabled ? "DELIVERY" : "PICKUP";
  const { register, control, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: "", phone: "", email: "", fulfilment: defaultFulfilment, area: zones[0]?.name ?? "Itanagar", address: "", preferredDate: "", preferredTime: "", notes: "", discountCode: "", paymentMethod: "WHATSAPP" },
  });
  const fulfilment = watch("fulfilment");
  const area = watch("area");
  const discountCode = watch("discountCode");
  const payload = useMemo(() => lines.map((l) => ({ kind: l.kind, id: l.id, quantity: l.quantity })), [lines]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LAST_ORDER);
      if (saved) setPlaced(JSON.parse(saved) as OrderCreated);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!ready || !payload.length) return;
    const t = window.setTimeout(async () => {
      setTotals(await previewTotals({ lines: payload, discountCode: discountCode || undefined, area, fulfilment }));
    }, 350);
    return () => window.clearTimeout(t);
  }, [payload, area, fulfilment, discountCode, ready]);

  useEffect(() => { if (ready && payload.length) track("checkout_start"); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createOrder({ lines: payload, form: values });
    if (!res.ok) {
      setServerError(res.error);
      for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setError(k.replace(/^form\./, "") as keyof Values, { message: v });
      return;
    }
    const order = res.data;
    if (order.razorpay && window.Razorpay) {
      const rp = new window.Razorpay({
        key: order.razorpay.key || razorpayKey, order_id: order.razorpay.orderId, amount: order.razorpay.amount, currency: "INR", name: site.brandName, description: `Order ${order.number}`,
        prefill: { name: order.razorpay.name, contact: order.razorpay.phone, email: order.razorpay.email ?? undefined }, theme: { color: "#1F3A2B" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const ok = await confirmRazorpayPayment({ orderNumber: order.number, ...r });
          finish({ ...order, paid: ok.ok });
        },
        modal: { ondismiss: () => finish(order) },
      });
      rp.open();
      return;
    }
    finish(order);
    // Open WhatsApp straight away; the confirmation screen keeps a button in case a popup blocker steps in.
    track("whatsapp_click", "checkout");
    window.open(order.whatsappUrl, "_blank", "noopener");
  });

  function finish(order: OrderCreated & { paid?: boolean }) {
    setPlaced(order);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
    try { sessionStorage.setItem(LAST_ORDER, JSON.stringify(order)); } catch { /* ignore */ }
  }

  if (placed) return <Confirmation order={placed} onNew={() => { sessionStorage.removeItem(LAST_ORDER); setPlaced(null); }} />;

  if (!ready) {
    return <div className="grid gap-8 lg:grid-cols-12"><div className="skeleton h-[32rem] lg:col-span-7" /><div className="skeleton h-80 lg:col-span-5" /></div>;
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-[calc(var(--radius)*1.5)] bg-paper px-6 py-20 text-center">
        <Bottle color="#9CCBE4" label="Empty" className="w-16" />
        <p className="font-display text-3xl">Your cart is still on the shelf.</p>
        <p className="text-muted">Pick a flavour or two and come back — we&apos;ll keep it cold.</p>
        <ButtonLink href="/flavours" size="lg">Browse flavours <ArrowIcon /></ButtonLink>
      </div>
    );
  }

  const belowMin = fulfilment === "DELIVERY" && totals && totals.subtotal < site.minOrderValue;

  return (
    <>
      {onlinePayments ? <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> : null}
      <form onSubmit={onSubmit} noValidate className="relative grid gap-10 lg:grid-cols-12 lg:gap-14">
        <Honeypot {...register("company_website")} />
        <div className="space-y-10 lg:col-span-7">
          <fieldset className="space-y-5">
            <legend className="font-display text-2xl">1. You</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="co-name" error={errors.name?.message}><Input id="co-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} /></Field>
              <Field label="Phone / WhatsApp" htmlFor="co-phone" error={errors.phone?.message}><Input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} {...register("phone")} /></Field>
              <Field label="Email" htmlFor="co-email" error={errors.email?.message} optional hint="For an order confirmation email" className="sm:col-span-2"><Input id="co-email" type="email" autoComplete="email" {...register("email")} /></Field>
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="font-display text-2xl">2. Delivery or pickup</legend>
            <Controller control={control} name="fulfilment" render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {site.deliveryEnabled ? <Choice name="fulfilment" value="DELIVERY" checked={field.value === "DELIVERY"} onChange={field.onChange}>Deliver to me</Choice> : null}
                {site.pickupEnabled ? <Choice name="fulfilment" value="PICKUP" checked={field.value === "PICKUP"} onChange={field.onChange}>I&apos;ll pick up</Choice> : null}
              </div>
            )} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Area" htmlFor="co-area" error={errors.area?.message}>
                <Select id="co-area" {...register("area")}>
                  {zones.map((z) => <option key={z.name} value={z.name}>{z.name}{fulfilment === "DELIVERY" ? ` — ${z.fee ? formatINR(z.fee) : "free"}` : ""}</option>)}
                </Select>
              </Field>
              <Field label="Preferred date" htmlFor="co-date" optional><Input id="co-date" type="date" {...register("preferredDate")} /></Field>
              {fulfilment === "DELIVERY" ? (
                <Field label="Delivery address" htmlFor="co-address" error={errors.address?.message} className="sm:col-span-2"><Textarea id="co-address" rows={3} className="min-h-24" autoComplete="street-address" placeholder="House / building, street, landmark" aria-invalid={Boolean(errors.address)} {...register("address")} /></Field>
              ) : (
                <p className="rounded-2xl bg-paper p-4 text-sm sm:col-span-2"><span className="font-medium">Pickup:</span> {site.pickupAddress ?? "We'll share the location on WhatsApp."}</p>
              )}
              <Field label="Preferred time" htmlFor="co-time" optional>
                <Select id="co-time" {...register("preferredTime")}>
                  <option value="">Any time</option>
                  <option>Morning (10–12)</option>
                  <option>Afternoon (12–4)</option>
                  <option>Evening (4–7)</option>
                </Select>
              </Field>
              <Field label="Notes" htmlFor="co-notes" optional><Input id="co-notes" placeholder="Gate code, returning bottles…" {...register("notes")} /></Field>
            </div>
          </fieldset>

          {onlinePayments ? (
            <fieldset className="space-y-4">
              <legend className="font-display text-2xl">3. Payment</legend>
              <Controller control={control} name="paymentMethod" render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <Choice name="paymentMethod" value="WHATSAPP" checked={field.value === "WHATSAPP"} onChange={field.onChange}>Confirm on WhatsApp</Choice>
                  <Choice name="paymentMethod" value="RAZORPAY" checked={field.value === "RAZORPAY"} onChange={field.onChange}>Pay now (UPI / card)</Choice>
                </div>
              )} />
            </fieldset>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[calc(var(--radius)*1.5)] bg-paper p-6 sm:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Your order</h2>
            <ul className="mt-5 divide-y divide-line">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-4 py-3">
                  <span className="grid h-14 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${l.accent} 30%, var(--cream))` }}><Bottle color={l.accent} label={l.name} className="h-12 w-auto" /></span>
                  <span className="flex-1"><span className="font-medium">{l.name}</span><span className="block text-sm text-muted">{l.quantity} × {formatINR(l.price)}</span></span>
                  <span className="tabular-nums">{formatINR(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <label htmlFor="co-code" className="sr-only">Discount code</label>
              <Input id="co-code" placeholder="Discount code" className="h-11 min-h-11 uppercase" {...register("discountCode")} />
            </div>
            {totals?.discountError || errors.discountCode?.message ? <p className="mt-2 text-sm text-brand" role="alert">{totals?.discountError ?? errors.discountCode?.message}</p> : null}
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatINR(totals?.subtotal ?? lines.reduce((n, l) => n + l.price * l.quantity, 0))}</dd></div>
              {totals?.discount ? <div className="flex justify-between text-forest"><dt>Discount</dt><dd className="tabular-nums">−{formatINR(totals.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt className="text-muted">{fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</dt><dd className="tabular-nums">{fulfilment === "PICKUP" ? "Free" : totals ? (totals.deliveryFee ? formatINR(totals.deliveryFee) : "Free") : "…"}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-4"><dt className="font-medium">Total</dt><dd className="font-display text-4xl tabular-nums">{totals ? formatINR(totals.total) : "…"}</dd></div>
            </dl>
            {totals?.problems.length ? <p className="mt-4 rounded-xl bg-brand/10 p-3 text-sm text-brand" role="alert">{totals.problems[0]}</p> : null}
            {belowMin ? <p className="mt-4 rounded-xl bg-sky/50 p-3 text-sm">Delivery orders start at {formatINR(site.minOrderValue)} — add a little more, or choose pickup.</p> : null}
            <Button type="submit" size="lg" disabled={isSubmitting || Boolean(belowMin) || Boolean(totals?.problems.length)} className="mt-6 w-full">
              {isSubmitting ? "Saving your order…" : watch("paymentMethod") === "RAZORPAY" ? "Pay & place order" : <><WhatsAppIcon className="size-5" /> Place order on WhatsApp</>}
            </Button>
            {serverError ? <p className="mt-3 text-sm text-brand" role="alert">{serverError}</p> : null}
            <p className="mt-4 text-xs text-muted">By ordering you agree to our <Link href="/legal/terms" className="underline">terms</Link> and <Link href="/legal/delivery-refunds" className="underline">delivery policy</Link>.</p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Confirmation({ order, onNew }: { order: OrderCreated & { paid?: boolean }; onNew: () => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid overflow-hidden rounded-[calc(var(--radius)*2)] bg-forest text-cream md:grid-cols-12" role="status">
        <div className="p-8 sm:p-12 md:col-span-7 lg:p-16">
          <p className="text-eyebrow text-sky">Order {order.number}</p>
          <h2 className="mt-4 text-h2">Thank you — it&apos;s in the brewhouse queue.</h2>
          <p className="mt-5 max-w-lg text-lead text-cream/80">
            {order.paid ? "Payment received. " : ""}We&apos;ve saved your order for {formatINR(order.total)}. {order.paid ? "We'll WhatsApp you to confirm delivery." : "Send the WhatsApp message that just opened so we can confirm delivery and payment."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={order.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-7 font-medium text-ink transition-transform hover:scale-[1.02]" onClick={() => track("whatsapp_click", "confirmation")}>
              <WhatsAppIcon className="size-5" /> {order.paid ? "Message us on WhatsApp" : "Open WhatsApp to send"}
            </a>
            <ButtonLink href="/flavours" variant="outline-light" size="lg" onClick={onNew}>Keep browsing</ButtonLink>
          </div>
          <p className="mt-6 text-sm text-cream/60">Save your order ID: <strong className="text-cream">{order.number}</strong></p>
        </div>
        <div className="relative hidden items-end justify-center gap-2 bg-[#2E5240] px-10 pt-10 md:col-span-5 md:flex" aria-hidden>
          <Bottle color="#8FA67C" label="Thank" className="w-1/4 -rotate-6" />
          <Bottle color="#E9C53F" label="You" className="w-1/3" />
          <Bottle color="#A8242C" label="🍀" className="w-1/4 rotate-6" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
