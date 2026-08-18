import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { Bakery } from "@/lib/types";

const accentBg: Record<Bakery["accent"], string> = {
  peach: "from-peach-soft to-cream",
  lavender: "from-lavender-soft to-cream",
  mint: "from-mint-soft to-cream",
  rose: "from-rose-soft to-cream",
  butter: "from-butter/70 to-cream",
};

export function Card({
  children,
  className,
  accent,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  accent?: Bakery["accent"];
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-bubble bg-gradient-to-br border border-white/80 shadow-soft backdrop-blur-sm transition-all",
        accent ? accentBg[accent] : "from-white to-cream",
        onClick && "cursor-pointer hover:shadow-float hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  className,
  tone = "soft",
}: {
  children: ReactNode;
  className?: string;
  tone?: "soft" | "rose" | "mint" | "butter" | "lavender";
}) {
  const tones: Record<string, string> = {
    soft: "bg-lavender-soft text-plum",
    rose: "bg-rose-soft text-cocoa",
    mint: "bg-mint-soft text-plum",
    butter: "bg-butter/80 text-cocoa",
    lavender: "bg-lavender text-plum",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-pill text-xs font-sans font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
