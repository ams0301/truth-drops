"use client";
import { useEffect, useState, useCallback } from "react";
import {
  listBakeries, listBakeryItems, addItem, updateItemQty, deleteItem,
  listOrders, updateOrderStatus, subscribe, setRescueOpen,
} from "@/lib/data";
import type { Bakery, Item, Order } from "@/lib/types";
import { Card, Pill } from "./Card";
import { Button } from "./Button";
import { useToast } from "./Toaster";
import { formatINR, discountPct, kgSaved, cn } from "@/lib/utils";
import { Store, Package, ClipboardCheck, Plus, Trash2, Stars } from "lucide-react";

const CATEGORIES: Item["category"][] = ["Cakes", "Pastries", "Sweets", "Bread", "Biscuits", "Magic Bag"];

export function MerchantDashboard() {
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const toast = useToast();

  const refresh = useCallback(async () => {
    const all = await listBakeries();
    setBakeries(all);
    if (!selectedId && all.length > 0) setSelectedId(all[0].id);
  }, [selectedId]);

  const loadCurrent = useCallback(async () => {
    if (!selectedId) return;
    const [its, ors] = await Promise.all([listBakeryItems(selectedId), listOrders({ bakeryId: selectedId })]);
    setItems(its);
    setOrders(ors);
  }, [selectedId]);

  useEffect(() => { refresh(); }, []);
  useEffect(() => { loadCurrent(); }, [loadCurrent]);
  useEffect(() => {
    const unsub = subscribe(loadCurrent);
    return unsub;
  }, [loadCurrent]);

  const bakery = bakeries.find((b) => b.id === selectedId) ?? null;
  const activeOrders = orders.filter((o) => o.status === "reserved");
  const pickedOrders = orders.filter((o) => o.status === "picked_up");
  const revenueTonight = pickedOrders.reduce((s, o) => s + o.total, 0)
    + activeOrders.reduce((s, o) => s + o.total, 0);
  const itemsSold = orders.filter((o) => o.status === "picked_up").reduce((s, o) => s + o.qty, 0);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 font-display font-semibold text-cocoa">
            <Store size={18} /> My bakery:
          </div>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 bg-white border border-lavender-soft rounded-pill px-4 py-2.5 font-sans font-semibold text-cocoa outline-none focus:border-peach"
          >
            {bakeries.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name} · {b.area}</option>)}
          </select>
          <Pill tone="mint">Live (demo pilot)</Pill>
        </div>
      </Card>

      {!bakery ? null : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon="🍰" label="Items listed" value={String(items.length)} tone="lavender" />
            <StatCard icon="🎟️" label="Active reservations" value={String(activeOrders.length)} tone="butter" />
            <StatCard icon="✅" label="Picked up" value={String(pickedOrders.length)} tone="mint" />
            <StatCard icon="💰" label="Tonight's revenue" value={formatINR(revenueTonight)} tone="rose" />
          </div>

          <Card accent={bakery.accent} className="p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-display font-bold text-lg text-cocoa">🌙 Rescue window</h3>
                <p className="font-sans text-sm text-plum/85">
                  {bakery.rescueWindowStart} – {bakery.rescueWindowEnd} · {bakery.area}
                </p>
                <p className="font-sans text-xs text-cocoa-soft mt-1">
                  You've rescued <span className="font-display font-bold text-cocoa">{itemsSold}</span> items & saved ~<span className="font-display font-bold text-cocoa">{kgSaved(itemsSold)} kg</span> of waste so far! 🌍
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={async () => {
                    const next = !(bakery.rescueOpen !== false);
                    await setRescueOpen(bakery.id, next);
                    toast({
                      title: next ? "Rescue window opened 🌙" : "Rescue closed 💤",
                      emoji: next ? "🌙" : "💤",
                      tone: next ? "mint" : "rose",
                    });
                  }}
                  aria-pressed={bakery.rescueOpen !== false}
                  className={cn(
                    "px-4 py-2 rounded-pill font-display font-semibold text-sm border transition-all",
                    bakery.rescueOpen !== false
                      ? "bg-mint text-plum border-mint"
                      : "bg-lavender-soft text-plum border-lavender",
                  )}
                >
                  {bakery.rescueOpen !== false ? "● OPEN — tap to close" : "✕ CLOSED — tap to open"}
                </button>
                <span className="font-sans text-[11px] text-cocoa-soft">Closes new reservations when off</span>
              </div>
            </div>
            {bakery.forecastNote && (
              <div className="mt-3 rounded-bubble bg-butter/40 border border-butter px-3 py-2.5 flex items-start gap-2 font-sans text-xs text-cocoa">
                <span className="text-base shrink-0">🔮</span>
                <span><b className="font-display">Demand hint:</b> {bakery.forecastNote}</span>
              </div>
            )}
          </Card>

          <AddItemForm bakeryId={bakery.id} bakedAtDefault={bakery.rescueWindowStart} onAdded={() => { toast({ title: "Item listed!", emoji: "🍰", tone: "mint" }); loadCurrent(); }} />

          <Card className="p-5">
            <h3 className="font-display font-bold text-lg text-cocoa mb-3 flex items-center gap-2">
              <Package size={18} /> Tonight's items ({items.length})
            </h3>
            {items.length === 0 ? (
              <p className="font-sans text-sm text-cocoa-soft py-6 text-center">No items yet — add your first one above 🍰</p>
            ) : (
              <div className="space-y-3">
                {items.map((it) => {
                  const sold = orders.filter((o) => o.itemId === it.id).reduce((s, o) => s + o.qty, 0);
                  return (
                    <div key={it.id} className="flex items-center gap-3 bg-white/70 border border-lavender-soft rounded-bubble p-3">
                      <div className="text-3xl">{it.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-cocoa truncate">{it.name}</div>
                        <div className="font-sans text-xs text-cocoa-soft">
                          {formatINR(it.rescuePrice)} · {discountPct(it.originalPrice, it.rescuePrice)}% off · {sold} reserved
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="font-sans text-xs text-cocoa-soft">Qty:</label>
                        <input
                          type="number"
                          min={0}
                          defaultValue={it.qty}
                          onBlur={(e) => {
                            const n = parseInt(e.target.value || "0", 10);
                            updateItemQty(it.id, isNaN(n) ? 0 : n);
                            toast({ title: `Updated ${it.name} qty → ${isNaN(n) ? 0 : n}`, emoji: "✏️", tone: "soft" });
                          }}
                          className="w-16 bg-white border border-lavender-soft rounded-pill px-2 py-1.5 font-sans text-sm text-center"
                        />
                        <button
                          onClick={() => { deleteItem(it.id); toast({ title: "Removed item", emoji: "🗑️", tone: "rose" }); }}
                          className="w-8 h-8 grid place-items-center rounded-pill bg-rose-soft text-cocoa hover:bg-rose/80"
                          aria-label="delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-bold text-lg text-cocoa mb-3 flex items-center gap-2">
              <ClipboardCheck size={18} /> Pickups to fulfill ({activeOrders.length})
            </h3>
            {activeOrders.length === 0 ? (
              <p className="font-sans text-sm text-cocoa-soft py-6 text-center">No reservations yet tonight 💤 — share your SugarCube page on WhatsApp!</p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((o) => {
                  const it = items.find((i) => i.id === o.itemId);
                  return (
                    <div key={o.id} className="flex items-center gap-3 bg-white/70 border border-butter rounded-bubble p-3">
                      <div className="text-3xl">{it?.emoji ?? "🧁"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans font-semibold text-cocoa truncate">
                          {o.customerName} · {o.customerPhone}
                        </div>
                        <div className="font-sans text-xs text-cocoa-soft">
                          {it?.name ?? "Item"} ×{o.qty} · {formatINR(o.total)} · {o.paid ? "paid ✅" : "unpaid"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-display font-bold text-lg text-cocoa tracking-wider">{o.pickupCode}</span>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            updateOrderStatus(o.id, "picked_up");
                            toast({ title: `${o.customerName} picked up — sold!`, emoji: "✅", tone: "mint" });
                          }}
                          className="px-4 py-1.5 text-xs"
                        >
                          Mark picked up
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {pickedOrders.length > 0 && (
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-cocoa mb-3 flex items-center gap-2">
                <Stars size={18} /> Happy rescuers tonight ({pickedOrders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pickedOrders.map((o) => (
                  <div key={o.id} className="font-sans text-sm bg-mint-soft/60 border border-mint rounded-pill px-3 py-2 flex justify-between">
                    <span>{o.customerName}</span>
                    <span className="text-cocoa-soft">{o.qty} treats · {formatINR(o.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: "lavender" | "mint" | "rose" | "butter" }) {
  const tones: Record<string, string> = {
    lavender: "from-lavender-soft",
    mint: "from-mint-soft",
    rose: "from-rose-soft",
    butter: "from-butter/70",
  };
  return (
    <Card className={`p-4 bg-gradient-to-br to-cream ${tones[tone]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="font-display font-bold text-2xl text-cocoa mt-1">{value}</div>
      <div className="font-sans text-xs text-cocoa-soft">{label}</div>
    </Card>
  );
}

function AddItemForm({ bakeryId, bakedAtDefault, onAdded }: { bakeryId: string; bakedAtDefault: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    emoji: "🍰",
    description: "",
    category: "Pastries" as Item["category"],
    originalPrice: "",
    rescuePrice: "",
    qty: "",
    bakedAt: bakedAtDefault,
    bestBefore: "22:30",
    allergens: "",
    veg: true,
  });

  function submit() {
    if (!form.name.trim() || !form.originalPrice || !form.rescuePrice || !form.qty) return;
    addItem({
      bakeryId,
      name: form.name.trim(),
      emoji: form.emoji || "🍰",
      description: form.description || "Rescued leftover — fresh tonight!",
      category: form.category,
      originalPrice: parseFloat(form.originalPrice),
      rescuePrice: parseFloat(form.rescuePrice),
      qty: parseInt(form.qty, 10),
      bakedAt: form.bakedAt,
      bestBefore: form.bestBefore,
      allergens: form.allergens ? form.allergens.split(",").map((a) => a.trim()) : [],
      veg: form.veg,
    });
    setForm((f) => ({ ...f, name: "", description: "", originalPrice: "", rescuePrice: "", qty: "" }));
    onAdded();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)} className="w-full py-3">
        <Plus size={18} /> Add a leftover treat to tonight's rescue list
      </Button>
    );
  }
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-lg text-cocoa">➕ Add a leftover treat</h3>
        <button onClick={() => setOpen(false)} className="font-sans text-sm text-cocoa-soft hover:text-cocoa">cancel</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <TF label="Name *" full><input className="sc-m-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Choco Pastry" /></TF>
        <TF label="Emoji"><input className="sc-m-input text-center text-xl" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} /></TF>
        <TF label="Category">
          <select className="sc-m-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Item["category"] })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </TF>
        <TF label="Description" full><input className="sc-m-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short, dreamy description" /></TF>
        <TF label="Original ₹"><input className="sc-m-input" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="85" /></TF>
        <TF label="Rescue ₹"><input className="sc-m-input" type="number" value={form.rescuePrice} onChange={(e) => setForm({ ...form, rescuePrice: e.target.value })} placeholder="35" /></TF>
        <TF label="Quantity"><input className="sc-m-input" type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="6" /></TF>
        <TF label="Baked at"><input className="sc-m-input" type="time" value={form.bakedAt} onChange={(e) => setForm({ ...form, bakedAt: e.target.value })} /></TF>
        <TF label="Best before"><input className="sc-m-input" type="time" value={form.bestBefore} onChange={(e) => setForm({ ...form, bestBefore: e.target.value })} /></TF>
        <TF label="Allergens (comma-sep)"><input className="sc-m-input" value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} placeholder="Dairy, Nuts" /></TF>
        <TF label="Veg?">
          <button
            type="button"
            onClick={() => setForm({ ...form, veg: !form.veg })}
            className={`sc-m-input text-left ${form.veg ? "text-mint" : "text-cocoa"}`}
          >
            {form.veg ? "🟢 Veg" : "🟤 Non-veg"}
          </button>
        </TF>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="magic" onClick={submit} className="flex-1">✨ Publish to SugarCube</Button>
      </div>

      <style jsx>{`
        :global(.sc-m-input) {
          width: 100%;
          background: white;
          border: 1px solid var(--color-lavender-soft);
          border-radius: var(--radius-pill);
          padding: 0.55rem 0.95rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-charcoal);
          outline: none;
        }
        :global(.sc-m-input:focus) { border-color: var(--color-peach); }
      `}</style>
    </Card>
  );
}

function TF({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "col-span-2 sm:col-span-3" : ""}`}>
      <span className="font-sans font-semibold text-xs text-cocoa-soft">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
