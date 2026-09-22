export type Bakery = {
  id: string;
  name: string;
  slug: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  rating: number;
  reviews: number;
  emoji: string;
  accent: "peach" | "lavender" | "mint" | "rose" | "butter";
  opensAt: string; // HH:mm
  closesAt: string; // HH:mm
  rescueWindowStart: string; // HH:mm
  rescueWindowEnd: string; // HH:mm
  tags: string[];
  rescueOpen?: boolean;          // bakery-controlled rescue window toggle (default true)
  forecastNote?: string;        // demand-forecast hint (demo only, static for now)
};

export type Item = {
  id: string;
  bakeryId: string;
  name: string;
  emoji: string;
  description: string;
  category: "Cakes" | "Pastries" | "Sweets" | "Bread" | "Biscuits" | "Magic Bag";
  originalPrice: number;
  rescuePrice: number;
  qty: number;
  bakedAt: string; // HH:mm
  bestBefore: string; // HH:mm
  allergens: string[];
  veg: boolean;
};

export type Order = {
  id: string;
  itemId: string;
  bakeryId: string;
  customerName: string;
  customerPhone: string;
  qty: number;
  total: number;
  status: "reserved" | "picked_up" | "cancelled";
  pickupCode: string;
  createdAt: string;
  paid: boolean;
};

export type Rating = {
  id: string;
  bakeryId: string;
  orderId: string;
  stars: number;
  note: string;
  createdAt: string;
};

// A user-posted storefront review with optional photo dataURL (camera/grab from clipboard in demo)
export type FeedPost = {
  id: string;
  bakeryId: string;
  itemId?: string;
  customerName: string;
  photo?: string;       // dataURL (optimized) — kept tiny for demo
  caption: string;
  stars: number;
  createdAt: string;
};

// Cart line item (lives on the client only)
export type CartLine = {
  itemId: string;
  qty: number;
};

// Saved/favourite bakeries (array of bakery ids, client only)
export type Favorites = string[];

// Quarterly aggregate donation pool (in ₹ and treats sponsored)
export type DonationPool = {
  totalINR: number;
  treatsSponsored: number;     // count of meals funded (250g/treat)
  updatedAt: string;
};

// Historical sold/inventory snapshot per item per night — powers dynamic forecasting
export type SalesSnapshot = {
  id: string;
  itemId: string;
  date: string;          // YYYY-MM-DD
  qtyListed: number;     // items bakery put up for rescue
  qtySold: number;       // items actually rescued
  leftoverWaste: number; // unsold = qtyListed - qtySold
};

// Aggregate community stats (across all users/devices of the demo)
export type CommunityStats = {
  totalTreatsRescued: number;
  totalKgSaved: number;
  totalCo2Kg: number;
  totalMealsDonated: number;
  totalActiveBakeries: number;
  updatedAt: string;
};
