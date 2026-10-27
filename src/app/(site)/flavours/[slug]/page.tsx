import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/blocks/interactive";
import { BlockIcon } from "@/blocks/icons";
import { LeafArt } from "@/components/brand/art";
import { Reveal, RevealItem, Stagger } from "@/components/motion/reveal";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { BuyBox } from "@/components/shop/buy-box";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGallery } from "@/components/shop/product-gallery";
import { getProduct, getProducts, getSettings } from "@/lib/data";
import { toCard } from "@/lib/shape";
import { readableOn, siteUrl } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/flavours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.seoTitle || `${p.name} Kombucha`,
    description: p.seoDescription || p.tagline,
    alternates: { canonical: `/flavours/${p.slug}` },
  };
}

const status = { IN_STOCK: null, LOW_STOCK: "Almost gone", SOLD_OUT: "Sold out for now", COMING_SOON: "Coming soon" } as const;

export default async function FlavourPage({ params }: PageProps<"/flavours/[slug]">) {
  const { slug } = await params;
  const [p, all, settings] = await Promise.all([getProduct(slug), getProducts(), getSettings()]);
  if (!p) notFound();
  const related = all.filter((x) => x.slug !== p.slug).sort((a, b) => Number(b.tags.some((t) => p.tags.includes(t))) - Number(a.tags.some((t) => p.tags.includes(t)))).slice(0, 3);
  const orderable = p.stockStatus === "IN_STOCK" || p.stockStatus === "LOW_STOCK";
  const ink = readableOn(p.accent);
  const priced = p.variants.find((v) => v.price !== null);

  return (
    <>
      <section className="relative -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[84px] lg:pt-[84px]" style={{ background: `color-mix(in oklab, ${p.accent} 38%, var(--cream))` }}>
        <div className="container-x grid gap-10 pb-20 pt-8 lg:grid-cols-12 lg:gap-16 lg:pb-28 lg:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-ink/60 lg:col-span-12">
            <Link href="/" className="hover:underline">Home</Link> / <Link href="/flavours" className="hover:underline">Flavours</Link> / <span aria-current="page" className="text-ink">{p.name}</span>
          </nav>
          <Reveal className="lg:col-span-6"><ProductGallery name={p.name} accent={p.accent} images={p.images.map((i) => ({ url: i.url, alt: i.alt }))} /></Reveal>
          <div className="lg:col-span-6 lg:pt-6">
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => <span key={t} className="rounded-full px-3 py-1 text-xs font-semibold capitalize" style={{ background: p.accent, color: ink }}>{t}</span>)}
              {status[p.stockStatus] ? <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream">{status[p.stockStatus]}</span> : null}
            </div>
            <h1 className="mt-5 text-display">{p.name}</h1>
            <p className="mt-4 font-display text-h3 italic text-ink/80">{p.tagline}</p>
            <div className="prose-brew mt-6 max-w-xl" dangerouslySetInnerHTML={{ __html: p.description }} />
            {p.tastingNotes.length ? (
              <div className="mt-8">
                <p className="text-eyebrow text-ink/60">Tasting notes</p>
                <ul className="mt-3 flex flex-wrap gap-2">{p.tastingNotes.map((n) => <li key={n} className="rounded-full border border-ink/20 bg-cream/50 px-4 py-1.5 text-sm">{n}</li>)}</ul>
              </div>
            ) : null}
            <div className="mt-10 border-t border-ink/15 pt-8">
              <BuyBox product={{ slug: p.slug, name: p.name, accent: p.accent }} variants={p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, compareAt: v.compareAt }))} orderable={orderable} statusLabel={status[p.stockStatus]} />
            </div>
            <p className="mt-6 text-sm text-ink/60">Delivered cold across {settings.deliveryZones.map((z) => z.name).filter((n) => !n.startsWith("Other")).join(" & ")}. Keep refrigerated.</p>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-brand">What&apos;s inside</p>
            <h2 className="mt-4 text-h2">Nothing to hide</h2>
            <Stagger className="mt-8 divide-y divide-line border-y border-line">
              {p.ingredients.map((ing) => (
                <RevealItem key={ing.name} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{ing.name}</p>
                    {ing.note ? <p className="text-sm text-muted">{ing.note}</p> : null}
                  </div>
                  {ing.local ? <span className="shrink-0 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-cream">Local</span> : null}
                </RevealItem>
              ))}
            </Stagger>
          </div>
          {p.localStory ? (
            <Reveal className="relative overflow-hidden rounded-[calc(var(--radius)*2)] bg-forest p-10 text-cream lg:col-span-7 lg:p-14">
              <LeafArt className="pointer-events-none absolute -right-10 -top-6 w-72 rotate-12 opacity-40" color="#8FA67C" />
              <p className="text-eyebrow text-sky">The local story</p>
              <p className="relative mt-6 font-display text-h3 leading-snug">{p.localStory}</p>
              {p.pairsWith.length ? (
                <div className="relative mt-10">
                  <p className="text-eyebrow text-cream/60">Pairs well with</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.pairsWith.map((x) => <li key={x} className="flex items-center gap-2 rounded-full border border-cream/25 px-4 py-2 text-sm"><BlockIcon name="sparkles" className="size-4 text-sky" />{x}</li>)}
                  </ul>
                </div>
              ) : null}
            </Reveal>
          ) : null}
        </div>
      </section>

      {p.faqs.length ? (
        <section className="section-y pt-0">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <h2 className="text-h2 lg:col-span-4">About {p.name}</h2>
            <div className="lg:col-span-8"><FaqList searchable={false} items={p.faqs.map((f, i) => ({ id: `pf-${i}`, question: f.q, answer: f.a, category: "Flavour" }))} /></div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section-y border-t border-line">
          <div className="container-x">
            <h2 className="text-h2">You might also like</h2>
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <li key={r.slug}><ProductCard p={toCard(r)} /></li>)}
            </ul>
          </div>
        </section>
      ) : null}

      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Flavours", path: "/flavours" }, { name: p.name, path: `/flavours/${p.slug}` }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${p.name} Kombucha`,
          description: p.tagline,
          brand: { "@type": "Brand", name: settings.brandName },
          image: p.images[0] ? siteUrl(p.images[0].url) : siteUrl(`/flavours/${p.slug}/opengraph-image`),
          sku: p.variants[0]?.sku ?? undefined,
          ...(priced
            ? { offers: { "@type": "Offer", priceCurrency: "INR", price: priced.price, url: siteUrl(`/flavours/${p.slug}`), availability: orderable ? "https://schema.org/InStock" : p.stockStatus === "COMING_SOON" ? "https://schema.org/PreOrder" : "https://schema.org/OutOfStock", areaServed: "Itanagar, Naharlagun" } }
            : {}),
        }}
      />
    </>
  );
}
