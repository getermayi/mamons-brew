import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/** Fixed-window limiter stored in Postgres, so it works across serverless instances. Returns false when over the limit. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const row = await db.rateLimit.findUnique({ where: { key } });
  if (!row || row.resetAt < now) {
    await db.rateLimit.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: 1, resetAt } });
    return true;
  }
  if (row.count >= limit) return false;
  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
}

/** Limit a public form by IP. */
export async function limitForm(action: string, limit = 5, windowSeconds = 10 * 60) {
  return rateLimit(`${action}:${await clientIp()}`, limit, windowSeconds);
}
