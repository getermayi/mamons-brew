import "server-only";
import { put, del } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

/** Vercel Blob in production; /public/uploads when no Blob token is configured (local dev). */
export async function storeFile(file: File) {
  if (!ALLOWED.includes(file.type)) throw new Error("Please upload a JPG, PNG, WebP, AVIF, GIF or SVG image.");
  if (file.size > MAX_BYTES) throw new Error("That file is over 10 MB — please use a smaller image.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const name = `${base}-${Date.now().toString(36)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`media/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error("Media storage isn't connected. Add a Vercel Blob store to the project.");
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function removeFile(url: string) {
  try {
    if (url.includes(".blob.vercel-storage.com")) await del(url);
    else if (url.startsWith("/uploads/")) await unlink(path.join(process.cwd(), "public", url));
  } catch {
    /* already gone */
  }
}
