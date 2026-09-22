"use client";
import { useLocation } from "./LocationProvider";
import { WhatsAppBotCTA } from "./WhatsAppBotCTA";

export function BakeryOwnerBanner() {
  const { city } = useLocation();
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="rounded-bubble bg-gradient-to-br from-mint-soft via-lavender-soft to-peach-soft border border-white/80 shadow-soft p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-8xl opacity-30 animate-float">🍩</div>
        <div className="absolute -bottom-6 -left-6 text-7xl opacity-30 animate-twinkle">🧁</div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-cocoa relative">
          Run a bakery or mithai shop in {city.name}? 🍪
        </h2>
        <p className="font-sans text-base text-plum/85 mt-3 max-w-xl mx-auto relative">
          Stop throwing away tonight's leftovers. List on SugarCube in 30 seconds
          (no app needed!) and recover up to 60% of cost — while warming hearts.
        </p>
        <div className="mt-6 relative">
          <WhatsAppBotCTA />
        </div>
      </div>
    </section>
  );
}
