import type { Metadata } from "next";
import { CheckoutClient } from "@/components/cart/checkout-client";
import { getSettings } from "@/lib/data";
import { razorpayConfigured, razorpayPublicKey } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  const onlinePayments = settings.features.onlinePayments && razorpayConfigured();
  return (
    <section className="container-x py-12 md:py-20">
      <p className="text-eyebrow text-brand">Checkout</p>
      <h1 className="mt-4 text-display">Almost <em className="accent">poured.</em></h1>
      <p className="mt-5 max-w-2xl text-lead text-muted">Tell us where to bring it. We&apos;ll save your order and open WhatsApp with everything filled in — just hit send and we&apos;ll confirm.</p>
      <div className="mt-12">
        <CheckoutClient onlinePayments={onlinePayments} razorpayKey={onlinePayments ? razorpayPublicKey() : ""} />
      </div>
    </section>
  );
}
