"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { subscribeNewsletter } from "@/app/actions/public";
import { newsletterSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Values = z.infer<typeof newsletterSchema>;

export function NewsletterForm({ tone = "light", buttonLabel = "Subscribe" }: { tone?: "light" | "dark"; buttonLabel?: string }) {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await subscribeNewsletter(values);
    if (res.ok) setDone(res.message ?? "You're on the list.");
    else setError(res.error);
  });

  const dark = tone === "dark";
  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.p key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("font-display text-2xl", dark ? "text-sky" : "text-forest")} role="status">
          {done} 🍀
        </motion.p>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -8 }}>
          <div className={cn("flex items-center gap-2 rounded-full border p-1.5 focus-within:ring-2", dark ? "border-cream/25 bg-cream/5 focus-within:ring-sky" : "border-line bg-paper focus-within:ring-forest")}>
            <label htmlFor={`nl-${tone}`} className="sr-only">Email address</label>
            <input
              id={`nl-${tone}`}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              className={cn("h-11 min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:opacity-60", dark ? "text-cream" : "text-ink")}
              aria-invalid={Boolean(formState.errors.email)}
              aria-describedby={`nl-${tone}-err`}
              {...register("email")}
            />
            <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("company_website")} />
            <button type="submit" disabled={formState.isSubmitting} className={cn("h-11 shrink-0 rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-60", dark ? "bg-cream text-ink hover:bg-sky" : "bg-forest text-cream hover:bg-brand")}>
              {formState.isSubmitting ? "…" : buttonLabel}
            </button>
          </div>
          <p id={`nl-${tone}-err`} className={cn("mt-2 min-h-5 text-sm", dark ? "text-[#ffb4b4]" : "text-brand")} role="alert">
            {formState.errors.email?.message ?? error}
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
