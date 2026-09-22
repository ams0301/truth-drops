import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "magic";

const variants: Record<Variant, string> = {
  primary:
    "bg-peach text-cocoa hover:bg-peach/90 border border-peach shadow-soft active:scale-[0.98]",
  secondary:
    "bg-white text-cocoa hover:bg-cream border border-lavender-soft shadow-soft active:scale-[0.98]",
  ghost: "bg-transparent text-cocoa hover:bg-lavender-soft",
  magic:
    "bg-gradient-to-br from-rose via-peach to-butter text-cocoa border border-white/70 shadow-float animate-wiggle",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-pill font-display font-semibold text-base transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
