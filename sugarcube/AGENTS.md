<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# SugarCube
- Next.js 16 App Router + Tailwind v4 (`@import "tailwindcss"` + `@theme inline`).
- TypeScript strict. Verify any edits with: `npm run build` (also runs tsc via Next).
- Dreamy design tokens live in `app/globals.css` (cream/peach/lavender/rose/mint/butter + cocoa/charcoal text, Baloo 2 + Nunito fonts).
- Data layer (`lib/data.ts`) is localStorage-backed for the demo; Supabase adapter is used only if env vars are present.
- Location: `lib/config.ts` defines registered CITIES (only Patna is `live:true` today). The `LocationProvider` (context) tracks the user's selected city and persists it. `CityGate` renders the `<NotAvailable/>` page in non-live cities. Auto-guess via `ipapi.co` on first visit.
- Navbar (= clear structured menu): left logo + (mobile) hamburger; primary nav (Discover / Magic Bags / For Bakeries); right = Search, LocationSwitcher, "More" dropdown (Impact, About, FAQ, Food Safety, Support, Terms, Privacy). Full mobile menu drawer. Support email = mohanaadarsh3@gmail.com (`SUPPORT_EMAIL`).
- Routes: `/` · `/items/[id]` · `/magic-bags` · `/bakeries/[id]` · `/search` · `/impact` · `/favorites` · `/about` · `/faq` · `/food-safety` · `/support` · `/terms` · `/privacy` · `/merchant` · `/api/whatsapp` (listing bot). Plus `sitemap.ts`, `robots.ts`, `manifest.ts`, `favicon.svg`.
- Customer-facing "browse" routes are wrapped in `<CityGate>` so non-live cities show the "Not in your region yet" page (with switch-to-Patna + waitlist mailto). Merchant page is NOT gated — bakeries in coming-soon cities can pre-onboard.
- Cart: `CartProvider` (client context) + slide-out `<CartDrawer>` opened via floating badge (bottom-right) and from ItemCard "+ Bag". Multi-item, single-bakery-per-order (auto-swaps & clears on cross-bakery add). Checkout writes one `Order` per line via `placeCartOrder` + adds optional ₹ donation to donation pool.
- Favourites: `getFavorites/toggleFavorite` (localStorage); heart button on BakeryCard + bakery detail header; `/favorites` page lists them; "/favorites" appears in navbar More + footer + sitemap.
- Reviews/feed: `BakeryFeed` widget lets any visitor post a 1-5★ review with optional photo (compressed to 256px JPEG dataURL, stored in localStorage). Shown as a gallery on bakery detail.
- Merchant intel: each seeded bakery has `forecastNote` (static Phenix-style demand hint) + a real `rescueOpen` toggle (clicks call `setRescueOpen`). Customer-facing BakeryCard + bakery detail respond with "💤 Closed tonight" + treat list hidden.
- Discover now has 3 views: Magic Bags (TGTG-first) / Treats / Map. Sort (closing soon / lowest ₹ / best deal), filter (Veg / Magic bags only / max-price slider / Favourites-only). Map = `react-leaflet` + OpenStreetMap tiles (no API key), loaded dynamically client-side only.
- Impact page = streak meter (current/best nights-in-a-row via `getStreak`), Sugar Stars progress bar, community donation pool widget (`getDonationPool`), and saved bakeries chips.
- Donations: hero `DonationBanner` on home; cart drawer has "Sponsor a treat" ₹0/20/50/100 toggle at checkout.
- `lib/data.ts` exports: `getFavorites/toggleFavorite/listFavoriteBakeries`, `getCart/addToCart/setCartQty/clearCart/cartCount`, `getFeed/addFeedPost`, `setRescueOpen`, `getDonationPool/addToDonationPool`, `pushRecentSearch/getRecentSearches`, `getStreak`, `placeCartOrder`.
<!-- END:nextjs-agent-rules -->
