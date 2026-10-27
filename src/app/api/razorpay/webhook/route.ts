import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayEvent = {
  event: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

/** Backup to the client-side confirmation: marks orders paid even if the shopper closes the tab. */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(body, signature)) return new Response("invalid signature", { status: 400 });

  const event = JSON.parse(body) as RazorpayEvent;
  const payment = event.payload?.payment?.entity;
  if (payment?.order_id) {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      await db.order.updateMany({ where: { razorpayOrderId: payment.order_id }, data: { paymentStatus: "PAID", razorpayPaymentId: payment.id } });
    } else if (event.event === "payment.failed") {
      await db.order.updateMany({ where: { razorpayOrderId: payment.order_id, paymentStatus: "UNPAID" }, data: { paymentStatus: "FAILED" } });
    }
  }
  return new Response("ok");
}
