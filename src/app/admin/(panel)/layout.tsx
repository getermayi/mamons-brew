import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [orders, enquiries, subscriptions] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.subscription.count({ where: { status: "REQUESTED" } }),
  ]);
  return <AdminShell user={{ name: user.name, email: user.email, role: user.role }} badges={{ orders, enquiries, subscriptions }}>{children}</AdminShell>;
}

function ShellSkeleton() {
  return (
    <div className="admin-root min-h-svh">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-a-line bg-a-panel lg:block" />
      <div className="space-y-4 p-10 lg:pl-74"><div className="skeleton h-8 w-60" /><div className="skeleton h-64" /></div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>
        <Suspense fallback={<div className="space-y-4"><div className="skeleton h-8 w-60" /><div className="skeleton h-72" /></div>}>{children}</Suspense>
      </Shell>
    </Suspense>
  );
}
