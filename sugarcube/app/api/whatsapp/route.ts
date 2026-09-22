import { NextResponse } from "next/server";
import { getSupabase, isSupabaseEnabled } from "@/lib/supabase";
import { seedItems } from "@/lib/seed";
import type { Item } from "@/lib/types";

type WAInbound = {
  from: string;
  body: string;
  mediaUrl?: string;
};

/**
 * WhatsApp Cloud API / MSG91 webhook parser.
 * Baker texts: "Choco Pastry 35 6" -> publishes one item.
 *
 * Expected connection: Meta WhatsApp Business "messages" webhook → POST here.
 * This stub echoes a "would-reply" for transparency during pilot.
 */
export async function POST(req: Request) {
  let payload: WAInbound;
  try {
    payload = (await req.json()) as WAInbound;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parts = payload.body?.trim().split(/\s+/) ?? [];
  if (parts.length < 3) {
    return NextResponse.json({
      ok: true,
      reply: "🍰 Hi baker! Send: <name> <rescue_price> <qty> — e.g. 'Choco Pastry 35 6'. SugarCube will list it in 5 seconds!",
      parsed: null,
    });
  }

  const qty = parseInt(parts[parts.length - 1], 10);
  const rescuePrice = parseFloat(parts[parts.length - 2]);
  const name = parts.slice(0, -2).join(" ");

  if (!name || isNaN(rescuePrice) || isNaN(qty)) {
    return NextResponse.json({
      ok: true,
      reply: `Hmm couldn't parse that 😅. Try: <name> <rescue_price> <qty>`,
      parsed: null,
    });
  }

  // In pilot we map all WhatsApp listings to the first seeded bakery
  const bakeryId = seedItems[0].bakeryId;
  const item: Omit<Item, "id"> = {
    bakeryId,
    name,
    emoji: "🍰",
    description: "Listed via WhatsApp — fresh leftover tonight!",
    category: "Pastries",
    originalPrice: Math.round(rescuePrice * 2),
    rescuePrice,
    qty,
    bakedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    bestBefore: "22:30",
    allergens: [],
    veg: true,
  };

  if (isSupabaseEnabled) {
    const sb = getSupabase()!;
    await sb.from("items").insert(item);
  }

  return NextResponse.json({
    ok: true,
    parsed: { name, rescuePrice, qty, bakeryId },
    reply: `✨ Listed "${name}" for ₹${rescuePrice} ×${qty} on SugarCube! Tap your dashboard link to view live pickup reservations. 🍰`,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "SugarCube WhatsApp listing bot",
    usage: "POST { from, body } where body = '<name> <rescue_price> <qty>'",
  });
}
