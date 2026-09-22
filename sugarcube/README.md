# 🍰 SugarCube

> Rescue a sweet tonight. Save it from the bin. — A dreamy marketplace for leftover bakery & mithai shop treats, piloted in **Patna**.

SugarCube helps Patna's bakeries sell their end-of-day leftover pastries, cakes, khaja, petha, and more at 40–70% off — so nothing is wasted and everyone gets a dreamy deal.

### ✨ Designs & vibes
- Palette: cream · peach · lavender · mint · rose · butter, with cocoa/charcoal text
- Fonts: **Baloo 2** (display) + **Nunito** (body)
- Floating-animated pastries, twinkling stars, rounded pill + bubble shapes, soft pastel shadows — fully custom & adorable

### 🚀 Run it

```bash
npm install
npm run dev    # http://localhost:3000
# production
npm run build && npm run start
```

Requires Node 18+. No env vars **required** for the demo — data is seeded on first load and persists in `localStorage`. To enable Supabase later:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx     # only for real payments
NEXT_PUBLIC_WHATSAPP_BOT_NUMBER=+919934001234  # for the "List via WhatsApp" CTA
```

### 🧁 Features
| Route | What's there |
|-------|--------------|
| `/` | Hero + discover all tonight's leftover treats / bakeries sorted by pickup urgency |
| `/items/[id]` | Big dreamy detail, allergens, freshness triplet, reserve form → demo Razorpay → 4-digit **pickup code** |
| `/magic-bags` | Curated "Magic Surprise Bags" (à la Too Good To Go) |
| `/bakeries/[id]` | Bakery profile, hours, tags, all tonight's items, customer love notes |
| `/search` | Full-text + category filters |
| `/impact` | Enter phone → your rescued items, CO₂ saved, kg food saved, "Sugar Stars" + history |
| `/about` | The story + how-it-works |
| `/merchant` | Bakery selector → live stats, **add** an item, **decrement** qty, **mark picked-up** — the merchant portal |
| `/api/whatsapp` | POST webhook so a bakery can WhatsApp `<name> <price> <qty>` and SugarCube publishes |

### 🏪 Try it as a merchant
1. Open `/merchant`
2. Pick a seeded bakery (Anand Sweets, Golden Crust, Hira Lal, Wakecup, Mithaas)
3. Add a leftover treat → it shows instantly on the Discover page (open on another tab/window)
4. Switch to customer view, reserve a treat, mark it picked-up
5. Inventory auto-decrements, impact meter updates, reload survives — all via `localStorage`

### 🔌 Switching to production
1. **Database** — edit `lib/data.ts`; Supabase adapter already wired, just set env vars. Suggested schema: `bakeries`, `items`, `orders`, `ratings`.
2. **Payments** — drop in [`razorpay` package](https://razorpay.com/docs/payments/server-integration/nodejs/) at the "Continue to pay" step in `components/ReserveFlow.tsx` (replace `fakePay()`). Order row's `paid` flag is already there.
3. **WhatsApp Cloud API** — point Meta webhook to `POST https://yourdomain/api/whatsapp`. Already returns a reply string + parses `<name> <price> <qty>` to insert into items.
4. **Maps** — `CITY_CENTER` is in `lib/config.ts`; drop in Google Maps + Distance Matrix for real proximity sort.

### 📁 Structure
```
app/
  page.tsx               # Discover
  items/[id]/page.tsx    # Item detail + reserve
  magic-bags/            # Surprise bags
  bakeries/[id]/         # Bakery profile
  search/ impact/ about/ merchant/
  api/whatsapp/route.ts  # WhatsApp listing bot
  layout.tsx             # Fonts + FloatingDecor + Toaster
components/  Pill/Card/Hero/ReserveFlow/MerchantDashboard/etc.
lib/        types.ts seed.ts(Patna bakeries) data.ts utils.ts config.ts supabase.ts
```

### ⚠️ Pilot caveats (by design)
- **Pickup only** — no delivery (keeps food safety simple).
- **Demo payment** — `npm run dev` does NOT charge real money. Replace stub with Razorpay.
- Always consume rescued treats within 2 hours of pickup. SugarCube is a marketplace; quality is the bakery's responsibility.

### 🌍 Built with
Next.js 16 · React 19 · Tailwind v4 · Supabase (optional) · lucide-react · clsx — made with 💗 in Patna.
