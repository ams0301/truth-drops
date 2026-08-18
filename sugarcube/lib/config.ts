export type City = {
  id: string;        // slug
  name: string;
  state: string;
  center: { lat: number; lng: number };
  live: boolean;     // is SugarCube operating here yet?
  launchETA?: string;
};

export const CITIES: City[] = [
  { id: "patna", name: "Patna", state: "Bihar", center: { lat: 25.6093, lng: 85.1235 }, live: true },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", center: { lat: 23.3441, lng: 85.3096 }, live: false, launchETA: "late 2026" },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", center: { lat: 25.3176, lng: 82.9739 }, live: false, launchETA: "early 2027" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", center: { lat: 22.5726, lng: 88.3639 }, live: false, launchETA: "late 2027" },
  { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi", center: { lat: 28.6139, lng: 77.209 }, live: false, launchETA: "TBA" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", center: { lat: 19.076, lng: 72.8777 }, live: false, launchETA: "TBA" },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", center: { lat: 12.9716, lng: 77.5946 }, live: false, launchETA: "TBA" },
  { id: "pune", name: "Pune", state: "Maharashtra", center: { lat: 18.5204, lng: 73.8567 }, live: false, launchETA: "TBA" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", center: { lat: 17.385, lng: 78.4867 }, live: false, launchETA: "TBA" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", center: { lat: 13.0827, lng: 80.2707 }, live: false, launchETA: "TBA" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", center: { lat: 23.0225, lng: 72.5714 }, live: false, launchETA: "TBA" },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", center: { lat: 26.9124, lng: 75.7873 }, live: false, launchETA: "TBA" },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", center: { lat: 26.8467, lng: 80.9462 }, live: false, launchETA: "TBA" },
];

export const DEFAULT_CITY = CITIES[0];
export const SUPPORT_EMAIL = "mohanaadarsh3@gmail.com";

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export const WHATSAPP_BOT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? "+919900000000";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
