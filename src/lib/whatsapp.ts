import { formatINR } from "@/lib/utils";

export type OrderMessageInput = {
  number: string;
  items: { name: string; variantLabel?: string | null; quantity: number; unitPrice: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  name: string;
  phone: string;
  fulfilment: "DELIVERY" | "PICKUP";
  area: string;
  address?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
};

/** Fills the owner-editable template. Unknown {variables} are left as-is so typos are visible. */
export function renderOrderMessage(template: string, o: OrderMessageInput) {
  const items = o.items.map((i) => `• ${i.quantity} × ${i.name}${i.variantLabel && i.variantLabel !== "Single bottle" ? ` (${i.variantLabel})` : ""} — ${formatINR(i.unitPrice * i.quantity)}`).join("\n");
  const vars: Record<string, string> = {
    orderId: o.number,
    items,
    subtotal: formatINR(o.subtotal),
    discount: o.discount ? `−${formatINR(o.discount)}` : "—",
    delivery: o.fulfilment === "PICKUP" ? "Pickup" : o.deliveryFee ? formatINR(o.deliveryFee) : "Free",
    total: formatINR(o.total),
    name: o.name,
    phone: o.phone,
    fulfilment: o.fulfilment === "PICKUP" ? "Pickup" : "Delivery",
    area: o.area,
    address: o.address || "—",
    date: o.preferredDate || (o.preferredTime ? "" : "Any time"),
    time: o.preferredTime || "",
    notes: o.notes || "—",
  };
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match).replace(/\n{3,}/g, "\n\n").trim();
}
