import { LegalLayout, H2, P, UL } from "@/components/LegalLayout";

export const metadata = { title: "Privacy Policy" };

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <LegalLayout emoji="🔒" title="Privacy Policy" intro={`Your data, handled like pastry — gently & with care. Last updated ${new Date().toLocaleDateString("en-IN")}.`}>
      <H2>1. What we collect</H2>
      <UL>
        <li><b>Name & phone</b> — only when you reserve a treat (so the bakery can confirm pickup).</li>
        <li><b>Email</b> — only when you write to Support or join a waitlist.</li>
        <li><b>Chosen city</b> — stored on your device so the site loads the right treats.</li>
        <li><b>Approximate location</b> — best-effort IP geolocation on first visit to auto-suggest your city. You can override it anytime.</li>
        <li><b>Order history</b> — so your Impact page works.</li>
      </UL>

      <H2>2. Where it lives</H2>
      <P>
        During the pilot demo, all data (order history, your selected city) is stored only in <b className="text-cocoa">your own browser's localStorage</b> — it never leaves your device. When production Supabase is connected, your email & order data lives on Supabase (in Mumbai region servers).
      </P>

      <H2>3. Who we share with</H2>
      <P>
        Your name and phone are shared with the bakery once you reserve — they need them to hand over the treat.
        We never sell your data. We never share it with advertisers.
        We share aggregate, anonymised impact numbers (e.g. "10kg food rescued") for PR/marketing.
      </P>

      <H2>4. Cookies & third-party</H2>
      <P>
        We use no tracking cookies during the pilot. The one-time IP geolookup hits <code className="bg-lavender-soft px-1 rounded">ipapi.co</code> anonymously to suggest your city — that may set its own cookie, which you can clear from your browser.
      </P>

      <H2>5. Bakery listings</H2>
      <P>
        Photos, descriptions and allergen information uploaded by bakeries are stored as listings and shown publicly (not your customer data — your customer identity is only shared with the specific bakery you reserve from).
      </P>

      <H2>6. Your rights</H2>
      <P>
        Email us at <a href="mailto:mohanaadarsh3@gmail.com" className="text-rose font-semibold underline underline-offset-2">mohanaadarsh3@gmail.com</a> to request the data we hold, correct it, or ask us to forget you. (Browser-side data you can clear yourself via "Settings → Site Data → Clear".)
      </P>

      <H2>7. Children</H2>
      <P>SugarCube is not intended for use by children under 13. We don't knowingly collect their data.</P>

      <H2>8. Security</H2>
      <P>
        We protect your data with TLS, encrypted storage at Supabase, and least-privilege access internally. No service is ever 100% secure — we promise transparency if there's a breach.
      </P>

      <H2>9. Changes</H2>
      <P>We'll update this page as the product evolves; the date above will reflect changes.</P>

      <H2>10. Contact</H2>
      <P>
        Privacy questions go to <a href="mailto:mohanaadarsh3@gmail.com" className="text-rose font-semibold underline underline-offset-2">mohanaadarsh3@gmail.com</a>.
      </P>
    </LegalLayout>
  );
}
