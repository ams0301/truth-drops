import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MerchantDashboard } from "@/components/MerchantDashboard";
import { MerchantHero } from "@/components/MerchantHero";

export default function MerchantPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <MerchantHero />
        <MerchantDashboard />
      </main>
      <Footer />
    </>
  );
}
