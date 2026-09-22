import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function LegalLayout({
  emoji,
  title,
  intro,
  children,
}: {
  emoji: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-6xl animate-float mb-3">{emoji}</div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-cocoa">{title}</h1>
          <p className="font-sans text-plum/80 mt-2 max-w-xl mx-auto">{intro}</p>
        </div>
        <div className="rounded-bubble bg-white/70 border border-lavender-soft shadow-soft p-6 md:p-8 space-y-5">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display font-bold text-cocoa text-xl mt-4">{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-sm text-plum/85 leading-relaxed">{children}</p>;
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="font-sans text-sm text-plum/85 leading-relaxed list-disc pl-5 space-y-1">{children}</ul>;
}
