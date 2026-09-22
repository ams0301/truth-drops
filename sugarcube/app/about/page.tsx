import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { WhatsAppBotCTA } from "@/components/WhatsAppBotCTA";
import { AboutHero } from "@/components/AboutHero";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-10">
        <AboutHero />
        <Card className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="font-display font-bold text-xl text-cocoa">🌙 The dream</h2>
            <p className="font-sans text-sm text-plum/85 mt-1">
              SugarCube connects those leftover treats with neighbours who love a sweet deal.
              Bakeries recover up to 60% cost. Rescuers get fresh luxury treats at 40–70% off.
              Food waste falls. Smiles rise.
            </p>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-cocoa">🍓 How it works for you</h2>
            <ol className="mt-2 space-y-2 font-sans text-sm text-plum/85">
              <li><Num /> <b>Find</b> tonight's leftover treats on SugarCube (sorted by pickup urgency).</li>
              <li><Num /> <b>Reserve</b> in one tap with your name + WhatsApp (Razorpay pilot).</li>
              <li><Num /> <b>Pick up</b> at the bakery with your SugarCube pickup code before closing.</li>
              <li><Num /> <b>Eat</b> within 2 hours for max freshness & joy. 🍰</li>
            </ol>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-cocoa">🏪 For bakeries</h2>
            <p className="font-sans text-sm text-plum/85 mt-1">
              Don't even need the app — just WhatsApp us your leftovers in the form
              <code className="bg-lavender-soft px-1.5 py-0.5 rounded mx-1 font-sans text-xs">{"<name> <price> <qty>"}</code>
              and we'll publish instantly. Then track pickups & revenue from your dashboard.
            </p>
            <div className="mt-3"><WhatsAppBotCTA /></div>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-cocoa">⚠️ Pilot caveats</h2>
            <ul className="mt-2 space-y-1 font-sans text-sm text-plum/85 list-disc pl-5">
              <li>Pickup only (no delivery yet — keeps food & you safe).</li>
              <li>Payment is stubbed in this demo (no real ₹ charged). Production will use Razorpay.</li>
              <li>Always consume rescued treats within 2 hours of pickup.</li>
              <li>Allergen information is provided by bakeries — please confirm at pickup.</li>
            </ul>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
}

function Num() {
  return <span className="inline-flex w-5 h-5 rounded-pill bg-peach text-cocoa font-display font-bold text-xs items-center justify-center mr-1">✨</span>;
}
