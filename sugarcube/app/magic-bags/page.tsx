import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MagicBags } from "@/components/MagicBags";
import { CityGate } from "@/components/CityGate";

export default function MagicBagsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <CityGate>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-rose-soft border border-rose rounded-pill px-4 py-1.5 mb-3 animate-twinkle">
              <span>🎁</span>
              <span className="font-sans font-semibold text-cocoa text-sm">SugarCube Magic Surprise Bags</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-cocoa">
              The dreamy <span className="text-rose">lucky dip</span> 🌈
            </h1>
            <p className="font-sans text-plum/85 mt-3 max-w-xl mx-auto">
              A surprise bag of leftover treats — chosen by the bakery. You skip the choice, the bakery sells more, and the planet grins. 🌍
            </p>
          </div>
          <MagicBags />
        </CityGate>
      </main>
      <Footer />
    </>
  );
}
