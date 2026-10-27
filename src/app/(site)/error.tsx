"use client";

import { Bottle } from "@/components/brand/bottle";
import { Button, ButtonLink } from "@/components/ui/button";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-x grid min-h-[70vh] items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <p className="text-eyebrow text-brand">Something went sideways</p>
        <h1 className="mt-5 text-display">A little <em className="accent">too</em> much fizz.</h1>
        <p className="mt-6 max-w-md text-lead text-muted">This page popped its cap unexpectedly. Try again — and if it keeps happening, WhatsApp us and we&apos;ll sort it.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" onClick={reset}>Try again</Button>
          <ButtonLink href="/" size="lg" variant="outline">Back home</ButtonLink>
        </div>
      </div>
      <div className="mx-auto w-1/3 max-w-40" aria-hidden><Bottle color="#A8242C" label="Oops" className="w-full -rotate-12" /></div>
    </section>
  );
}
