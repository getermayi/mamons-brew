import { Bottle } from "@/components/brand/bottle";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[75vh] items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <p className="text-eyebrow text-brand">Error 404</p>
        <h1 className="mt-5 text-display">This page has <em className="accent">fizzled</em> out.</h1>
        <p className="mt-6 max-w-md text-lead text-muted">Maybe it was moved, maybe it never finished fermenting. Either way, there&apos;s cold kombucha just a click away.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/flavours" size="lg">Browse flavours <ArrowIcon /></ButtonLink>
          <ButtonLink href="/" size="lg" variant="outline">Back home</ButtonLink>
        </div>
      </div>
      <div className="relative mx-auto flex w-full max-w-sm items-end justify-center" aria-hidden>
        <div className="absolute inset-x-6 top-6 aspect-square rounded-full bg-sky" />
        <Bottle color="#9CCBE4" label="404" className="relative w-1/2 rotate-[24deg]" />
      </div>
    </section>
  );
}
