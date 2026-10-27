import { getProduct, getProducts } from "@/lib/data";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Mamon Brews kombucha";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  return ogCard({ eyebrow: "Mamon Brews kombucha", title: p?.name ?? "Kombucha", subtitle: p?.tagline ?? "Handcrafted in Arunachal Pradesh", accent: p?.accent ?? "#C98A3D" });
}
