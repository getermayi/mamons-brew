import { cacheLife } from "next/cache";
import Link from "next/link";
import { HillsArt } from "@/components/brand/art";
import { LogoMark } from "@/components/brand/logo";
import type { NavTree, Settings } from "@/lib/data";
import { NewsletterForm } from "./newsletter-form";
import { SmartLink } from "./smart-link";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({ settings, nav, legal }: { settings: Settings; nav: NavTree; legal: { slug: string; title: string }[] }) {
  const socials = Object.entries(settings.socials).filter(([, v]) => v);
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-cream">
      <HillsArt className="pointer-events-none h-28 -translate-y-px rotate-180 opacity-100" tones={["var(--page-bg)"]} softFirst={false} />
      <div className="container-x grid gap-14 pb-10 pt-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-eyebrow text-sky">{settings.brandStyled}</p>
          <p className="mt-5 max-w-md font-display text-h3">{settings.missionLine}</p>
          {settings.features.newsletter ? (
            <div className="mt-8 max-w-md">
              <p className="mb-3 text-sm text-cream/70">New batches, pop-ups and the odd recipe. No spam, ever.</p>
              <NewsletterForm tone="dark" />
            </div>
          ) : null}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
          {nav.map((col) => (
            <div key={col.id}>
              <p className="text-eyebrow text-cream/50">{col.label}</p>
              <ul className="mt-4 space-y-2.5">
                {col.children.map((c) => (
                  <li key={c.id}>
                    <Link href={c.href} className="text-cream/85 transition-colors hover:text-sky">{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-6 lg:col-span-3">
          <div>
            <p className="text-eyebrow text-cream/50">Talk to us</p>
            <ul className="mt-4 space-y-2.5 text-cream/85">
              <li><SmartLink href="whatsapp" className="hover:text-sky">WhatsApp {settings.whatsapp}</SmartLink></li>
              <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-sky">Call {settings.phone}</a></li>
              {settings.email ? <li><a href={`mailto:${settings.email}`} className="hover:text-sky">{settings.email}</a></li> : null}
              <li>{settings.address}{settings.address !== settings.city ? `, ${settings.city}` : ""}, {settings.region}</li>
            </ul>
          </div>
          <div>
            <p className="text-eyebrow text-cream/50">Hours</p>
            <ul className="mt-4 space-y-1 text-sm text-cream/85">
              {settings.hours.map((h) => <li key={h.days}><span className="text-cream/60">{h.days}</span> · {h.time}</li>)}
            </ul>
          </div>
          {socials.length ? (
            <ul className="flex gap-3">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <SmartLink href={url} className="inline-flex h-10 items-center rounded-full border border-cream/25 px-4 text-sm capitalize transition-colors hover:bg-cream hover:text-ink">{name === "x" ? "X" : name}</SmartLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="container-x relative">
        <p aria-hidden className="pointer-events-none select-none whitespace-nowrap font-display text-[19vw] leading-[0.8] tracking-[-0.05em] text-cream/[0.06]">
          {settings.brandName}
        </p>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-cream/55 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="size-7 text-cream" />
            <span>© <CopyrightYear /> {settings.brandName}. Brewed with care in {settings.city}, {settings.region}.</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {settings.fssai ? <span>FSSAI Lic. No. {settings.fssai}</span> : null}
            {legal.map((l) => <Link key={l.slug} href={`/legal/${l.slug}`} className="hover:text-cream">{l.title}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
