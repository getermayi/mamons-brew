"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { SETTINGS_TABS } from "@/admin/settings-fields";
import { adminAction } from "@/lib/admin-action";
import { db } from "@/lib/db";
import { fieldsSchema } from "@/lib/fields";
import type { Prisma } from "@/generated/prisma/client";
import { ActionError } from "@/lib/session";
import { TAGS } from "@/lib/tags";

type V = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const strOrNull = (v: unknown) => str(v) || null;
const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function saveSettings(tab: string, values: V) {
  return adminAction("OWNER", async () => {
    const def = SETTINGS_TABS.find((t) => t.key === tab);
    if (!def) throw new ActionError("Unknown settings section.");
    const v = fieldsSchema(def.fields).parse(values) as V;
    const tags: string[] = [TAGS.settings];

    switch (tab) {
      case "brand":
        await db.siteSettings.update({ where: { id: "site" }, data: { brandName: str(v.brandName), brandStyled: str(v.brandStyled), tagline: str(v.tagline), missionLine: str(v.missionLine), logoUrl: strOrNull(v.logoUrl), logoDarkUrl: strOrNull(v.logoDarkUrl), faviconUrl: strOrNull(v.faviconUrl), ogImageUrl: strOrNull(v.ogImageUrl) } });
        break;
      case "contact":
        await db.siteSettings.update({
          where: { id: "site" },
          data: {
            whatsapp: str(v.whatsapp), phone: str(v.phone), email: strOrNull(v.email), fssai: strOrNull(v.fssai), address: str(v.address), city: str(v.city), region: str(v.region), postalCode: strOrNull(v.postalCode),
            hours: json(v.hours), socials: { instagram: str(v.instagram), facebook: str(v.facebook), youtube: str(v.youtube), x: str(v.x) },
          },
        });
        break;
      case "theme":
        await db.themeSettings.upsert({
          where: { id: "theme" },
          create: { id: "theme", forest: str(v.forest), brandRed: str(v.brandRed), sky: str(v.sky), cream: str(v.cream), ink: str(v.ink), displayFont: str(v.displayFont), sansFont: str(v.sansFont), radius: Number(v.radius), grain: v.grain === true },
          update: { forest: str(v.forest), brandRed: str(v.brandRed), sky: str(v.sky), cream: str(v.cream), ink: str(v.ink), displayFont: str(v.displayFont), sansFont: str(v.sansFont), radius: Number(v.radius), grain: v.grain === true },
        });
        tags.push(TAGS.theme);
        break;
      case "announcement":
        await db.siteSettings.update({ where: { id: "site" }, data: { announcement: { enabled: v.enabled === true, text: str(v.text), linkLabel: str(v.linkLabel), href: str(v.href), bg: str(v.bg), fg: str(v.fg) } } });
        break;
      case "features": {
        const { animation, ...flags } = v;
        await db.siteSettings.update({ where: { id: "site" }, data: { features: json(flags), animation: z.enum(["FULL", "REDUCED", "OFF"]).parse(animation) } });
        tags.push(TAGS.pages);
        break;
      }
      case "orders":
        if (v.deliveryEnabled !== true && v.pickupEnabled !== true) throw new ActionError("Keep at least one of delivery or pickup switched on.");
        await db.siteSettings.update({
          where: { id: "site" },
          data: { whatsappTemplate: str(v.whatsappTemplate), deliveryZones: json(v.deliveryZones), minOrderValue: Number(v.minOrderValue) || 0, freeDeliveryAbove: typeof v.freeDeliveryAbove === "number" ? v.freeDeliveryAbove : null, deliveryEnabled: v.deliveryEnabled === true, pickupEnabled: v.pickupEnabled === true, pickupAddress: strOrNull(v.pickupAddress) },
        });
        break;
    }
    return { data: null, tags, audit: { action: "update", entity: "Settings", summary: `Updated ${def.label.toLowerCase()} settings` }, message: "Saved — live on the site." };
  });
}

// ─── Navigation ─────────────────────────────────────────────────────

const navSchema = z.array(z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(300),
  children: z.array(z.object({ label: z.string().trim().min(1).max(60), href: z.string().trim().min(1).max(300) })).max(20).default([]),
})).max(20);

export async function saveNavigation(key: "header" | "footer", values: V) {
  return adminAction("EDITOR", async () => {
    const items = navSchema.parse(values.items);
    await db.$transaction(async (tx) => {
      const menu = await tx.navigationMenu.upsert({ where: { key }, create: { key, name: key === "header" ? "Header menu" : "Footer menu" }, update: {} });
      await tx.navItem.deleteMany({ where: { menuId: menu.id } });
      for (const [order, it] of items.entries()) {
        const parent = await tx.navItem.create({ data: { menuId: menu.id, label: it.label, href: it.href, order } });
        for (const [co, c] of it.children.entries()) await tx.navItem.create({ data: { menuId: menu.id, parentId: parent.id, label: c.label, href: c.href, order: co } });
      }
    });
    return { data: null, tags: [TAGS.nav], audit: { action: "update", entity: "Navigation", summary: `Updated the ${key} menu` }, message: "Menu saved — live on the site." };
  });
}

// ─── Users ──────────────────────────────────────────────────────────

const tempPassword = () => `Brew-${randomBytes(6).toString("base64url")}`;

export async function inviteUser(input: unknown) {
  return adminAction<{ password: string }>("OWNER", async () => {
    const v = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email(), role: z.enum(["OWNER", "EDITOR", "VIEWER"]) }).parse(input);
    const password = tempPassword();
    await db.user.create({ data: { name: v.name, email: v.email.toLowerCase(), role: v.role, passwordHash: await bcrypt.hash(password, 12) } });
    return { data: { password }, audit: { action: "invite", entity: "User", summary: `Invited ${v.email} as ${v.role.toLowerCase()}` } };
  });
}

export async function updateUser(id: string, input: unknown) {
  return adminAction("OWNER", async (me) => {
    const v = z.object({ role: z.enum(["OWNER", "EDITOR", "VIEWER"]), active: z.boolean() }).parse(input);
    if (id === me.id && (v.role !== "OWNER" || !v.active)) throw new ActionError("You can't remove your own owner access.");
    if (v.role !== "OWNER" || !v.active) {
      const owners = await db.user.count({ where: { role: "OWNER", active: true, id: { not: id } } });
      if (!owners) throw new ActionError("There must always be at least one active owner.");
    }
    const u = await db.user.update({ where: { id }, data: v });
    return { data: null, audit: { action: "update", entity: "User", entityId: id, summary: `Set ${u.email} to ${v.role.toLowerCase()}${v.active ? "" : " (deactivated)"}` }, message: "User updated" };
  });
}

export async function resetUserPassword(id: string) {
  return adminAction<{ password: string }>("OWNER", async () => {
    const password = tempPassword();
    const u = await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
    return { data: { password }, audit: { action: "reset-password", entity: "User", entityId: id, summary: `Reset password for ${u.email}` } };
  });
}

export async function changeOwnPassword(input: unknown) {
  return adminAction("VIEWER", async (me) => {
    const v = z.object({ current: z.string().min(1), next: z.string().min(10, "Use at least 10 characters").max(200) }).parse(input);
    const u = await db.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!(await bcrypt.compare(v.current, u.passwordHash))) throw new ActionError("Your current password is incorrect.");
    await db.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(v.next, 12) } });
    return { data: null, audit: { action: "change-password", entity: "User", entityId: me.id, summary: "Changed their password" }, message: "Password changed" };
  });
}
