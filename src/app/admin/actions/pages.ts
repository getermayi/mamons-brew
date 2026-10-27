"use server";

import { z } from "zod";
import { getBlockDef } from "@/blocks/definitions";
import { adminAction } from "@/lib/admin-action";
import { db } from "@/lib/db";
import { fieldsSchema } from "@/lib/fields";
import { Prisma } from "@/generated/prisma/client";
import { cleanHtml } from "@/lib/sanitize";
import { ActionError } from "@/lib/session";
import { TAGS } from "@/lib/tags";
import { slugify } from "@/lib/utils";

export type DraftSection = { id: string; type: string; content: Record<string, unknown>; visible: boolean };

const RESERVED = ["admin", "api", "checkout", "flavours-detail", "journal-post", "legal", "sitemap.xml", "robots.txt"];

function cleanContent(type: string, content: unknown) {
  const def = getBlockDef(type);
  if (!def) throw new ActionError(`Unknown block type “${type}”.`);
  const parsed = fieldsSchema(def.fields).parse(content) as Record<string, unknown>;
  for (const f of def.fields) if (f.kind === "richtext" && typeof parsed[f.name] === "string") parsed[f.name] = cleanHtml(parsed[f.name] as string);
  return parsed as Prisma.InputJsonValue;
}

const draftSchema = z.array(z.object({ id: z.string().max(40), type: z.string().max(40), content: z.record(z.string(), z.unknown()), visible: z.boolean() })).max(60);

export async function saveDraft(pageId: string, sections: DraftSection[]) {
  return adminAction("EDITOR", async () => {
    const list = draftSchema.parse(sections).map((s) => ({ ...s, content: cleanContent(s.type, s.content) }));
    await db.page.update({ where: { id: pageId }, data: { draft: list as Prisma.InputJsonValue, draftUpdatedAt: new Date() } });
    return { data: null, message: "Draft saved — preview updated" };
  });
}

export async function publishPage(pageId: string) {
  return adminAction("EDITOR", async () => {
    const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
    const draft = page.draft ? draftSchema.parse(page.draft) : null;
    await db.$transaction(async (tx) => {
      if (draft) {
        await tx.section.deleteMany({ where: { pageId } });
        await tx.section.createMany({ data: draft.map((s, order) => ({ pageId, type: s.type, content: cleanContent(s.type, s.content), visible: s.visible, order })) });
      }
      await tx.page.update({ where: { id: pageId }, data: { draft: Prisma.DbNull, draftUpdatedAt: null, status: "PUBLISHED" } });
    });
    return { data: null, tags: [TAGS.pages, TAGS.page(page.slug)], audit: { action: "publish", entity: "Page", entityId: pageId, summary: `Published page “${page.title}”` }, message: "Published — the page is live" };
  });
}

export async function discardDraft(pageId: string) {
  return adminAction("EDITOR", async () => {
    await db.page.update({ where: { id: pageId }, data: { draft: Prisma.DbNull, draftUpdatedAt: null } });
    return { data: null, message: "Draft discarded" };
  });
}

const metaSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(80),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  ogImageUrl: z.string().trim().max(2048),
  noindex: z.boolean(),
});

export async function savePageMeta(pageId: string, input: unknown) {
  return adminAction("EDITOR", async () => {
    const v = metaSchema.parse(input);
    const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
    const slug = page.system ? page.slug : slugify(v.slug || v.title);
    if (!page.system && RESERVED.includes(slug)) throw new ActionError("That URL is reserved — choose another.");
    await db.page.update({ where: { id: pageId }, data: { title: v.title, slug, status: page.slug === "home" ? "PUBLISHED" : v.status, seoTitle: v.seoTitle || null, seoDescription: v.seoDescription || null, ogImageUrl: v.ogImageUrl || null, noindex: v.noindex } });
    return { data: null, tags: [TAGS.pages, TAGS.page(page.slug), TAGS.page(slug)], audit: { action: "update", entity: "Page", entityId: pageId, summary: `Updated settings for “${v.title}”` } };
  });
}

export async function createPage(input: { title: string }) {
  return adminAction<{ id: string }>("EDITOR", async () => {
    const title = z.string().trim().min(2).max(120).parse(input.title);
    let slug = slugify(title);
    if (RESERVED.includes(slug) || (await db.page.findUnique({ where: { slug } }))) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const page = await db.page.create({
      data: {
        title, slug, status: "DRAFT",
        sections: { create: [{ type: "pageHero", order: 0, content: { eyebrow: "", title, intro: "", tone: "cream", art: "hills", image: { url: "", alt: "" } } }] },
      },
    });
    return { data: { id: page.id }, tags: [TAGS.pages], audit: { action: "create", entity: "Page", entityId: page.id, summary: `Created page “${title}”` } };
  });
}

export async function deletePage(pageId: string) {
  return adminAction("OWNER", async () => {
    const page = await db.page.findUniqueOrThrow({ where: { id: pageId } });
    if (page.system) throw new ActionError("Core pages can't be deleted — set them to Draft to hide them instead.");
    await db.page.delete({ where: { id: pageId } });
    return { data: null, tags: [TAGS.pages, TAGS.page(page.slug)], audit: { action: "delete", entity: "Page", entityId: pageId, summary: `Deleted page “${page.title}”` } };
  });
}
