import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, Pill } from "@/components/Card";
import { ItemCard } from "@/components/ItemCard";
import { CityGate } from "@/components/CityGate";
import { BakeryFeed } from "@/components/BakeryFeed";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getBakery, listBakeryItems, listRatings } from "@/lib/data";
import { ArrowLeft, Clock, MapPin, Phone, Star } from "lucide-react";

export default async function BakeryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bakery = await getBakery(id);
  if (!bakery) notFound();
  const [items, ratings] = await Promise.all([listBakeryItems(bakery.id), listRatings(bakery.id)]);
  const avg = ratings.length ? ratings.reduce((a, r) => a + r.stars, 0) / ratings.length : bakery.rating;

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-6">
       <CityGate>
        <Link href="/" className="inline-flex items-center gap-1.5 font-sans text-sm text-cocoa-soft hover:text-cocoa mb-4">
          <ArrowLeft size={16} /> Discover more bakeries
        </Link>

        <Card accent={bakery.accent} className="p-6 md:p-8 relative">
          <div className="absolute top-4 right-4"><FavoriteButton bakeryId={bakery.id} /></div>
          <div className="flex flex-col md:flex-row items-start gap-6 pr-10">
            <div className="text-7xl animate-float">{bakery.emoji}</div>
            <div className="flex-1">
              <h1 className="font-display font-extrabold text-3xl text-cocoa leading-tight">{bakery.name}</h1>
              <div className="flex items-center flex-wrap gap-3 mt-2 font-sans text-sm">
                <span className="flex items-center gap-1 font-display font-bold text-cocoa">
                  <Star size={14} className="fill-rose text-rose" /> {avg.toFixed(1)}
                </span>
                <span className="text-cocoa-soft">· {bakery.reviews} reviews</span>
                <span className="text-cocoa-soft">· 📍 {bakery.area}</span>
              </div>
              <p className="font-sans text-sm text-cocoa-soft mt-2 flex items-start gap-1.5">
                <MapPin size={14} className="mt-0.5 shrink-0" /> {bakery.address}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {bakery.tags.map((t) => <Pill key={t} tone="soft">{t}</Pill>)}
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 font-sans text-sm">
                <Stat icon={<Clock size={14} />} label="Opens" value={bakery.opensAt} />
                <Stat icon={<Clock size={14} />} label="Closes" value={bakery.closesAt} />
                <Stat icon={<span>🌙</span>} label="Rescue window" value={`${bakery.rescueWindowStart}–${bakery.rescueWindowEnd}`} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <a href={`https://wa.me/${bakery.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-display font-semibold text-sm bg-mint text-plum px-4 py-2 rounded-pill border border-mint hover:shadow-soft">
                  <Phone size={14} /> WhatsApp {bakery.phone}
                </a>
                <span className="font-sans text-xs text-cocoa-soft">📞 Call ahead to confirm pickup</span>
              </div>
            </div>
          </div>
        </Card>

        <h2 className="font-display font-bold text-2xl text-cocoa mt-8 mb-4">
          🍰 Treats left tonight ({items.length})
        </h2>

        {items.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-6xl animate-wiggle">🥐</div>
            <h3 className="font-display font-bold text-xl text-cocoa mt-3">No treats left tonight 💗</h3>
            <p className="font-sans text-sm text-cocoa-soft mt-2">
              Their rescue window opens at {bakery.rescueWindowStart}. Pop in tomorrow!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((i) => <ItemCard key={i.id} item={i} />)}
          </div>
        )}

        {bakery.rescueOpen === false && (
          <div className="mt-8 rounded-bubble bg-lavender-soft/70 border border-lavender px-6 py-5 text-center">
            <div className="text-4xl animate-wiggle">💤</div>
            <h3 className="font-display font-bold text-lg text-plum mt-2">{bakery.name} hasn't opened tonight's rescue window</h3>
            <p className="font-sans text-sm text-cocoa-soft mt-1">
              They typically open around {bakery.rescueWindowStart} — pop back soon, or save this bakery with the heart above to get alerted.
            </p>
          </div>
        )}

        <div className="mt-10">
          <BakeryFeed bakeryId={bakery.id} bakeryName={bakery.name} />
        </div>

        {ratings.length > 0 && (
          <>
            <h2 className="font-display font-bold text-2xl text-cocoa mt-10 mb-4">💗 Rescuer love</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratings.slice(0, 6).map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-rose">{"★".repeat(r.stars)}</span>
                    <span className="font-sans text-xs text-cocoa-soft">{r.note}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
       </CityGate>
      </main>
      <Footer />
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/70 border border-lavender-soft rounded-pill px-3 py-2">
      <span className="text-cocoa-soft">{icon}</span>
      <div>
        <div className="font-sans text-[11px] text-cocoa-soft">{label}</div>
        <div className="font-display font-bold text-cocoa text-sm">{value}</div>
      </div>
    </div>
  );
}
