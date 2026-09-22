import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Favorites } from "@/components/Favorites";
import { CityGate } from "@/components/CityGate";

export const metadata = { title: "My saved bakeries" };

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <CityGate>
          <h1 className="font-display font-extrabold text-3xl text-cocoa mb-1">
            💗 Your saved bakeries
          </h1>
          <p className="font-sans text-sm text-cocoa-soft mb-6">
            Tap the heart on any bakery to add them here. We'll send a friendly ping
            the moment their rescue window opens tonight. (Live alerts coming soon — for now, peek back at 8 PM!)
          </p>
          <Favorites />
        </CityGate>
      </main>
      <Footer />
    </>
  );
}
