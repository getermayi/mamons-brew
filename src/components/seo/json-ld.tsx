import type { Settings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

/** Renders JSON-LD safely (escapes "<" so content can't break out of the script tag). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function LocalBusinessJsonLd({ settings }: { settings: Settings }) {
  const sameAs = Object.values(settings.socials).filter(Boolean);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "FoodEstablishment"],
        "@id": siteUrl("/#business"),
        name: settings.brandName,
        description: settings.tagline,
        url: siteUrl(),
        telephone: settings.phone,
        image: settings.ogImageUrl ? siteUrl(settings.ogImageUrl) : undefined,
        logo: settings.logoUrl ? siteUrl(settings.logoUrl) : undefined,
        address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city, addressRegion: settings.region, postalCode: settings.postalCode ?? undefined, addressCountry: "IN" },
        geo: { "@type": "GeoCoordinates", latitude: 27.1043, longitude: 93.6955 },
        areaServed: settings.deliveryZones.map((z) => ({ "@type": "City", name: z.name })),
        servesCuisine: "Kombucha, fermented beverages",
        priceRange: "₹₹",
        sameAs,
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: siteUrl(it.path) })),
      }}
    />
  );
}
