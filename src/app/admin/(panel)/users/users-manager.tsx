"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changeOwnPassword, inviteUser, resetUserPassword, updateUser } from "@/app/admin/actions/settings";
import { AButton, AInput, ALabel, ASelect, ASwitch, Badge, Card } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

type U = { id: string; name: string; email: string; role: "OWNER" | "EDITOR" | "VIEWER"; active: boolean; lastLoginAt: string | null };

export function UsersManager({ users, meId }: { users: U[]; meId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "EDITOR" as U["role"] });
  const [pw, setPw] = useState({ current: "", next: "" });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <Card title="Team">
        <ul className="divide-y divide-a-line">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{u.name} {u.id === meId ? <Badge>You</Badge> : null} {!u.active ? <Badge tone="red">Deactivated</Badge> : null}</p>
                <p className="text-sm text-a-muted">{u.email} · {u.lastLoginAt ? `last signed in ${formatDate(u.lastLoginAt)}` : "never signed in"}</p>
              </div>
              <div className="flex items-center gap-2">
                <ASelect aria-label={`Role for ${u.name}`} value={u.role} disabled={pending} className="w-32" onChange={(e) => start(async () => { const r = await updateUser(u.id, { role: e.target.value, active: u.active }); if (r.ok) { toast.success("Role updated"); router.refresh(); } else toast.error(r.error); })}>
                  <option value="OWNER">Owner</option><option value="EDITOR">Editor</option><option value="VIEWER">Viewer</option>
                </ASelect>
                <ASwitch label={u.active ? "Deactivate" : "Activate"} checked={u.active} disabled={pending} onChange={(v) => start(async () => { const r = await updateUser(u.id, { role: u.role, active: v }); if (r.ok) { toast.success(v ? "Activated" : "Deactivated"); router.refresh(); } else toast.error(r.error); })} />
                {u.id !== meId ? <AButton size="sm" disabled={pending} onClick={() => window.confirm(`Reset ${u.name}'s password?`) && start(async () => { const r = await resetUserPassword(u.id); if (r.ok) setSecret({ email: u.email, password: r.data.password }); else toast.error(r.error); })}>Reset password</AButton> : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-6">
        {secret ? (
          <Card title="Share this password" description="Shown once. Send it privately — they can change it after signing in.">
            <p className="text-sm">{secret.email}</p>
            <p className="mt-2 select-all rounded-xl bg-a-hover px-3 py-2 font-mono text-sm">{secret.password}</p>
            <div className="mt-3 flex gap-2"><AButton size="sm" onClick={() => { void navigator.clipboard.writeText(secret.password); toast.success("Copied"); }}>Copy</AButton><AButton size="sm" variant="ghost" onClick={() => setSecret(null)}>Done</AButton></div>
          </Card>
        ) : null}
        <Card title="Invite someone">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await inviteUser(form); if (r.ok) { setSecret({ email: form.email, password: r.data.password }); setForm({ name: "", email: "", role: "EDITOR" }); router.refresh(); } else toast.error(r.error); }); }}>
            <div><ALabel htmlFor="iv-name">Name</ALabel><AInput id="iv-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><ALabel htmlFor="iv-email">Email</ALabel><AInput id="iv-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><ALabel htmlFor="iv-role">Role</ALabel><ASelect id="iv-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as U["role"] })}><option value="EDITOR">Editor</option><option value="VIEWER">Viewer</option><option value="OWNER">Owner</option></ASelect></div>
            <AButton type="submit" variant="primary" disabled={pending} className="w-full">Create account</AButton>
          </form>
        </Card>
        <Card title="Change your password">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await changeOwnPassword(pw); if (r.ok) { toast.success("Password changed"); setPw({ current: "", next: "" }); } else toast.error(r.fieldErrors?.next ?? r.error); }); }}>
            <div><ALabel htmlFor="pw-cur">Current password</ALabel><AInput id="pw-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
            <div><ALabel htmlFor="pw-new" hint="10+ characters">New password</ALabel><AInput id="pw-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
            <AButton type="submit" disabled={pending} className="w-full">Update password</AButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
