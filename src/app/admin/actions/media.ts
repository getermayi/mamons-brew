"use server";

import { z } from "zod";
import { adminAction } from "@/lib/admin-action";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/session";
import { removeFile, storeFile } from "@/lib/storage";

export type MediaItem = { id: string; url: string; alt: string; folder: string; filename: string; width: number | null; height: number | null; size: number; createdAt: string };

export async function listMedia(input: { q?: string; folder?: string }) {
  await assertAdmin("VIEWER");
  const rows = await db.media.findMany({
    where: {
      ...(input.folder && input.folder !== "All" ? { folder: input.folder } : {}),
      ...(input.q ? { OR: [{ alt: { contains: input.q, mode: "insensitive" } }, { filename: { contains: input.q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const folders = await db.media.groupBy({ by: ["folder"], _count: true, orderBy: { folder: "asc" } });
  return {
    items: rows.map((m): MediaItem => ({ id: m.id, url: m.url, alt: m.alt, folder: m.folder, filename: m.filename, width: m.width, height: m.height, size: m.size, createdAt: m.createdAt.toISOString() })),
    folders: folders.map((f) => ({ name: f.folder, count: f._count })),
  };
}

export async function uploadMedia(form: FormData) {
  return adminAction("EDITOR", async () => {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new z.ZodError([{ code: "custom", path: ["file"], message: "Choose an image to upload", input: null }]);
    const meta = z.object({
      alt: z.string().trim().max(300).default(""),
      folder: z.string().trim().max(60).default("General"),
      width: z.coerce.number().int().positive().optional(),
      height: z.coerce.number().int().positive().optional(),
    }).parse({ alt: form.get("alt") ?? "", folder: form.get("folder") || "General", width: form.get("width") || undefined, height: form.get("height") || undefined });
    const url = await storeFile(file);
    const m = await db.media.create({ data: { url, filename: file.name, mime: file.type, size: file.size, alt: meta.alt, folder: meta.folder, width: meta.width, height: meta.height } });
    return { data: { id: m.id, url: m.url, alt: m.alt }, audit: { action: "upload", entity: "Media", entityId: m.id, summary: `Uploaded ${file.name}` } };
  });
}

export async function updateMedia(id: string, input: { alt: string; folder: string }) {
  return adminAction("EDITOR", async () => {
    const data = z.object({ alt: z.string().trim().max(300), folder: z.string().trim().min(1).max(60) }).parse(input);
    await db.media.update({ where: { id }, data });
    return { data: null, message: "Saved" };
  });
}

export async function deleteMedia(id: string) {
  return adminAction("EDITOR", async () => {
    const m = await db.media.delete({ where: { id } });
    await removeFile(m.url);
    return { data: null, audit: { action: "delete", entity: "Media", entityId: id, summary: `Deleted ${m.filename}` } };
  });
}
