import { LegalLayout, H2, P, UL } from "@/components/LegalLayout";

export const metadata = { title: "Terms of Use" };

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <LegalLayout emoji="📄" title="Terms of Use" intro={`Pilot terms — last updated ${new Date().toLocaleDateString("en-IN")}. We've kept them readable, like a sweet recipe card.`}>
      <H2>1. What SugarCube is</H2>
      <P>
        SugarCube ("we", "us", "SugarCube") is a marketplace operated from India, connecting bakeries and sweet shops with customers ("you") to sell leftover treats at the end of each day. We are not a food business ourselves — we provide the listing, reservation and pickup-code tools.
      </P>

      <H2>2. Using the service</H2>
      <UL>
        <li>You must be 18+ or have a guardian's permission to reserve treats.</li>
        <li>Provide accurate name + phone at checkout — your pickup code only works when they match.</li>
        <li>Treat chefs, bakers and counter staff at our bakeries with kindness. 💗</li>
        <li>Don't resell, bulk-hoard or otherwise misuse reserved treats — they are for personal enjoyment.</li>
      </UL>

      <H2>3. The marketplace relationship</H2>
      <P>
        Your contract of sale is with the <b className="text-cocoa">bakery</b>, not SugarCube.
        SugarCube facilitates discovery, reserve flow and pickup tokens.
        Food quality, freshness, allergen accuracy and hygiene are the bakery's responsibility.
      </P>

      <H2>4. Payments (pilot)</H2>
      <P>
        During the pilot phase on this site, payment is <b className="text-cocoa">stubbed</b> — no real money is charged. Any "payment" screen is a simulation. When we go fully live, payments flow through Razorpay, subject to its own terms.
      </P>

      <H2>5. Reservations & cancellations</H2>
      <P>
        A reservation commits inventory for you at the bakery. During the pilot, paid reservations are non-refundable except in cases of clear food-safety failure — email support in that case.
      </P>

      <H2>6. Food safety</H2>
      <P>
        You've read and accept our <a href="/food-safety" className="text-rose font-semibold underline underline-offset-2">Food Safety guide</a>, including the 2-hour rule and that allergen/veg tags are bakery-provided.
      </P>

      <H2>7. Liability</H2>
      <P>
        To the maximum extent permitted by Indian law, SugarCube is not liable for any harm arising from food purchased through the marketplace. Your recourse for food-related issues is against the bakery.
      </P>

      <H2>8. Acceptable use & content</H2>
      <P>
        You won't scrape, reverse-engineer, spam, harass or upload unlawful content via any SugarCube form (incl. Support and merchant listings).
      </P>

      <H2>9. Account & data</H2>
      <P>
        Currently SugarCube doesn't require a password — you identify by phone number for the Impact page. We may add accounts later. Read our <a href="/privacy" className="text-rose font-semibold underline underline-offset-2">Privacy Policy</a>.
      </P>

      <H2>10. Changes</H2>
      <P>
        We will update this page as SugarCube grows. The "last updated" date above will reflect that. Continued use after a change counts as acceptance.
      </P>

      <H2>11. Contact</H2>
      <P>
        Questions? <a href="mailto:mohanaadarsh3@gmail.com" className="text-rose font-semibold underline underline-offset-2">mohanaadarsh3@gmail.com</a> — we reply within 24 working hours.
      </P>
    </LegalLayout>
  );
}
