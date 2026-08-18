// SQLite via node:sqlite (built into Node v22.5+ / v24+ — no native rebuild).
// API differences vs better-sqlite3: use DatabaseSync; .prepare(sql).get/all
// accept varargs or array; INSERT returns { changes, lastInsertRowid }.

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'bot.db'));
try { db.exec('PRAGMA journal_mode = WAL'); } catch {}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  premium_until INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  file_id TEXT,
  msg_chat_id INTEGER,
  msg_id INTEGER,
  created_at INTEGER NOT NULL,
  day_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dl_user_day ON downloads(user_id, day_key);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  utr TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  decided_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pay_utr ON payments(utr);
CREATE TABLE IF NOT EXISTS used_utrs (
  utr TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,
  used_at INTEGER NOT NULL
);
`);

function nowMs() { return Date.now(); }
function dayKey(ts = nowMs()) { return new Date(ts).toISOString().slice(0, 10); }

function getUser(id) { return db.prepare('SELECT * FROM users WHERE id=?').get(id) || null; }
function ensureUser(id) {
  const ex = getUser(id);
  if (ex) return ex;
  db.prepare('INSERT INTO users (id, premium_until, created_at) VALUES (?,?,?)').run(id, null, nowMs());
  return getUser(id);
}
function isPremium(id) {
  const u = getUser(id); if (!u) return false;
  if (u.premium_until == null) return false;
  return u.premium_until > nowMs();
}
function setPremium(id, untilMsOrNull) {
  ensureUser(id);
  const cur = getUser(id);
  let nextUntil = untilMsOrNull;
  if (untilMsOrNull != null && cur.premium_until && cur.premium_until > nowMs()) {
    nextUntil = cur.premium_until + (untilMsOrNull - nowMs());
  }
  db.prepare('UPDATE users SET premium_until=? WHERE id=?').run(nextUntil, id);
}
function getTodayCount(id) {
  const r = db.prepare('SELECT COUNT(*) AS c FROM downloads WHERE user_id=? AND day_key=?').get(id, dayKey());
  return r ? r.c : 0;
}
function recordDownload(id, fileId, msgChatId, msgId) {
  db.prepare('INSERT INTO downloads (user_id, file_id, msg_chat_id, msg_id, created_at, day_key) VALUES (?,?,?,?,?,?)')
    .run(id, fileId, msgChatId, msgId, nowMs(), dayKey());
}
function createPayment(userId, planId, amount) {
  const res = db.prepare('INSERT INTO payments (user_id, plan_id, amount, status, created_at) VALUES (?,?,?,?,?)')
    .run(userId, planId, amount, 'pending', nowMs());
  return res.lastInsertRowid;
}
function getPayment(pid) {
  return db.prepare('SELECT * FROM payments WHERE id=?').get(pid) || null;
}
function setPaymentStatus(pid, status, utr) {
  if (utr != null) {
    db.prepare('UPDATE payments SET status=?, utr=?, decided_at=? WHERE id=?').run(status, utr, nowMs(), pid);
  } else {
    db.prepare('UPDATE payments SET status=?, decided_at=? WHERE id=?').run(status, nowMs(), pid);
  }
}
function isUtrUsed(utr) {
  if (!utr) return false;
  return !!db.prepare('SELECT 1 FROM used_utrs WHERE utr=?').get(utr);
}
function markUtrUsed(utr, userId, paymentId) {
  let res;
  try {
    res = db.prepare('INSERT OR IGNORE INTO used_utrs (utr, user_id, payment_id, used_at) VALUES (?,?,?,?)')
      .run(utr, userId, paymentId, nowMs());
  } catch {
    return false;
  }
  return res.changes > 0;
}
function pendingPaymentForUser(userId) {
  const cutoff = nowMs() - (Number(process.env.PAY_TIMER_MINUTES || 5) * 60 * 1000);
  return db.prepare('SELECT * FROM payments WHERE user_id=? AND status=? AND created_at>=? ORDER BY id DESC LIMIT 1')
    .get(userId, 'pending', cutoff) || null;
}
function allUsersCount() {
  const r = db.prepare('SELECT COUNT(*) AS c FROM users').get(); return r ? r.c : 0;
}
function premiumUsersCount() {
  const r = db.prepare('SELECT COUNT(*) AS c FROM users WHERE premium_until IS NOT NULL AND premium_until > ?').get(nowMs());
  return r ? r.c : 0;
}
function todayDownloadsTotal() {
  const r = db.prepare('SELECT COUNT(*) AS c FROM downloads WHERE day_key=?').get(dayKey());
  return r ? r.c : 0;
}

module.exports = {
  db, nowMs, dayKey,
  ensureUser, getUser, isPremium, setPremium,
  getTodayCount, recordDownload,
  createPayment, getPayment, setPaymentStatus, pendingPaymentForUser,
  isUtrUsed, markUtrUsed,
  allUsersCount, premiumUsersCount, todayDownloadsTotal,
};
