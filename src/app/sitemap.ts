import type { MetadataRoute } from "next";
import { getLegalList, getPosts, getProducts, getPublishedPageSlugs, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, products, posts, legal, settings] = await Promise.all([getPublishedPageSlugs(), getProducts(), getPosts(), getLegalList(), getSettings()]);
  const gated: Record<string, boolean> = { journal: settings.features.blog, events: settings.features.events, subscribe: settings.features.subscriptions, "bottle-return": settings.features.bottleReturn };
  return [
    ...pages.filter((p) => gated[p.slug] !== false).map((p) => ({ url: siteUrl(p.slug === "home" ? "/" : `/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: p.slug === "home" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: siteUrl(`/flavours/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...(settings.features.blog ? posts.map((p) => ({ url: siteUrl(`/journal/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })) : []),
    ...legal.map((l) => ({ url: siteUrl(`/legal/${l.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
