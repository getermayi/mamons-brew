import type { CardProduct } from "@/components/shop/product-card";
import type { StoryFlavour } from "@/blocks/flavour-story";
import type { PublicProduct } from "@/lib/data";

const statusLabel = { IN_STOCK: null, LOW_STOCK: "Almost gone", SOLD_OUT: "Sold out", COMING_SOON: "Coming soon" } as const;

export function defaultVariant(p: PublicProduct) {
  return p.variants.find((v) => v.isDefault) ?? p.variants[0] ?? null;
}

export function toCard(p: PublicProduct): CardProduct {
  const v = defaultVariant(p);
  const img = p.images[0];
  return {
    slug: p.slug, name: p.name, tagline: p.tagline, accent: p.accent, tags: p.tags, stockStatus: p.stockStatus,
    price: v?.price ?? null, variantId: v?.id ?? null, variantLabel: v?.label ?? "Bottle", image: img ? { url: img.url, alt: img.alt } : null,
  };
}

export function toStory(p: PublicProduct): StoryFlavour {
  const v = defaultVariant(p);
  const img = p.images[0];
  return {
    slug: p.slug, name: p.name, tagline: p.tagline, accent: p.accent, tags: p.tags, notes: p.tastingNotes,
    price: v?.price ?? null, variantId: v?.id ?? null, variantLabel: v?.label ?? "Bottle",
    available: (p.stockStatus === "IN_STOCK" || p.stockStatus === "LOW_STOCK") && v?.price !== null && v?.price !== undefined,
    statusLabel: statusLabel[p.stockStatus], image: img ? { url: img.url, alt: img.alt } : null,
  };
}
