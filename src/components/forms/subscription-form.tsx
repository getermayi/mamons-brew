"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { submitSubscription } from "@/app/actions/public";
import { Bottle } from "@/components/brand/bottle";
import { useSite } from "@/components/site/site-context";
import { Button } from "@/components/ui/button";
import { subscriptionSchema } from "@/lib/schemas";
import { Choice, Field, Honeypot, Input, Select, Textarea } from "./fields";

type Values = z.input<typeof subscriptionSchema>;

export function SubscriptionForm({ flavours, successMessage }: { flavours: { slug: string; name: string; accent: string }[]; successMessage: string }) {
  const site = useSite();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { name: "", phone: "", email: "", area: site.deliveryZones[0]?.name ?? "", address: "", frequency: "WEEKLY", flavours: flavours.map((f) => ({ slug: f.slug, name: f.name, quantity: 0 })) },
  });
  const { fields } = useFieldArray({ control, name: "flavours" });
  const list = watch("flavours");
  const total = list.reduce((n, f) => n + Number(f.quantity || 0), 0);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await submitSubscription(values);
    if (res.ok) setDone(true);
    else setError(res.error);
  });

  if (!site.features.subscriptions) {
    return <p className="rounded-[var(--radius)] bg-paper p-8 text-center font-display text-2xl">Subscriptions are taking a short break. Message us on WhatsApp and we&apos;ll sort you out.</p>;
  }

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 rounded-[calc(var(--radius)*1.4)] bg-forest px-8 py-16 text-center text-cream" role="status">
          <Bottle color="#E9C53F" label="Weekly" className="w-16" />
          <p className="font-display text-3xl">{successMessage}</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate className="relative space-y-8" exit={{ opacity: 0 }}>
          <Honeypot {...register("company_website")} />
          <fieldset>
            <legend className="text-sm font-medium">Your mix <span className="text-muted">— bottles per delivery</span></legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {fields.map((f, i) => {
                const accent = flavours[i]?.accent ?? "#C98A3D";
                const q = Number(list[i]?.quantity || 0);
                return (
                  <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-3 pr-4">
                    <span className="grid h-16 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${accent} 30%, var(--cream))` }}><Bottle color={accent} label={f.name} className="h-14 w-auto" /></span>
                    <span className="flex-1 font-medium">{f.name}</span>
                    <div className="inline-flex items-center rounded-full border border-line bg-cream">
                      <button type="button" className="grid size-9 place-items-center" aria-label={`Fewer ${f.name}`} onClick={() => setValue(`flavours.${i}.quantity`, Math.max(0, q - 1))}>−</button>
                      <span className="w-6 text-center tabular-nums" aria-live="polite">{q}</span>
                      <button type="button" className="grid size-9 place-items-center" aria-label={`More ${f.name}`} onClick={() => setValue(`flavours.${i}.quantity`, Math.min(24, q + 1))}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-muted">{total ? `${total} bottle${total > 1 ? "s" : ""} per delivery` : "Pick at least one bottle."}</p>
            {errors.flavours?.root?.message || errors.flavours?.message ? <p role="alert" className="mt-1 text-sm text-brand">{errors.flavours?.root?.message ?? errors.flavours?.message}</p> : null}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">How often?</legend>
            <Controller control={control} name="frequency" render={({ field }) => (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Choice name="frequency" value="WEEKLY" checked={field.value === "WEEKLY"} onChange={field.onChange}>Every week</Choice>
                <Choice name="frequency" value="BIWEEKLY" checked={field.value === "BIWEEKLY"} onChange={field.onChange}>Every two weeks</Choice>
              </div>
            )} />
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" htmlFor="sb-name" error={errors.name?.message}><Input id="sb-name" autoComplete="name" {...register("name")} /></Field>
            <Field label="Phone / WhatsApp" htmlFor="sb-phone" error={errors.phone?.message}><Input id="sb-phone" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} /></Field>
            <Field label="Email" htmlFor="sb-email" error={errors.email?.message} optional><Input id="sb-email" type="email" autoComplete="email" {...register("email")} /></Field>
            <Field label="Area" htmlFor="sb-area" error={errors.area?.message}>
              <Select id="sb-area" {...register("area")}>{site.deliveryZones.map((z) => <option key={z.name}>{z.name}</option>)}</Select>
            </Field>
            <Field label="Delivery address" htmlFor="sb-address" error={errors.address?.message} className="sm:col-span-2"><Textarea id="sb-address" rows={2} className="min-h-20" autoComplete="street-address" {...register("address")} /></Field>
            <Field label="Start from" htmlFor="sb-start" optional><Input id="sb-start" type="date" {...register("startDate")} /></Field>
            <Field label="Notes" htmlFor="sb-notes" optional><Input id="sb-notes" placeholder="Gate code, best time…" {...register("notes")} /></Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">No payment now. We&apos;ll confirm on WhatsApp.</p>
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">{isSubmitting ? "Sending…" : "Request subscription"}</Button>
          </div>
          {error ? <p role="alert" className="text-brand">{error}</p> : null}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
