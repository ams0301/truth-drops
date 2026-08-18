"use client";
import Link from "next/link";
import type { Bakery } from "@/lib/types";
import { Card, Pill } from "./Card";
import { FavoriteButton } from "./FavoriteButton";

export function BakeryCard({ bakery, itemCount }: { bakery: Bakery; itemCount?: number }) {
  const open = bakery.rescueOpen !== false;
  return (
    <div className="relative h-full">
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton bakeryId={bakery.id} size={16} />
      </div>
      <Link href={`/bakeries/${bakery.id}`} className="block h-full">
        <Card accent={bakery.accent} className="p-5 h-full flex flex-col">
          <div className="flex items-start gap-4 pr-12">
            <div className="text-4xl md:text-5xl animate-float">{bakery.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg text-cocoa leading-tight">{bakery.name}</h3>
              <p className="font-sans text-xs text-cocoa-soft mt-0.5">📍 {bakery.area}</p>
              <div className="flex items-center gap-1 mt-1 font-sans text-xs text-cocoa-soft">
                <span className="text-rose font-semibold">★ {bakery.rating}</span>
                <span>· {bakery.reviews} reviews</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bakery.tags.slice(0, 3).map((t) => (
              <Pill key={t} tone="soft">{t}</Pill>
            ))}
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/60">
            <div className="font-sans text-xs text-cocoa-soft">
              🌙 Rescue window <span className="font-semibold text-cocoa">{bakery.rescueWindowStart}</span>–{bakery.rescueWindowEnd}
            </div>
            {!open ? (
              <span className="font-display font-semibold text-sm px-3 py-1.5 rounded-pill bg-lavender-soft text-plum">
                💤 Closed tonight
              </span>
            ) : itemCount && itemCount > 0 ? (
              <span className="font-display font-semibold text-sm px-3 py-1.5 rounded-pill bg-peach text-cocoa">
                {itemCount} treats left 🎂
              </span>
            ) : (
              <span className="font-display font-semibold text-sm px-3 py-1.5 rounded-pill bg-lavender-soft text-plum">
                View →
              </span>
            )}
          </div>
        </Card>
      </Link>
    </div>
  );
}
