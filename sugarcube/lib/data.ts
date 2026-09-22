import type { Bakery, CartLine, CommunityStats, DonationPool, Favorites, FeedPost, Item, Order, Rating, SalesSnapshot } from "./types";
import { getSupabase, isSupabaseEnabled } from "./supabase";
import { seedBakeries, seedCommunityStats, seedFeedPosts, seedItems, seedRatings, seedSalesHistory } from "./seed";

const LS_BAKERIES = "sc_bakeries_v1";
const LS_ITEMS = "sc_items_v1";
const LS_ORDERS = "sc_orders_v1";
const LS_RATINGS = "sc_ratings_v1";
const LS_IMPACT = "sc_impact_v1";
const LS_FAVS = "sc_favs_v1";
const LS_CART = "sc_cart_v1";
const LS_FEED = "sc_feed_v1";
const LS_DONATIONS = "sc_donations_v1";
const LS_RECENT_SEARCHES = "sc_recent_searches_v1";
const LS_SALES = "sc_sales_v1";
const LS_COMMUNITY = "sc_community_v1";

// --- localStorage helpers (client-side only) ---

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function lsGet<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("sc-data-change", { detail: { key } }));
  } catch {}
}

function seedIfEmpty() {
  if (!isBrowser()) return;
  if (!window.localStorage.getItem(LS_BAKERIES)) lsSet(LS_BAKERIES, seedBakeries);
  if (!window.localStorage.getItem(LS_ITEMS)) lsSet(LS_ITEMS, seedItems);
  if (!window.localStorage.getItem(LS_ORDERS)) lsSet(LS_ORDERS, []);
  if (!window.localStorage.getItem(LS_RATINGS)) lsSet(LS_RATINGS, []);
  if (!window.localStorage.getItem(LS_IMPACT)) {
    lsSet(LS_IMPACT, { itemsRescued: 0, ordersPlaced: 0 });
  }
}

// --- Public API (server-component safe: async fns read from localStorage on client OR Supabase if configured) ---

export async function listBakeries(): Promise<Bakery[]> {
  if (isSupabaseEnabled) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("bakeries").select("*").order("rating", { ascending: false });
    if (error) return seedBakeries;
    return (data as Bakery[]) ?? [];
  }
  seedIfEmpty();
  return lsGet<Bakery[]>(LS_BAKERIES, seedBakeries);
}

export async function listItems(onlyOpen = false): Promise<Item[]> {
  if (isSupabaseEnabled) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from("items").select("*").eq("qty", ">0");
    if (error) return seedItems;
    return (data as Item[]) ?? [];
  }
  seedIfEmpty();
  const items = lsGet<Item[]>(LS_ITEMS, seedItems).filter((i) => i.qty > 0);
  return items;
}

export async function listBakeryItems(bakeryId: string): Promise<Item[]> {
  const items = await listItems();
  return items.filter((i) => i.bakeryId === bakeryId && i.qty > 0);
}

export async function getBakery(id: string): Promise<Bakery | null> {
  const all = await listBakeries();
  return all.find((b) => b.id === id || b.slug === id) ?? null;
}

export async function getItem(id: string): Promise<Item | null> {
  const all = await listItems();
  return all.find((i) => i.id === id) ?? null;
}

export function subscribe(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener("sc-data-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("sc-data-change", handler);
    window.removeEventListener("storage", handler);
  };
}

// --- Mutations (client-side; stored in localStorage regardless of Supabase for demo) ---

export async function createOrder(input: {
  itemId: string;
  bakeryId: string;
  customerName: string;
  customerPhone: string;
  qty: number;
  total: number;
  paid: boolean;
}): Promise<Order> {
  const orders = lsGet<Order[]>(LS_ORDERS, []);
  const order: Order = {
    id: "or_" + Math.random().toString(36).slice(2, 9),
    itemId: input.itemId,
    bakeryId: input.bakeryId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    qty: input.qty,
    total: input.total,
    status: "reserved",
    pickupCode: String(Math.floor(1000 + Math.random() * 9000)),
    createdAt: new Date().toISOString(),
    paid: input.paid,
  };
  orders.push(order);
  lsSet(LS_ORDERS, orders);

  // decrement inventory
  const items = lsGet<Item[]>(LS_ITEMS, seedItems);
  const idx = items.findIndex((i) => i.id === input.itemId);
  if (idx >= 0) {
    items[idx].qty = Math.max(0, items[idx].qty - input.qty);
    lsSet(LS_ITEMS, items);
  }
  return order;
}

export async function listOrders(filter?: { bakeryId?: string; phone?: string }): Promise<Order[]> {
  let orders = lsGet<Order[]>(LS_ORDERS, []);
  if (filter?.bakeryId) orders = orders.filter((o) => o.bakeryId === filter.bakeryId);
  if (filter?.phone) orders = orders.filter((o) => o.customerPhone === filter.phone);
  return [...orders].reverse();
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const orders = lsGet<Order[]>(LS_ORDERS, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = status;
    lsSet(LS_ORDERS, orders);
  }
}

export async function addRating(r: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
  const ratings = lsGet<Rating[]>(LS_RATINGS, []);
  const rating: Rating = {
    ...r,
    id: "rt_" + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  };
  ratings.push(rating);
  lsSet(LS_RATINGS, ratings);
  return rating;
}

export async function listRatings(bakeryId: string): Promise<Rating[]> {
  const ratings = lsGet<Rating[]>(LS_RATINGS, []).filter((r) => r.bakeryId === bakeryId);
  return ratings.reverse();
}

// Merchant: add a new item
export async function addItem(item: Omit<Item, "id">): Promise<Item> {
  const items = lsGet<Item[]>(LS_ITEMS, []);
  const newItem: Item = { ...item, id: "it_" + Math.random().toString(36).slice(2, 9) };
  items.push(newItem);
  lsSet(LS_ITEMS, items);
  return newItem;
}

export async function updateItemQty(itemId: string, qty: number) {
  const items = lsGet<Item[]>(LS_ITEMS, seedItems);
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx >= 0) {
    items[idx].qty = Math.max(0, qty);
    lsSet(LS_ITEMS, items);
  }
}

export async function deleteItem(itemId: string) {
  const items = lsGet<Item[]>(LS_ITEMS, seedItems).filter((i) => i.id !== itemId);
  lsSet(LS_ITEMS, items);
}

export type CustomerImpact = { itemsRescued: number; ordersPlaced: number; lastOrderAt?: string };
export async function getCustomerImpact(phone: string): Promise<CustomerImpact> {
  const orders = await listOrders({ phone });
  if (orders.length === 0) return { itemsRescued: 0, ordersPlaced: 0 };
  return {
    itemsRescued: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.qty, 0),
    ordersPlaced: orders.length,
    lastOrderAt: orders[0].createdAt,
  };
}

// ---- Favorites ----
export function getFavorites(): Favorites {
  return lsGet<Favorites>(LS_FAVS, []);
}
export function toggleFavorite(bakeryId: string): Favorites {
  const favs = getFavorites();
  const next = favs.includes(bakeryId)
    ? favs.filter((f) => f !== bakeryId)
    : [...favs, bakeryId];
  lsSet(LS_FAVS, next);
  return next;
}
export async function listFavoriteBakeries(): Promise<Bakery[]> {
  const all = await listBakeries();
  const favs = getFavorites();
  return all.filter((b) => favs.includes(b.id));
}

// ---- Cart (multi-item) ----
export function getCart(): CartLine[] {
  return lsGet<CartLine[]>(LS_CART, []);
}
export function addToCart(itemId: string, qty = 1): CartLine[] {
  const cart = getCart();
  const idx = cart.findIndex((l) => l.itemId === itemId);
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({ itemId, qty });
  lsSet(LS_CART, cart);
  return cart;
}
export function setCartQty(itemId: string, qty: number): CartLine[] {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((l) => l.itemId !== itemId);
  } else {
    const idx = cart.findIndex((l) => l.itemId === itemId);
    if (idx >= 0) cart[idx].qty = qty;
    else cart.push({ itemId, qty });
  }
  lsSet(LS_CART, cart);
  return cart;
}
export function clearCart() {
  lsSet(LS_CART, []);
}

export function cartCount(): number {
  return getCart().reduce((s, l) => s + l.qty, 0);
}

// ---- Feed (community reviews + photos) ----
export async function getFeed(bakeryId?: string): Promise<FeedPost[]> {
  const posts = lsGet<FeedPost[]>(LS_FEED, []);
  const filtered = bakeryId ? posts.filter((p) => p.bakeryId === bakeryId) : posts;
  return filtered.reverse();
}
export async function addFeedPost(p: Omit<FeedPost, "id" | "createdAt">): Promise<FeedPost> {
  const posts = lsGet<FeedPost[]>(LS_FEED, []);
  const post: FeedPost = {
    ...p,
    id: "fp_" + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  lsSet(LS_FEED, posts);
  return post;
}

// ---- Rescue-window toggle (merchant) ----
export async function setRescueOpen(bakeryId: string, open: boolean) {
  const list = lsGet<Bakery[]>(LS_BAKERIES, seedBakeries);
  const idx = list.findIndex((b) => b.id === bakeryId);
  if (idx >= 0) {
    list[idx].rescueOpen = open;
    lsSet(LS_BAKERIES, list);
  }
}

// ---- Donation pool ----
export function getDonationPool(): DonationPool {
  return lsGet<DonationPool>(LS_DONATIONS, { totalINR: 0, treatsSponsored: 0, updatedAt: new Date().toISOString() });
}
export function addToDonationPool(inr: number, treats: number) {
  const p = getDonationPool();
  const next: DonationPool = {
    totalINR: p.totalINR + inr,
    treatsSponsored: p.treatsSponsored + treats,
    updatedAt: new Date().toISOString(),
  };
  lsSet(LS_DONATIONS, next);
  return next;
}

// ---- Recent searches ----
export function pushRecentSearch(term: string): string[] {
  const t = term.trim();
  if (!t) return getRecentSearches();
  const all = lsGet<string[]>(LS_RECENT_SEARCHES, []).filter((s) => s.toLowerCase() !== t.toLowerCase());
  const next = [t, ...all].slice(0, 8);
  lsSet(LS_RECENT_SEARCHES, next);
  return next;
}
export function getRecentSearches(): string[] {
  return lsGet<string[]>(LS_RECENT_SEARCHES, []);
}

// ---- Streak: count consecutive nights (calendar days) the user has placed an order ----
export async function getStreak(phone: string): Promise<{ current: number; best: number }> {
  const orders = (await listOrders({ phone })).filter((o) => o.status !== "cancelled");
  if (orders.length === 0) return { current: 0, best: 0 };
  // dedupe by YYYY-MM-DD
  const days = Array.from(
    new Set(orders.map((o) => new Date(o.createdAt).toISOString().slice(0, 10))),
  ).sort();                                  // ascending
  // best & current streak
  let current = 1, best = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else if (diffDays === 0) {
      // same day — no change
    } else {
      current = 1;
    }
  }
  // is the latest day today or yesterday?
  const latest = new Date(days[days.length - 1]);
  const today = new Date();
  const daysSinceLatest = Math.round((today.getTime() - latest.getTime()) / 86400000);
  const currentAlive = daysSinceLatest <= 1 ? current : 0;
  return { current: currentAlive, best: Math.max(best, current) };
}

// ---- Scaffold: create multi-item order row per cart line ----
export async function placeCartOrder(input: {
  lines: { item: Item; qty: number }[];
  bakeryId: string;
  customerName: string;
  customerPhone: string;
  donationInr?: number;
}): Promise<Order[]> {
  const created: Order[] = [];
  for (const line of input.lines) {
    const o = await createOrder({
      itemId: line.item.id,
      bakeryId: input.bakeryId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      qty: line.qty,
      total: line.item.rescuePrice * line.qty,
      paid: true,
    });
    created.push(o);
  }
  if (input.donationInr && input.donationInr > 0) {
    addToDonationPool(input.donationInr, Math.round(input.donationInr / 30)); // avg ₹30 sponsors 1 treat
  }
  clearCart();
  return created;
}
