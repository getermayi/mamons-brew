import { getPost, getPosts } from "@/lib/data";
import { ogCard, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Mamon Brews journal";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post?.title ?? "Journal";
  return ogCard({ eyebrow: post?.category?.name ?? "Journal", title: title.length > 44 ? `${title.slice(0, 42)}…` : title, subtitle: "The Mamon Brews journal", accent: "#9CCBE4" });
}
