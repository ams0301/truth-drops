import { LegalLayout, H2, P, UL } from "@/components/LegalLayout";

export const metadata = { title: "Food Safety" };

export default function FoodSafetyPage() {
  return (
    <LegalLayout emoji="🍣" title="Food safety, sweetly explained" intro="How SugarCube keeps rescued treats delicious & safe tonight — and what we ask of you.">
      <H2>🌙 The 2-hour rule</H2>
      <P>
        SugarCube is a same-evening rescue marketplace. Once you pick up your treat,
        we ask you to <b className="text-cocoa">eat it within 2 hours</b>.
        Cream-based pastries, dairy mithai and baked bread all degrade quickly after
        being unsealed — this is the single most important rule for safe rescue.
      </P>

      <H2>👨‍🍳 Freshness tags</H2>
      <P>Every listing shows:</P>
      <UL>
        <li><b>Baked at:</b> when the bakery reports the item was made.</li>
        <li><b>Best before:</b> the time the bakery considers the treat at peak quality.</li>
        <li><b>Pickup by:</b> the deadline that the customer must arrive by.</li>
        <li><b>Allergens:</b> bakery-provided list (dairy, gluten, eggs, nuts, sesame, jaggery etc.)</li>
      </UL>
      <P>If any tag is missing on a listing, ask the bakery at pickup before eating.</P>

      <H2>🟢 Veg / 🟤 Non-veg</H2>
      <P>Each item is tagged by the bakery. SugarCube does not verify these tags — if it matters to you, please double-check at the counter.</P>

      <H2>🧁 Storage on the way home</H2>
      <UL>
        <li>In Patna's climate, transport cream pastries in a cool bag where possible.</li>
        <li>Khaja, petha, anarsa, biscuits store better at room temperature.</li>
        <li>Carry upright; cream rolls and mithai hate getting squished!</li>
        <li>If you've got a long ride after pickup, refrigerate within 1 hour.</li>
      </UL>

      <H2>🚨 Something tasted off?</H2>
      <P>
        Stop eating immediately. Keep the rest and the receipt (or SugarCube order code),
        then email <a href="mailto:mohanaadarsh3@gmail.com" className="text-rose font-semibold underline underline-offset-2">mohanaadarsh3@gmail.com</a> within 24 hours.
        SugarCube investigates complaints seriously — repeat offenders get delisted.
      </P>

      <H2>⚖️ Who is responsible?</H2>
      <P>
        SugarCube is a marketplace (an intermediary), per India's IT Rules.
        The bakery is responsible for the freshness, hygiene and allergen accuracy of any treat they list.
        By reserving you accept the caveats listed here and in our <a href="/terms" className="text-rose font-semibold underline underline-offset-2">Terms of Use</a>.
      </P>

      <H2>🚫 Pick-up only (for now)</H2>
      <P>
        We don't deliver, on purpose — pickups avoid the cold-chain risks of transit
        and let you meet your baker 💗. Delivery will come later, with vetted hyperlocal partners.
      </P>
    </LegalLayout>
  );
}
