import { AEmpty, Badge, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function ActivityPage() {
  await requireAdmin();
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { name: true } } } });
  return (
    <>
      <PageHeader title="Activity log" description="Who changed what, and when. The latest 300 actions." />
      {logs.length ? (
        <ol className="divide-y divide-a-line rounded-2xl border border-a-line bg-a-panel">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-4">
              <span className="w-40 shrink-0 text-xs tabular-nums text-a-muted">{formatDate(l.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
              <span className="w-36 shrink-0 font-medium">{l.user?.name ?? "System"}</span>
              <span className="flex-1">{l.summary}</span>
              <Badge>{l.entity}</Badge>
            </li>
          ))}
        </ol>
      ) : <AEmpty title="Nothing logged yet" body="Sign-ins and every save in the admin will appear here." />}
    </>
  );
}
