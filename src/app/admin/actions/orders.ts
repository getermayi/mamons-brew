"use server";

import { z } from "zod";
import { adminAction } from "@/lib/admin-action";
import { db } from "@/lib/db";

const statuses = ["NEW", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
const label: Record<(typeof statuses)[number], string> = { NEW: "New", CONFIRMED: "Confirmed", OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

export async function setOrderStatus(id: string, status: string) {
  return adminAction("EDITOR", async () => {
    const s = z.enum(statuses).parse(status);
    const o = await db.order.update({ where: { id }, data: { status: s } });
    return { data: null, audit: { action: "status", entity: "Order", entityId: id, summary: `Marked ${o.number} as ${label[s].toLowerCase()}` }, message: `Marked as ${label[s].toLowerCase()}` };
  });
}

export async function setPaymentStatus(id: string, status: string) {
  return adminAction("EDITOR", async () => {
    const s = z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]).parse(status);
    const o = await db.order.update({ where: { id }, data: { paymentStatus: s } });
    return { data: null, audit: { action: "payment", entity: "Order", entityId: id, summary: `Payment for ${o.number}: ${s.toLowerCase()}` }, message: "Payment updated" };
  });
}

export async function saveOrderNotes(id: string, notes: string) {
  return adminAction("EDITOR", async () => {
    const n = z.string().max(4000).parse(notes);
    await db.order.update({ where: { id }, data: { internalNotes: n || null } });
    return { data: null, message: "Notes saved" };
  });
}
