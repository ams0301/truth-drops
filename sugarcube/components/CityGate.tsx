"use client";
import { useLocation } from "./LocationProvider";
import type { City } from "@/lib/config";
import { NotAvailable } from "./NotAvailable";

/**
 * Renders children only if SugarCube is live in the user's selected city.
 * Otherwise shows a friendly "not available" page letting them switch to Patna.
 */
export function CityGate({ children }: { children: React.ReactNode }) {
  const { city } = useLocation();
  if (!city.live) {
    return <NotAvailable city={city} />;
  }
  return <>{children}</>;
}

export function useCurrentCity(): City {
  return useLocation().city;
}
