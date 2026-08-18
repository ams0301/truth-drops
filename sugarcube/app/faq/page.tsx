import { LegalLayout, H2, P, UL } from "@/components/LegalLayout";

export const metadata = { title: "FAQ" };

export default function FAQPage() {
  return (
    <LegalLayout emoji="❓" title="Sweet questions, dreamy answers" intro="Everything you might wonder before rescuing a treat tonight.">
      <H2>🍰 What is SugarCube?</H2>
      <P>SugarCube is a marketplace where bakeries and mithai shops sell their end-of-day leftover treats at 40–70% off, so they don't go to waste. You save money, the bakery recovers cost, the planet is happier.</P>

      <H2>📍 Where is SugarCube active?</H2>
      <P>Currently live in Patna only. We're baking up the next cities — Ranchi, Varanasi, Kolkata and beyond. Use the city switcher in the top bar to pick where you are (or where you'll soon be visiting).</P>
      <UL>
        <li>Live city → browse and reserve treats.</li>
        <li>Coming-soon city → join the waitlist; we'll email you the moment we open.</li>
      </UL>

      <H2>🌙 When do I pick up?</H2>
      <P>Each bakery has a "rescue window" (usually 8 PM to closing, ~10–11 PM). Your pickup code is only valid during that window. We strongly recommend picking up early for freshest treats.</P>

      <H2>💳 How do I pay?</H2>
      <P>This demo runs on a stubbed payment — no real money is charged. When SugarCube goes live, payments flow through <b className="text-cocoa">Razorpay</b> (UPI, cards, netbanking, wallets).</P>

      <H2>🎁 What's a Magic Bag?</H2>
      <P>A surprise leftover bundle chosen by the bakery — usually 3–4 items at a deeper discount. You skip the choice, the bakery clears more shelves. Two lucky dips available: bakery-style and mithai-style.</P>

      <H2>🥐 The treat I wanted is gone!</H2>
      <P>Treats are first-come-first-served and inventory updates live. We sort by "closing soon" so you can race to grab your favourite. You can also save the bakery page so you can rush back tomorrow at their window.</P>

      <H2>🤧 Is leftover food safe to eat?</H2>
      <P>Yes, when eaten the same night. SugarCube lists items only within their best-before window set by the bakery. Read our <a href="/food-safety" className="text-rose font-semibold underline underline-offset-2">Food Safety guide</a> for full details.</P>

      <H2>🏪 I'm a bakery owner — how do I list?</H2>
      <P>You don't even need the app. Tap "List via WhatsApp" anywhere on the site, or visit the <a href="/merchant" className="text-rose font-semibold underline underline-offset-2">Merchant portal</a> to add things from a dashboard. We're happy to onboard you over email — <a href="mailto:mohanaadarsh3@gmail.com" className="text-rose font-semibold underline underline-offset-2">mohanaadarsh3@gmail.com</a>.</P>

      <H2>🔄 Can I cancel a reservation?</H2>
      <P>During the pilot, once you've paid & reserved, you can't auto-cancel — the bakery has set the treat aside for you. Please reach out via Support if something serious came up and we'll do our best.</P>

      <H2>🌍 How do you calculate my impact?</H2>
      <P>Every rescued item ≈ 120g of food, and ~2.5kg CO₂e per kg of food waste averted (per FAO estimates). The My Impact page sums your pickups to date.</P>
    </LegalLayout>
  );
}
