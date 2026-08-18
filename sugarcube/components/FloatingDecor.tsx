const pastries = [
  { emoji: "🧁", top: "8%", left: "7%", cls: "animate-float", style: { animationDelay: "0s" } },
  { emoji: "🥐", top: "16%", right: "10%", cls: "animate-drift" },
  { emoji: "🍰", top: "44%", left: "4%", cls: "animate-float", style: { animationDelay: "2s" } },
  { emoji: "🍩", top: "70%", right: "6%", cls: "animate-twinkle", style: { animationDelay: "1s" } },
  { emoji: "🍪", top: "82%", left: "12%", cls: "animate-drift", style: { animationDelay: "3s" } },
  { emoji: "✨", top: "30%", right: "20%", cls: "animate-twinkle" },
  { emoji: "✨", top: "60%", left: "22%", cls: "animate-twinkle", style: { animationDelay: "1.5s" } },
  { emoji: "🪄", top: "10%", left: "45%", cls: "animate-twinkle", style: { animationDelay: "2.5s" } },
];

export function FloatingDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pastries.map((p, i) => (
        <span
          key={i}
          className={`absolute text-3xl md:text-5xl opacity-25 select-none ${p.cls}`}
          style={{ top: p.top, left: p.left, right: p.right, ...p.style }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
