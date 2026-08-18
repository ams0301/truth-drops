"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { WhatsAppBotCTA } from "./WhatsAppBotCTA";
import { useLocation } from "./LocationProvider";
import { Mail } from "lucide-react";

export function Footer() {
  const { city } = useLocation();
  return (
    <footer className="mt-auto bg-gradient-to-t from-lavender-soft to-cream border-t border-white/60 py-10 px-5">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 font-sans text-sm text-cocoa-soft max-w-sm">
            SugarCube helps bakeries rescue their leftover sweets at dreamy discounts.
            Save a treat, save the planet. 🌍
          </p>
          <a href="mailto:mohanaadarsh3@gmail.com" className="inline-flex items-center gap-2 mt-4 font-display font-semibold text-sm text-cocoa hover:text-rose transition-colors">
            <Mail size={15} /> mohanaadarsh3@gmail.com
          </a>
        </div>

        <div className="flex flex-col gap-2 font-sans text-sm">
          <h4 className="font-display font-semibold text-cocoa mb-1">For sweet tooths</h4>
          <Link href="/" className="text-cocoa-soft hover:text-cocoa">Discover treats</Link>
          <Link href="/magic-bags" className="text-cocoa-soft hover:text-cocoa">Magic Bags 🎁</Link>
          <Link href="/impact" className="text-cocoa-soft hover:text-cocoa">My Impact</Link>
          <Link href="/favorites" className="text-cocoa-soft hover:text-cocoa">My Bakeries ❤️</Link>
          <Link href="/faq" className="text-cocoa-soft hover:text-cocoa">FAQ</Link>
        </div>

        <div className="flex flex-col gap-2 font-sans text-sm">
          <h4 className="font-display font-semibold text-cocoa mb-1">For bakeries</h4>
          <Link href="/merchant" className="text-cocoa-soft hover:text-cocoa">Merchant portal</Link>
          <div className="mt-2"><WhatsAppBotCTA /></div>
          <div className="mt-3">
            <h5 className="font-display font-semibold text-cocoa mb-1">Trust</h5>
            <Link href="/food-safety" className="text-cocoa-soft hover:text-cocoa block">Food safety</Link>
            <Link href="/terms" className="text-cocoa-soft hover:text-cocoa block">Terms of use</Link>
            <Link href="/privacy" className="text-cocoa-soft hover:text-cocoa block">Privacy policy</Link>
            <Link href="/support" className="text-cocoa-soft hover:text-cocoa block">Support</Link>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/50 font-sans text-xs text-cocoa-soft flex flex-col md:flex-row gap-2 md:justify-between">
        <span>© {new Date().getFullYear()} SugarCube. Made with 💗 in India.</span>
        <span>{city.name} pilot · Pickup only · Consume rescued treats within 2 hrs.</span>
      </div>
    </footer>
  );
}
