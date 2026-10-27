import { notFound } from "next/navigation";
import { Blocks } from "@/blocks/render";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { getEvents, getFaqs, getPage, getPublishedPageSlugs, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/page-meta";
import { siteUrl } from "@/lib/utils";

const featureGate: Record<string, keyof Awaited<ReturnType<typeof getSettings>>["features"]> = {
  journal: "blog",
  events: "events",
  subscribe: "subscriptions",
  "bottle-return": "bottleReturn",
};

export async function generateStaticParams() {
  const pages = await getPublishedPageSlugs();
  return pages.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  return pageMetadata(slug, `/${slug}`);
}

export default async function CmsPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page || page.status !== "PUBLISHED" || slug === "home") notFound();
  const gate = featureGate[slug];
  if (gate && !settings.features[gate]) notFound();

  const hasFaq = page.sections.some((s) => s.type === "faq");
  const faqs = hasFaq ? await getFaqs() : [];
  const events = slug === "events" ? await getEvents() : [];

  return (
    <>
      <Blocks sections={page.sections} />
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: page.title, path: `/${slug}` }]} />
      {slug === "faq" && faqs.length ? (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }} />
      ) : null}
      {events.map((e) => (
        <JsonLd
          key={e.id}
          data={{
            "@context": "https://schema.org", "@type": "Event", name: e.title, startDate: e.startsAt.toISOString(), endDate: e.endsAt?.toISOString(), description: e.description,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "Place", name: e.venue, address: e.address ?? e.venue }, image: e.posterUrl ? siteUrl(e.posterUrl) : undefined,
            organizer: { "@type": "Organization", name: settings.brandName, url: siteUrl() },
          }}
        />
      ))}
    </>
  );
}
