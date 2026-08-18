import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Pill } from "@/components/Card";
import { getBakery, getItem } from "@/lib/data";
import { ReserveFlow } from "@/components/ReserveFlow";
import { CityGate } from "@/components/CityGate";
import { formatINR, discountPct, relativeWindow } from "@/lib/utils";
import { ArrowLeft, Clock, MapPin, ShieldAlert, Star } from "lucide-react";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();
  const bakery = await getBakery(item.bakeryId);
  if (!bakery) notFound();

  const pct = discountPct(item.originalPrice, item.rescuePrice);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-6">
       <CityGate>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-cocoa-soft hover:text-cocoa transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to all treats
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Visual side */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-8 md:p-12 text-center relative overflow-hidden animate-pop-in">
              <div className="absolute top-4 left-4">
                <Pill tone={pct >= 60 ? "rose" : "butter"}>{pct}% off 🎀</Pill>
              </div>
              <div className="absolute top-4 right-4">
                <Pill tone="mint">{item.veg ? "🟢 Veg" : "🟤 Non-veg"}</Pill>
              </div>
              <div className="text-9xl animate-float mt-2">{item.emoji}</div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-cocoa mt-6 leading-tight">
                {item.name}
              </h1>
              <p className="font-sans text-plum/85 mt-3 max-w-md mx-auto">{item.description}</p>

              <div className="mt-6 flex items-baseline justify-center gap-3">
                <span className="font-display font-extrabold text-4xl text-rose">
                  {formatINR(item.rescuePrice)}
                </span>
                <span className="font-sans text-lg text-cocoa-soft line-through">
                  {formatINR(item.originalPrice)}
                </span>
                <span className="font-sans text-sm font-semibold text-mint bg-white px-3 py-1 rounded-pill border border-mint">
                  Save {formatINR(item.originalPrice - item.rescuePrice)}
                </span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-cocoa mb-3">🌙 Freshness & safety</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-sans text-sm">
                <Stat label="Baked at" value={item.bakedAt} emoji="👨‍🍳" />
                <Stat label="Best before" value={item.bestBefore} emoji="⏰" />
                <Stat label="Pickup by" value={bakery.rescueWindowEnd} emoji="🏃" />
              </div>
              {item.allergens.length > 0 && (
                <div className="mt-3 flex items-start gap-2 font-sans text-xs text-cocoa-soft bg-butter/40 rounded-pill px-3 py-2">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                  <span>Contains: {item.allergens.join(", ")}. Please inform the bakery of any allergies.</span>
                </div>
              )}
              <p className="mt-2 font-sans text-[11px] text-cocoa-soft">
                ⚠️ Always consume rescued treats within 2 hours of pickup. SugarCube is a marketplace — quality is the bakery's responsibility.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="font-display font-bold text-lg text-cocoa mb-2">🏪 From {bakery.name}</h3>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{bakery.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-sans text-sm">
                    <span className="font-display font-bold text-cocoa flex items-center gap-1">
                      <Star size={14} className="fill-rose text-rose" /> {bakery.rating}
                    </span>
                    <span className="text-cocoa-soft">· {bakery.reviews} reviews</span>
                  </div>
                  <p className="font-sans text-sm text-cocoa-soft mt-1 flex items-start gap-1.5">
                    <MapPin size={14} className="mt-0.5 shrink-0" /> {bakery.address}
                  </p>
                  <p className="font-sans text-xs text-cocoa-soft mt-1 flex items-center gap-1.5">
                    <Clock size={13} /> Tonight's rescue window: {bakery.rescueWindowStart}–{bakery.rescueWindowEnd}
                  </p>
                  <div className="mt-2">
                    <Link href={`/bakeries/${bakery.id}`}>
                      <span className="font-display font-semibold text-sm text-cocoa underline underline-offset-2">
                        View all {bakery.name}'s treats →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Reserve flow */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            {item.qty <= 0 ? (
              <Card className="p-8 text-center">
                <div className="text-7xl animate-wiggle">🥐</div>
                <h3 className="font-display font-bold text-xl text-cocoa mt-3">
                  All gone! They've found dreamy homes 💗
                </h3>
                <p className="font-sans text-sm text-cocoa-soft mt-2">
                  Try another treat, or come back tomorrow at {bakery.rescueWindowStart} PM!
                </p>
                <Link href="/" className="inline-block mt-4">
                  <span className="font-display font-semibold text-cocoa bg-peach px-5 py-2.5 rounded-pill">
                    Discover more →
                  </span>
                </Link>
              </Card>
            ) : (
              <>
                <div className="text-center mb-2">
                  <Pill tone="rose">{"⏳ " + relativeWindow(bakery.rescueWindowEnd)}</Pill>
                </div>
                <ReserveFlow item={item} bakery={bakery} />
              </>
            )}
          </div>
        </div>
       </CityGate>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-bubble bg-white/70 border border-lavender-soft px-4 py-3">
      <div className="text-xl">{emoji}</div>
      <div className="font-sans text-xs text-cocoa-soft mt-0.5">{label}</div>
      <div className="font-display font-bold text-cocoa">{value}</div>
    </div>
  );
}
