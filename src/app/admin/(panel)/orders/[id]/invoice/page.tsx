import { notFound } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate, formatINR } from "@/lib/utils";
import { PrintButton } from "./print-button";

export default async function InvoicePage({ params }: PageProps<"/admin/orders/[id]/invoice">) {
  const { id } = await params;
  await requireAdmin();
  const [o, s] = await Promise.all([db.order.findUnique({ where: { id }, include: { items: true } }), db.siteSettings.findUnique({ where: { id: "site" } })]);
  if (!o || !s) notFound();

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-a-line bg-white p-8 text-[#141613] print:border-0 print:p-0 sm:p-12">
      <div className="no-print mb-8 flex justify-end"><PrintButton /></div>
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoMark className="size-12 text-[#141613]" />
          <div>
            <p className="font-display text-2xl">{s.brandName}</p>
            <p className="text-xs text-[#6b6b63]">{s.address}, {s.city}, {s.region} {s.postalCode}</p>
            <p className="text-xs text-[#6b6b63]">{s.phone}{s.fssai ? ` · FSSAI ${s.fssai}` : ""}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-[#A8242C]">Invoice</p>
          <p className="text-xl font-semibold">{o.number}</p>
          <p className="text-sm text-[#6b6b63]">{formatDate(o.createdAt)}</p>
        </div>
      </header>
      <section className="mt-10 grid grid-cols-2 gap-6 text-sm">
        <div><p className="text-xs uppercase tracking-wider text-[#6b6b63]">Billed to</p><p className="mt-1 font-medium">{o.name}</p><p>{o.phone}</p>{o.email ? <p>{o.email}</p> : null}</div>
        <div><p className="text-xs uppercase tracking-wider text-[#6b6b63]">{o.fulfilment === "PICKUP" ? "Pickup" : "Deliver to"}</p><p className="mt-1">{o.area}</p>{o.address ? <p className="whitespace-pre-line">{o.address}</p> : null}</div>
      </section>
      <table className="mt-10 w-full text-sm">
        <thead><tr className="border-b border-[#141613] text-left text-xs uppercase tracking-wider"><th className="py-2">Item</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th></tr></thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id} className="border-b border-[#e6e1d6]"><td className="py-2.5">{i.name}{i.variantLabel ? <span className="text-[#6b6b63]"> · {i.variantLabel}</span> : null}</td><td className="py-2.5 text-right tabular-nums">{i.quantity}</td><td className="py-2.5 text-right tabular-nums">{formatINR(i.unitPrice)}</td><td className="py-2.5 text-right tabular-nums">{formatINR(i.unitPrice * i.quantity)}</td></tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto mt-6 w-64 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatINR(o.subtotal)}</dd></div>
        {o.discount ? <div className="flex justify-between"><dt>Discount</dt><dd className="tabular-nums">−{formatINR(o.discount)}</dd></div> : null}
        <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{o.deliveryFee ? formatINR(o.deliveryFee) : "Free"}</dd></div>
        <div className="flex justify-between border-t border-[#141613] pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatINR(o.total)}</dd></div>
        <div className="flex justify-between text-xs text-[#6b6b63]"><dt>Payment</dt><dd>{o.paymentStatus === "PAID" ? "Paid" : "Due"}</dd></div>
      </dl>
      <footer className="mt-14 border-t border-[#e6e1d6] pt-6 text-center text-xs text-[#6b6b63]">
        Thank you for choosing {s.brandName} 🍀 Keep refrigerated · Return your bottles for credit · {s.missionLine}
      </footer>
    </div>
  );
}
