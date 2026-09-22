"use client";
import { useEffect, useState, useCallback } from "react";
import { listBakeries, listItems, subscribe, getRecentSearches, pushRecentSearch } from "@/lib/data";
import type { Bakery, Item } from "@/lib/types";
import { ItemCard } from "./ItemCard";
import { Card, Pill } from "./Card";
import { Search as SearchIcon, Clock, Sparkles } from "lucide-react";

const CATS = ["All", "Cakes", "Pastries", "Sweets", "Bread", "Biscuits", "Magic Bag"];
const SUGGESTIONS = ["choco", "khaja", "croissant", "brownie", "petha", "buttercream", "Pineapple", "Magic"];

export function SearchClient() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const load = useCallback(async () => {
    const [b, i] = await Promise.all([listBakeries(), listItems()]);
    setBakeries(b); setItems(i);
    setRecent(getRecentSearches());
  }, []);
  useEffect(() => {
    load();
    const unsub = subscribe(load);
    return unsub;
  }, [load]);

  const name = (id: string) => bakeries.find((b) => b.id === id)?.name ?? "";
  const area = (id: string) => bakeries.find((b) => b.id === id)?.area ?? "";
  const filtered = items.filter((i) => {
    if (cat !== "All" && i.category !== cat) return false;
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      i.name.toLowerCase().includes(needle) ||
      i.description.toLowerCase().includes(needle) ||
      area(i.bakeryId).toLowerCase().includes(needle) ||
      name(i.bakeryId).toLowerCase().includes(needle)
    );
  });

  return (
    <div>
      <Card className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex items-center gap-2 flex-1 bg-white border border-lavender-soft rounded-pill px-4 py-2.5">
          <SearchIcon size={18} className="text-cocoa-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { setRecent(pushRecentSearch(q)); } }}
            placeholder="Try 'choco', 'khaja', 'Bhagalpur' or 'Rajendra Nagar'…"
            className="flex-1 bg-transparent outline-none font-sans text-sm text-cocoa"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-pill font-sans font-semibold text-xs transition ${cat === c ? "bg-peach text-cocoa shadow-soft" : "bg-white/70 text-cocoa-soft hover:bg-lavender-soft"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Suggestions + recents */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {recent.length > 0 && (
          <>
            <span className="font-sans text-xs text-cocoa-soft inline-flex items-center gap-1"><Clock size={12} /> Recent:</span>
            {recent.map((r) => (
              <button key={r} onClick={() => { setQ(r); }} className="px-2.5 py-1 rounded-pill bg-lavender-soft text-plum font-sans text-xs hover:bg-lavender">
                {r}
              </button>
            ))}
          </>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="font-sans text-xs text-cocoa-soft inline-flex items-center gap-1"><Sparkles size={12} /> Try:</span>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => { setQ(s); setRecent(pushRecentSearch(s)); }} className="px-2.5 py-1 rounded-pill bg-peach-soft text-cocoa hover:bg-peach font-sans text-xs">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 mb-2 flex items-center gap-2">
        <Pill tone="soft">{filtered.length} matches</Pill>
        {q && <Pill tone="mint">🔎 "{q}"</Pill>}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-6xl animate-wiggle">🥐</div>
          <h3 className="font-display font-bold text-xl text-cocoa mt-3">Nothing dreamy matches that yet 💤</h3>
          <p className="font-sans text-sm text-cocoa-soft mt-2">Try another flavour or area — bakeries add items hourly.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((i) => <ItemCard key={i.id} item={i} bakeryName={name(i.bakeryId)} />)}
        </div>
      )}
    </div>
  );
}
