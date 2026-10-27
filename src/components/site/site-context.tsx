"use client";

import { createContext, use, type ReactNode } from "react";
import type { Features } from "@/lib/schemas";

export type SiteInfo = {
  brandName: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  features: Features;
  deliveryZones: { name: string; fee: number; eta: string }[];
  minOrderValue: number;
  freeDeliveryAbove: number | null;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  pickupAddress: string | null;
};

const SiteContext = createContext<SiteInfo | null>(null);

export function SiteProvider({ value, children }: { value: SiteInfo; children: ReactNode }) {
  return <SiteContext value={value}>{children}</SiteContext>;
}

export function useSite() {
  const ctx = use(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
