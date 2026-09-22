"use client";
import { useEffect, useState, useCallback } from "react";
import { getFeed, addFeedPost, subscribe } from "@/lib/data";
import type { FeedPost } from "@/lib/types";
import { Card } from "./Card";
import { Button } from "./Button";
import { useToast } from "./Toaster";

export function BakeryFeed({ bakeryId, bakeryName }: { bakeryId: string; bakeryName: string }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setPosts(await getFeed(bakeryId));
  }, [bakeryId]);

  useEffect(() => { load(); const unsub = subscribe(load); return unsub; }, [load]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h3 className="font-display font-bold text-lg text-cocoa flex items-center gap-2">
          📸 Rescuer love for {bakeryName}
        </h3>
        <Button variant="primary" onClick={() => setOpen((o) => !o)} className="px-4 py-2 text-xs">
          {open ? "Cancel" : "✏️ Post your rescue"}
        </Button>
      </div>

      {open && (
        <PostForm
          bakeryId={bakeryId}
          onDone={() => { setOpen(false); toast({ title: `Posted to ${bakeryName}'s feed!`, emoji: "📸", tone: "mint" }); load(); }}
        />
      )}

      {posts.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-5xl animate-wiggle">🥐</div>
          <p className="font-sans text-sm text-cocoa-soft mt-2">
            No posts yet — be the first to share a rescue moment 💗
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {posts.map((p) => (
            <div key={p.id} className="rounded-bubble border border-lavender-soft overflow-hidden bg-white">
              {p.photo ? (
                <img src={p.photo} alt={p.caption} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square grid place-items-center bg-peach-soft text-5xl">🍰</div>
              )}
              <div className="p-2">
                <div className="font-sans text-[11px] text-cocoa-soft">{p.customerName} · {"★".repeat(p.stars)}</div>
                <div className="font-sans text-xs text-cocoa line-clamp-2">{p.caption}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PostForm({ bakeryId, onDone }: { bakeryId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [stars, setStars] = useState(5);
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) {
      // basic limit to keep localStorage tiny
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // downscale via canvas to ≤256px
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 256, 256);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setPhoto(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  }

  return (
    <div className="rounded-bubble bg-lavender-soft/50 p-4 space-y-3 mb-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-white border border-lavender-soft rounded-pill px-3 py-2 font-sans text-sm outline-none focus:border-peach" />
      <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What did you rescue? Was it dreamy?" rows={2} className="w-full bg-white border border-lavender-soft rounded-pill px-3 py-2 font-sans text-sm outline-none focus:border-peach" />
      <div className="flex items-center gap-2">
        <span className="font-sans text-xs text-cocoa-soft">Rating:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setStars(s)} className={`text-xl transition ${s <= stars ? "text-rose" : "text-cocoa-soft/40"}`} aria-label={`${s} stars`} aria-pressed={stars === s}>★</button>
        ))}
      </div>
      <div>
        <label className="font-sans text-xs text-cocoa-soft block mb-1">📸 Add a photo (optional)</label>
        <input type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
        {photo && <img src={photo} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-pill" />}
      </div>
      <Button
        variant="magic"
        onClick={async () => {
          if (!name.trim() || caption.trim().length < 3) return;
          await addFeedPost({ bakeryId, customerName: name.trim(), caption: caption.trim(), stars, photo });
          onDone();
        }}
        disabled={!name.trim() || caption.trim().length < 3}
      >
        ✨ Share rescue moment
      </Button>
    </div>
  );
}
