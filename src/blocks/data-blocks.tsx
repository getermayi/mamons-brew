import { cacheLife } from "next/cache";
import Link from "next/link";
import { Bottle } from "@/components/brand/bottle";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import { Reveal, RevealItem, Stagger } from "@/components/motion/reveal";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductCard } from "@/components/shop/product-card";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { CtaButton, SmartLink, WhatsAppIcon } from "@/components/site/smart-link";
import { MediaImage } from "@/components/ui/media-image";
import {
  getBundles, getCategories, getEvents, getFaqs, getGallery, getMilestones, getPosts, getProducts, getSettings, getStockists, getTeam, getTestimonials,
} from "@/lib/data";
import { toCard, toStory } from "@/lib/shape";
import { cn, formatDate, formatINR } from "@/lib/utils";
import type {
  BundlesContent, ContactContent, EventsContent, FaqContent, FlavourShowcaseContent, FormContent, GalleryContent, JournalContent, MapContent,
  MilestonesContent, NewsletterContent, ProductGridContent, StockistsContent, TeamContent, TestimonialsContent,
} from "./definitions";
import { FlavourStory } from "./flavour-story";
import { Countdown, EventGallery, FaqList, JournalGrid, MasonryGallery } from "./interactive";
import { EmptyState, SectionHeading } from "./shared";

function MapEmbed({ query, title, className }: { query: string; title: string; className?: string }) {
  return (
    <iframe
      title={title}
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("size-full border-0 grayscale-[35%] contrast-[1.05]", className)}
    />
  );
}

// ─── Flavours ───────────────────────────────────────────────────────

export async function FlavourShowcaseBlock({ c }: { c: FlavourShowcaseContent }) {
  const all = await getProducts();
  const products = c.featuredOnly ? all.filter((p) => p.featured) : all;
  if (!products.length) return null;
  return (
    <section className="relative">
      <div className="container-x pt-[clamp(4.5rem,3rem+6vw,9rem)]">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align="split">
          {c.cta.label ? <Reveal delay={0.25} className="mt-6"><CtaButton link={c.cta} variant="outline" size="md" /></Reveal> : null}
        </SectionHeading>
      </div>
      {c.mode === "story" ? (
        <FlavourStory flavours={products.map(toStory)} />
      ) : (
        <div className="container-x section-y pt-14">
          <ul className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:thin]" data-lenis-prevent>
            {products.map((p) => (
              <li key={p.slug} className="w-[78vw] max-w-sm shrink-0 snap-start sm:w-[44vw] lg:w-[30vw]"><ProductCard p={toCard(p)} /></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export async function ProductGridBlock({ c }: { c: ProductGridContent }) {
  const products = await getProducts();
  return (
    <section className="pb-[clamp(4.5rem,3rem+6vw,9rem)] pt-8">
      <div className="container-x">
        {c.title ? <h2 className="mb-8 text-h2">{c.title}</h2> : null}
        {products.length ? <ProductGrid products={products.map(toCard)} showFilters={c.showFilters} /> : <EmptyState title="The fridge is restocking." body="New batches are fermenting right now. Check back soon, or ask us on WhatsApp what's ready." />}
      </div>
    </section>
  );
}

export async function BundlesBlock({ c }: { c: BundlesContent }) {
  const bundles = await getBundles();
  if (!bundles.length) return null;
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align="split" />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => {
            const accent = b.items[0]?.product.accent ?? "#C98A3D";
            const saving = b.compareAt ? b.compareAt - b.price : 0;
            return (
              <RevealItem key={b.id} className="flex flex-col overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper">
                <div className="relative aspect-[5/4]" style={{ background: `color-mix(in oklab, ${accent} 40%, var(--cream))` }}>
                  {b.imageUrl ? <MediaImage src={b.imageUrl} alt={b.imageAlt ?? b.name} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" /> : (
                    <div className="absolute inset-x-[10%] bottom-0 flex items-end justify-center gap-1">
                      {b.items.slice(0, 4).map((it) => <Bottle key={it.id} color={it.product.accent} label={it.product.name.split(" ")[0]} className="w-1/4" />)}
                    </div>
                  )}
                  {b.badge ? <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-cream">{b.badge}</span> : null}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-h3">{b.name}</h3>
                  <p className="mt-2 text-muted">{b.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5 text-xs">
                    {b.items.map((it) => <li key={it.id} className="rounded-full border border-line px-2.5 py-1">{it.quantity} × {it.product.name}</li>)}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-7">
                    <div>
                      <p className="font-display text-3xl tabular-nums">{formatINR(b.price)}</p>
                      {saving > 0 ? <p className="text-sm text-muted"><s>{formatINR(b.compareAt)}</s> · save {formatINR(saving)}</p> : null}
                    </div>
                    <AddToCart size="md" item={{ kind: "bundle", id: b.id, name: b.name, label: "Pack", price: b.price, accent, href: "/packs" }} />
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Where to buy ───────────────────────────────────────────────────

export async function StockistsBlock({ c }: { c: StockistsContent }) {
  const [stockists, settings] = await Promise.all([getStockists(), getSettings()]);
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} align="split">
          {c.cta.label ? <Reveal delay={0.2} className="mt-6"><CtaButton link={c.cta} variant="outline" size="md" /></Reveal> : null}
        </SectionHeading>
        <div className={cn("mt-14 grid gap-5", c.showMap ? "lg:grid-cols-12" : "")}>
          <Stagger className={cn("grid gap-4", c.showMap ? "lg:col-span-5" : "md:grid-cols-2 lg:grid-cols-3")}>
            {stockists.map((s) => (
              <RevealItem key={s.id} className="group flex flex-col rounded-[calc(var(--radius)*1.3)] border border-line bg-paper p-7 transition-colors hover:border-ink/30">
                <p className="text-eyebrow text-brand">{s.kind} · {s.area}</p>
                <h3 className="mt-3 text-h3">{s.name}</h3>
                <p className="mt-2 text-muted">{s.address}</p>
                {s.hours ? <p className="mt-1 text-sm text-muted">{s.hours}</p> : null}
                <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                  {s.mapsUrl ? <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-cream transition-colors hover:bg-forest">Directions ↗</a> : null}
                  {s.phone ? <a href={`tel:${s.phone}`} className="inline-flex h-10 items-center rounded-full border border-line px-4 hover:bg-ink/5">Call</a> : null}
                </div>
              </RevealItem>
            ))}
            {c.showZones && settings.deliveryEnabled ? (
              <RevealItem className="rounded-[calc(var(--radius)*1.3)] bg-forest p-7 text-cream">
                <p className="text-eyebrow text-sky">Home delivery</p>
                <h3 className="mt-3 text-h3">We bring it cold</h3>
                <ul className="mt-5 divide-y divide-cream/15">
                  {settings.deliveryZones.map((z) => (
                    <li key={z.name} className="flex items-baseline justify-between gap-4 py-3">
                      <span>{z.name}<span className="block text-xs text-cream/60">{z.eta}</span></span>
                      <span className="tabular-nums">{z.fee ? formatINR(z.fee) : "Free"}</span>
                    </li>
                  ))}
                </ul>
                {settings.freeDeliveryAbove ? <p className="mt-4 text-sm text-cream/70">Free delivery on orders over {formatINR(settings.freeDeliveryAbove)}.</p> : null}
                <SmartLink href="whatsapp" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-cream px-5 text-sm font-medium text-ink"><WhatsAppIcon className="size-4" /> Order on WhatsApp</SmartLink>
              </RevealItem>
            ) : null}
          </Stagger>
          {c.showMap ? (
            <Reveal className="relative min-h-[420px] overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper lg:col-span-7">
              <MapEmbed query={stockists[0] ? `${stockists[0].name}, ${stockists[0].address}` : `${settings.city}, ${settings.region}`} title="Map of Mamon Brews stockists" className="absolute inset-0" />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ─── Events ─────────────────────────────────────────────────────────

async function NowISO() {
  "use cache";
  cacheLife("hours");
  return new Date().toISOString();
}

export async function EventsBlock({ c }: { c: EventsContent }) {
  const [settings, events, nowIso] = await Promise.all([getSettings(), getEvents(), NowISO()]);
  if (!settings.features.events) return null;
  const now = new Date(nowIso).getTime();
  const upcoming = events.filter((e) => (e.endsAt ?? e.startsAt).getTime() >= now).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const past = events.filter((e) => (e.endsAt ?? e.startsAt).getTime() < now);

  if (c.mode === "upcoming") {
    return (
      <section className="section-y">
        <div className="container-x">
          <SectionHeading eyebrow={c.eyebrow} title={c.title} />
          <div className="mt-12">
            {upcoming.length === 0 ? (
              <EmptyState title="Nothing on the calendar — yet." body="We're always cooking up the next pour. Follow @mamoon.brews for pop-ups, or book us for your own event below." />
            ) : (
              <Stagger className="grid gap-5">
                {upcoming.slice(0, c.limit).map((e) => (
                  <RevealItem key={e.id} className="grid overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper md:grid-cols-12">
                    <div className="relative aspect-[4/5] md:col-span-4 md:aspect-auto md:min-h-80">
                      {e.posterUrl ? <MediaImage src={e.posterUrl} alt={e.posterAlt ?? e.title} fill sizes="(min-width:768px) 30vw, 92vw" className="object-cover" /> : null}
                    </div>
                    <div className="flex flex-col gap-5 p-7 md:col-span-8 md:p-10">
                      <p className="text-eyebrow text-brand">{formatDate(e.startsAt, { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                      <h3 className="text-h2">{e.title}</h3>
                      <p className="text-muted">{e.venue}</p>
                      <p className="max-w-2xl">{e.description}</p>
                      <Countdown to={e.startsAt.toISOString()} />
                    </div>
                  </RevealItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (c.mode === "past") {
    if (!past.length) return null;
    return (
      <section className="section-y">
        <div className="container-x">
          <SectionHeading eyebrow={c.eyebrow} title={c.title} />
          <Stagger className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, c.limit).map((e) => (
              <RevealItem key={e.id}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-paper">
                  {e.posterUrl ? <MediaImage src={e.posterUrl} alt={e.posterAlt ?? e.title} fill sizes="(min-width:1024px) 30vw, 92vw" className="object-cover" /> : null}
                </div>
                <p className="mt-5 text-eyebrow text-muted">{formatDate(e.startsAt, { month: "long", year: "numeric" })} · {e.venue}</p>
                <h3 className="mt-2 text-h3">{e.title}</h3>
                <p className="mt-2 text-muted">{e.description}</p>
                {e.partners.length ? <p className="mt-2 text-sm">With {e.partners.join(", ")}</p> : null}
                {e.gallery.length ? <div className="mt-4"><EventGallery images={e.gallery} /></div> : null}
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>
    );
  }

  const strip = [...upcoming, ...past].slice(0, c.limit);
  if (!strip.length) return null;
  return (
    <section className="section-y overflow-hidden">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} align="split">
          {c.cta.label ? <Reveal delay={0.2} className="mt-6"><CtaButton link={c.cta} variant="outline" size="md" /></Reveal> : null}
        </SectionHeading>
      </div>
      <ul className="mt-12 flex snap-x gap-5 overflow-x-auto px-[clamp(1rem,0.4rem+2.8vw,3.5rem)] pb-4 [scrollbar-width:none]" data-lenis-prevent>
        {strip.map((e) => {
          const isUpcoming = (e.endsAt ?? e.startsAt).getTime() >= now;
          return (
            <li key={e.id} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
              <Link href="/events" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-paper">
                  {e.posterUrl ? <MediaImage src={e.posterUrl} alt={e.posterAlt ?? e.title} fill sizes="22rem" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                  <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold", isUpcoming ? "bg-brand text-cream" : "bg-cream/85 text-ink")}>{isUpcoming ? "Upcoming" : "Past"}</span>
                </div>
                <p className="mt-4 text-eyebrow text-muted">{formatDate(e.startsAt, { day: "numeric", month: "short", year: "numeric" })}</p>
                <h3 className="mt-2 font-display text-2xl leading-tight">{e.title}</h3>
                <p className="mt-1 text-sm text-muted">{e.venue}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Social proof ───────────────────────────────────────────────────

export async function TestimonialsBlock({ c }: { c: TestimonialsContent }) {
  const items = await getTestimonials();
  if (!items.length) return null; // hidden until real reviews are published in the admin
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <RevealItem key={t.id} className={cn("flex flex-col justify-between rounded-[calc(var(--radius)*1.4)] p-8", i % 3 === 0 ? "bg-forest text-cream" : i % 3 === 1 ? "bg-sky/60" : "bg-paper")}>
              <p aria-label={`${t.rating} out of 5 stars`} className="tracking-[0.2em]">{"★".repeat(t.rating)}<span className="opacity-25">{"★".repeat(5 - t.rating)}</span></p>
              <blockquote className="mt-6 font-display text-[1.7rem] leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="mt-8 text-sm"><span className="font-semibold">{t.name}</span>{t.context ? <span className="opacity-70"> · {t.context}</span> : null}</p>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export async function GalleryBlock({ c }: { c: GalleryContent }) {
  const [items, settings] = await Promise.all([getGallery(), getSettings()]);
  const shown = items.slice(0, c.limit);
  if (!shown.length) return null;
  if (c.mode === "masonry") {
    return (
      <section className="section-y pt-10">
        <div className="container-x">
          {c.title ? <SectionHeading eyebrow={c.eyebrow} title={c.title} className="mb-10" /> : null}
          <MasonryGallery items={shown} />
        </div>
      </section>
    );
  }
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} align="split">
          {settings.socials.instagram ? (
            <Reveal delay={0.2} className="mt-6"><CtaButton link={{ label: "Follow on Instagram", href: settings.socials.instagram }} variant="outline" size="md" /></Reveal>
          ) : null}
        </SectionHeading>
        <Stagger className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4" gap={0.05}>
          {shown.map((g, i) => (
            <RevealItem key={g.id} className={cn("group relative overflow-hidden rounded-[var(--radius)]", i % 5 === 0 ? "row-span-2 aspect-[4/7] md:aspect-auto" : "aspect-square")}>
              <SmartLink href={settings.socials.instagram || "/gallery"} className="block size-full">
                <MediaImage src={g.url} alt={g.alt} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105" />
                <span className="absolute inset-0 grid place-items-center bg-ink/0 text-sm font-medium text-cream opacity-0 transition-all duration-500 group-hover:bg-ink/35 group-hover:opacity-100">View on Instagram ↗</span>
              </SmartLink>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ─── Engagement ─────────────────────────────────────────────────────

export async function NewsletterBlock({ c }: { c: NewsletterContent }) {
  const settings = await getSettings();
  if (!settings.features.newsletter) return null;
  return (
    <section className="container-x py-10 md:py-16">
      <Reveal className="grid gap-8 rounded-[calc(var(--radius)*2)] bg-sky p-8 sm:p-12 md:grid-cols-2 md:items-center lg:p-16">
        <div>
          <h2 className="text-h2">{c.title}</h2>
          {c.body ? <p className="mt-4 max-w-md text-ink/75">{c.body}</p> : null}
        </div>
        <NewsletterForm buttonLabel={c.buttonLabel} />
      </Reveal>
    </section>
  );
}

export async function FaqBlock({ c }: { c: FaqContent }) {
  const all = await getFaqs();
  const items = c.mode === "home" ? all.filter((f) => f.showOnHome) : c.mode === "category" ? all.filter((f) => f.category === c.category) : all;
  if (!items.length) return null;
  const searchable = c.mode === "all";
  return (
    <section className="section-y">
      <div className={cn("container-x", searchable ? "max-w-5xl" : "grid gap-12 lg:grid-cols-12")}>
        {searchable ? null : (
          <div className="lg:col-span-4">
            <SectionHeading eyebrow={c.eyebrow} title={c.title} />
            {c.cta.label ? <Reveal delay={0.2} className="mt-8"><CtaButton link={c.cta} variant="outline" size="md" /></Reveal> : null}
          </div>
        )}
        <Reveal className={searchable ? "" : "lg:col-span-8"}>
          <FaqList items={items.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category }))} searchable={searchable} />
        </Reveal>
      </div>
    </section>
  );
}

export async function FormBlock({ c }: { c: FormContent }) {
  const flavours = c.formType === "SUBSCRIBE" ? (await getProducts()).filter((p) => p.stockStatus !== "COMING_SOON" && p.stockStatus !== "SOLD_OUT") : [];
  return (
    <section id="enquire" className="section-y scroll-mt-24">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
        </div>
        <Reveal className="lg:col-span-8">
          {c.formType === "SUBSCRIBE" ? (
            <SubscriptionForm flavours={flavours.map((p) => ({ slug: p.slug, name: p.name, accent: p.accent }))} successMessage={c.successMessage} />
          ) : (
            <EnquiryForm type={c.formType as "BUSINESS" | "EVENT" | "CONTACT" | "TASTING" | "GIFTING"} successMessage={c.successMessage} />
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function MapBlock({ c }: { c: MapContent }) {
  return (
    <section className="section-y">
      <div className="container-x">
        {c.title ? <h2 className="text-h2">{c.title}</h2> : null}
        <Reveal className="mt-8 aspect-[16/10] overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper md:aspect-[21/9]">
          <MapEmbed query={c.query} title={c.title || "Map"} />
        </Reveal>
        {c.caption ? <p className="mt-4 text-muted">{c.caption}</p> : null}
      </div>
    </section>
  );
}

export async function ContactBlock({ c }: { c: ContactContent }) {
  const s = await getSettings();
  const cards = [
    { label: "WhatsApp", value: s.whatsapp, href: "whatsapp", note: "Fastest reply" },
    { label: "Call", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}`, note: s.hours[0] ? `${s.hours[0].days}, ${s.hours[0].time}` : "" },
    ...(s.socials.instagram ? [{ label: "Instagram", value: `@${s.socials.instagram.replace(/\/$/, "").split("/").pop()}`, href: s.socials.instagram, note: "New batches & pop-ups" }] : []),
    ...(s.email ? [{ label: "Email", value: s.email, href: `mailto:${s.email}`, note: "For longer conversations" }] : []),
  ];
  return (
    <section className="section-y pt-10">
      <div className="container-x">
        <SectionHeading title={c.title} intro={c.intro} />
        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
            {cards.map((card) => (
              <RevealItem key={card.label}>
                <SmartLink href={card.href} className="group flex h-full flex-col justify-between rounded-[calc(var(--radius)*1.3)] border border-line bg-paper p-7 transition-colors hover:bg-ink hover:text-cream">
                  <span className="text-eyebrow text-brand group-hover:text-sky">{card.label}</span>
                  <span className="mt-8 font-display text-2xl break-words">{card.value}</span>
                  <span className="mt-2 text-sm opacity-60">{card.note}</span>
                </SmartLink>
              </RevealItem>
            ))}
            <RevealItem className="rounded-[calc(var(--radius)*1.3)] bg-forest p-7 text-cream sm:col-span-2">
              <p className="text-eyebrow text-sky">Brewhouse</p>
              <p className="mt-4 font-display text-2xl">{s.address}{s.address !== s.city ? `, ${s.city}` : ""}, {s.region} {s.postalCode}</p>
              <ul className="mt-4 space-y-1 text-sm text-cream/75">{s.hours.map((h) => <li key={h.days}>{h.days} · {h.time}</li>)}</ul>
            </RevealItem>
          </Stagger>
          {c.showMap ? (
            <Reveal className="relative min-h-[420px] overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-paper lg:col-span-6">
              <MapEmbed query={`${s.city}, ${s.region}`} title={`Map of ${s.city}`} className="absolute inset-0" />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ─── Story ──────────────────────────────────────────────────────────

export async function TeamBlock({ c }: { c: TeamContent }) {
  const team = await getTeam();
  if (!team.length) return null;
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading eyebrow={c.eyebrow} title={c.title} />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <RevealItem key={m.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)*1.3)] bg-[color-mix(in_oklab,var(--sky)_45%,var(--cream))]">
                {m.photoUrl ? <MediaImage src={m.photoUrl} alt={m.name} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" /> : (
                  <div className="absolute inset-0 flex items-end justify-center gap-2 px-10">
                    <Bottle color="#8FA67C" label="Brew" className="w-1/4" /><Bottle color="#A8242C" label="Team" className="w-1/3" /><Bottle color="#E9C53F" label="Pour" className="w-1/4" />
                  </div>
                )}
              </div>
              <h3 className="mt-5 text-h3">{m.name}</h3>
              <p className="text-eyebrow mt-2 text-brand">{m.role}</p>
              {m.bio ? <p className="mt-3 text-muted">{m.bio}</p> : null}
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export async function MilestonesBlock({ c }: { c: MilestonesContent }) {
  const items = await getMilestones();
  if (!items.length) return null;
  return (
    <section className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start"><SectionHeading eyebrow={c.eyebrow} title={c.title} /></div>
        <ol className="relative border-l border-line pl-8 lg:col-span-8">
          {items.map((m) => (
            <Reveal as="li" key={m.id} className="relative pb-14 last:pb-0">
              <span aria-hidden className="absolute -left-[41px] top-1 size-5 rounded-full border-4 border-[var(--page-bg)] bg-brand" />
              <p className="text-eyebrow text-brand">{m.dateLabel}</p>
              <h3 className="mt-3 text-h3">{m.title}</h3>
              <p className="mt-3 max-w-xl text-muted">{m.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function JournalBlock({ c }: { c: JournalContent }) {
  const [settings, posts, categories] = await Promise.all([getSettings(), getPosts(), getCategories()]);
  if (!settings.features.blog) return null;
  const shown = posts.slice(0, c.limit);
  return (
    <section className="section-y pt-10">
      <div className="container-x">
        {c.title ? <SectionHeading eyebrow={c.eyebrow} title={c.title} className="mb-10" /> : null}
        {shown.length ? (
          <JournalGrid
            categories={c.showCategories ? categories.filter((cat) => posts.some((p) => p.categoryId === cat.id)).map((cat) => cat.name) : null}
            posts={shown.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, coverUrl: p.coverUrl, coverAlt: p.coverAlt, category: p.category?.name ?? null, publishedAt: p.publishedAt?.toISOString() ?? null, readingMinutes: p.readingMinutes }))}
          />
        ) : (
          <EmptyState title="The first story is still steeping." body="Recipes and brewhouse notes are on their way." />
        )}
      </div>
    </section>
  );
}
