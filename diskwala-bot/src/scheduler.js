// 45-minute auto-delete scheduler for sent video messages.
// Stores {chatId, messageId, fileDiskwalaId, sentAt} and fires deleteMessage
// after env.DELETE_AFTER_MINUTES (default 45). Keeps timers across restart via
// a JSON file under data/scheduler.json.

const path = require('path');
const fs = require('fs');
const DATA_DIR = path.join(__dirname, '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'scheduler.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

const TTL_MS = (Number(process.env.DELETE_AFTER_MINUTES) || 45) * 60 * 1000;

let telegram = null; // set from index.js
let timers = new Map(); // key `${chatId}:${messageId}` -> NodeJS.Timeout
let pendingJobs = []; // [{chatId, messageId, sentAt}]

function load() {
  try {
    pendingJobs = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch { pendingJobs = []; }
}
function save() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(pendingJobs, null, 2));
}

function arm(chatId, messageId, sentAt, onDelete) {
  const key = `${chatId}:${messageId}`;
  const fireAt = sentAt + TTL_MS;
  const delay = Math.max(0, fireAt - Date.now());
  const t = setTimeout(async () => {
    try { await onDelete(chatId, messageId); } catch (e) { /* ignore */ }
    timers.delete(key);
    pendingJobs = pendingJobs.filter((j) => !(j.chatId === chatId && j.messageId === messageId));
    save();
  }, delay);
  if (t.unref) t.unref();
  timers.set(key, t);
  pendingJobs.push({ chatId, messageId, sentAt });
  save();
}

function cancel(chatId, messageId) {
  const key = `${chatId}:${messageId}`;
  const t = timers.get(key);
  if (t) { clearTimeout(t); timers.delete(key); }
  pendingJobs = pendingJobs.filter((j) => !(j.chatId === chatId && j.messageId === messageId));
  save();
}

async function restoreAll(onDelete) {
  load();
  for (const job of pendingJobs.slice()) {
    if (Date.now() >= job.sentAt + TTL_MS) {
      // already due — fire now
      try { await onDelete(job.chatId, job.messageId); } catch { /* ignore */ }
      pendingJobs = pendingJobs.filter((j) => !(j.chatId === job.chatId && j.messageId === job.messageId));
    } else {
      const key = `${job.chatId}:${job.messageId}`;
      const delay = (job.sentAt + TTL_MS) - Date.now();
      const t = setTimeout(async () => {
        try { await onDelete(job.chatId, job.messageId); } catch { /* ignore */ }
        timers.delete(key);
        pendingJobs = pendingJobs.filter((j) => !(j.chatId === job.chatId && j.messageId === job.messageId));
        save();
      }, delay);
      if (t.unref) t.unref();
      timers.set(key, t);
    }
  }
  save();
}

module.exports = { arm, cancel, restoreAll };
