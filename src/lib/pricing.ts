import "server-only";
import { db } from "@/lib/db";
import type { DeliveryZone } from "@/lib/schemas";

export type PricedLine = { productId: string | null; bundleId: string | null; name: string; variantLabel: string | null; unitPrice: number; quantity: number };

/** Re-prices the cart from the database — client prices are never trusted. */
export async function priceLines(lines: { kind: "variant" | "bundle"; id: string; quantity: number }[]) {
  const variantIds = lines.filter((l) => l.kind === "variant").map((l) => l.id);
  const bundleIds = lines.filter((l) => l.kind === "bundle").map((l) => l.id);
  const [variants, bundles] = await Promise.all([
    db.productVariant.findMany({ where: { id: { in: variantIds } }, include: { product: { select: { id: true, name: true, published: true, stockStatus: true } } } }),
    db.bundle.findMany({ where: { id: { in: bundleIds }, active: true } }),
  ]);

  const priced: PricedLine[] = [];
  const problems: string[] = [];
  for (const l of lines) {
    if (l.kind === "variant") {
      const v = variants.find((x) => x.id === l.id);
      if (!v || !v.product.published) { problems.push("An item in your cart is no longer available."); continue; }
      if (v.price === null || v.product.stockStatus === "SOLD_OUT" || v.product.stockStatus === "COMING_SOON") { problems.push(`${v.product.name} isn't available to order right now.`); continue; }
      priced.push({ productId: v.product.id, bundleId: null, name: v.product.name, variantLabel: v.label, unitPrice: v.price, quantity: l.quantity });
    } else {
      const b = bundles.find((x) => x.id === l.id);
      if (!b) { problems.push("A pack in your cart is no longer available."); continue; }
      priced.push({ productId: null, bundleId: b.id, name: b.name, variantLabel: "Pack", unitPrice: b.price, quantity: l.quantity });
    }
  }
  const subtotal = priced.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  return { priced, subtotal, problems };
}

export async function evaluateDiscount(code: string | undefined, subtotal: number) {
  if (!code) return { amount: 0, code: null as string | null, error: null as string | null };
  const dc = await db.discountCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  const now = new Date();
  if (!dc || !dc.active) return { amount: 0, code: null, error: "That code isn't valid." };
  if (dc.startsAt && dc.startsAt > now) return { amount: 0, code: null, error: "That code isn't active yet." };
  if (dc.endsAt && dc.endsAt < now) return { amount: 0, code: null, error: "That code has expired." };
  if (dc.usageLimit !== null && dc.usedCount >= dc.usageLimit) return { amount: 0, code: null, error: "That code has been fully used." };
  if (subtotal < dc.minOrder) return { amount: 0, code: null, error: `Spend ₹${dc.minOrder} or more to use this code.` };
  const amount = dc.type === "PERCENT" ? Math.round((subtotal * Math.min(100, dc.value)) / 100) : Math.min(subtotal, dc.value);
  return { amount, code: dc.code, error: null };
}

export function deliveryFeeFor(zones: DeliveryZone[], area: string, fulfilment: "DELIVERY" | "PICKUP", subtotalAfterDiscount: number, freeAbove: number | null) {
  if (fulfilment === "PICKUP") return 0;
  if (freeAbove !== null && subtotalAfterDiscount >= freeAbove) return 0;
  return zones.find((z) => z.name === area)?.fee ?? zones.at(-1)?.fee ?? 0;
}
