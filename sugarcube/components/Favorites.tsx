"use client";
import { useEffect, useState, useCallback } from "react";
import { listFavoriteBakeries, listBakeries, listItems, subscribe } from "@/lib/data";
import type { Bakery, Item } from "@/lib/types";
import { BakeryCard } from "./BakeryCard";
import { Card } from "./Card";
import Link from "next/link";

export function Favorites() {
  const [favBakeries, setFavBakeries] = useState<Bakery[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    const [favs, its] = await Promise.all([listFavoriteBakeries(), listItems()]);
    setFavBakeries(favs);
    setItems(its);
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribe(load);
    return unsub;
  }, [load]);

  if (favBakeries === null) return null;
  if (favBakeries.length === 0) {
    return (
      <Card className="p-10 text-center">
        <div className="text-7xl animate-wiggle">🥐</div>
        <h3 className="font-display font-bold text-xl text-cocoa mt-3">You haven't saved anyone yet 💗</h3>
        <p className="font-sans text-sm text-cocoa-soft mt-2 max-w-sm mx-auto">
          Tap the heart <span className="text-rose">❤</span> on any bakery on Discover to get a heads-up the moment their rescue window opens!
        </p>
        <Link href="/" className="inline-block mt-4 font-display font-semibold px-5 py-2.5 rounded-pill bg-peach text-cocoa">
          🍰 Discover bakeries
        </Link>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favBakeries.map((b) => (
        <BakeryCard key={b.id} bakery={b} itemCount={items.filter((i) => i.bakeryId === b.id).length} />
      ))}
    </div>
  );
}
