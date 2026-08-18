import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Card";
import { SupportForm } from "@/components/SupportForm";
import { SUPPORT_EMAIL } from "@/lib/config";
import { Mail, MessageCircleHeart, Clock, Store, HeartHandshake } from "lucide-react";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-7xl animate-float mb-3">💌</div>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-cocoa">
            We're <span className="text-rose">here</span> for you 🌙
          </h1>
          <p className="font-sans text-plum/85 mt-3 max-w-md mx-auto">
            A question, a worry, a kind word — drop a line and we'll reply sweet & swift.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Card className="p-5 text-center">
            <Mail className="mx-auto text-cocoa-soft" />
            <h3 className="font-display font-bold text-cocoa mt-2">Email us</h3>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-sans text-sm text-rose hover:underline break-all">
              {SUPPORT_EMAIL}
            </a>
          </Card>
          <Card className="p-5 text-center">
            <Clock className="mx-auto text-cocoa-soft" />
            <h3 className="font-display font-bold text-cocoa mt-2">Reply times</h3>
            <p className="font-sans text-sm text-cocoa-soft">Within 24 hours, every working day.</p>
          </Card>
          <Card className="p-5 text-center">
            <MessageCircleHeart className="mx-auto text-cocoa-soft" />
            <h3 className="font-display font-bold text-cocoa mt-2">Kindness policy</h3>
            <p className="font-sans text-sm text-cocoa-soft">No question is too small. Be patient, we're a tiny team 🍰</p>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Pill tone="butter"><Store size={12} /> Bakery owner?</Pill>
          <Pill tone="mint"><HeartHandshake size={12} /> Sweet tooth?</Pill>
          <span className="font-sans text-xs text-cocoa-soft px-1">Both welcome below</span>
        </div>

        <SupportForm />

        <Card className="p-5 mt-6">
          <h3 className="font-display font-bold text-cocoa mb-2">Common queries</h3>
          <p className="font-sans text-sm text-cocoa-soft">
            Before writing, you may find a quick answer on our{" "}
            <a href="/faq" className="text-rose underline underline-offset-2 font-semibold">FAQ</a> or{" "}
            <a href="/food-safety" className="text-rose underline underline-offset-2 font-semibold">Food Safety</a> page.
          </p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
