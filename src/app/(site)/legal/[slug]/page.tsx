import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegal, getLegalList } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getLegalList()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegal(slug);
  return page ? { title: page.title, alternates: { canonical: `/legal/${slug}` } } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = await getLegal(slug);
  if (!page) notFound();
  return (
    <article className="container-x max-w-3xl py-16 md:py-24">
      <p className="text-eyebrow text-brand">Legal</p>
      <h1 className="mt-4 text-display">{page.title}</h1>
      <p className="mt-4 text-sm text-muted">Last updated {formatDate(page.updatedAt)}</p>
      <div className="prose-brew mt-12" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
