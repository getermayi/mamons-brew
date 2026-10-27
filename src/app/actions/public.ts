"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { confirmToCustomer, notifyOwner } from "@/lib/email";
import { deliveryFeeFor, evaluateDiscount, priceLines } from "@/lib/pricing";
import { createRazorpayOrder, razorpayConfigured, razorpayPublicKey, verifyPaymentSignature } from "@/lib/razorpay";
import { limitForm } from "@/lib/rate-limit";
import { cartLineSchema, checkoutSchema, enquirySchema, newsletterSchema, subscriptionSchema } from "@/lib/schemas";
import { formatINR, waLink } from "@/lib/utils";
import { renderOrderMessage } from "@/lib/whatsapp";

type Result<T = null> = { ok: true; data: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function zodFail(e: z.ZodError): Result<never> {
  const fieldErrors: Record<string, string> = {};
  for (const i of e.issues) fieldErrors[i.path.join(".")] ??= i.message;
  return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
}

const SPAM_OK = { ok: true as const, data: null, message: "Thanks!" };
const normalizePhone = (p: string) => p.replace(/[^\d+]/g, "").replace(/^\+?91(?=\d{10}$)/, "");

// ─── Newsletter ─────────────────────────────────────────────────────

export async function subscribeNewsletter(input: unknown): Promise<Result> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  if (parsed.data.company_website) return SPAM_OK;
  if (!(await limitForm("newsletter", 5))) return { ok: false, error: "Too many tries — please wait a few minutes." };
  const email = parsed.data.email.toLowerCase();
  await db.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: { unsubscribed: false } });
  await db.analyticsEvent.create({ data: { type: "newsletter" } });
  return { ok: true, data: null, message: "You're on the list" };
}

// ─── Enquiries ──────────────────────────────────────────────────────

const enquiryLabels = { BUSINESS: "Wholesale enquiry", EVENT: "Event booking", CONTACT: "Contact message", TASTING: "Tasting session", GIFTING: "Gifting enquiry" } as const;

export async function submitEnquiry(input: unknown): Promise<Result> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  const { company_website, ...data } = parsed.data;
  if (company_website) return SPAM_OK;
  if (!(await limitForm("enquiry", 4))) return { ok: false, error: "You've sent a few messages already — we'll be in touch soon." };

  const enquiry = await db.enquiry.create({ data: { ...data, phone: data.phone || null, email: data.email || null } });
  await db.analyticsEvent.create({ data: { type: "enquiry", label: data.type } });
  await notifyOwner(
    `New ${enquiryLabels[data.type].toLowerCase()} from ${data.name}`,
    enquiryLabels[data.type],
    [["Name", data.name], ["Phone", data.phone ?? "—"], ["Email", data.email ?? "—"], ["Business", [data.businessName, data.businessType].filter(Boolean).join(" · ") || "—"], ["Location", data.location ?? "—"], ["Volume", data.monthlyVolume ?? "—"], ["Date", data.eventDate ?? "—"], ["Message", data.message]],
    `/admin/enquiries?id=${enquiry.id}`,
  );
  return { ok: true, data: null };
}

// ─── Subscriptions ──────────────────────────────────────────────────

export async function submitSubscription(input: unknown): Promise<Result> {
  const settings = await getSettings();
  if (!settings.features.subscriptions) return { ok: false, error: "Subscriptions are paused right now — message us on WhatsApp instead." };
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  const { company_website, ...data } = parsed.data;
  if (company_website) return SPAM_OK;
  if (!(await limitForm("subscription", 3))) return { ok: false, error: "We've got your request already — we'll be in touch." };

  const phone = normalizePhone(data.phone);
  const customer = await db.customer.upsert({ where: { phone }, create: { phone, name: data.name, email: data.email || null, area: data.area, address: data.address }, update: { name: data.name, area: data.area, address: data.address, ...(data.email ? { email: data.email } : {}) } });
  const flavours = data.flavours.filter((f) => f.quantity > 0);
  const bottles = flavours.reduce((n, f) => n + f.quantity, 0);
  const sub = await db.subscription.create({
    data: { customerId: customer.id, name: data.name, phone, email: data.email || null, area: data.area, address: data.address, flavours, frequency: data.frequency, bottles, startDate: data.startDate || null, notes: data.notes || null },
  });
  await notifyOwner(`New subscription request from ${data.name}`, "Subscription request", [["Name", data.name], ["Phone", phone], ["Frequency", data.frequency === "WEEKLY" ? "Weekly" : "Every two weeks"], ["Bottles", flavours.map((f) => `${f.quantity} × ${f.name}`).join(", ")], ["Area", data.area], ["Address", data.address]], `/admin/subscriptions?id=${sub.id}`);
  return { ok: true, data: null };
}

// ─── Checkout ───────────────────────────────────────────────────────

const orderInput = z.object({ lines: z.array(cartLineSchema).min(1, "Your cart is empty").max(30), form: checkoutSchema });

export async function previewTotals(input: { lines: unknown; discountCode?: string; area: string; fulfilment: "DELIVERY" | "PICKUP" }) {
  const lines = z.array(cartLineSchema).max(30).safeParse(input.lines);
  if (!lines.success) return { subtotal: 0, discount: 0, deliveryFee: 0, total: 0, discountError: null, problems: ["Your cart couldn't be read."] };
  const settings = await getSettings();
  const { subtotal, problems } = await priceLines(lines.data);
  const d = await evaluateDiscount(input.discountCode || undefined, subtotal);
  const deliveryFee = deliveryFeeFor(settings.deliveryZones, input.area, input.fulfilment, subtotal - d.amount, settings.freeDeliveryAbove);
  return { subtotal, discount: d.amount, deliveryFee, total: subtotal - d.amount + deliveryFee, discountError: input.discountCode ? d.error : null, problems };
}

export type OrderCreated = {
  number: string;
  total: number;
  whatsappUrl: string;
  razorpay: { key: string; orderId: string; amount: number; name: string; phone: string; email: string | null } | null;
};

export async function createOrder(input: unknown): Promise<Result<OrderCreated>> {
  const parsed = orderInput.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  const { lines, form } = parsed.data;
  if (form.company_website) return { ok: false, error: "Something went wrong — please message us on WhatsApp." };
  if (!(await limitForm("order", 6))) return { ok: false, error: "Too many orders in a short time — please message us on WhatsApp." };

  const settings = await getSettings();
  if (form.fulfilment === "DELIVERY" && !settings.deliveryEnabled) return { ok: false, error: "Delivery is paused right now — please choose pickup." };
  if (form.fulfilment === "PICKUP" && !settings.pickupEnabled) return { ok: false, error: "Pickup isn't available right now — please choose delivery." };
  const payOnline = form.paymentMethod === "RAZORPAY";
  if (payOnline && !(settings.features.onlinePayments && razorpayConfigured())) return { ok: false, error: "Online payment isn't available — choose WhatsApp to confirm." };

  const { priced, subtotal, problems } = await priceLines(lines);
  if (problems.length) return { ok: false, error: problems[0] };
  if (!priced.length) return { ok: false, error: "Your cart is empty." };
  if (form.fulfilment === "DELIVERY" && subtotal < settings.minOrderValue) return { ok: false, error: `Delivery orders start at ${formatINR(settings.minOrderValue)}.` };

  const discount = await evaluateDiscount(form.discountCode || undefined, subtotal);
  if (form.discountCode && discount.error) return { ok: false, error: discount.error, fieldErrors: { discountCode: discount.error } };
  const deliveryFee = deliveryFeeFor(settings.deliveryZones, form.area, form.fulfilment, subtotal - discount.amount, settings.freeDeliveryAbove);
  const total = subtotal - discount.amount + deliveryFee;

  const phone = normalizePhone(form.phone);
  const customer = await db.customer.upsert({
    where: { phone },
    create: { phone, name: form.name, email: form.email || null, area: form.area, address: form.address || null },
    update: { name: form.name, area: form.area, ...(form.address ? { address: form.address } : {}), ...(form.email ? { email: form.email } : {}) },
  });

  let order: { id: string; number: string } | null = null;
  for (let attempt = 0; attempt < 6 && !order; attempt++) {
    const number = `MB-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      order = await db.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            number, customerId: customer.id, name: form.name, phone, email: form.email || null, fulfilment: form.fulfilment, area: form.area,
            address: form.fulfilment === "DELIVERY" ? form.address : settings.pickupAddress, preferredDate: form.preferredDate || null, preferredTime: form.preferredTime || null,
            notes: form.notes || null, subtotal, discount: discount.amount, deliveryFee, total, discountCode: discount.code, paymentMethod: form.paymentMethod,
            items: { create: priced },
          },
          select: { id: true, number: true },
        });
        if (discount.code) await tx.discountCode.update({ where: { code: discount.code }, data: { usedCount: { increment: 1 } } });
        return created;
      });
    } catch (e) {
      if (!(typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002")) throw e;
    }
  }
  if (!order) return { ok: false, error: "We couldn't save your order — please try again." };

  const message = renderOrderMessage(settings.whatsappTemplate, {
    number: order.number, items: priced, subtotal, discount: discount.amount, deliveryFee, total, name: form.name, phone, fulfilment: form.fulfilment,
    area: form.area, address: form.fulfilment === "DELIVERY" ? form.address : settings.pickupAddress, preferredDate: form.preferredDate, preferredTime: form.preferredTime, notes: form.notes,
  });

  await db.analyticsEvent.create({ data: { type: "order", label: order.number } });
  const rows: [string, string][] = [["Order", order.number], ["Items", priced.map((p) => `${p.quantity} × ${p.name}`).join(", ")], ["Total", formatINR(total)], ["Customer", `${form.name} · ${phone}`], [form.fulfilment === "PICKUP" ? "Pickup" : "Delivery", `${form.area}${form.address ? ` — ${form.address}` : ""}`], ["Preferred", [form.preferredDate, form.preferredTime].filter(Boolean).join(" ") || "—"], ["Notes", form.notes || "—"]];
  await notifyOwner(`🍀 New order ${order.number} — ${formatINR(total)}`, `New order ${order.number}`, rows, `/admin/orders/${order.id}`);
  await confirmToCustomer(form.email, `Your Mamon Brews order ${order.number}`, `Thanks, ${form.name.split(" ")[0]}! We've got your order.`, rows);

  let razorpay: OrderCreated["razorpay"] = null;
  if (payOnline) {
    const rp = await createRazorpayOrder(total, order.number);
    await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rp.id } });
    razorpay = { key: razorpayPublicKey(), orderId: rp.id, amount: rp.amount, name: form.name, phone, email: form.email || null };
  }

  return { ok: true, data: { number: order.number, total, whatsappUrl: waLink(settings.whatsapp, message), razorpay } };
}

export async function confirmRazorpayPayment(input: { orderNumber: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<Result> {
  const schema = z.object({ orderNumber: z.string().max(20), razorpay_order_id: z.string().max(60), razorpay_payment_id: z.string().max(60), razorpay_signature: z.string().max(200) });
  const p = schema.safeParse(input);
  if (!p.success) return { ok: false, error: "Payment details were incomplete." };
  if (!verifyPaymentSignature(p.data.razorpay_order_id, p.data.razorpay_payment_id, p.data.razorpay_signature)) return { ok: false, error: "We couldn't verify that payment. If you were charged, message us on WhatsApp." };
  await db.order.updateMany({ where: { number: p.data.orderNumber, razorpayOrderId: p.data.razorpay_order_id }, data: { paymentStatus: "PAID", razorpayPaymentId: p.data.razorpay_payment_id } });
  return { ok: true, data: null };
}
