import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Impact } from "@/components/Impact";

export default function ImpactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-6xl animate-float mb-3">🌍</div>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-cocoa">
            Your <span className="text-rose">rescue</span> journey 🍰
          </h1>
          <p className="font-sans text-plum/85 mt-3 max-w-md mx-auto">
            Every treat you rescued brought a smile to a baker and a sigh to the planet.
          </p>
        </div>
        <Impact />
      </main>
      <Footer />
    </>
  );
}
