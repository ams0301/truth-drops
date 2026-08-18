// Payment flow:
//  - parse plans from env
//  - present QR + plan buttons
//  - user selects a plan -> creates pending payment row -> 5-min timer
//  - user uploads screenshot -> Tesseract OCR -> try to extract amount + UTR
//  - verify: UTR not previously used AND amount matches selected plan price
//  - on success: extend premium (or set lifetime) and mark payment verified
//  - on failure: tell user why, let admin manually approve

const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const db = require('./db');

const QR_FILE = path.join(__dirname, '..', 'assets', 'qr.png');

function parsePlans() {
  // Format: 25r5|5 Days|25|5,45r10|10 Days|45|10,...,1500rlt|Lifetime|1500|null
  const raw = process.env.PLANS || '';
  return raw.split(',').map((part) => {
    const [id, label, price, days] = part.split('|').map((s) => s && s.trim());
    if (!id || !label || !price) return null;
    let d = days;
    if (d === 'null' || d === '' || d == null) d = null; else d = Number(d);
    return { id, label, price: Number(price), days: d };
  }).filter(Boolean);
}

function planButtonRows(plans) {
  // 2 per row
  const rows = [];
  for (let i = 0; i < plans.length; i += 2) {
    rows.push(plans.slice(i, i + 2).map((p) => ({
      text: `${p.label} - Rs${p.price}`,
      callback_data: `pay:${p.id}`,
    })));
  }
  return rows;
}

function planById(plans, id) {
  return plans.find((p) => p.id === id);
}

// Convert plan.days (number of days, or null) into an absolute untilMs.
function untilForPlan(plan) {
  const now = Date.now();
  if (plan.days == null) return Number.MAX_SAFE_INTEGER; // lifetime marker
  return now + plan.days * 24 * 60 * 60 * 1000;
}

function formatPremiumUntil(ms) {
  if (ms == null) return 'No active premium';
  if (ms >= Number.MAX_SAFE_INTEGER) return 'Lifetime';
  return new Date(ms).toUTCString();
}

// OCR a screenshot buffer; returns plain text.
async function ocrImage(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng', { logger: () => {} });
  return (data && data.text) || '';
}

function extractAmountFromText(text) {
  if (!text) return null;
  // Patterns: "Rs 25", "Rs.25", "INR 25", "₹ 25", "25.00", "Paid ₹25", "Amount: Rs. 25.00"
  const matches = [...text.matchAll(/(?:Rs\.?|INR|₹)?\s*([0-9]{1,4}(?:[.,][0-9]{0,2})?)/g)]
    .map((m) => parseFloat(m[1].replace(/,/g, '')))
    .filter((n) => !Number.isNaN(n) && n >= 1);
  if (matches.length === 0) return null;
  // Prefer the match closest to "rs" / "amount" / "paid" context
  const ctxIdx = text.search(/(?:Amount|Paid|Rs\.?|INR|₹)/i);
  if (ctxIdx >= 0) {
    const tail = text.slice(ctxIdx, ctxIdx + 40);
    const m = tail.match(/([0-9]{1,4}(?:[.,][0-9]{0,2})?)/);
    if (m) { const n = parseFloat(m[1].replace(/,/g, '')); if (n >= 1) return Math.round(n); }
  }
  return Math.round(matches[0]);
}

function extractUTRFromText(text) {
  if (!text) return null;
  // UPI UTR is a 12-digit number, but bank refs can be 10-20 digits.
  // Look near "UPI Ref" / "UPI Transaction Ref" / "Reference No" / "UTR".
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const labelRe = /(upi\s*ref|reference\s*no|utr|ref no|transaction\s*(id|ref)|txn\s*ref)/i;
  for (let i = 0; i < lines.length; i++) {
    if (labelRe.test(lines[i])) {
      // try this line, then next 3 lines (number often below label)
      for (let j = i; j < Math.min(lines.length, i + 4); j++) {
        const m = lines[j].match(/([0-9]{10,22})/);
        if (m) return m[1];
      }
    }
  }
  // fallback: longest numeric run
  const nums = text.match(/[0-9]{10,22}/g);
  if (nums && nums.length) {
    return nums.sort((a, b) => b.length - a.length)[0];
  }
  return null;
}

// Verify a screenshot against a pending payment.
// Returns { ok, reason, amount, utr }
async function verifyScreenshot(buffer, userId) {
  const pending = db.pendingPaymentForUser(userId);
  if (!pending) {
    return { ok: false, reason: 'No active payment in the last 5 minutes. Run /upgrade to choose a plan first.' };
  }
  const plan = planById(parsePlans(), pending.plan_id);
  if (!plan) {
    return { ok: false, reason: 'Could not find the selected plan. Please restart with /upgrade.' };
  }

  let text = '';
  try { text = await ocrImage(buffer); }
  catch (e) { return { ok: false, reason: 'OCR failed to read the screenshot. Please retry or contact admin.' }; }

  const amount = extractAmountFromText(text);
  const utr = extractUTRFromText(text);

  if (!utr) {
    return { ok: false, reason: 'Could not read a UPI Reference Number (UTR) from the screenshot. Make sure the screenshot shows the UTR / UPI Ref No clearly.', amount, utr: null };
  }

  if (db.isUtrUsed(utr)) {
    return { ok: false, reason: 'This UTR has already been used for another payment. Refunds/reused screenshots are not allowed.', amount, utr };
  }

  if (!amount || amount < plan.price) {
    return { ok: false, reason: `Read amount Rs${amount != null ? amount : '—'}, but the "${plan.label}" plan costs Rs${plan.price}. If you paid the wrong amount, contact admin.`, amount, utr };
  }

  // Lock the UTR (atomic). If insert race, reject.
  const locked = db.markUtrUsed(utr, userId, pending.id);
  if (!locked) {
    return { ok: false, reason: 'This UTR is already being claimed. Please contact admin.', amount, utr };
  }

  const untilMs = untilForPlan(plan);
  // Lifetime: store null in DB (interpret null as lifetime premium).
  db.setPremium(userId, untilMs >= Number.MAX_SAFE_INTEGER ? null : untilMs);
  db.setPaymentStatus(pending.id, 'verified', utr);
  return { ok: true, plan, amount, utr, untilMs: untilMs >= Number.MAX_SAFE_INTEGER ? null : untilMs };
}

// Helper to fire when the 5-min payment timer expires without a screenshot.
function notifyTimeout(tg, chatId) {
  return tg.sendMessage(chatId, 'Your payment window (5 min) expired. Run /upgrade again to retry.');
}

module.exports = {
  QR_FILE,
  parsePlans,
  planButtonRows,
  planById,
  untilForPlan,
  formatPremiumUntil,
  ocrImage,
  extractAmountFromText,
  extractUTRFromText,
  verifyScreenshot,
  notifyTimeout,
};
