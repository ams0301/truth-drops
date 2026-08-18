"use client";
import Link from "next/link";
import { Button } from "./Button";
import { useLocation } from "./LocationProvider";

export function Hero({ bakeryCount = 5, treatCount = 16 }: { bakeryCount?: number; treatCount?: number }) {
  const { city } = useLocation();
  return (
    <section className="relative px-4 md:px-6 pt-6 pb-10">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 border border-lavender-soft rounded-pill px-4 py-1.5 mb-5 animate-twinkle">
          <span>🌙</span>
          <span className="font-sans text-sm font-semibold text-plum">
            Tonight's rescue window open in {city.name}!
          </span>
        </div>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-cocoa leading-tight tracking-tight">
          Rescue a sweet <span className="text-rose">tonight</span>.
          <br />
          <span className="bg-gradient-to-r from-rose via-cocoa to-plum bg-clip-text text-transparent">
            Save it from the bin. 🍰✨
          </span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto font-sans text-base md:text-lg text-plum/85">
          {city.name}'s bakeries & mithai shops bake more than they sell by 9 PM.
          SugarCube helps them find dreamy homes for those last treats —
          at up to <span className="font-semibold text-cocoa">70% off</span>.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="#discover">
            <Button variant="primary" className="px-8 py-4 text-lg">
              🍰 Find treats near me
            </Button>
          </Link>
          <Link href="/magic-bags">
            <Button variant="magic" className="px-8 py-4 text-lg">
              🎁 Magic Bags
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 font-sans text-sm text-cocoa-soft">
          <span><span className="font-display font-bold text-cocoa">{bakeryCount}</span> bakeries</span>
          <span className="h-4 w-px bg-cocoa-soft/30" />
          <span><span className="font-display font-bold text-cocoa">{treatCount}</span> treats left tonight</span>
          <span className="h-4 w-px bg-cocoa-soft/30 hidden sm:block" />
          <span className="hidden sm:inline">Pickup only · Pay on app</span>
        </div>
      </div>
    </section>
  );
}
