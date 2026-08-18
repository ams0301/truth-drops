import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto px-6 py-20 text-center">
        <div className="text-8xl animate-wiggle">🥐💤</div>
        <h1 className="font-display font-extrabold text-4xl text-cocoa mt-4 leading-tight">
          This treat has already<br />wandered home 💗
        </h1>
        <p className="font-sans text-plum/85 mt-3">
          The page you're hunting for isn't here tonight. Let's find you a fresh rescue instead.
        </p>
        <Link href="/" className="inline-block mt-6">
          <span className="font-display font-semibold px-7 py-3 rounded-pill bg-peach text-cocoa shadow-soft">
            🍰 Back to discover
          </span>
        </Link>
      </main>
      <Footer />
    </>
  );
}
