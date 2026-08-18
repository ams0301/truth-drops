"use client";
import { useEffect, useState, useCallback } from "react";
import { listBakeries, listItems, subscribe } from "@/lib/data";
import type { Bakery, Item } from "@/lib/types";
import { ItemCard } from "./ItemCard";

export function MagicBags() {
  const [bags, setBags] = useState<Item[] | null>(null);
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [highlight, setHighlight] = useState(true);

  const load = useCallback(async () => {
    const [items, b] = await Promise.all([listItems(), listBakeries()]);
    setBakeries(b);
    setBags(items.filter((i) => i.category === "Magic Bag"));
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribe(load);
    return unsub;
  }, [load]);

  const name = (id: string) => bakeries.find((b) => b.id === id)?.name;

  if (bags === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-bubble bg-white/60 border p-5 animate-pulse h-64" />
        ))}
      </div>
    );
  }
  if (highlight && bags.length > 0) {
    return (
      <>
        <div className="rounded-bubble bg-gradient-to-br from-rose via-peach to-butter text-cocoa border border-white/70 shadow-float p-8 text-center mb-7 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-7xl opacity-40 animate-float">🎁</div>
          <div className="relative">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl">Why Magic Bags rock 🌈</h2>
            <p className="font-sans text-sm mt-2 max-w-md mx-auto opacity-90">
              A dreamy surprise mix chosen by the bakery — biggest discounts, zero decision fatigue,
              and the best chance of clearing the shelf. Tap "View today's bags" below.
            </p>
            <button
              onClick={() => setHighlight(false)}
              className="mt-4 font-display font-semibold bg-white text-cocoa px-5 py-2.5 rounded-pill shadow-soft hover:scale-105 transition"
            >
              View today's bags →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bags.slice(0, 3).map((b) => <ItemCard key={b.id} item={b} bakeryName={name(b.bakeryId)} />)}
        </div>
      </>
    );
  }
  if (bags.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-bubble bg-white/60 border border-white/80 shadow-soft">
        <div className="text-7xl animate-wiggle">🎁</div>
        <h3 className="font-display font-bold text-xl text-cocoa mt-3">No Magic Bags tonight 💤</h3>
        <p className="font-sans text-sm text-cocoa-soft mt-2 max-w-sm mx-auto">
          Bakeries decide surprise bags at the last moment — peek in again at 8 PM!
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {bags.map((b) => <ItemCard key={b.id} item={b} bakeryName={name(b.bakeryId)} />)}
    </div>
  );
}
