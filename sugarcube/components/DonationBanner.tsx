"use client";
import { Button } from "./Button";
import { getDonationPool } from "@/lib/data";

export function DonationBanner() {
  const pool = getDonationPool();
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="rounded-bubble bg-gradient-to-br from-rose to-peach border border-white/70 shadow-float p-8 md:p-12 text-center relative overflow-hidden text-cocoa">
        <div className="absolute -top-6 -right-6 text-8xl opacity-30 animate-float">💝</div>
        <div className="absolute -bottom-6 -left-6 text-7xl opacity-30 animate-twinkle">🌍</div>
        <div className="relative">
          <span className="inline-block bg-white/70 text-plum px-3 py-1 rounded-pill font-sans font-semibold text-xs mb-3">
            💝 Sponsor a treat for someone in need
          </span>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">
            Don't need a treat? Pay one forward 🍮
          </h2>
          <p className="font-sans text-base mt-3 max-w-xl mx-auto opacity-90">
            Add ₹20, ₹50 or ₹100 at checkout to fund the same leftover treat for an NGO partner
            (Akshaya Patra / Aahar). Every ₹30 ≈ one meal sponsored tonight.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <div className="bg-white/70 rounded-pill px-4 py-2 font-display font-semibold">
              🌍 Community so far: <b>{pool.treatsSponsored}</b> treats · {pool.totalINR > 0 ? `₹${pool.totalINR}` : "₹0"}
            </div>
            <a href="/impact" className="self-center">
              <Button variant="secondary" className="px-6 py-2.5">See impact →</Button>
            </a>
          </div>
          <p className="font-sans text-xs opacity-80 mt-3">
            (Donations are auto-added at checkout — look for the "Sponsor a treat" line in your rescue bag 🍮)
          </p>
        </div>
      </div>
    </section>
  );
}
