"use client";

import { Command } from "cmdk";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { logout } from "@/app/admin/actions/session";
import { ADMIN_NAV } from "@/admin/nav";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { AIcon } from "./icon";

type User = { name: string; email: string; role: "OWNER" | "EDITOR" | "VIEWER" };
type Badges = { orders: number; enquiries: number; subscriptions: number };
const rank = { VIEWER: 0, EDITOR: 1, OWNER: 2 } as const;

export function AdminShell({ user, badges, children }: { user: User; badges: Badges; children: ReactNode }) {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mb-admin-theme");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved theme once in the browser
      setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the drawer on navigation
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggleDark = () => {
    setDark((d) => {
      try { localStorage.setItem("mb-admin-theme", d ? "light" : "dark"); } catch { /* ignore */ }
      return !d;
    });
  };

  const nav = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.minRole || rank[user.role] >= rank[i.minRole]) })).filter((g) => g.items.length);

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark className="size-8 text-a-text" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Mamon Brews</p>
          <p className="text-[11px] text-a-muted">Admin</p>
        </div>
      </div>
      <button type="button" onClick={() => setPaletteOpen(true)} className="mx-3 mb-3 flex h-9 items-center gap-2 rounded-xl border border-a-line bg-a-bg px-3 text-sm text-a-muted hover:text-a-text">
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        Search…
        <kbd className="ml-auto rounded border border-a-line px-1.5 text-[10px]">⌘K</kbd>
      </button>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6" data-lenis-prevent>
        {nav.map((g) => (
          <div key={g.label}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-a-muted">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                const count = i.badgeKey ? badges[i.badgeKey] : 0;
                return (
                  <li key={i.href}>
                    <Link href={i.href} aria-current={active ? "page" : undefined} className={cn("flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-sm transition-colors", active ? "bg-a-accent text-a-accent-ink" : "text-a-text hover:bg-a-hover")}>
                      <AIcon name={i.icon} />
                      <span className="flex-1 truncate">{i.label}</span>
                      {count ? <span className={cn("rounded-full px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-a-accent-ink/20" : "bg-[#f04438] text-white")}>{count}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-a-line p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <span className="grid size-8 place-items-center rounded-full bg-a-hover text-sm font-semibold">{user.name.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-a-muted">{user.role.toLowerCase()} · {user.email}</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <button type="button" onClick={toggleDark} className="h-8 rounded-lg border border-a-line text-xs hover:bg-a-hover" aria-label="Toggle dark mode">{dark ? "☀ Light" : "☾ Dark"}</button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="grid h-8 place-items-center rounded-lg border border-a-line text-xs hover:bg-a-hover">View site ↗</a>
          <form action={logout}><button type="submit" className="h-8 w-full rounded-lg border border-a-line text-xs hover:bg-a-hover">Sign out</button></form>
        </div>
      </div>
    </nav>
  );

  return (
    <div className={cn("admin-root min-h-svh", dark && "dark")}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-a-line bg-a-panel lg:block">{sidebar}</aside>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
          <Dialog.Content aria-describedby={undefined} className={cn("admin-root fixed inset-y-0 left-0 z-50 w-[84vw] max-w-72 border-r border-a-line bg-a-panel lg:hidden", dark && "dark")}>
            <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
            {sidebar}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-a-line bg-a-bg/85 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-xl border border-a-line" aria-label="Open menu">
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <LogoMark className="size-7 text-a-text" />
          <span className="font-semibold">Admin</span>
          <button type="button" onClick={() => setPaletteOpen(true)} className="ml-auto grid size-10 place-items-center rounded-xl border border-a-line" aria-label="Search">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </header>
        <main id="admin-main" className="mx-auto max-w-[88rem] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} nav={nav} onToggleDark={toggleDark} dark={dark} />
      <Toaster position="top-center" theme={dark ? "dark" : "light"} richColors closeButton />
    </div>
  );
}

function CommandPalette({ open, onOpenChange, nav, onToggleDark, dark }: { open: boolean; onOpenChange: (o: boolean) => void; nav: typeof ADMIN_NAV; onToggleDark: () => void; dark: boolean }) {
  const router = useRouter();
  const go = (href: string) => { onOpenChange(false); router.push(href); };
  const item = "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-a-hover";
  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command menu" overlayClassName="fixed inset-0 z-50 bg-black/40" contentClassName={cn("admin-root fixed left-1/2 top-[12vh] z-50 w-[min(36rem,94vw)] -translate-x-1/2 overflow-hidden rounded-2xl border border-a-line bg-a-panel shadow-2xl", dark && "dark")}>
      <Command.Input placeholder="Jump to… or type an action" className="h-14 w-full border-b border-a-line bg-transparent px-5 text-base outline-none placeholder:text-a-muted" />
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="p-6 text-center text-sm text-a-muted">Nothing found.</Command.Empty>
        <Command.Group heading="Quick actions" className="text-[11px] text-a-muted [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
          <Command.Item className={item} onSelect={() => go("/admin/orders?status=NEW")}>📦 New orders</Command.Item>
          <Command.Item className={item} onSelect={() => go("/admin/c/flavours/new")}>＋ Add a flavour</Command.Item>
          <Command.Item className={item} onSelect={() => go("/admin/c/journal/new")}>✎ Write a journal post</Command.Item>
          <Command.Item className={item} onSelect={() => go("/admin/c/events/new")}>📅 Add an event</Command.Item>
          <Command.Item className={item} onSelect={() => go("/admin/settings#announcement")}>📣 Edit announcement bar</Command.Item>
          <Command.Item className={item} onSelect={() => go("/admin/media")}>🖼 Upload photos</Command.Item>
          <Command.Item className={item} onSelect={() => { onToggleDark(); onOpenChange(false); }}>{dark ? "☀ Switch to light mode" : "☾ Switch to dark mode"}</Command.Item>
          <Command.Item className={item} onSelect={() => { onOpenChange(false); window.open("/", "_blank"); }}>↗ View the website</Command.Item>
        </Command.Group>
        {nav.map((g) => (
          <Command.Group key={g.label} heading={g.label} className="text-[11px] text-a-muted [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
            {g.items.map((i) => (
              <Command.Item key={i.href} value={`${g.label} ${i.label}`} className={cn(item, "text-a-text")} onSelect={() => go(i.href)}>
                <AIcon name={i.icon} /> {i.label}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
