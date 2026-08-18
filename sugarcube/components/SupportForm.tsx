"use client";
import { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useToast } from "./Toaster";
import { SUPPORT_EMAIL } from "@/lib/config";

const SUBJECTS = [
  "I have a question about a treat",
  "My pickup didn't go well",
  "Food quality / freshness concern",
  "I'm a bakery owner — onboarding help",
  "I want SugarCube in my city",
  "Press / partnership",
  "Something else",
] as const;

export function SupportForm() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0] as string,
    role: "Customer",
    message: "",
  });
  const [sent, setSent] = useState(false);

  function send() {
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 5) {
      toast({ title: "Please fill all fields 🍰", emoji: "⚠️", tone: "rose" });
      return;
    }
    const body = encodeURIComponent(
      `Hi SugarCube,\n\nName: ${form.name}\nEmail: ${form.email}\nRole: ${form.role}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
    );
    const subject = encodeURIComponent(`[${form.role}] ${form.subject}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    toast({ title: "Opening your email app… 💌", emoji: "✨", tone: "mint" });
  }

  if (sent) {
    return (
      <Card className="p-8 text-center animate-pop-in">
        <div className="text-6xl animate-wiggle">📮</div>
        <h3 className="font-display font-bold text-xl text-cocoa mt-3">Almost there!</h3>
        <p className="font-sans text-sm text-cocoa-soft mt-2 max-w-sm mx-auto">
          Your email app just opened with everything pre-filled. Hit send and we'll reply within 24 hours. 💗
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => setSent(false)}>
          ← Write another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-display font-bold text-lg text-cocoa mb-4">Send us a note 💌</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Your name">
          <input className="sc-s-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aisha K." />
        </Field>
        <Field label="Your email">
          <input className="sc-s-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="aisha@email.com" />
        </Field>
        <Field label="I am a">
          <select className="sc-s-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Customer</option>
            <option>Bakery owner / merchant</option>
            <option>Press / partnership</option>
          </select>
        </Field>
        <Field label="Subject">
          <select className="sc-s-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tell us more">
            <textarea
              className="sc-s-input min-h-28"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What happened, what would help, etc. — be as dreamy as you like…"
            />
          </Field>
        </div>
      </div>
      <Button variant="magic" className="w-full mt-4 py-3" onClick={send}>
        ✨ Send support request
      </Button>
      <p className="font-sans text-xs text-cocoa-soft text-center mt-3">
        Your email goes directly to <b>mohanaadarsh3@gmail.com</b>. We never share your email.
      </p>

      <style jsx>{`
        :global(.sc-s-input) {
          width: 100%;
          background: white;
          border: 1px solid var(--color-lavender-soft);
          border-radius: var(--radius-pill);
          padding: 0.65rem 1rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-charcoal);
          outline: none;
        }
        :global(.sc-s-input:focus) { border-color: var(--color-peach); box-shadow: 0 0 0 4px rgba(255,217,196,.4); }
        textarea.sc-s-input {
          border-radius: 1.25rem;
          padding: 1rem;
          resize: vertical;
        }
      `}</style>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-sans font-semibold text-xs text-cocoa-soft">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
