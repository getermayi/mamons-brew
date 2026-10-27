import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { ShareButtons } from "@/components/site/share-buttons";
import { MediaImage } from "@/components/ui/media-image";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { formatDate, siteUrl } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt?.toISOString() },
  };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const [post, posts, settings] = await Promise.all([getPost(slug), getPosts(), getSettings()]);
  if (!post || !settings.features.blog) notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const url = siteUrl(`/journal/${post.slug}`);

  return (
    <article>
      <header className="container-x max-w-5xl pt-10 md:pt-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted"><Link href="/journal" className="hover:underline">← Journal</Link></nav>
        <p className="mt-8 text-eyebrow text-brand">{[post.category?.name, post.publishedAt ? formatDate(post.publishedAt) : null, `${post.readingMinutes} min read`].filter(Boolean).join(" · ")}</p>
        <h1 className="mt-5 text-display">{post.title}</h1>
        <p className="mt-6 max-w-3xl text-lead text-muted">{post.excerpt}</p>
      </header>
      {post.coverUrl ? (
        <Reveal className="container-x mt-12 max-w-6xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius)*2)] bg-paper">
            <MediaImage src={post.coverUrl} alt={post.coverAlt ?? ""} fill priority sizes="(min-width:1280px) 72rem, 100vw" className="object-cover" />
          </div>
        </Reveal>
      ) : null}
      <div className="container-x grid max-w-6xl gap-10 py-16 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm text-muted">By {post.authorName}</p>
            <div className="mt-4"><ShareButtons url={url} title={post.title} /></div>
          </div>
        </aside>
        <div className="prose-brew lg:col-span-8" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      {more.length ? (
        <section className="border-t border-line">
          <div className="container-x section-y">
            <h2 className="text-h2">Keep reading</h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-2">
              {more.map((m) => (
                <li key={m.slug}>
                  <Link href={`/journal/${m.slug}`} className="group grid grid-cols-[8rem_1fr] items-center gap-5">
                    <span className="relative aspect-square overflow-hidden rounded-[var(--radius)] bg-paper">{m.coverUrl ? <MediaImage src={m.coverUrl} alt="" fill sizes="8rem" className="object-cover" /> : null}</span>
                    <span><span className="text-eyebrow text-muted">{m.category?.name}</span><span className="mt-2 block font-display text-2xl leading-tight group-hover:text-brand">{m.title}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: post.title, path: `/journal/${post.slug}` }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(),
          author: { "@type": "Organization", name: post.authorName }, publisher: { "@type": "Organization", name: settings.brandName, logo: { "@type": "ImageObject", url: siteUrl("/brand/logo.svg") } },
          image: siteUrl(`/journal/${post.slug}/opengraph-image`), mainEntityOfPage: url,
        }}
      />
    </article>
  );
}
