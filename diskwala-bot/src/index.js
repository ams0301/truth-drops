require('dotenv').config();
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { Telegraf, Markup } = require('telegraf');
const db = require('./db');
const diskwala = require('./diskwala');
const pay = require('./payment');
const scheduler = require('./scheduler');

if (!process.env.BOT_TOKEN) {
  console.error('Missing BOT_TOKEN in .env');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = Number(process.env.ADMIN_ID || 0);
const FREE_DAILY_LIMIT = Number(process.env.FREE_DAILY_LIMIT || 3);
const PAY_TIMER_MIN = Number(process.env.PAY_TIMER_MINUTES || 5);
const TMP_DIR = path.join(__dirname, '..', 'tmp');
fs.mkdirSync(TMP_DIR, { recursive: true });

// Telegram hard caps: file upload to bot must be <= 50 MB. We reject larger.
// (Telegram also cannot send videos >50MB in chat without resending as doc — we
// still try, since diskwala files are short-form micro-dramas under that cap.)
const MAX_SEND_BYTES = 49 * 1024 * 1024;
// We also cap raw file fetch to avoid disk exhaustion.
const MAX_FETCH_BYTES = 60 * 1024 * 1024;

const activeDownloads = new Set(); // per-user lock to prevent concurrency abuse

function isAdmin(userId) { return Number(userId) === ADMIN_ID; }

function userStatusText(user) {
  const todayCount = db.getTodayCount(user.id);
  const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount);
  let s = '';
  if (db.isPremium(user.id)) {
    const u = db.getUser(user.id).premium_until;
    s = `Premium active until: ${pay.formatPremiumUntil(u)}\nDaily limit: Unlimited`;
  } else {
    s = `Free plan: ${remaining}/${FREE_DAILY_LIMIT} downloads left today (UTC midnight reset).`;
  }
  return s;
}

bot.start(async (ctx) => {
  db.ensureUser(ctx.from.id);
  const u = db.getUser(ctx.from.id);
  let msg = `Send me a diskwala.com link like\nhttps://www.diskwala.com/app/<id>\n\n${userStatusText(u)}\n\nCommands:\n/status  - check quota & premium\n/upgrade - view paid plans\n/help    - full guide`;
  if (isAdmin(ctx.from.id)) msg += `\n\nAdmin: /grant <tg_id> <plan_id> | /revoke <tg_id> | /stats`;
  return ctx.reply(msg);
});

bot.command('help', (ctx) => ctx.reply(
  `How to use:\n` +
  `1) Paste a diskwala.com/app/<id> link.\n` +
  `2) Bot fetches the video ad-free and sends it in chat.\n` +
  `3) Free users: ${FREE_DAILY_LIMIT} downloads/day. Videos auto-delete after ${process.env.DELETE_AFTER_MINUTES || 45} min.\n` +
  `4) Need more? Run /upgrade, choose a plan, scan the QR, pay, send the success screenshot. Bot auto-verifies via UTR.\n` +
  `5) /status to see your quota & premium expiry.`
));

bot.command('status', (ctx) => {
  db.ensureUser(ctx.from.id);
  const u = db.getUser(ctx.from.id);
  return ctx.reply(userStatusText(u));
});

bot.command('upgrade', async (ctx) => {
  db.ensureUser(ctx.from.id);
  const plans = pay.parsePlans();
  if (plans.length === 0) return ctx.reply('No plans configured. Ask the admin to set PLANS in .env.');
  let caption =
    `Choose a plan and pay via UPI to the QR.\n` +
    `UPI ID: ${process.env.UPI_ID || '—'}\n\n` +
    `After paying, send a screenshot of the success screen with the UPI Ref No (UTR) visible.\n` +
    `You have ${PAY_TIMER_MIN} minutes after selecting a plan.\n\n` +
    `Plans:\n`;
  for (const p of plans) caption += `• ${p.label} – Rs${p.price}\n`;
  try {
    await ctx.replyWithPhoto({ source: fs.createReadStream(pay.QR_FILE) }, { caption });
  } catch (e) {
    await ctx.reply(`(Could not attach QR image: ${e.message})\n${caption}`);
  }
  await ctx.reply('Tap a plan button to begin:', Markup.inlineKeyboard(pay.planButtonRows(plans)));
});

bot.action(/^pay:(.+)$/, async (ctx) => {
  const planId = ctx.match[1];
  const plan = pay.planById(pay.parsePlans(), planId);
  if (!plan) return ctx.answerCbQuery('Unknown plan').catch(() => {});
  db.ensureUser(ctx.from.id);
  const pid = db.createPayment(ctx.from.id, planId, plan.price);
  // schedule a timeout notifier
  setTimeout(() => {
    // If still pending at timeout, mark stale and notify.
    const p = db.getPayment(pid);
    if (p && p.status === 'pending') {
      db.setPaymentStatus(pid, 'rejected', null);
      pay.notifyTimeout(bot.telegram, ctx.chat.id).catch(() => {});
    }
  }, PAY_TIMER_MIN * 60 * 1000).unref();
  return ctx.answerCbQuery(`Selected: ${plan.label} (Rs${plan.price})`).catch(() => {})
    .then(() => ctx.reply(
      `Plan: ${plan.label} — Rs${plan.price}\n` +
      `Pay to UPI ID: ${process.env.UPI_ID || '—'}\n` +
      `Amount MUST be exactly Rs${plan.price}.\n\n` +
      `Send the payment success screenshot now (with UPI Ref No / UTR visible).\n` +
      `Timer: ${PAY_TIMER_MIN} minutes.`
    ));
});

// Screenshot handler — both photos and document photos.
async function handleScreenshot(ctx, buffer) {
  db.ensureUser(ctx.from.id);
  if (!db.pendingPaymentForUser(ctx.from.id)) {
    return ctx.reply('No active payment window. Run /upgrade and pick a plan first.');
  }
  const m = await ctx.reply('Verifying your payment... please wait (OCR can take ~10s).');
  try {
    const r = await pay.verifyScreenshot(buffer, ctx.from.id);
    if (r.ok) {
      const untilTxt = r.untilMs == null ? 'Lifetime' : pay.formatPremiumUntil(r.untilMs);
      try { await ctx.telegram.deleteMessage(ctx.chat.id, m.message_id); } catch {}
      return ctx.reply(
        `Payment verified! ${r.plan.label} active.\n` +
        `UTR: ${r.utr}\n` +
        `Amount read: Rs${r.amount}\n` +
        `Premium until: ${untilTxt}\n\n` +
        `Send diskwala links anytime — no daily cap.`
      );
    } else {
      try { await ctx.telegram.deleteMessage(ctx.chat.id, m.message_id); } catch {}
      return ctx.reply(
        `Could not auto-verify: ${r.reason}\n\n` +
        `If you believe this is a mistake, contact admin (you may send the screenshot to a @${process.env.ADMIN_USERNAME || '—'}).`
      );
    }
  } catch (e) {
    try { await ctx.telegram.deleteMessage(ctx.chat.id, m.message_id); } catch {}
    return ctx.reply(`Verification error: ${e.message}`);
  }
}

bot.on('photo', async (ctx) => {
  try {
    const largest = ctx.message.photo[ctx.message.photo.length - 1];
    const fileLink = await ctx.telegram.getFileLink(largest.file_id);
    const res = await fetch(fileLink);
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    await handleScreenshot(ctx, buf);
  } catch (e) {
    await ctx.reply(`Could not read the photo: ${e.message}`);
  }
});

bot.on('document', async (ctx) => {
  const d = ctx.message.document;
  if (d && d.mime_type && d.mime_type.startsWith('image/')) {
    try {
      const fileLink = await ctx.telegram.getFileLink(d.file_id);
      const res = await fetch(fileLink);
      const ab = await res.arrayBuffer();
      await handleScreenshot(ctx, Buffer.from(ab));
    } catch (e) {
      await ctx.reply(`Could not read the document: ${e.message}`);
    }
  } else {
    ctx.reply('Send a diskwala.com link, or a payment screenshot as a photo.');
  }
});

// Main flow: any text message — try to detect a diskwala link.
bot.on('text', async (ctx) => {
  const text = ctx.message.text || '';
  // ignore commands
  if (text.startsWith('/')) return;

  // Helper inline for the heavy path
  await processLink(ctx, text);
});

async function processLink(ctx, text) {
  db.ensureUser(ctx.from.id);
  const fileId = diskwala.extractFileId(text);
  if (!fileId) {
    return ctx.reply('Send a valid diskwala.com/app/<id> link. Run /help for usage.');
  }

  // Quota check
  const premium = db.isPremium(ctx.from.id);
  if (!premium) {
    const used = db.getTodayCount(ctx.from.id);
    if (used >= FREE_DAILY_LIMIT) {
      const plans = pay.parsePlans();
      return ctx.reply(
        `You've reached the free daily limit (${FREE_DAILY_LIMIT}/day).\n` +
        `To continue today, upgrade: run /upgrade${plans.length ? '' : ' (no plans configured yet)'}.`
      );
    }
  }

  // Concurrency lock per user
  const lockKey = String(ctx.from.id);
  if (activeDownloads.has(lockKey)) {
    return ctx.reply('You already have a download in progress. Please wait for it to finish.');
  }
  activeDownloads.add(lockKey);
  const status = await ctx.reply('Resolving diskwala file (this can take 10-30s)...');

  let localFile = null;
  try {
    const info = await diskwala.resolveFile(fileId);
    localFile = path.join(TMP_DIR, `${fileId}-${crypto.randomBytes(4).toString('hex')}-${info.filename || 'video.mp4'}`);
    await ctx.telegram.editMessageText(status.chat.id, status.message_id, undefined, 'Downloading video...').catch(() => {});
    const { bytes } = await diskwala.downloadToFile(info.downloadUrl, localFile, { maxBytes: MAX_FETCH_BYTES });
    if (bytes > MAX_SEND_BYTES) {
      await ctx.reply(`File is too large to send via Telegram chat (${(bytes/1048576).toFixed(1)} MB > 50 MB limit). Auto-skipped.`);
      return;
    }
    await ctx.telegram.editMessageText(status.chat.id, status.message_id, undefined, 'Uploading to chat...').catch(() => {});
    const sent = await ctx.replyWithVideo(
      { source: fs.createReadStream(localFile), filename: info.filename || 'video.mp4' },
      { caption: `${info.filename || 'video'}\n\nDisclaimer: shared from a diskwala link. The bot does not bypass paywalls or paid creator content; it only fetches the publicly-served file. Auto-deletes in ${process.env.DELETE_AFTER_MINUTES || 45} min.` }
    );
    // record + schedule delete
    db.recordDownload(ctx.from.id, fileId, sent.chat.id, sent.message_id);
    scheduler.arm(sent.chat.id, sent.message_id, Date.now(), async (chatId, messageId) => {
      try { await bot.telegram.deleteMessage(chatId, messageId); } catch {}
      if (localFile && fs.existsSync(localFile)) { fs.promises.unlink(localFile).catch(() => {}); }
      try { await bot.telegram.sendMessage(chatId, 'Your shared video was auto-deleted (45 min policy).'); } catch {}
    });
    try { await ctx.telegram.deleteMessage(status.chat.id, status.message_id); } catch {}
    if (!premium) {
      const used = db.getTodayCount(ctx.from.id);
      const rem = Math.max(0, FREE_DAILY_LIMIT - used);
      await ctx.reply(`Done! You have ${rem}/${FREE_DAILY_LIMIT} free downloads left today.`).catch(() => {});
    } else {
      await ctx.reply(`Done! Premium usage — no daily cap. Premium until: ${pay.formatPremiumUntil(db.getUser(ctx.from.id).premium_until)}`).catch(() => {});
    }
  } catch (e) {
    await ctx.reply(`Failed: ${e.message}`).catch(() => {});
    try { await ctx.telegram.deleteMessage(status.chat.id, status.message_id); } catch {}
    if (localFile && fs.existsSync(localFile)) fs.promises.unlink(localFile).catch(() => {});
  } finally {
    activeDownloads.delete(lockKey);
  }
}

// Admin commands
function adminGuard(ctx, next) {
  if (!isAdmin(ctx.from.id)) return ctx.reply('Admin only.').catch(() => {});
  return next();
}

bot.command('grant', (ctx) => adminGuard(ctx, () => {
  const [tgIdStr, planId] = (ctx.message.text || '').split(/\s+/).slice(1);
  const tgId = Number(tgIdStr);
  if (!tgId || !planId) return ctx.reply('Usage: /grant <tg_id> <plan_id>. Plans: ' + pay.parsePlans().map(p => p.id).join(', '));
  const plan = pay.planById(pay.parsePlans(), planId);
  if (!plan) return ctx.reply('Unknown plan_id. Plans: ' + pay.parsePlans().map(p => p.id).join(', '));
  db.ensureUser(tgId);
  const untilMs = pay.untilForPlan(plan);
  db.setPremium(tgId, untilMs >= Number.MAX_SAFE_INTEGER ? null : untilMs);
  return ctx.reply(`Granted ${plan.label} to ${tgId}. Active until ${pay.formatPremiumUntil(untilMs >= Number.MAX_SAFE_INTEGER ? null : untilMs)}.`);
}));

bot.command('revoke', (ctx) => adminGuard(ctx, () => {
  const [tgIdStr] = (ctx.message.text || '').split(/\s+/).slice(1);
  const tgId = Number(tgIdStr);
  if (!tgId) return ctx.reply('Usage: /revoke <tg_id>');
  db.ensureUser(tgId);
  db.setPremium(tgId, 0);
  return ctx.reply(`Revoked premium for ${tgId}.`);
}));

bot.command('stats', (ctx) => adminGuard(ctx, () => {
  return ctx.reply(
    `Users: ${db.allUsersCount()}\n` +
    `Premium users: ${db.premiumUsersCount()}\n` +
    `Downloads today (UTC): ${db.todayDownloadsTotal()}`
  );
}));

// Restore scheduled deletes
process.nextTick(() => {
  scheduler.restoreAll(async (chatId, messageId) => {
    try { await bot.telegram.deleteMessage(chatId, messageId); } catch {}
  }).catch(() => {});
});

bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.launch().then(() => {
  console.log('diskwala-bot up. Admin:', ADMIN_ID, 'Free/day:', FREE_DAILY_LIMIT);
});

const stop = () => bot.stop('shutdown');
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
