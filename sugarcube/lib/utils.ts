import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPct(original: number, rescue: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - rescue) / original) * 100);
}

export function relativeWindow(closesAt: string): string {
  const close = new Date(closesAt);
  const diffMs = close.getTime() - Date.now();
  if (diffMs <= 0) return "Pickup window closed";
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `Pickup closes in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `Pickup closes in ${hrs}h ${mins % 60}m`;
}

export function kgSaved(items: number): number {
  // Avg leftover pastry ≈ 120g
  return Math.round((items * 0.12) * 10) / 10;
}

export function co2SavedKg(items: number): number {
  // ~2.5 kg CO2e per kg of food waste averted
  return Math.round(kgSaved(items) * 2.5 * 10) / 10;
}
