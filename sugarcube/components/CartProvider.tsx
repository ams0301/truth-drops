"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addToCart, getCart, setCartQty, clearCart, subscribe,
  cartCount,
} from "@/lib/data";
import type { CartLine } from "@/lib/types";
import { getItem } from "@/lib/data";
import type { Item } from "@/lib/types";

export type CartLineLive = CartLine & { item: Item };

type CartCtx = {
  lines: CartLineLive[];
  count: number;
  total: number;
  bakeryId: string | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (itemId: string, qty?: number) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLineLive[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(async () => {
    const cart = getCart();
    const items = await Promise.all(cart.map((l) => getItem(l.itemId)));
    const live: CartLineLive[] = cart
      .map((l, i) => (items[i] ? { ...l, item: items[i]! } : null))
      .filter((x): x is CartLineLive => x !== null);
    setLines(live);
  }, []);

  useEffect(() => { load(); const unsub = subscribe(load); return unsub; }, [load]);

  const add = useCallback(async (itemId: string, qty = 1) => {
    const incoming = await getItem(itemId);
    if (!incoming) return;
    const currentBakery = lines[0]?.item.bakeryId;
    if (currentBakery && currentBakery !== incoming.bakeryId) {
      // auto-swap, replacing previous bakery's items
      clearCart();
    }
    addToCart(itemId, qty);
    await load();
    setIsOpen(true);
  }, [lines, load]);

  const setQty = useCallback(async (itemId: string, qty: number) => {
    setCartQty(itemId, qty);
    await load();
  }, [load]);

  const value: CartCtx = {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + l.item.rescuePrice * l.qty, 0),
    bakeryId: lines[0]?.item.bakeryId ?? null,
    isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false),
    add, setQty, clear: () => { clearCart(); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
