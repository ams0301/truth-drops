"use client";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "./LocationProvider";
import { CITIES } from "@/lib/config";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationSwitcher({ compact = false }: { compact?: boolean }) {
  const { city, setCity } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change your city"
        className="inline-flex items-center gap-1.5 bg-white/80 hover:bg-white border border-lavender-soft rounded-pill px-3 py-2 font-sans font-semibold text-sm text-cocoa transition-colors shadow-soft"
      >
        <MapPin size={15} className="text-rose" />
        <span>{city.name}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose city"
          className="absolute right-0 mt-2 w-64 bg-white rounded-bubble border border-lavender-soft shadow-float p-2 z-50 max-h-[70vh] overflow-y-auto animate-pop-in"
        >
          <p className="px-3 py-2 font-sans text-xs text-cocoa-soft">
            🌙 Choose a city — we'll surface nearby rescue treats
          </p>
          <div className="border-t border-lavender-soft my-1" />
          {CITIES.map((c) => {
            const active = c.id === city.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCity(c.id); setOpen(false); }}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-pill transition-colors",
                  active ? "bg-peach/80 text-cocoa" : "hover:bg-lavender-soft text-cocoa",
                )}
              >
                <span className="text-base">{c.live ? "🌙" : "💤"}</span>
                <span className="flex-1">
                  <span className="block font-display font-semibold text-sm">{c.name}</span>
                  <span className="block font-sans text-[11px] text-cocoa-soft">
                    {c.state}{c.live ? " · Live" : ` · ${c.launchETA ?? "Coming soon"}`}
                  </span>
                </span>
                {active && <Check size={16} className="text-cocoa" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
