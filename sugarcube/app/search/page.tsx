import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchClient } from "@/components/SearchClient";
import { CityGate } from "@/components/CityGate";

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <CityGate>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-cocoa mb-1">
            Search the dreamy bakery aisle 🔍
          </h1>
          <p className="font-sans text-sm text-cocoa-soft mb-6">Find a treat by name, category or bakery area.</p>
          <SearchClient />
        </CityGate>
      </main>
      <Footer />
    </>
  );
}
