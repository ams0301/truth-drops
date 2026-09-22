"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { LocationSwitcher } from "./LocationSwitcher";
import { ChevronDown, Menu, X, Search, CalendarHeart, Gift, Store, HelpCircle, Mail, FileText, Shield, Cookie, LifeBuoy, Info, Heart } from "lucide-react";

const primaryNav = [
  { href: "/", label: "Discover", emoji: "🍰", icon: CalendarHeart },
  { href: "/magic-bags", label: "Magic Bags", emoji: "🎁", icon: Gift },
  { href: "/merchant", label: "For Bakeries", emoji: "🏪", icon: Store },
];

const moreMenu = [
  { href: "/impact", label: "My Impact", emoji: "✨", icon: CalendarHeart },
  { href: "/favorites", label: "My Bakeries", emoji: "❤️", icon: Heart },
  { href: "/about", label: "About", emoji: "ℹ️", icon: Info },
  { href: "/faq", label: "FAQ", emoji: "❓", icon: HelpCircle },
  { href: "/food-safety", label: "Food Safety", emoji: "🍣", icon: Cookie },
  { href: "/support", label: "Support", emoji: "💌", icon: LifeBuoy, highlight: true },
  { href: "/terms", label: "Terms", emoji: "📄", icon: FileText },
  { href: "/privacy", label: "Privacy", emoji: "🔒", icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all",
        scrolled ? "backdrop-blur-md bg-cream/85 shadow-soft" : "bg-transparent",
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="md:hidden w-10 h-10 grid place-items-center rounded-pill bg-white/70 border border-lavender-soft hover:bg-lavender-soft transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo />
        </div>

        {/* Desktop primary */}
        <div className="hidden md:flex items-center gap-1 bg-white/70 rounded-pill px-1.5 py-1 border border-lavender-soft">
          {primaryNav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-4 py-2 rounded-pill font-display font-semibold text-sm transition-all flex items-center gap-1.5",
                  active ? "bg-peach text-cocoa shadow-soft" : "text-cocoa-soft hover:bg-lavender-soft",
                )}
              >
                <span aria-hidden className="text-base">{n.emoji}</span>
                {n.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search treats"
            className="w-10 h-10 grid place-items-center rounded-pill bg-white/70 border border-lavender-soft hover:bg-lavender-soft transition-colors"
          >
            <Search size={18} className="text-cocoa" />
          </Link>
          <LocationSwitcher />

          {/* More dropdown */}
          <div ref={moreRef} className="hidden md:relative md:block">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-label="More options"
              className="inline-flex items-center gap-1 bg-white/70 hover:bg-white border border-lavender-soft rounded-pill px-3 py-2 font-sans font-semibold text-sm text-cocoa transition-colors"
            >
              More
              <ChevronDown size={14} className={cn("transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-bubble border border-lavender-soft shadow-float p-2 z-50 animate-pop-in"
              >
                {moreMenu.map((m) => {
                  const active = pathname === m.href;
                  return (
                    <Link
                      key={m.href}
                      href={m.href}
                      role="menuitem"
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-pill transition-colors",
                        active ? "bg-peach/80 text-cocoa" : "hover:bg-lavender-soft text-cocoa",
                        m.highlight && "font-semibold",
                      )}
                    >
                      <m.icon size={16} className="text-cocoa-soft" />
                      <span className="font-sans text-sm flex-1">{m.label}</span>
                      <span aria-hidden>{m.emoji}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-50 pointer-events-none">
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-charcoal/30 pointer-events-auto"
          />
          <nav className="absolute left-3 right-3 top-20 pointer-events-auto bg-cream rounded-bubble border border-lavender-soft shadow-float p-3 max-h-[80vh] overflow-y-auto animate-pop-in">
            {[...primaryNav, ...moreMenu].map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-pill transition-colors",
                    active ? "bg-peach text-cocoa font-semibold" : "text-cocoa hover:bg-lavender-soft",
                  )}
                >
                  <span aria-hidden className="text-xl w-7 text-center">{n.emoji}</span>
                  <span className="font-display">{n.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-lavender-soft my-2" />
            <div className="px-3 py-2">
              <p className="font-sans text-xs text-cocoa-soft">Support email</p>
              <a href="mailto:mohanaadarsh3@gmail.com" className="flex items-center gap-2 font-display font-semibold text-sm text-cocoa mt-1">
                <Mail size={14} /> mohanaadarsh3@gmail.com
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
