"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { submitEnquiry } from "@/app/actions/public";
import { Bottle } from "@/components/brand/bottle";
import { Button } from "@/components/ui/button";
import { enquirySchema } from "@/lib/schemas";
import { Field, Honeypot, Input, Select, Textarea } from "./fields";

type Values = z.input<typeof enquirySchema>;
type Kind = Values["type"];

const copy: Record<Kind, { button: string; message: string }> = {
  BUSINESS: { button: "Send enquiry", message: "Tell us about your menu, footfall or anything else we should know." },
  EVENT: { button: "Request a booking", message: "Venue, guest count and the kind of event." },
  TASTING: { button: "Book a tasting", message: "How many people, and where?" },
  GIFTING: { button: "Ask about gifting", message: "How many packs, and when do you need them?" },
  CONTACT: { button: "Send message", message: "What's on your mind?" },
};

export function EnquiryForm({ type, successMessage }: { type: Kind; successMessage: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { type, name: "", phone: "", email: "", message: "" },
  });
  const business = type === "BUSINESS" || type === "GIFTING";
  const dated = type === "EVENT" || type === "TASTING";

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await submitEnquiry(values);
    if (res.ok) setDone(true);
    else {
      setError(res.error);
      for (const [k, v] of Object.entries(res.fieldErrors ?? {})) setFieldError(k as keyof Values, { message: v });
    }
  });

  const err = (k: keyof Values) => errors[k]?.message as string | undefined;

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5 rounded-[calc(var(--radius)*1.4)] bg-forest px-8 py-16 text-center text-cream" role="status">
          <Bottle color="#9CCBE4" label="Cheers" className="w-16" />
          <p className="font-display text-3xl">{successMessage}</p>
          <p className="text-cream/70">Need us sooner? WhatsApp is fastest.</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2" exit={{ opacity: 0 }}>
          <input type="hidden" {...register("type")} />
          <Honeypot {...register("company_website")} />
          <Field label="Your name" htmlFor="eq-name" error={err("name")}><Input id="eq-name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} /></Field>
          <Field label="Phone / WhatsApp" htmlFor="eq-phone" error={err("phone")}><Input id="eq-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} {...register("phone")} /></Field>
          <Field label="Email" htmlFor="eq-email" error={err("email")} optional className={business ? "" : "sm:col-span-2"}><Input id="eq-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} /></Field>
          {business ? (
            <>
              <Field label="Business name" htmlFor="eq-biz" optional><Input id="eq-biz" autoComplete="organization" {...register("businessName")} /></Field>
              <Field label="Type of business" htmlFor="eq-type" optional>
                <Select id="eq-type" defaultValue="" {...register("businessType")}>
                  <option value="">Choose one</option>
                  {["Café", "Restaurant", "Bar", "Store / supermarket", "Hotel", "Office / corporate", "Event organiser", "Other"].map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Location" htmlFor="eq-loc" optional><Input id="eq-loc" placeholder="Itanagar, Naharlagun…" {...register("location")} /></Field>
              <Field label="Expected monthly volume" htmlFor="eq-vol" optional>
                <Select id="eq-vol" defaultValue="" {...register("monthlyVolume")}>
                  <option value="">Not sure yet</option>
                  {["Under 50 bottles", "50–150 bottles", "150–400 bottles", "400+ bottles"].map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
            </>
          ) : null}
          {dated ? (
            <>
              <Field label="Date" htmlFor="eq-date" optional><Input id="eq-date" type="date" {...register("eventDate")} /></Field>
              <Field label="Location" htmlFor="eq-loc2" optional><Input id="eq-loc2" {...register("location")} /></Field>
            </>
          ) : null}
          <Field label="Message" htmlFor="eq-msg" error={err("message")} className="sm:col-span-2"><Textarea id="eq-msg" placeholder={copy[type].message} aria-invalid={Boolean(errors.message)} {...register("message")} /></Field>
          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">We reply within a working day.</p>
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">{isSubmitting ? "Sending…" : copy[type].button}</Button>
          </div>
          {error ? <p role="alert" className="text-brand sm:col-span-2">{error}</p> : null}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
