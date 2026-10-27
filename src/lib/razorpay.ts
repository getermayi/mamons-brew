import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export function razorpayConfigured() {
  return Boolean(keyId && keySecret);
}

export function razorpayPublicKey() {
  return keyId ?? "";
}

/** Creates a Razorpay order via the REST API (amount in paise). */
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  if (!keyId || !keySecret) throw new Error("Razorpay keys are not configured");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` },
    body: JSON.stringify({ amount: amountRupees * 100, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed: ${res.status}`);
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return data;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(body: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return safeEqual(expected, signature);
}
