"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { track } from "@/lib/track-client";

export type CartLine = {
  key: string;
  kind: "variant" | "bundle";
  id: string;
  name: string;
  label: string;
  price: number;
  accent: string;
  href: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  pulse: number;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mamon-cart-v1";
const MAX_QTY = 48;

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartLine[]).filter((l) => typeof l?.id === "string" && typeof l?.quantity === "number") : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    // Hydrate from storage after mount so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser storage
    setLines(load());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setLines(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode — cart still works for this visit */
    }
  }, [lines, ready]);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    const key = `${line.kind}:${line.id}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) return prev.map((l) => (l.key === key ? { ...l, ...line, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l));
      return [...prev, { ...line, key, quantity: Math.min(MAX_QTY, quantity) }];
    });
    setPulse((p) => p + 1);
    track("add_to_cart", line.name);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l))));
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    return { lines, count, subtotal, ready, open, pulse, setOpen, add, setQuantity, remove, clear };
  }, [lines, ready, open, pulse, add, setQuantity, remove, clear]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
