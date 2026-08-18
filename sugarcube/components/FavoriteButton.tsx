"use client";
import { useState, useCallback } from "react";
import { getFavorites, toggleFavorite } from "@/lib/data";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({ bakeryId, size = 18 }: { bakeryId: string; size?: number }) {
  const [favs, setFavs] = useState<string[]>(() =>
    typeof window !== "undefined" ? getFavorites() : [],
  );

  const isFav = favs.includes(bakeryId);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = toggleFavorite(bakeryId);
      setFavs(next);
    },
    [bakeryId],
  );

  return (
    <button
      onClick={onClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Unfavourite this bakery" : "Favourite this bakery"}
      className={cn(
        "w-10 h-10 grid place-items-center rounded-pill bg-white/80 border border-white/80 shadow-soft transition-all",
        isFav ? "text-rose" : "text-cocoa-soft hover:text-rose",
        isFav && "animate-pop-in",
      )}
    >
      <Heart size={size} className={cn(isFav && "fill-rose")} />
    </button>
  );
}
