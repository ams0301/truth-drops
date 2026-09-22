"use client";
import { useEffect, useRef } from "react";
import type { Bakery, Item } from "@/lib/types";
import Link from "next/link";
import { useLocation } from "./LocationProvider";

export function CityMapView({ bakeries, items }: { bakeries: Bakery[]; items: Item[] }) {
  const { city } = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = (await import("leaflet")).default;
      // Leaflet CSS injection
      const cssHref = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      if (!document.querySelector(`link[href="${cssHref}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssHref;
        document.head.appendChild(link);
      }
      if (cancelled) return;
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([city.center.lat, city.center.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapInstance.current = map;

      bakeries.forEach((b) => {
        const itemCount = items.filter((i) => i.bakeryId === b.id).length;
        const popupHtml = `
          <div style="font-family:'Nunito',system-ui,sans-serif;text-align:center;min-width:160px;">
            <div style="font-size:28px;">${b.emoji}</div>
            <strong style="font-family:'Baloo 2',system-ui,serif;color:#3A2E3F;display:block;margin-top:4px;">${b.name}</strong>
            <div style="font-size:11px;color:#8E7280;">📍 ${b.area} · ${itemCount} treats</div>
            <div style="font-size:11px;color:#8E7280;margin-bottom:6px;">🌙 ${b.rescueWindowStart}–${b.rescueWindowEnd}</div>
            <a href="/bakeries/${b.id}" style="
              display:inline-block;text-decoration:none;
              background:#FFD9C4;color:#3A2E3F;font-weight:700;
              padding:6px 14px;border-radius:999px;font-size:12px;">
              View treats →
            </a>
          </div>`;
        const icon = L.divIcon({
          className: "sc-pin",
          html: `<div style="
            font-size:28px;
            filter: drop-shadow(0 4px 6px rgba(120,90,110,.35));
            transform: translate(-50%,-100%);
            cursor:pointer;">${b.rescueOpen === false ? "💤" : "🍰"}</div>`,
          iconSize: [40, 40],
          iconAnchor: [0, 0],
        });
        L.marker([b.lat, b.lng], { icon }).addTo(map)
          .bindPopup(popupHtml, { closeButton: false, autoPan: true })
          .on("popupopen", () => {});
      });

      // Fix tile render after layout settle
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => { cancelled = true; if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.center.lat, city.center.lng]);

  return (
    <div className="rounded-bubble bg-white/60 border border-lavender-soft shadow-soft p-1">
      <div ref={mapRef} className="w-full h-[60vh] rounded-bubble" aria-label="Map of bakeries in your city" />
      <p className="px-5 py-2 font-sans text-xs text-cocoa-soft text-center">
        🍰 tap a treat pin to see items · 💤 bakery closed tonight · map data © OpenStreetMap
      </p>
    </div>
  );
}
