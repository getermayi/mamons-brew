import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  type: z.enum(["whatsapp_click", "add_to_cart", "checkout_start", "phone_click", "instagram_click"]),
  label: z.string().max(120).optional(),
  path: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!(await rateLimit(`track:${ip}`, 60, 60))) return new Response(null, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  await db.analyticsEvent.create({ data: parsed.data });
  return new Response(null, { status: 204 });
}
