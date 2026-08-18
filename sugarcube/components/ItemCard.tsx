"use client";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { Card, Pill } from "./Card";
import { formatINR, discountPct, cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { useToast } from "./Toaster";

export function ItemCard({ item, bakeryName }: { item: Item; bakeryName?: string }) {
  const pct = discountPct(item.originalPrice, item.rescuePrice);
  const low = item.qty <= 2;
  const { add } = useCart();
  const toast = useToast();
  return (
    <Card className="p-5 h-full flex flex-col animate-pop-in">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/items/${item.id}`} className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-5xl">{item.emoji}</div>
        </Link>
        <div className="flex flex-col items-end gap-1">
          <Pill tone={pct >= 60 ? "rose" : pct >= 40 ? "butter" : "lavender"}>
            {pct}% off
          </Pill>
          {item.veg && <Pill tone="mint">🟢 Veg</Pill>}
        </div>
      </div>
      <Link href={`/items/${item.id}`} className="flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-cocoa mt-2 leading-tight">{item.name}</h3>
        {bakeryName && <p className="font-sans text-xs text-cocoa-soft mt-0.5">at {bakeryName}</p>}
        <p className="font-sans text-sm text-plum/80 mt-2 line-clamp-2 flex-1">{item.description}</p>

        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <Pill tone="soft">🏷 {item.category}</Pill>
          {item.category === "Magic Bag" && <Pill tone="rose">🎁 Surprise</Pill>}
          <Pill tone={low ? "rose" : "mint"}>
            {low ? "Only " : ""}{item.qty} left
          </Pill>
        </div>
      </Link>

      <div className="mt-4 flex items-end justify-between border-t border-white/60 pt-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl text-cocoa">{formatINR(item.rescuePrice)}</span>
            <span className="font-sans text-sm text-cocoa-soft line-through">{formatINR(item.originalPrice)}</span>
          </div>
          <p className="font-sans text-[11px] text-cocoa-soft mt-0.5">
            🕒 Baked {item.bakedAt} · Eat by {item.bestBefore}
          </p>
        </div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            if (item.qty <= 0) return;
            await add(item.id, 1);
            toast({ title: `Added ${item.name} to bag 🍮`, emoji: "🍰", tone: "mint" });
          }}
          disabled={item.qty <= 0}
          className={cn(
            "font-display font-semibold text-sm px-4 py-2 rounded-pill transition-all",
            item.qty <= 0
              ? "bg-lavender-soft text-plum opacity-60 cursor-not-allowed"
              : "bg-peach text-cocoa hover:bg-peach/80 active:scale-95",
          )}
        >
          {item.qty <= 0 ? "Gone 💤" : "+ Bag"}
        </button>
      </div>
    </Card>
  );
}

export function ItemSkeleton() {
  return (
    <div className="rounded-bubble bg-white/60 border border-white/80 shadow-soft p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="w-12 h-12 rounded-pill bg-lavender-soft" />
        <div className="w-12 h-6 rounded-pill bg-lavender-soft" />
      </div>
      <div className="h-4 w-3/4 rounded-pill bg-lavender-soft mt-3" />
      <div className="h-3 w-1/2 rounded-pill bg-lavender-soft mt-2" />
      <div className="h-6 w-1/3 rounded-pill bg-peach-soft mt-4" />
    </div>
  );
}
