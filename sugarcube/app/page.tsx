import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Discover } from "@/components/Discover";
import { BakeryOwnerBanner } from "@/components/BakeryOwnerBanner";
import { DonationBanner } from "@/components/DonationBanner";
import { CityGate } from "@/components/CityGate";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CityGate>
          <Hero />
          <Discover />
          <DonationBanner />
          <BakeryOwnerBanner />
        </CityGate>
      </main>
      <Footer />
    </>
  );
}
