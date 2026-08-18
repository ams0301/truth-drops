"use client";
import { useLocation } from "./LocationProvider";
import { CityGate } from "./CityGate";
import { Card } from "./Card";

export function MerchantHero() {
  const { city } = useLocation();
  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-mint-soft border border-mint rounded-pill px-4 py-1.5 mb-3">
          <span>🏪</span>
          <span className="font-sans font-semibold text-plum text-sm">
            Merchant portal
            {city.live ? ` · ${city.name} pilot` : ` · ${city.name} (coming soon)`}
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-cocoa">
          Run your <span className="text-rose">bakery's</span> rescue night
        </h1>
        <p className="font-sans text-plum/85 mt-3 max-w-xl mx-auto">
          Pick your bakery, open the rescue window, add items, and watch them find homes in real time. 🍰
        </p>
      </div>
      {!city.live && (
        <Card className="p-5 mb-6 text-center">
          <p className="font-sans text-sm text-plum">
            🌙 SugarCube isn't live in {city.name} yet, but you can pre-onboard now —
            we'll switch on your city the moment we launch. <a href="mailto:mohanaadarsh3@gmail.com" className="underline font-semibold text-cocoa">Email us</a> to be first in line.
          </p>
        </Card>
      )}
    </>
  );
}
