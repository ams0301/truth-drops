"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CITIES, DEFAULT_CITY, getCity, type City } from "@/lib/config";

const LS_KEY = "sc_city_v1";

type LocationContextType = {
  city: City;                    // currently selected city (where user wants to browse)
  guessedCity: City | null;       // auto-detected from IP (best effort)
  setCity: (id: string) => void;
  isUserCity: boolean;            // is selected city the same as the user's actual detected location?
  loadingGuess: boolean;
};

const LocationContext = createContext<LocationContextType | null>(null);

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City>(DEFAULT_CITY);
  const [guessedCity, setGuessedCity] = useState<City | null>(null);
  const [loadingGuess, setLoadingGuess] = useState(true);

  // restore saved + IP-guess on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
    if (saved) {
      const c = getCity(saved);
      if (c) setCityState(c);
    }
    // best-effort IP geolocation (free, anonymous). Non-fatal.
    (async () => {
      try {
        const r = await fetch("https://ipapi.co/json/");
        if (!r.ok) return;
        const data = await r.json();
        const guessed = CITIES.find(
          (c) =>
            c.name.toLowerCase() === String(data.city ?? "").toLowerCase() ||
            c.name.toLowerCase() === String(data.region ?? "").toLowerCase(),
        );
        if (guessed) {
          setGuessedCity(guessed);
          if (!saved) setCityState(guessed);   // auto-select on first visit
        }
      } catch {
        // offline / blocked — silently skip
      } finally {
        setLoadingGuess(false);
      }
    })();
  }, []);

  const setCity = useCallback((id: string) => {
    const c = getCity(id);
    if (c) {
      setCityState(c);
      try { window.localStorage.setItem(LS_KEY, c.id); } catch {}
    }
  }, []);

  const isUserCity = guessedCity ? guessedCity.id === city.id : true;

  return (
    <LocationContext.Provider value={{ city, guessedCity, setCity, isUserCity, loadingGuess }}>
      {children}
    </LocationContext.Provider>
  );
}
