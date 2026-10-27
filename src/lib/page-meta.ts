import type { Metadata } from "next";
import { getPage, getSettings } from "@/lib/data";
import { stripAccent } from "@/lib/accent";

export async function pageMetadata(slug: string, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return {};
  const title = page.seoTitle || page.title;
  const description = page.seoDescription || settings.tagline;
  const image = page.ogImageUrl || settings.ogImageUrl;
  return {
    title: slug === "home" ? { absolute: title } : stripAccent(title),
    description,
    alternates: { canonical: path },
    robots: page.noindex || page.status === "DRAFT" ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: path, images: image ? [{ url: image }] : undefined },
  };
}
