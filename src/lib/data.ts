import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import {
  announcementSchema, deliveryZonesSchema, eventGallerySchema, featuresSchema, hoursSchema, ingredientsSchema,
  productFaqsSchema, socialsSchema, type Features,
} from "@/lib/schemas";
import { TAGS } from "@/lib/tags";

/**
 * Public, cached reads. Every function is tagged so admin saves can expire
 * exactly what changed (see lib/revalidate.ts) — edits go live instantly.
 */

const defaultFeatures: Features = {
  onlinePayments: false, subscriptions: true, blog: true, events: true, bottleReturn: true, newsletter: true, floatingWhatsapp: true,
};

export async function getSettings() {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("max");
  const s = await db.siteSettings.findUnique({ where: { id: "site" } });
  if (!s) throw new Error("Site settings missing — run `npm run db:seed`.");
  return {
    ...s,
    hours: hoursSchema.catch([]).parse(s.hours),
    socials: socialsSchema.catch({ instagram: "", facebook: "", youtube: "", x: "" }).parse(s.socials),
    announcement: announcementSchema.catch({ enabled: false, text: "", linkLabel: "", href: "", bg: "#1F3A2B", fg: "#F5EFE3" }).parse(s.announcement),
    features: featuresSchema.catch(defaultFeatures).parse(s.features),
    deliveryZones: deliveryZonesSchema.catch([]).parse(s.deliveryZones),
  };
}
export type Settings = Awaited<ReturnType<typeof getSettings>>;

export async function getTheme() {
  "use cache";
  cacheTag(TAGS.theme);
  cacheLife("max");
  const t = await db.themeSettings.findUnique({ where: { id: "theme" } });
  return t ?? { id: "theme", forest: "#1F3A2B", brandRed: "#A8242C", sky: "#9CCBE4", cream: "#F5EFE3", ink: "#141613", displayFont: "fraunces", sansFont: "instrument", radius: 18, grain: true, updatedAt: new Date(0) };
}

export async function getNav(key: "header" | "footer") {
  "use cache";
  cacheTag(TAGS.nav);
  cacheLife("max");
  const menu = await db.navigationMenu.findUnique({
    where: { key },
    include: { items: { orderBy: { order: "asc" } } },
  });
  const items = menu?.items ?? [];
  return items
    .filter((i) => !i.parentId)
    .map((i) => ({ id: i.id, label: i.label, href: i.href, children: items.filter((c) => c.parentId === i.id).map((c) => ({ id: c.id, label: c.label, href: c.href })) }));
}
export type NavTree = Awaited<ReturnType<typeof getNav>>;

export async function getPage(slug: string) {
  "use cache";
  cacheTag(TAGS.pages, TAGS.page(slug));
  cacheLife("max");
  return db.page.findUnique({
    where: { slug },
    include: { sections: { where: { visible: true }, orderBy: { order: "asc" } } },
  });
}

export async function getPublishedPageSlugs() {
  "use cache";
  cacheTag(TAGS.pages);
  cacheLife("max");
  const pages = await db.page.findMany({ where: { status: "PUBLISHED", noindex: false }, select: { slug: true, updatedAt: true } });
  return pages;
}

const productInclude = {
  variants: { orderBy: { order: "asc" as const } },
  images: { orderBy: { order: "asc" as const } },
};

function shapeProduct<T extends { ingredients: unknown; faqs: unknown }>(p: T) {
  return { ...p, ingredients: ingredientsSchema.catch([]).parse(p.ingredients), faqs: productFaqsSchema.catch([]).parse(p.faqs) };
}

export async function getProducts() {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("max");
  const rows = await db.product.findMany({ where: { published: true }, include: productInclude, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map(shapeProduct);
}
export type PublicProduct = Awaited<ReturnType<typeof getProducts>>[number];

export async function getProduct(slug: string) {
  "use cache";
  cacheTag(TAGS.products, TAGS.product(slug));
  cacheLife("max");
  const p = await db.product.findFirst({ where: { slug, published: true }, include: productInclude });
  return p ? shapeProduct(p) : null;
}

export async function getBundles() {
  "use cache";
  cacheTag(TAGS.bundles, TAGS.products);
  cacheLife("max");
  return db.bundle.findMany({
    where: { active: true },
    include: { items: { include: { product: { select: { name: true, slug: true, accent: true } } } } },
    orderBy: { sortOrder: "asc" },
  });
}
export type PublicBundle = Awaited<ReturnType<typeof getBundles>>[number];

export async function getStockists() {
  "use cache";
  cacheTag(TAGS.stockists);
  cacheLife("max");
  return db.stockist.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

export async function getEvents() {
  "use cache";
  cacheTag(TAGS.events);
  cacheLife("max");
  const rows = await db.event.findMany({ where: { published: true }, orderBy: { startsAt: "desc" } });
  return rows.map((e) => ({ ...e, gallery: eventGallerySchema.catch([]).parse(e.gallery) }));
}
export type PublicEvent = Awaited<ReturnType<typeof getEvents>>[number];

export async function getPosts() {
  "use cache";
  cacheTag(TAGS.posts);
  cacheLife("max");
  return db.post.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });
}
export type PublicPost = Awaited<ReturnType<typeof getPosts>>[number];

export async function getPost(slug: string) {
  "use cache";
  cacheTag(TAGS.posts, TAGS.post(slug));
  cacheLife("max");
  return db.post.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
}

export async function getCategories() {
  "use cache";
  cacheTag(TAGS.posts);
  cacheLife("max");
  return db.category.findMany({ orderBy: { order: "asc" } });
}

export async function getTestimonials() {
  "use cache";
  cacheTag(TAGS.testimonials);
  cacheLife("max");
  return db.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
}

export async function getFaqs() {
  "use cache";
  cacheTag(TAGS.faqs);
  cacheLife("max");
  return db.faq.findMany({ where: { published: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}

export async function getGallery() {
  "use cache";
  cacheTag(TAGS.gallery);
  cacheLife("max");
  return db.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function getTeam() {
  "use cache";
  cacheTag(TAGS.team);
  cacheLife("max");
  return db.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getMilestones() {
  "use cache";
  cacheTag(TAGS.milestones);
  cacheLife("max");
  return db.milestone.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getLegal(slug: string) {
  "use cache";
  cacheTag(TAGS.legal);
  cacheLife("max");
  return db.legalPage.findUnique({ where: { slug } });
}

export async function getLegalList() {
  "use cache";
  cacheTag(TAGS.legal);
  cacheLife("max");
  return db.legalPage.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } });
}
