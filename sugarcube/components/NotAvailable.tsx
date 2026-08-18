"use client";
import { useLocation } from "./LocationProvider";
import { CITIES, DEFAULT_CITY, type City } from "@/lib/config";
import { Card } from "./Card";
import { Button } from "./Button";
import { MapPin, Sparkles, CalendarClock } from "lucide-react";

export function NotAvailable({ city }: { city: City }) {
  const { setCity } = useLocation();
  const liveCities = CITIES.filter((c) => c.live);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-8xl animate-wiggle mb-4">🥺</div>
      <h1 className="font-display font-extrabold text-3xl md:text-4xl text-cocoa leading-tight">
        Not available in <span className="text-rose">{city.name}</span> yet
      </h1>
      <p className="font-sans text-plum/85 mt-3 max-w-md mx-auto">
        We're heartbroken 🍮 — SugarCube hasn't bloomed in your selected city yet.
        Switch to one of our live cities to start rescuing sweets, or join the waitlist
        below — we'll come knocking soon!
      </p>

      <Card className="p-6 mt-7 text-left">
        <h3 className="font-display font-bold text-lg text-cocoa flex items-center gap-2">
          <Sparkles size={18} className="text-rose" /> Switch to a live city
        </h3>
        <p className="font-sans text-sm text-cocoa-soft mt-1">
          Travelling somewhere soon? Pick a city we're live in, and you can browse today.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {liveCities.map((c) => (
            <button
              key={c.id}
              onClick={() => setCity(c.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-mint-soft border border-mint text-plum font-display font-semibold text-sm hover:bg-mint transition-colors"
            >
              <MapPin size={14} /> {c.name}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 mt-4 text-left">
        <h3 className="font-display font-bold text-lg text-cocoa flex items-center gap-2">
          <CalendarClock size={18} className="text-cocoa-soft" /> {city.name} launch
        </h3>
        <p className="font-sans text-sm text-cocoa-soft mt-1">
          Expected: <span className="font-display font-semibold text-cocoa">{city.launchETA ?? "soon — we're working hard"}</span>
        </p>
        <Button
          variant="primary"
          className="mt-4 w-full sm:w-auto"
          onClick={() => {
            const subject = encodeURIComponent(`Waitlist me for SugarCube in ${city.name}`);
            const body = encodeURIComponent("Hi SugarCube team,\n\nPlease notify me when SugarCube launches in " + city.name + "!\n\nName: \nWhatsApp: ");
            window.location.href = `mailto:mohanaadarsh3@gmail.com?subject=${subject}&body=${body}`;
          }}
        >
          ✨ Join {city.name} waitlist
        </Button>
      </Card>

      <p className="mt-6 font-sans text-xs text-cocoa-soft">
        💡 Pro tip: if you're physically not in {city.name} but visiting soon, switching lets you explore
        treats in advance so you're ready on arrival.
      </p>
    </div>
  );
}
