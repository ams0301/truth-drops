"use client";
import { createContext, useContext, useCallback, useState } from "react";

export type Toast = { id: string; title: string; emoji?: string; tone?: "soft" | "mint" | "rose" };
type Ctx = { toast: (t: Omit<Toast, "id">) => void };
const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Graceful no-op if rendered outside provider (e.g. during SSR prerender)
    return () => {};
  }
  return ctx.toast;
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3200);
  }, []);

  const tone = (t?: Toast["tone"]) =>
    t === "rose"
      ? "bg-rose-soft border-rose"
      : t === "mint"
        ? "bg-mint-soft border-mint"
        : "bg-lavender-soft border-lavender";

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed z-[100] bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[92%] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-pop-in shadow-soft border rounded-[1.25rem] px-5 py-3 flex items-center gap-3 backdrop-blur ${tone(t.tone)}`}
          >
            {t.emoji && <span className="text-2xl">{t.emoji}</span>}
            <span className="font-sans font-semibold text-cocoa">{t.title}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
