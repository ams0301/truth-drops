"use client";
import { WHATSAPP_BOT_NUMBER } from "@/lib/config";

export function WhatsAppBotCTA({ className = "" }: { className?: string }) {
  const text = encodeURIComponent("Hi SugarCube! I want to list my leftover sweets tonight 🍰");
  const href = `https://wa.me/${WHATSAPP_BOT_NUMBER.replace(/\D/g, "")}?text=${text}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-mint text-plum border border-mint px-5 py-3 rounded-pill font-display font-semibold shadow-soft hover:shadow-float transition-all active:scale-95 ${className}`}
    >
      <span className="text-xl">💬</span>
      List via WhatsApp
    </a>
  );
}
