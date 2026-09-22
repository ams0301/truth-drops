"use client";
import { useState } from "react";
import type { Bakery, Item } from "@/lib/types";
import { Card, Pill } from "./Card";
import { Button } from "./Button";
import { useToast } from "./Toaster";
import { createOrder } from "@/lib/data";
import { formatINR, discountPct, kgSaved, co2SavedKg } from "@/lib/utils";
import { CheckCircle2, MapPin, Clock, ShieldCheck } from "lucide-react";

type Step = "form" | "pay" | "success";

export function ReserveFlow({ item, bakery }: { item: Item; bakery: Bakery }) {
  const toast = useToast();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<{ pickupCode: string; id: string } | null>(null);

  const pct = discountPct(item.originalPrice, item.rescuePrice);
  const total = item.rescuePrice * qty;
  const validPhone = /^\+?\d{10,13}$/.test(phone.replace(/\s+/g, ""));
  const canContinue = name.trim().length > 1 && validPhone && qty > 0 && qty <= item.qty;

  async function fakePay() {
    setPaying(true);
    // Simulate Razorpay flow with a brief delay
    await new Promise((r) => setTimeout(r, 1200));
    setPaying(false);
    const o = await createOrder({
      itemId: item.id,
      bakeryId: bakery.id,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      qty,
      total,
      paid: true,
    });
    setOrder({ pickupCode: o.pickupCode, id: o.id });
    setStep("success");
    toast({ title: "Reservation confirmed! Go pick it up 🍰", emoji: "✨", tone: "mint" });
  }

  if (step === "success" && order) {
    return (
      <Card className="p-6 md:p-8 text-center animate-pop-in">
        <div className="text-6xl animate-wiggle">🎉</div>
        <h3 className="font-display font-bold text-2xl text-cocoa mt-4">
          Saved! Head to {bakery.name} now 🏃
        </h3>
        <p className="font-sans text-sm text-cocoa-soft mt-2">
          Show this pickup code at the counter:
        </p>
        <div className="my-5 inline-flex flex-col items-center bg-white border-2 border-dashed border-rose rounded-bubble px-8 py-5 shadow-soft">
          <span className="font-display font-extrabold text-5xl tracking-[0.3em] text-cocoa">
            {order.pickupCode}
          </span>
          <span className="font-sans text-xs text-cocoa-soft mt-1">SugarCube pickup code</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 font-sans text-xs">
          <Info>
            <MapPin size={14} /> {bakery.area}
          </Info>
          <Info>
            <Clock size={14} /> Pickup by {bakery.rescueWindowEnd}
          </Info>
          <Info>
            <ShieldCheck size={14} /> Eat within 2 hrs
          </Info>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="secondary" onClick={() => { setStep("form"); setOrder(null); }}>
            Rescue another →
          </Button>
          <a href={`https://wa.me/${bakery.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
            <Button variant="primary">💬 Tell bakery on WhatsApp</Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display font-bold text-xl text-cocoa">Reserve this treat 🍮</h3>
        <Pill tone={pct >= 60 ? "rose" : "butter"}>{pct}% off</Pill>
      </div>

      <div className="mt-4 rounded-bubble bg-lavender-soft/60 p-4 font-sans text-sm text-plum">
        🍰 {item.name} · <span className="font-display font-bold text-cocoa">{formatINR(item.rescuePrice)}</span>{" "}
        <span className="line-through text-cocoa-soft">{formatINR(item.originalPrice)}</span>
        {" · "}
        <span className="font-semibold">Only {item.qty} left</span>
      </div>

      {step === "form" ? (
        <div className="mt-5 space-y-4">
          <Field label="Your name" hint="So the bakery knows who's coming 💗">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aisha"
              className="sc-input"
            />
          </Field>
          <Field label="WhatsApp / phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="+91 9XXXXXXXXX"
              className="sc-input"
            />
            {!phone ? null : validPhone ? (
              <span className="text-mint font-semibold text-xs flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> looks good
              </span>
            ) : (
              <span className="text-rose font-semibold text-xs mt-1 block">Enter a valid phone</span>
            )}
          </Field>
          <Field label="How many?">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-pill bg-white border border-lavender text-cocoa font-display font-bold text-xl grid place-items-center hover:bg-lavender-soft active:scale-95"
                aria-label="decrease"
              >−</button>
              <span className="font-display font-bold text-2xl text-cocoa w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(item.qty, q + 1))}
                className="w-10 h-10 rounded-pill bg-white border border-lavender text-cocoa font-display font-bold text-xl grid place-items-center hover:bg-lavender-soft active:scale-95"
                aria-label="increase"
              >+</button>
              <span className="font-sans text-xs text-cocoa-soft ml-2">(max {item.qty})</span>
            </div>
          </Field>

          <div className="rounded-bubble bg-mint-soft/70 border border-mint p-4 font-sans text-sm text-plum">
            <div className="flex justify-between"><span>Sub total</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between text-cocoa-soft"><span>Platform fee</span><span>₹0 (pilot)</span></div>
            <div className="flex justify-between font-display font-bold text-cocoa mt-2 pt-2 border-t border-mint">
              <span>You pay</span><span>{formatINR(total)}</span>
            </div>
            <div className="mt-2 text-xs text-plum flex items-center gap-1">
              🌍 You'll save ~{kgSaved(qty)} kg of food & ~{co2SavedKg(qty)} kg CO₂ 🌍
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full py-4 text-lg"
            disabled={!canContinue}
            onClick={() => setStep("pay")}
          >
            Continue to pay · {formatINR(total)} →
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-bubble bg-white border border-lavender-soft p-5 space-y-2 font-sans text-sm">
            <Row label="Treat">{item.emoji} {item.name}</Row>
            <Row label="Bakery">{bakery.name}</Row>
            <Row label="Name">{name.trim()}</Row>
            <Row label="Phone">{phone.trim()}</Row>
            <Row label="Qty">{qty}</Row>
            <div className="pt-2 border-t border-lavender-soft flex justify-between font-display font-bold text-cocoa">
              <span>Total</span><span>{formatINR(total)}</span>
            </div>
          </div>
          <p className="font-sans text-xs text-cocoa-soft text-center">
            🟢 Demo pilot: payment is stubbed (no real card/UPI charged). On production this opens Razorpay.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setStep("form")} disabled={paying}>
              ← Edit details
            </Button>
            <Button variant="magic" className="flex-1 py-4" onClick={fakePay} disabled={paying}>
              {paying ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-cocoa/40 border-t-cocoa rounded-full animate-spin-donut" />
                  Reserving…
                </>
              ) : (
                <>✨ Pay {formatINR(total)} & reserve</>
              )}
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .sc-input {
          width: 100%;
          background: white;
          border: 1px solid var(--color-lavender-soft);
          border-radius: var(--radius-pill);
          padding: 0.7rem 1.1rem;
          font-family: var(--font-sans);
          font-weight: 500;
          color: var(--color-charcoal);
          outline: none;
          transition: all .2s;
        }
        .sc-input:focus {
          border-color: var(--color-peach);
          box-shadow: 0 0 0 4px rgba(255,217,196,0.4);
        }
      `}</style>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-display font-semibold text-sm text-cocoa flex items-center gap-2">
        {label}
        {hint && <span className="font-sans font-normal text-xs text-cocoa-soft">· {hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-cocoa-soft">{label}</span>
      <span className="text-cocoa font-semibold text-right">{children}</span>
    </div>
  );
}
function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-pill bg-white/70 px-2 py-2 border border-lavender-soft text-cocoa-soft">
      {children}
    </div>
  );
}
