import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 group select-none", className)}
      aria-label="SugarCube home"
    >
      <span className="text-2xl md:text-3xl animate-float transition-transform group-hover:scale-110">
        🍰
      </span>
      {!compact && (
        <span className="font-display font-bold text-xl md:text-2xl text-cocoa tracking-tight">
          Sugar<span className="text-rose">Cube</span>
        </span>
      )}
    </Link>
  );
}
