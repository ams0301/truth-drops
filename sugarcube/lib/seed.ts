import type { Bakery, Item, SalesSnapshot, FeedPost, Rating, CommunityStats } from "./types";

// --- Only one bakery in this pilot: a single, full-featured demo so pitching is on one entity. ---
export const seedBakeries: Bakery[] = [
  {
    id: "bk_demo",
    name: "Demo Bakery",
    slug: "demo-bakery",
    area: "Gandhi Maidan",
    address: "South Gandhi Maidan, Frazer Road, Patna, Bihar 800001",
    lat: 25.6118,
    lng: 85.1374,
    phone: "+919812345678",
    rating: 4.7,
    reviews: 248,
    emoji: "🧁",
    accent: "peach",
    opensAt: "08:00",
    closesAt: "22:30",
    rescueWindowStart: "20:30",
    rescueWindowEnd: "22:30",
    tags: ["Pure Veg", "Cream Pastries", "Croissants", "Brownies", "Mithai", "Patties", "Bread"],
    rescueOpen: true,
    forecastNote: "Computed daily from the last 14 nights of sales — see merchant dashboard.",
  },
];

// --- Tonight's live items. A representative spread for the demo. ---
export const seedItems: Item[] = [
  {
    id: "it_choco_pastry",
    bakeryId: "bk_demo",
    name: "Chocolate Truffle Pastry",
    emoji: "🍫",
    description: "Rich Belgian cocoa sponge layered with ganache — baked fresh this evening.",
    category: "Pastries",
    originalPrice: 95,
    rescuePrice: 38,
    qty: 12,
    bakedAt: "17:00",
    bestBefore: "22:30",
    allergens: ["Dairy", "Gluten"],
    veg: true,
  },
  {
    id: "it_pineapple_cake",
    bakeryId: "bk_demo",
    name: "Pineapple Cream Cake Slice",
    emoji: "🍍",
    description: "Vanilla sponge, whipped cream, juicy pineapple bits. Patna favourite.",
    category: "Cakes",
    originalPrice: 110,
    rescuePrice: 45,
    qty: 7,
    bakedAt: "16:30",
    bestBefore: "22:30",
    allergens: ["Dairy", "Eggs", "Gluten"],
    veg: true,
  },
  {
    id: "it_croissant",
    bakeryId: "bk_demo",
    name: "Butter Croissant",
    emoji: "🥐",
    description: "27-layer hand-laminated butter croissant. Crispy, dreamy, flaky.",
    category: "Bread",
    originalPrice: 75,
    rescuePrice: 32,
    qty: 8,
    bakedAt: "16:00",
    bestBefore: "22:30",
    allergens: ["Dairy", "Gluten"],
    veg: true,
  },
  {
    id: "it_cookie",
    bakeryId: "bk_demo",
    name: "Choco Chip Cookie (set of 4)",
    emoji: "🍪",
    description: "Chunky Belgian choco-chip cookies. Perfect with tonight's chai.",
    category: "Biscuits",
    originalPrice: 130,
    rescuePrice: 58,
    qty: 6,
    bakedAt: "15:00",
    bestBefore: "22:30",
    allergens: ["Dairy", "Gluten", "Eggs"],
    veg: true,
  },
  {
    id: "it_brownie",
    bakeryId: "bk_demo",
    name: "Fudge Brownie",
    emoji: "🟤",
    description: "Dense, gooey, crackle-top brownie. Even better with tonight's coffee.",
    category: "Pastries",
    originalPrice: 90,
    rescuePrice: 35,
    qty: 9,
    bakedAt: "16:30",
    bestBefore: "22:30",
    allergens: ["Dairy", "Gluten", "Eggs"],
    veg: true,
  },
  {
    id: "it_cream_roll",
    bakeryId: "bk_demo",
    name: "Bhagalpur Cream Roll",
    emoji: "🥯",
    description: "Flaky cream-stuffed roll, the Bhagalpur special — tonight only.",
    category: "Pastries",
    originalPrice: 45,
    rescuePrice: 18,
    qty: 14,
    bakedAt: "18:00",
    bestBefore: "22:30",
    allergens: ["Dairy", "Gluten"],
    veg: true,
  },
  {
    id: "it_sourdough",
    bakeryId: "bk_demo",
    name: "Sourdough Loaf",
    emoji: "🍞",
    description: "Wild-fermented sourdough, bakes each morning. Tomorrow it's stale — save it tonight!",
    category: "Bread",
    originalPrice: 200,
    rescuePrice: 85,
    qty: 4,
    bakedAt: "08:00",
    bestBefore: "22:30",
    allergens: ["Gluten"],
    veg: true,
  },
  {
    id: "it_magic_pastry",
    bakeryId: "bk_demo",
    name: "SugarCube Magic Sweet Surprise Bag",
    emoji: "🎁",
    description: "Surprise mix of 3-4 leftover pastries & biscuits. A lucky dip of joy!",
    category: "Magic Bag",
    originalPrice: 280,
    rescuePrice: 99,
    qty: 5,
    bakedAt: "17:00",
    bestBefore: "22:30",
    allergens: ["May contain dairy/gluten/eggs"],
    veg: true,
  },
  {
    id: "it_magic_mithai",
    bakeryId: "bk_demo",
    name: "Magic Mithai Surprise Box",
    emoji: "🎁",
    description: "A surprise box of 3-4 leftover mithai — Til Kut, Anarsa, Perakiya, chum-chum.",
    category: "Magic Bag",
    originalPrice: 240,
    rescuePrice: 89,
    qty: 3,
    bakedAt: "11:00",
    bestBefore: "22:30",
    allergens: ["May contain dairy/nuts/sesame"],
    veg: true,
  },
  {
    id: "it_patties",
    bakeryId: "bk_demo",
    name: "Veg Patty (pack of 2)",
    emoji: "🥧",
    description: "Flaky baked vegetable patty — savoury companion to your evening chai.",
    category: "Pastries",
    originalPrice: 80,
    rescuePrice: 30,
    qty: 6,
    bakedAt: "16:00",
    bestBefore: "22:00",
    allergens: ["Gluten", "Dairy"],
    veg: true,
  },
];

// --- 14 nights of historical sales snapshots per item, used for dynamic forecasting. ---
// Pattern depends on item: some sell out fast (chocolate pastry = 95% sold),
// some consistently leave 2-4 (cream roll), some slow (sourdough). Pseudo-random but deterministic.
const SALE_PROFILES: Record<string, { sellThrough: number; qtyListed: number }> = {
  it_choco_pastry: { sellThrough: 0.95, qtyListed: 14 },
  it_pineapple_cake: { sellThrough: 0.85, qtyListed: 8 },
  it_croissant: { sellThrough: 0.75, qtyListed: 9 },
  it_cookie: { sellThrough: 0.6, qtyListed: 8 },
  it_brownie: { sellThrough: 0.92, qtyListed: 10 },
  it_cream_roll: { sellThrough: 0.7, qtyListed: 18 },
  it_sourdough: { sellThrough: 0.5, qtyListed: 6 },
  it_magic_pastry: { sellThrough: 0.95, qtyListed: 6 },
  it_magic_mithai: { sellThrough: 0.88, qtyListed: 5 },
  it_patties: { sellThrough: 0.82, qtyListed: 7 },
};

// Deterministic PRNG — same per uuid+date so demo always shows the same numbers
function hash(n: number, salt: number): number {
  let x = (n * 9301 + salt * 49297) % 233280;
  return x / 233280;
}

export const seedSalesHistory: SalesSnapshot[] = (() => {
  const out: SalesSnapshot[] = [];
  const today = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const iso = date.toISOString().slice(0, 10);
    for (const it of seedItems) {
      const prof = SALE_PROFILES[it.id];
      if (!prof) continue;
      const dayIdx = parseInt(iso.replace(/-/g, ""), 10);
      const jitter = hash(dayIdx, parseInt(it.id.slice(-2) || "0", 36) || 1) - 0.5;  // -0.5..0.4
      const factor = 1 + jitter * 0.4;
      const listed = Math.max(2, Math.round(prof.qtyListed * factor));
      const sold = Math.min(listed, Math.round(listed * prof.sellThrough * (0.95 + jitter * 0.1)));
      out.push({
        id: `ss_${iso}_${it.id}`,
        itemId: it.id,
        date: iso,
        qtyListed: listed,
        qtySold: sold,
        leftoverWaste: listed - sold,
      });
    }
  }
  return out;
})();

// --- Starter customer reviews (text + star rating). Photos optional. ---
export const seedFeedPosts: FeedPost[] = [
  { id: "fp_1", bakeryId: "bk_demo", customerName: "Aisha K.", caption: "Chocolate pastry was still so dreamy at 9 PM — saved our movie night 🎬", stars: 5, createdAt: new Date(Date.now() - 36e5 * 6).toISOString() },
  { id: "fp_2", bakeryId: "bk_demo", customerName: "Ravi", caption: "Magic Sweet Bag had 3 different pastries. ₹99 well spent 💗", stars: 5, createdAt: new Date(Date.now() - 36e5 * 22).toISOString() },
  { id: "fp_3", bakeryId: "bk_demo", customerName: "Priya", caption: "Brownie was gooey, not stale at all — ate before reaching home 😅", stars: 4, createdAt: new Date(Date.now() - 36e5 * 30).toISOString() },
  { id: "fp_4", bakeryId: "bk_demo", customerName: "Mohit", caption: "Bhagalpur cream roll — childhood nostalgia at ₹18. Will come back tomorrow.", stars: 5, createdAt: new Date(Date.now() - 36e5 * 52).toISOString() },
  { id: "fp_5", bakeryId: "bk_demo", customerName: "Neha", caption: "Sourdough was 2 days worth — made incredible bread pudding. Worth ₹85.", stars: 4, createdAt: new Date(Date.now() - 36e5 * 72).toISOString() },
  { id: "fp_6", bakeryId: "bk_demo", customerName: "Sneha", caption: "Patties combo for evening tea with family — everyone loved the deal.", stars: 5, createdAt: new Date(Date.now() - 36e5 * 96).toISOString() },
];

// Star-only Ratings that the bakery profile shows above the photo feed.
export const seedRatings: Rating[] = seedFeedPosts.map((p) => ({
  id: "rt_seed_" + p.id,
  bakeryId: "bk_demo",
  orderId: p.id,
  stars: p.stars,
  note: p.caption,
  createdAt: p.createdAt,
})).slice(0, 4);

// --- Starting community stats — the "pod" of this device's seed has already saved some tonight. ---
export const seedCommunityStats: CommunityStats = {
  totalTreatsRescued: 0,
  totalKgSaved: 0,
  totalCo2Kg: 0,
  totalMealsDonated: 0,
  totalActiveBakeries: 1,
  updatedAt: new Date().toISOString(),
};
