# diskwala-bot

Telegram bot for downloading diskwala.com videos ad-free — 3 free downloads/day,
QR + UTR-verified premium upgrade, auto-deletes videos from chat 45 min after
sending.

## Structure

```
src/index.js        Telegraf bot: handlers (text/photo/command/admin)
src/diskwala.js     Playwright extractor: drives diskwala's signed SDK in-page
                    to get the real download URL; then Node downloads the file
src/db.js           node:sqlite (built-in) store: users, downloads, payments, UTRs
src/payment.js      Plan parsing + Tesseract OCR + UTR verify + 5-min timer
src/scheduler.js    45-min auto-delete timers (persists across restarts)
assets/qr.png       Your UPI QR (already added)
data/               Auto-created sqlite DB + scheduler state
tmp/                Auto-created temp video files (deleted after sending)
```

## First-time setup (already done once on this machine)

```
cd diskwala-bot
npm install
npx playwright install chromium
```

## Run

```
npm start
```

The bot prints `diskwala-bot up. Admin: 1289017759 ...`. Send `/start` to it on
Telegram.

## Environment (.env)

Already filled: `BOT_TOKEN`, `ADMIN_ID`, `FREE_DAILY_LIMIT=3`,
`DELETE_AFTER_MINUTES=45`, `PAY_TIMER_MINUTES=5`, `PLANS=...`.

**You still must edit `UPI_ID`** to the UPI ID printed on your QR
(currently the placeholder `replace@upi`).

## Plans (already configured)

`25r5|5 Days|25|5` , `45r10|10 Days|45|10`, `65r15|15 Days|65|15`,
`120r1m|1 Month|120|30`, `320r3m|3 Months|320|90`, `1500rlt|Lifetime|1500|null`

Edit `PLANS=` in `.env` to change prices/IDs.

## Bot commands (regular users)

- Send a diskwala.com/app/<id> link → bot fetches & sends the video, deletes after 45 min.
- `/status`  — quota / premium status
- `/upgrade` — shows QR + plan buttons, starts 5-min payment timer
- `/help`    — usage text

After picking a plan via the inline buttons, send a payment success screenshot
as a photo. Tesseract OCR reads the **UPI Ref No (UTR)** and the amount; the
bot verifies UTR is unused and amount matches plan price, then sets premium for
the chosen duration (lifetime = forever).

## Admin commands (only your TG ID `1289017759`)

- `/grant <tg_id> <plan_id>` — manually upgrade any user (e.g. `/grant 123 120r1m`)
- `/revoke <tg_id>`          — remove premium
- `/stats`                   — user / premium / today downloads counts

## Hosting

- **Local PC**: run `npm start`. To keep it alive across reboots, install `pm2`
  globally and: `pm2 start npm --name diskwala -- start`.
- **VPS / Render / Railway**: deploy as a Node app; ensure Chromium is installed
  (`npx playwright install chromium` runs on the image at build time, or use a
  Playwright base image). Add `.env` to secrets.

## Important notes

- Telegram caps files at **50 MB** when sent to bots. Larger diskwala files are
  rejected with a clear message (most diskwala micro-drama videos fit; bot does
  not transcode).
- The AppiCryptWeb signing inside diskwala is intentional anti-scraping. We never
  reverse it — we run the real SDK inside a headless Chromium and capture the
  resulting signed URL. This is robust against future diskwala changes but does
  require Chromium available on the host.
- UPI screenshot verification OCR can mis-read a small fraction of screenshots.
  Users in that case should contact you, the admin, who can run `/grant`.
- This bot only fetches diskwala files that the uploader has made publicly
  accessible (no paywall bypass).
