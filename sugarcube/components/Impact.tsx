"use client";
import { useEffect, useState, useCallback } from "react";
import {
  listOrders, subscribe, getCustomerImpact, getStreak, getDonationPool, listFavoriteBakeries,
} from "@/lib/data";
import type { Bakery, DonationPool } from "@/lib/types";
import type { Order } from "@/lib/types";
import { Card } from "./Card";
import { Button } from "./Button";
import { formatINR, kgSaved, co2SavedKg } from "@/lib/utils";
import Link from "next/link";

export function Impact() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [impact, setImpact] = useState<{ itemsRescued: number; ordersPlaced: number; lastOrderAt?: string } | null>(null);
  const [streak, setStreak] = useState<{ current: number; best: number }>({ current: 0, best: 0 });
  const [pool, setPool] = useState<DonationPool | null>(null);
  const [favBakeries, setFavBakeries] = useState<Bakery[]>([]);

  const load = useCallback(async () => {
    if (!submitted || !phone) return;
    const [ors, imp, streakVal, poolVal, favs] = await Promise.all([
      listOrders({ phone }),
      getCustomerImpact(phone),
      getStreak(phone),
      Promise.resolve(getDonationPool()),
      listFavoriteBakeries(),
    ]);
    setOrders(ors);
    setImpact(imp);
    setStreak(streakVal);
    setPool(poolVal);
    setFavBakeries(favs);
  }, [submitted, phone]);

  useEffect(() => {
    load();
    if (!submitted) return;
    const unsub = subscribe(load);
    return unsub;
  }, [load, submitted]);

  if (!submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="text-5xl mb-3 animate-wiggle">📲</div>
        <h3 className="font-display font-bold text-xl text-cocoa">Enter the phone you reserved with</h3>
        <p className="font-sans text-sm text-cocoa-soft mt-1 mb-5">We'll fetch your rescue story 💗</p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && /^\d{10,13}$/.test(phone.replace(/\D/g, "")) && setSubmitted(true)}
          placeholder="+91 9XXXXXXXXX"
          className="sc-input"
        />
        <div className="mt-4">
          <button
            disabled={!/^\d{10,13}$/.test(phone.replace(/\D/g, ""))}
            onClick={() => setSubmitted(true)}
            className="font-display font-semibold px-8 py-3 rounded-pill bg-peach text-cocoa shadow-soft disabled:opacity-50"
          >
            Show my impact ✨
          </button>
        </div>
        <style jsx>{`
          .sc-input {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            display: block;
            background: white;
            border: 1px solid var(--color-lavender-soft);
            border-radius: var(--radius-pill);
            padding: 0.75rem 1.1rem;
            font-family: var(--font-sans);
            font-weight: 500;
            color: var(--color-charcoal);
            outline: none;
          }
          .sc-input:focus { border-color: var(--color-peach); box-shadow: 0 0 0 4px rgba(255,217,196,.4); }
        `}</style>
      </Card>
    );
  }

  if (!impact) return <Card className="p-8 text-center font-sans text-cocoa-soft">Loading your dreamy stats…</Card>;

  return (
    <div className="space-y-5">
      {/* Streak meter */}
      <Card className="p-6 bg-gradient-to-br from-rose-soft via-peach-soft to-butter/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-lg text-cocoa flex items-center gap-2">
              🔥 Rescue streak
            </h3>
            <p className="font-sans text-sm text-cocoa-soft mt-1">
              {streak.current > 0
                ? <>You've rescued <b className="text-rose">{streak.current} night{streak.current === 1 ? "" : "s"} in a row</b> — keep it up 💗</>
                : <>Place a rescue tonight to start your streak! 🌙</>}
            </p>
            <p className="font-sans text-xs text-cocoa-soft mt-1">
              Best streak so far: <b>{streak.best} night{streak.best === 1 ? "" : "s"}</b>
            </p>
          </div>
          <div className="text-6xl animate-wiggle">🔥</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <BigStat emoji="🍰" value={impact.itemsRescued} label="treats rescued" tone="from-peach-soft" />
        <BigStat emoji="🎁" value={impact.ordersPlaced} label="orders placed" tone="from-lavender-soft" />
        <BigStat emoji="🌍" value={`~${co2SavedKg(impact.itemsRescued)} kg`} label="CO₂ avoided" tone="from-mint-soft" />
        <BigStat emoji="⚖️" value={`~${kgSaved(impact.itemsRescued)} kg`} label="food saved" tone="from-rose-soft" />
        <BigStat emoji="💰" value={formatINR(orders.reduce((s, o) => s + o.total, 0))} label="spent on rescue" tone="from-butter/70" />
        <BigStat emoji="⭐" value={`${Math.max(1, Math.floor(impact.itemsRescued / 5))}`} label="Sugar Stars" tone="from-lavender" />
      </div>

      {/* Sugar Stars progress */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-cocoa mb-2">⭐ Sugar Stars journey</h3>
        <div className="relative w-full h-3 bg-lavender-soft rounded-pill overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-peach via-rose to-butter rounded-pill transition-all"
            style={{ width: `${Math.min(100, (impact.itemsRescued % 5) * 20)}%` }}
          />
        </div>
        <p className="font-sans text-xs text-cocoa-soft mt-2">
          {5 - (impact.itemsRescued % 5)} more rescues to your next Sugar Star perk — a free Magic Bag upgrade! 🎁
        </p>
      </Card>

      {/* Donation pool community widget */}
      {pool && pool.totalINR > 0 && (
        <Card className="p-6 bg-gradient-to-br from-mint-soft to-cream border border-mint">
          <h3 className="font-display font-bold text-lg text-cocoa flex items-center gap-2 mb-2">💝 Community donations</h3>
          <p className="font-sans text-sm text-plum/85">
            You and other SugarCube rescuers have collectively sponsored <b className="font-display text-cocoa">{pool.treatsSponsored}</b> treat{pool.treatsSponsored === 1 ? "" : "s"} worth <b className="font-display text-cocoa">{formatINR(pool.totalINR)}</b> for our NGO partners. 🌍
          </p>
        </Card>
      )}

      {/* Saved bakeries */}
      {favBakeries.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display font-bold text-lg text-cocoa mb-2">❤ Your saved bakeries</h3>
          <div className="flex flex-wrap gap-2">
            {favBakeries.map((b) => (
              <Link key={b.id} href={`/bakeries/${b.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-pill bg-white/70 border border-lavender-soft hover:bg-peach-soft transition">
                <span className="text-2xl">{b.emoji}</span>
                <span className="font-display font-semibold text-sm text-cocoa">{b.name}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-cocoa mb-3">📜 Your rescue history</h3>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl animate-wiggle">🥐</div>
            <p className="font-sans text-sm text-cocoa-soft mt-3">No rescues yet with that phone.</p>
            <Link href="/" className="inline-block mt-3 font-display font-semibold px-5 py-2 rounded-pill bg-peach text-cocoa">
              Find your first treat 🍰
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white/70 border border-lavender-soft rounded-pill px-4 py-3 font-sans text-sm">
                <div>
                  <div className="font-display font-semibold text-cocoa">Order #{o.pickupCode} · {o.status === "picked_up" ? "✅ picked up" : o.status === "cancelled" ? "❌ cancelled" : "🎟 reserved"}</div>
                  <div className="text-xs text-cocoa-soft">{new Date(o.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <div className="font-display font-bold text-cocoa">{formatINR(o.total)} · ×{o.qty}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-center">
        <button onClick={() => setSubmitted(false)} className="font-sans text-sm text-cocoa-soft hover:text-cocoa underline underline-offset-2">
          ← Try a different phone
        </button>
      </div>
    </div>
  );
}

function BigStat({ emoji, value, label, tone }: { emoji: string; value: string | number; label: string; tone: string }) {
  return (
    <Card className={`p-5 text-center bg-gradient-to-br to-cream ${tone}`}>
      <div className="text-3xl">{emoji}</div>
      <div className="font-display font-extrabold text-2xl text-cocoa mt-1">{value}</div>
      <div className="font-sans text-xs text-cocoa-soft">{label}</div>
    </Card>
  );
}
