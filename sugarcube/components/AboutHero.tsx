"use client";
import { useLocation } from "./LocationProvider";
import { DEFAULT_CITY } from "@/lib/config";

export function AboutHero() {
  const { city } = useLocation();
  return (
    <div className="text-center mb-8">
      <div className="text-7xl animate-float mb-3">🧁</div>
      <h1 className="font-display font-extrabold text-3xl md:text-5xl text-cocoa">
        A dreamy idea born in <span className="text-rose">{DEFAULT_CITY.name}</span>
      </h1>
      <p className="font-sans text-plum/85 mt-4 max-w-xl mx-auto">
        Every night, bakeries and mithai shops across India close their shutters with trays of unsold treats.
        Pastry turns dull by morning. Khaja loses its crunch. Cream rolls can't survive tomorrow.
        So they end up in the bin — bakery margin lost & the planet sad. 💔
        {city.live ? ` SugarCube just landed in ${city.name}.` : ` We're knocking on ${city.name}'s door next.`}
      </p>
    </div>
  );
}
