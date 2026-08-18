"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listBakeries, listItems, subscribe, getFavorites } from "@/lib/data";
import type { Bakery, Item } from "@/lib/types";
import { BakeryCard } from "./BakeryCard";
import { ItemCard } from "./ItemCard";
import { ItemSkeleton } from "./ItemCard";
import { CityMapView } from "./CityMapView";
import { Pill } from "./Card";
import { cn } from "@/lib/utils";
import { Filter, MapPin, ShoppingBag, Grid3x3, Gift } from "lucide-react";

type Sort = "closing" | "lowest" | "highest-discount";
type V = "bags" | "treats" | "map";

const VEG_FILTERS = ["All", "Veg only", "Magic bags"] as const;

export function Discover() {
  const [bakeries, setBakeries] = useState<Bakery[] | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [v, setV] = useState<V>("bags");
  const [sort, setSort] = useState<Sort>("closing");
  const [veg, setVeg] = useState<(typeof VEG_FILTERS)[number]>("All");
  const [maxPrice, setMaxPrice] = useState(150);
  const [favOnly, setFavOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    const [b, i] = await Promise.all([listBakeries(), listItems()]);
    setBakeries(b);
    setItems(i);
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribe(load);
    return unsub;
  }, [load]);

  const bakeryName = (id: string) => bakeries?.find((b) => b.id === id)?.name;
  const bakeryFor = (i: Item): Bakery | undefined => bakeries?.find((b) => b.id === i.bakeryId);
  const favorites = getFavorites();

  let visible = items ?? [];
  if (v === "bags") visible = visible.filter((i) => i.category === "Magic Bag");
  else if (veg === "Magic bags") visible = visible.filter((i) => i.category === "Magic Bag");
  else if (veg === "Veg only") visible = visible.filter((i) => i.veg);
  if (v !== "bags" && veg !== "Magic bags") {
    visible = visible.filter((i) => i.rescuePrice <= maxPrice);
  }
  if (favOnly) {
    visible = visible.filter((i) => favorites.includes(i.bakeryId));
  }

  // sort
  visible = [...visible].sort((a, b) => {
    if (sort === "lowest") return a.rescuePrice - b.rescuePrice;
    if (sort === "highest-discount") {
      const pa = (a.originalPrice - a.rescuePrice) / a.originalPrice;
      const pb = (b.originalPrice - b.rescuePrice) / b.originalPrice;
      return pb - pa;
    }
    // closing = by bakery rescueWindowEnd ascending
    return (bakeryFor(a)?.rescueWindowEnd ?? "").localeCompare(bakeryFor(b)?.rescueWindowEnd ?? "");
  });

  return (
    <div id="discover" className="max-w-6xl mx-auto px-4 md:px-6 py-10 scroll-mt-20">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa">
            Tonight's dreamy rescues 🍭
          </h2>
          <p className="font-sans text-sm text-cocoa-soft mt-1">
            Bags-first (à la TGTG) — surprise bundles, deals, and a map of nearby bakeries.
          </p>
        </div>
        <div className="inline-flex bg-white/70 border border-lavender-soft rounded-pill p-1" role="tablist">
          <TabBtn active={v === "bags"} onClick={() => setV("bags")} icon={<Gift size={15} />} label="Magic Bags" />
          <TabBtn active={v === "treats"} onClick={() => setV("treats")} icon={<Grid3x3 size={15} />} label="Treats" />
          <TabBtn active={v === "map"} onClick={() => setV("map")} icon={<MapPin size={15} />} label="Map" />
        </div>
      </div>

      {v === "map" ? (
        <CityMapView bakeries={bakeries ?? []} items={items ?? []} />
      ) : (
        <>
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-pill bg-white/80 border border-lavender-soft font-sans font-semibold text-sm text-cocoa hover:bg-lavender-soft"
            >
              <Filter size={14} /> Filters
            </button>
            {showFilters && (
              <>
                <div className="inline-flex bg-white/70 border border-lavender-soft rounded-pill p-1">
                  <SortBtn active={sort === "closing"} onClick={() => setSort("closing")}>Closing soon</SortBtn>
                  <SortBtn active={sort === "lowest"} onClick={() => setSort("lowest")}>Lowest ₹</SortBtn>
                  <SortBtn active={sort === "highest-discount"} onClick={() => setSort("highest-discount")}>Best deal</SortBtn>
                </div>
                <div className="inline-flex bg-white/70 border border-lavender-soft rounded-pill p-1">
                  {VEG_FILTERS.map((f) => (
                    <SortBtn key={f} active={veg === f} onClick={() => setVeg(f)}>{f}</SortBtn>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 bg-white/70 border border-lavender-soft rounded-pill px-3 py-2 font-sans text-xs text-cocoa-soft">
                  Under <b className="text-cocoa">₹{maxPrice}</b>
                  <input type="range" min={20} max={250} step={10} value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="accent-rose" />
                </label>
                <button
                  onClick={() => setFavOnly((f) => !f)}
                  className={cn(
                    "px-3 py-2 rounded-pill font-sans font-semibold text-sm border transition",
                    favOnly ? "bg-rose text-white border-rose" : "bg-white/70 text-cocoa-soft border-lavender-soft hover:bg-rose-soft",
                  )}
                  aria-pressed={favOnly}
                >
                  ❤ Favourites only
                </button>
              </>
            )}
            {!showFilters && (
              <Pill tone="soft">🔎 {visible.length} match{visible.length === 1 ? "" : "es"}</Pill>
            )}
          </div>

          {/* For bags-first: prominently show bakery list sparingly alongside */}
          {v === "bags" && (bakeries === null || items === null) ? (
            <SkeletonGrid />
          ) : v === "bags" ? (
            <>
              {visible.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visible.map((i) => (
                    <ItemCard key={i.id} item={i} bakeryName={bakeryName(i.bakeryId)} />
                  ))}
                </div>
              )}
              <h3 className="mt-10 mb-4 font-display font-bold text-xl text-cocoa flex items-center gap-2">
                <ShoppingBag size={18} /> Or browse à-la-carte
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(items ?? []).filter((i) => i.category !== "Magic Bag").slice(0, 9).map((i) => (
                  <ItemCard key={i.id} item={i} bakeryName={bakeryName(i.bakeryId)} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/magic-bags" className="font-display font-semibold text-sm text-cocoa underline underline-offset-2">
                  View all à-la-carte treats →
                </Link>
              </div>
            </>
          ) : (
            (items === null) ? (
              <SkeletonGrid />
            ) : visible.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visible.map((i) => (
                  <ItemCard key={i.id} item={i} bakeryName={bakeryName(i.bakeryId)} />
                ))}
              </div>
            )
          )}

          {/* Bakery row always at bottom */}
          {bakeries && bakeries.length > 0 && (
            <>
              <h3 className="mt-10 mb-4 font-display font-bold text-xl text-cocoa flex items-center gap-2">
                <MapPin size={18} /> {bakeries.length} bakeries live tonight
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {bakeries.map((b) => (
                  <BakeryCard
                    key={b.id}
                    bakery={b}
                    itemCount={(items ?? []).filter((i) => i.bakeryId === b.id).length}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-pill font-display font-semibold text-sm transition-all inline-flex items-center gap-1.5",
        active ? "bg-peach text-cocoa shadow-soft" : "text-cocoa-soft",
      )}
    >
      {icon}{label}
    </button>
  );
}
function SortBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-pill font-sans text-xs font-semibold transition",
        active ? "bg-peach text-cocoa shadow-soft" : "text-cocoa-soft hover:bg-lavender-soft",
      )}
    >
      {children}
    </button>
  );
}
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => <ItemSkeleton key={i} />)}
    </div>
  );
}
export function EmptyState() {
  return (
    <div className="text-center py-16 px-6 rounded-bubble bg-white/60 border border-white/80 shadow-soft">
      <div className="text-7xl animate-wiggle">🥐</div>
      <h3 className="font-display font-bold text-xl text-cocoa mt-4">
        All the sweets have found homes 💗
      </h3>
      <p className="font-sans text-sm text-cocoa-soft mt-2 max-w-sm mx-auto">
        No treats left to save tonight — they've all gone home with someone dreamy.
        Check back tomorrow at the rescue window!
      </p>
    </div>
  );
}
