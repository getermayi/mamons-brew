"use server";

import { getCollection } from "@/admin/collections";
import { adminAction } from "@/lib/admin-action";
import { db } from "@/lib/db";
import { fieldsSchema } from "@/lib/fields";
import { cleanHtml } from "@/lib/sanitize";
import { ActionError, assertAdmin } from "@/lib/session";
import { TAGS } from "@/lib/tags";
import { readingMinutes, slugify } from "@/lib/utils";
import type { Role } from "@/generated/prisma/enums";

export type Cell = string | number | boolean | null;
export type Row = { id: string; title: string; slug?: string; cells: Record<string, Cell> };
type Values = Record<string, unknown>;

// ─── small typed readers for validated values ───────────────────────
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const sn = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const nn = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const b = (v: unknown) => v === true;
const tags = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const rows = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is Values => typeof x === "object" && x !== null) : []);

const IST = "+05:30";
function toInput(d: Date | null | undefined, withTime = false) {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  return withTime ? `${date}T${get("hour")}:${get("minute")}` : date;
}
function fromInput(v: unknown) {
  const str = s(v);
  if (!str) return null;
  return new Date(str.includes("T") ? `${str}:00${IST}` : `${str}T00:00:00${IST}`);
}
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
const slugOr = (v: unknown, fallback: unknown) => slugify(s(v) || s(fallback)) || `item-${Date.now().toString(36)}`;

type Handler = {
  list: () => Promise<Row[]>;
  get: (id: string) => Promise<Values | null>;
  save: (id: string | null, v: Values) => Promise<{ id: string; title: string; tags: string[] }>;
  remove?: (id: string) => Promise<string[]>;
  reorder?: (ids: string[]) => Promise<string[]>;
  min?: Role;
};

async function reorderWith(ids: string[], update: (id: string, order: number) => Promise<unknown>) {
  await db.$transaction(async () => { for (const [i, id] of ids.entries()) await update(id, i); });
}

const handlers: Record<string, Handler> = {
  flavours: {
    list: async () => (await db.product.findMany({ include: { variants: { orderBy: { order: "asc" } } }, orderBy: { sortOrder: "asc" } })).map((p) => ({
      id: p.id, title: p.name, slug: p.slug,
      cells: { accent: p.accent, name: p.name, price: p.variants[0]?.price ?? null, stockStatus: p.stockStatus, featured: p.featured, published: p.published },
    })),
    get: async (id) => {
      const p = await db.product.findUnique({ where: { id }, include: { variants: { orderBy: { order: "asc" } }, images: { orderBy: { order: "asc" } } } });
      if (!p) return null;
      return {
        ...p, localStory: p.localStory ?? "", seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
        variants: p.variants.map((v) => ({ id: v.id, label: v.label, sku: v.sku ?? "", price: v.price ?? "", compareAt: v.compareAt ?? "" })),
        images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
      };
    },
    save: async (id, v) => {
      const slug = slugOr(v.slug, v.name);
      const data = {
        name: s(v.name), slug, tagline: s(v.tagline), description: cleanHtml(s(v.description)), accent: s(v.accent), stockStatus: s(v.stockStatus) as "IN_STOCK",
        featured: b(v.featured), published: b(v.published), tags: tags(v.tags).map((t) => t.toLowerCase()), tastingNotes: tags(v.tastingNotes),
        ingredients: rows(v.ingredients).map((r) => ({ name: s(r.name), note: s(r.note), local: b(r.local) })), localStory: sn(v.localStory), pairsWith: tags(v.pairsWith),
        faqs: rows(v.faqs).map((r) => ({ q: s(r.q), a: s(r.a) })), seoTitle: sn(v.seoTitle), seoDescription: sn(v.seoDescription),
      };
      const variants = rows(v.variants);
      if (!variants.length) throw new ActionError("Add at least one size & price.");
      const product = await db.$transaction(async (tx) => {
        const p = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data: { ...data, sortOrder: await tx.product.count() } });
        // Keep variant ids stable (they're in shoppers' saved carts); delete only what was removed.
        const keep = variants.map((r) => s(r.id)).filter(Boolean);
        await tx.productVariant.deleteMany({ where: { productId: p.id, id: { notIn: keep } } });
        for (const [order, r] of variants.entries()) {
          const vd = { label: s(r.label) || "Bottle", sku: sn(r.sku), price: nn(r.price), compareAt: nn(r.compareAt), order, isDefault: order === 0 };
          if (s(r.id) && keep.includes(s(r.id))) await tx.productVariant.update({ where: { id: s(r.id) }, data: vd });
          else await tx.productVariant.create({ data: { ...vd, productId: p.id } });
        }
        await tx.productImage.deleteMany({ where: { productId: p.id } });
        const imgs = rows(v.images).filter((r) => s(r.url));
        if (imgs.length) await tx.productImage.createMany({ data: imgs.map((r, order) => ({ productId: p.id, url: s(r.url), alt: s(r.alt) || data.name, order })) });
        return p;
      });
      return { id: product.id, title: product.name, tags: [TAGS.products, TAGS.product(slug), TAGS.bundles, TAGS.pages] };
    },
    remove: async (id) => {
      const used = await db.orderItem.count({ where: { productId: id } });
      if (used) throw new ActionError("This flavour has orders, so it can't be deleted. Untick “Visible on the site” to hide it instead.");
      await db.product.delete({ where: { id } });
      return [TAGS.products, TAGS.bundles, TAGS.pages];
    },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.product.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.products, TAGS.pages]; },
  },

  packs: {
    list: async () => (await db.bundle.findMany({ orderBy: { sortOrder: "asc" } })).map((x) => ({ id: x.id, title: x.name, slug: x.slug, cells: { imageUrl: x.imageUrl, name: x.name, price: x.price, compareAt: x.compareAt, active: x.active } })),
    get: async (id) => {
      const x = await db.bundle.findUnique({ where: { id }, include: { items: true } });
      return x ? { ...x, compareAt: x.compareAt ?? "", badge: x.badge ?? "", imageUrl: x.imageUrl ?? "", imageAlt: x.imageAlt ?? "", items: x.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) } : null;
    },
    save: async (id, v) => {
      const items = rows(v.items).filter((r) => s(r.productId));
      if (!items.length) throw new ActionError("Add at least one flavour to the pack.");
      const data = { name: s(v.name), slug: slugOr(v.slug, v.name), description: s(v.description), price: n(v.price), compareAt: nn(v.compareAt), badge: sn(v.badge), imageUrl: sn(v.imageUrl), imageAlt: sn(v.imageAlt), active: b(v.active) };
      const x = await db.$transaction(async (tx) => {
        const bdl = id ? await tx.bundle.update({ where: { id }, data }) : await tx.bundle.create({ data: { ...data, sortOrder: await tx.bundle.count() } });
        await tx.bundleItem.deleteMany({ where: { bundleId: bdl.id } });
        await tx.bundleItem.createMany({ data: items.map((r) => ({ bundleId: bdl.id, productId: s(r.productId), quantity: Math.max(1, n(r.quantity)) })) });
        return bdl;
      });
      return { id: x.id, title: x.name, tags: [TAGS.bundles] };
    },
    remove: async (id) => { await db.bundle.delete({ where: { id } }); return [TAGS.bundles]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.bundle.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.bundles]; },
  },

  discounts: {
    list: async () => (await db.discountCode.findMany({ orderBy: { createdAt: "desc" } })).map((d) => ({
      id: d.id, title: d.code,
      cells: { code: d.code, summary: d.type === "PERCENT" ? `${d.value}% off` : `₹${d.value} off`, usage: `${d.usedCount}${d.usageLimit ? ` / ${d.usageLimit}` : ""}`, endsAt: iso(d.endsAt), active: d.active },
    })),
    get: async (id) => {
      const d = await db.discountCode.findUnique({ where: { id } });
      return d ? { ...d, startsAt: toInput(d.startsAt), endsAt: toInput(d.endsAt), usageLimit: d.usageLimit ?? "" } : null;
    },
    save: async (id, v) => {
      const data = { code: s(v.code).toUpperCase().replace(/[^A-Z0-9_-]/g, ""), type: s(v.type) as "PERCENT", value: n(v.value), minOrder: n(v.minOrder), startsAt: fromInput(v.startsAt), endsAt: fromInput(v.endsAt), usageLimit: nn(v.usageLimit), active: b(v.active) };
      if (data.type === "PERCENT" && data.value > 100) throw new ActionError("A percentage discount can't be more than 100.");
      const d = id ? await db.discountCode.update({ where: { id }, data }) : await db.discountCode.create({ data });
      return { id: d.id, title: d.code, tags: [] };
    },
    remove: async (id) => { await db.discountCode.delete({ where: { id } }); return []; },
  },

  stockists: {
    list: async () => (await db.stockist.findMany({ orderBy: { sortOrder: "asc" } })).map((x) => ({ id: x.id, title: x.name, cells: { name: x.name, area: x.area, kind: x.kind, active: x.active } })),
    get: async (id) => { const x = await db.stockist.findUnique({ where: { id } }); return x ? { ...x, phone: x.phone ?? "", hours: x.hours ?? "", mapsUrl: x.mapsUrl ?? "", lat: x.lat ?? "", lng: x.lng ?? "" } : null; },
    save: async (id, v) => {
      const data = { name: s(v.name), kind: s(v.kind), address: s(v.address), area: s(v.area), phone: sn(v.phone), hours: sn(v.hours), mapsUrl: sn(v.mapsUrl) ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s(v.name)} ${s(v.address)}`)}`, lat: nn(v.lat), lng: nn(v.lng), active: b(v.active) };
      const x = id ? await db.stockist.update({ where: { id }, data }) : await db.stockist.create({ data: { ...data, sortOrder: await db.stockist.count() } });
      return { id: x.id, title: x.name, tags: [TAGS.stockists] };
    },
    remove: async (id) => { await db.stockist.delete({ where: { id } }); return [TAGS.stockists]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.stockist.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.stockists]; },
  },

  events: {
    list: async () => (await db.event.findMany({ orderBy: { startsAt: "desc" } })).map((e) => ({ id: e.id, title: e.title, slug: e.slug, cells: { posterUrl: e.posterUrl, title: e.title, startsAt: iso(e.startsAt), venue: e.venue, published: e.published } })),
    get: async (id) => { const e = await db.event.findUnique({ where: { id } }); return e ? { ...e, startsAt: toInput(e.startsAt, true), endsAt: toInput(e.endsAt, true), address: e.address ?? "", posterUrl: e.posterUrl ?? "", posterAlt: e.posterAlt ?? "" } : null; },
    save: async (id, v) => {
      const startsAt = fromInput(v.startsAt);
      if (!startsAt) throw new ActionError("Add a start date.");
      const data = { title: s(v.title), slug: slugOr(v.slug, v.title), startsAt, endsAt: fromInput(v.endsAt), venue: s(v.venue), address: sn(v.address), description: s(v.description), posterUrl: sn(v.posterUrl), posterAlt: sn(v.posterAlt), partners: tags(v.partners), gallery: rows(v.gallery).filter((r) => s(r.url)).map((r) => ({ url: s(r.url), alt: s(r.alt) })), published: b(v.published) };
      const e = id ? await db.event.update({ where: { id }, data }) : await db.event.create({ data });
      return { id: e.id, title: e.title, tags: [TAGS.events] };
    },
    remove: async (id) => { await db.event.delete({ where: { id } }); return [TAGS.events]; },
  },

  journal: {
    list: async () => (await db.post.findMany({ include: { category: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] })).map((p) => ({ id: p.id, title: p.title, slug: p.slug, cells: { coverUrl: p.coverUrl, title: p.title, category: p.category?.name ?? "—", status: p.status, publishedAt: iso(p.publishedAt) } })),
    get: async (id) => { const p = await db.post.findUnique({ where: { id } }); return p ? { ...p, categoryId: p.categoryId ?? "", coverUrl: p.coverUrl ?? "", coverAlt: p.coverAlt ?? "", publishedAt: toInput(p.publishedAt), seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "" } : null; },
    save: async (id, v) => {
      const content = cleanHtml(s(v.content));
      const status = s(v.status) === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
      const slug = slugOr(v.slug, v.title);
      const data = { title: s(v.title), slug, excerpt: s(v.excerpt), content, coverUrl: sn(v.coverUrl), coverAlt: sn(v.coverAlt), categoryId: sn(v.categoryId), authorName: s(v.authorName) || "Mamon Brews", status, publishedAt: fromInput(v.publishedAt) ?? (status === "PUBLISHED" ? new Date() : null), readingMinutes: readingMinutes(content), seoTitle: sn(v.seoTitle), seoDescription: sn(v.seoDescription) } as const;
      const p = id ? await db.post.update({ where: { id }, data }) : await db.post.create({ data });
      return { id: p.id, title: p.title, tags: [TAGS.posts, TAGS.post(slug)] };
    },
    remove: async (id) => { await db.post.delete({ where: { id } }); return [TAGS.posts]; },
  },

  categories: {
    list: async () => (await db.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { order: "asc" } })).map((c) => ({ id: c.id, title: c.name, cells: { name: c.name, slug: c.slug, posts: c._count.posts } })),
    get: async (id) => db.category.findUnique({ where: { id } }),
    save: async (id, v) => {
      const data = { name: s(v.name), slug: slugOr(v.slug, v.name) };
      const c = id ? await db.category.update({ where: { id }, data }) : await db.category.create({ data: { ...data, order: await db.category.count() } });
      return { id: c.id, title: c.name, tags: [TAGS.posts] };
    },
    remove: async (id) => { await db.category.delete({ where: { id } }); return [TAGS.posts]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.category.update({ where: { id }, data: { order: o } })); return [TAGS.posts]; },
  },

  testimonials: {
    list: async () => (await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } })).map((t) => ({ id: t.id, title: t.name, cells: { quote: t.quote.length > 70 ? `${t.quote.slice(0, 70)}…` : t.quote, name: t.name, rating: t.rating, published: t.published } })),
    get: async (id) => { const t = await db.testimonial.findUnique({ where: { id } }); return t ? { ...t, context: t.context ?? "" } : null; },
    save: async (id, v) => {
      const data = { quote: s(v.quote), name: s(v.name), context: sn(v.context), rating: Math.min(5, Math.max(1, Math.round(n(v.rating)) || 5)), published: b(v.published) };
      const t = id ? await db.testimonial.update({ where: { id }, data }) : await db.testimonial.create({ data: { ...data, sortOrder: await db.testimonial.count() } });
      return { id: t.id, title: t.name, tags: [TAGS.testimonials] };
    },
    remove: async (id) => { await db.testimonial.delete({ where: { id } }); return [TAGS.testimonials]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.testimonial.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.testimonials]; },
  },

  faqs: {
    list: async () => (await db.faq.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] })).map((f) => ({ id: f.id, title: f.question, cells: { question: f.question, category: f.category, showOnHome: f.showOnHome, published: f.published } })),
    get: async (id) => db.faq.findUnique({ where: { id } }),
    save: async (id, v) => {
      const data = { question: s(v.question), answer: s(v.answer), category: s(v.category) || "General", showOnHome: b(v.showOnHome), published: b(v.published) };
      const f = id ? await db.faq.update({ where: { id }, data }) : await db.faq.create({ data: { ...data, sortOrder: await db.faq.count() } });
      return { id: f.id, title: f.question, tags: [TAGS.faqs] };
    },
    remove: async (id) => { await db.faq.delete({ where: { id } }); return [TAGS.faqs]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.faq.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.faqs]; },
  },

  gallery: {
    list: async () => (await db.galleryItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })).map((g) => ({ id: g.id, title: g.alt, cells: { url: g.url, alt: g.alt, category: g.category } })),
    get: async (id) => { const g = await db.galleryItem.findUnique({ where: { id } }); return g ? { ...g, caption: g.caption ?? "" } : null; },
    save: async (id, v) => {
      if (!s(v.url)) throw new ActionError("Choose a photo.");
      const media = await db.media.findFirst({ where: { url: s(v.url) } });
      const data = { url: s(v.url), alt: s(v.alt), caption: sn(v.caption), category: s(v.category) || "General", width: n(v.width) || media?.width || 1200, height: n(v.height) || media?.height || 1500 };
      const g = id ? await db.galleryItem.update({ where: { id }, data }) : await db.galleryItem.create({ data: { ...data, sortOrder: await db.galleryItem.count() } });
      return { id: g.id, title: g.alt, tags: [TAGS.gallery] };
    },
    remove: async (id) => { await db.galleryItem.delete({ where: { id } }); return [TAGS.gallery]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.galleryItem.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.gallery]; },
  },

  team: {
    list: async () => (await db.teamMember.findMany({ orderBy: { sortOrder: "asc" } })).map((t) => ({ id: t.id, title: t.name, cells: { photoUrl: t.photoUrl, name: t.name, role: t.role } })),
    get: async (id) => { const t = await db.teamMember.findUnique({ where: { id } }); return t ? { ...t, bio: t.bio ?? "", photoUrl: t.photoUrl ?? "" } : null; },
    save: async (id, v) => {
      const data = { name: s(v.name), role: s(v.role), bio: sn(v.bio), photoUrl: sn(v.photoUrl) };
      const t = id ? await db.teamMember.update({ where: { id }, data }) : await db.teamMember.create({ data: { ...data, sortOrder: await db.teamMember.count() } });
      return { id: t.id, title: t.name, tags: [TAGS.team] };
    },
    remove: async (id) => { await db.teamMember.delete({ where: { id } }); return [TAGS.team]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.teamMember.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.team]; },
  },

  milestones: {
    list: async () => (await db.milestone.findMany({ orderBy: { sortOrder: "asc" } })).map((m) => ({ id: m.id, title: m.title, cells: { dateLabel: m.dateLabel, title: m.title } })),
    get: async (id) => db.milestone.findUnique({ where: { id } }),
    save: async (id, v) => {
      const data = { dateLabel: s(v.dateLabel), title: s(v.title), description: s(v.description) };
      const m = id ? await db.milestone.update({ where: { id }, data }) : await db.milestone.create({ data: { ...data, sortOrder: await db.milestone.count() } });
      return { id: m.id, title: m.title, tags: [TAGS.milestones] };
    },
    remove: async (id) => { await db.milestone.delete({ where: { id } }); return [TAGS.milestones]; },
    reorder: async (ids) => { await reorderWith(ids, (id, o) => db.milestone.update({ where: { id }, data: { sortOrder: o } })); return [TAGS.milestones]; },
  },

  legal: {
    list: async () => (await db.legalPage.findMany({ orderBy: { title: "asc" } })).map((l) => ({ id: l.id, title: l.title, slug: l.slug, cells: { title: l.title, slug: l.slug, updatedAt: iso(l.updatedAt) } })),
    get: async (id) => db.legalPage.findUnique({ where: { id } }),
    save: async (id, v) => {
      const data = { title: s(v.title), slug: slugOr(v.slug, v.title), content: cleanHtml(s(v.content)) };
      const l = id ? await db.legalPage.update({ where: { id }, data }) : await db.legalPage.create({ data });
      return { id: l.id, title: l.title, tags: [TAGS.legal] };
    },
    remove: async (id) => { await db.legalPage.delete({ where: { id } }); return [TAGS.legal]; },
  },

  enquiries: {
    list: async () => (await db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 2000 })).map((e) => ({ id: e.id, title: e.name, cells: { createdAt: iso(e.createdAt), name: e.name, type: e.type, status: e.status, phone: e.phone ?? e.email ?? "" } })),
    get: async (id) => {
      const e = await db.enquiry.findUnique({ where: { id } });
      return e ? { ...e, phone: e.phone ?? "", email: e.email ?? "", businessName: e.businessName ?? "", businessType: e.businessType ?? "", location: e.location ?? "", monthlyVolume: e.monthlyVolume ?? "", eventDate: e.eventDate ?? "", notes: e.notes ?? "" } : null;
    },
    save: async (id, v) => {
      if (!id) throw new ActionError("Enquiries come from the website forms.");
      const e = await db.enquiry.update({ where: { id }, data: { status: s(v.status) as "NEW", notes: sn(v.notes) } });
      return { id: e.id, title: e.name, tags: [] };
    },
    remove: async (id) => { await db.enquiry.delete({ where: { id } }); return []; },
  },

  subscriptions: {
    list: async () => (await db.subscription.findMany({ orderBy: { createdAt: "desc" } })).map((x) => ({ id: x.id, title: x.name, cells: { createdAt: iso(x.createdAt), name: x.name, frequency: x.frequency, bottles: x.bottles, status: x.status, nextDelivery: iso(x.nextDelivery) } })),
    get: async (id) => {
      const x = await db.subscription.findUnique({ where: { id } });
      if (!x) return null;
      const mix = rows(x.flavours).map((f) => `${n(f.quantity)} × ${s(f.name)}`).join(", ");
      return { ...x, mix, nextDelivery: toInput(x.nextDelivery), startDate: x.startDate ?? "", address: x.address ?? "", notes: x.notes ?? "" };
    },
    save: async (id, v) => {
      if (!id) throw new ActionError("Subscriptions come from the website form.");
      const x = await db.subscription.update({ where: { id }, data: { status: s(v.status) as "ACTIVE", nextDelivery: fromInput(v.nextDelivery), frequency: s(v.frequency) as "WEEKLY", bottles: Math.max(1, n(v.bottles)), notes: sn(v.notes) } });
      return { id: x.id, title: x.name, tags: [] };
    },
    remove: async (id) => { await db.subscription.delete({ where: { id } }); return []; },
  },

  customers: {
    list: async () => (await db.customer.findMany({ include: { orders: { where: { status: { not: "CANCELLED" } }, select: { total: true, createdAt: true } } }, orderBy: { updatedAt: "desc" } })).map((c) => ({
      id: c.id, title: c.name,
      cells: { name: c.name, phone: c.phone, area: c.area ?? "—", orders: c.orders.length, ltv: c.orders.reduce((t, o) => t + o.total, 0), lastOrder: iso(c.orders.map((o) => o.createdAt).sort((a, z) => z.getTime() - a.getTime())[0]) },
    })),
    get: async (id) => { const c = await db.customer.findUnique({ where: { id } }); return c ? { ...c, email: c.email ?? "", area: c.area ?? "", address: c.address ?? "", notes: c.notes ?? "" } : null; },
    save: async (id, v) => {
      if (!id) throw new ActionError("Customers are created from orders.");
      const c = await db.customer.update({ where: { id }, data: { name: s(v.name), email: sn(v.email), area: sn(v.area), address: sn(v.address), notes: sn(v.notes) } });
      return { id: c.id, title: c.name, tags: [] };
    },
    min: "EDITOR",
  },

  newsletter: {
    list: async () => (await db.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } })).map((x) => ({ id: x.id, title: x.email, cells: { email: x.email, source: x.source, createdAt: iso(x.createdAt), unsubscribed: x.unsubscribed } })),
    get: async (id) => db.newsletterSubscriber.findUnique({ where: { id } }),
    save: async (id, v) => {
      if (!id) throw new ActionError("Subscribers sign up on the website.");
      const x = await db.newsletterSubscriber.update({ where: { id }, data: { unsubscribed: b(v.unsubscribed) } });
      return { id: x.id, title: x.email, tags: [] };
    },
    remove: async (id) => { await db.newsletterSubscriber.delete({ where: { id } }); return []; },
  },
};

function need(key: string) {
  const def = getCollection(key);
  const h = handlers[key];
  if (!def || !h) throw new ActionError("Unknown content type.");
  return { def, h };
}

export async function listRows(key: string) {
  await assertAdmin("VIEWER");
  return need(key).h.list();
}

export async function getItem(key: string, id: string) {
  await assertAdmin("VIEWER");
  return need(key).h.get(id);
}

export async function loadSources(sources: string[]) {
  await assertAdmin("VIEWER");
  const out: Record<string, { value: string; label: string }[]> = {};
  if (sources.includes("products")) out.products = (await db.product.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })).map((p) => ({ value: p.id, label: p.name }));
  if (sources.includes("categories")) out.categories = (await db.category.findMany({ orderBy: { order: "asc" } })).map((c) => ({ value: c.id, label: c.name }));
  return out;
}

export async function saveItem(key: string, id: string | null, values: Values) {
  return adminAction<{ id: string }>("EDITOR", async () => {
    const { def, h } = need(key);
    const parsed = fieldsSchema(def.fields).parse(values) as Values;
    const res = await h.save(id, parsed);
    return {
      data: { id: res.id },
      tags: res.tags,
      audit: { action: id ? "update" : "create", entity: def.singular, entityId: res.id, summary: `${id ? "Updated" : "Created"} ${def.singular.toLowerCase()} “${res.title}”` },
      message: "Saved — live on the site.",
    };
  });
}

export async function deleteItem(key: string, id: string) {
  return adminAction("EDITOR", async () => {
    const { def, h } = need(key);
    if (!h.remove) throw new ActionError(`${def.label} can't be deleted.`);
    const tagsToClear = await h.remove(id);
    return { data: null, tags: tagsToClear, audit: { action: "delete", entity: def.singular, entityId: id, summary: `Deleted a ${def.singular.toLowerCase()}` }, message: "Deleted" };
  });
}

export async function reorderItems(key: string, ids: string[]) {
  return adminAction("EDITOR", async () => {
    const { def, h } = need(key);
    if (!h.reorder) throw new ActionError("This list can't be reordered.");
    const t = await h.reorder(ids.slice(0, 500));
    return { data: null, tags: t, audit: { action: "reorder", entity: def.singular, summary: `Reordered ${def.label.toLowerCase()}` }, message: "Order saved" };
  });
}

export async function bulkDelete(key: string, ids: string[]) {
  return adminAction("EDITOR", async () => {
    const { def, h } = need(key);
    if (!h.remove) throw new ActionError(`${def.label} can't be deleted.`);
    let t: string[] = [];
    for (const id of ids.slice(0, 200)) t = [...t, ...(await h.remove(id))];
    return { data: null, tags: t, audit: { action: "delete", entity: def.singular, summary: `Deleted ${ids.length} ${def.label.toLowerCase()}` }, message: `Deleted ${ids.length}` };
  });
}
