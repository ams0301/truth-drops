"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Button } from "./Button";
import { useToast } from "./Toaster";
import { placeCartOrder } from "@/lib/data";
import { formatINR, cn } from "@/lib/utils";
import { X, ShoppingBag, CheckCircle2 } from "lucide-react";

export function CartDrawer() {
  const { lines, total, count, isOpen, close, setQty, clear, bakeryId } = useCart();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [donate, setDonate] = useState(20);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState<{ code: string; name: string } | null>(null);

  const validPhone = /^\+?\d{10,13}$/.test(phone.replace(/\s+/g, ""));
  const valid = name.trim().length > 1 && validPhone && lines.length > 0;
  const grand = total + (donate > 0 ? donate : 0);

  async function pay() {
    if (!valid) {
      toast({ title: "Please add name + phone 🍰", emoji: "⚠️", tone: "rose" });
      return;
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1100));
    const orders = await placeCartOrder({
      bakeryId: bakeryId!,
      lines: lines.map((l) => ({ item: l.item, qty: l.qty })),
      customerName: name.trim(),
      customerPhone: phone.trim(),
      donationInr: donate > 0 ? donate : 0,
    });
    setPaying(false);
    const code = orders[0]?.pickupCode ?? "----";
    // Same pickup code across all lines for one bakery by design (post-demo could differ)
    setConfirmed({ code, name: name.trim() });
    setLines([]);
    (window as any).dispatchEvent(new CustomEvent("sc-data-change"));
    toast({ title: `Reserved ${orders.length} item(s)! Pickup code shown. 🍰`, emoji: "✨", tone: "mint" });
  }

  // re-render helpers — setLines baked into CartProvider state updates via subscribe
  const setLines = (_l: never[]) => {};

  return (
    <>
      <button
        aria-label="Close cart"
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-charcoal/30 transition-opacity",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream z-50 shadow-float flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <header className="px-5 py-4 flex items-center justify-between bg-lavender-soft/70 border-b border-lavender-soft">
          <h2 className="font-display font-bold text-lg text-cocoa flex items-center gap-2">
            <ShoppingBag size={18} /> Your rescue bag 🍮
            {count > 0 && <span className="text-xs font-sans font-semibold bg-peach text-cocoa px-2 py-0.5 rounded-pill">{count}</span>}
          </h2>
          <button onClick={close} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-pill bg-white/70 hover:bg-white">
            <X size={18} />
          </button>
        </header>

        {confirmed ? (
          <div className="flex-1 p-6 text-center overflow-y-auto">
            <div className="text-7xl animate-wiggle">🎉</div>
            <h3 className="font-display font-bold text-2xl text-cocoa mt-4">
              Saved! See you at the bakery 🏃
            </h3>
            <p className="font-sans text-sm text-cocoa-soft mt-1">Show this pickup code:</p>
            <div className="my-5 inline-flex flex-col items-center bg-white border-2 border-dashed border-rose rounded-bubble px-8 py-5 shadow-soft">
              <span className="font-display font-extrabold text-5xl tracking-[0.3em] text-cocoa">{confirmed.code}</span>
              <span className="font-sans text-xs text-cocoa-soft mt-1">SugarCube pickup code</span>
            </div>
            {donate > 0 && (
              <p className="font-sans text-xs text-mint bg-mint-soft/60 border border-mint rounded-pill px-3 py-2 inline-block">
                💝 You sponsored ~{Math.round(donate / 30)} treat(s) for someone in need — thank you, {confirmed.name}!
              </p>
            )}
            <div className="mt-6">
              <Button variant="primary" onClick={() => { setConfirmed(null); close(); }}>
                Continue dreaming →
              </Button>
            </div>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <div className="text-7xl animate-wiggle">🛒</div>
              <h3 className="font-display font-bold text-lg text-cocoa mt-4">Your bag is empty</h3>
              <p className="font-sans text-sm text-cocoa-soft mt-2 max-w-xs">
                Add treats from any bakery to start rescuing. (Items across bakeries will swap automatically — we keep one pickup per order.)
              </p>
              <Button variant="primary" className="mt-5" onClick={close}>Discover treats →</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {lines.map((l) => (
                <div key={l.itemId} className="flex items-center gap-3 bg-white/70 border border-lavender-soft rounded-bubble p-3">
                  <div className="text-3xl">{l.item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-cocoa truncate">{l.item.name}</div>
                    <div className="font-sans text-xs text-cocoa-soft">{formatINR(l.item.rescuePrice)} each</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setQty(l.itemId, l.qty - 1)} className="w-7 h-7 grid place-items-center rounded-pill bg-white border border-lavender hover:bg-lavender-soft font-display font-bold text-cocoa">−</button>
                    <span className="w-6 text-center font-display font-bold text-cocoa">{l.qty}</span>
                    <button onClick={() => setQty(l.itemId, l.qty + 1)} className="w-7 h-7 grid place-items-center rounded-pill bg-white border border-lavender hover:bg-lavender-soft font-display font-bold text-cocoa">+</button>
                  </div>
                  <div className="w-16 text-right font-display font-bold text-cocoa text-sm">{formatINR(l.item.rescuePrice * l.qty)}</div>
                  <button onClick={() => setQty(l.itemId, 0)} aria-label="remove" className="text-cocoa-soft hover:text-rose ml-1">✕</button>
                </div>
              ))}
              <button onClick={() => { clear(); toast({ title: "Bag cleared", emoji: "🧹", tone: "soft" }); }} className="text-xs text-cocoa-soft hover:text-rose underline underline-offset-2 mt-2 ml-auto block">
                Clear bag
              </button>
            </div>

            <div className="border-t border-lavender-soft p-5 bg-white/60 space-y-3">
              {/* Donation toggle */}
              <div className="rounded-bubble bg-rose-soft/60 border border-rose p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💝</span>
                    <div>
                      <div className="font-display font-semibold text-sm text-cocoa">Sponsor a treat</div>
                      <div className="font-sans text-[11px] text-cocoa-soft">Helps an NGO rescue similar leftover sweets tonight.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDonate(amt)}
                        className={cn(
                          "px-2.5 py-1 rounded-pill text-xs font-display font-semibold border transition",
                          donate === amt ? "bg-rose text-white border-rose" : "bg-white text-cocoa border-lavender-soft",
                        )}
                      >
                        {amt === 0 ? "Skip" : `₹${amt}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white border border-lavender-soft rounded-pill px-4 py-2.5 font-sans font-medium text-sm text-cocoa outline-none focus:border-peach"
              />
              <input
                value={phone}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp +91…"
                className="w-full bg-white border border-lavender-soft rounded-pill px-4 py-2.5 font-sans font-medium text-sm text-cocoa outline-none focus:border-peach"
              />

              <div className="rounded-bubble bg-mint-soft/70 p-3 text-sm font-sans">
                <div className="flex justify-between"><span>Treats</span><span>{formatINR(total)}</span></div>
                {donate > 0 && <div className="flex justify-between text-cocoa-soft mt-0.5"><span>Donation</span><span>{formatINR(donate)}</span></div>}
                <div className="flex justify-between font-display font-bold text-cocoa mt-1 pt-1 border-t border-mint">
                  <span>Total</span><span>{formatINR(grand)}</span>
                </div>
              </div>

              <Button variant="magic" className="w-full py-3.5" disabled={!valid || paying} onClick={pay}>
                {paying ? (
                  <><span className="inline-block w-5 h-5 border-2 border-cocoa/40 border-t-cocoa rounded-full animate-spin-donut" /> Reserving…</>
                ) : (
                  <><CheckCircle2 size={18} /> Pay {formatINR(grand)} & reserve</>
                )}
              </Button>
              <p className="font-sans text-[10px] text-cocoa-soft text-center">
                🟢 Demo pilot — payment stubbed (no real ₹ charged). Production uses Razorpay.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
