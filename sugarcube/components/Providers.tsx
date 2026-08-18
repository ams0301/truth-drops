"use client";
import { LocationProvider } from "./LocationProvider";
import { Toaster } from "./Toaster";
import { FloatingDecor } from "./FloatingDecor";
import { CartProvider } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "./CartProvider";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

function FloatingCartBadge() {
  const { count, open } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count === 0) return null;
  return (
    <button
      onClick={open}
      aria-label={`Open cart, ${count} items`}
      className="fixed z-40 bottom-6 right-6 inline-flex items-center gap-2 bg-peach text-cocoa font-display font-bold pl-4 pr-5 py-3 rounded-pill shadow-float border border-white/80 animate-pop-in hover:scale-105 transition-transform"
    >
      <ShoppingBag size={18} />
      {count} {count === 1 ? "treat" : "treats"}
      <span className="font-sans text-xs font-normal text-cocoa-soft">· View bag →</span>
    </button>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <CartProvider>
        <FloatingDecor />
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
        <CartDrawer />
        <FloatingCartBadge />
        <Toaster />
      </CartProvider>
    </LocationProvider>
  );
}
