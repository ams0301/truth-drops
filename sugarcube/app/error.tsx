"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex-1 max-w-xl mx-auto px-6 py-20 text-center">
      <div className="text-8xl animate-wiggle">🍰</div>
      <h1 className="font-display font-extrabold text-3xl text-cocoa mt-4 leading-tight">
        Oops! A pastry fell over 🥲
      </h1>
      <p className="font-sans text-plum/85 mt-3">
        Something dreamy went wrong on our side. Please try again — the kitchen gets messy sometimes.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={reset}
          className="font-display font-semibold px-7 py-3 rounded-pill bg-peach text-cocoa shadow-soft"
        >
          🔄 Try again
        </button>
        <Link href="/" className="font-display font-semibold px-7 py-3 rounded-pill bg-white text-cocoa border border-lavender-soft">
          🍰 Home
        </Link>
      </div>
    </main>
  );
}
