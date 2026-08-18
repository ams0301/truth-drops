// Diskwala downloader
// Strategy: launch a headless Chromium, intercept the network requests the app
// makes to ddudapidd.diskwala.com (which carry the signed Appicrypt header
// generated inside-page by the real AppiCryptWeb WASM), and capture the
// response that contains the signed download URL. We never have to reverse the
// WASM signing — we just let the page do it and read the result.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const API_HOST = 'ddudapidd.diskwala.com';
const EXTRACT_TIMEOUT = Number(process.env.EXTRACT_TIMEOUT_MS || 45000);

// Regex for file IDs inside diskwala.com/app/<id> URLs
const FILE_ID_RE = /diskwala\.com\/app\/([A-Za-z0-9]+)/i;

function extractFileId(text) {
  if (!text) return null;
  const m = text.match(FILE_ID_RE);
  return m ? m[1] : null;
}

let _browserPromise = null;
async function getBrowser() {
  if (!_browserPromise) {
    _browserPromise = chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    });
    // swap promise -> resolved instance for stable reuse, plus cleanup on crash
    _browserPromise.catch(() => { _browserPromise = null; });
  }
  return _browserPromise;
}

/**
 * Drive the diskwala app page in a real browser and capture the signed
 * download URL + metadata for the given file id.
 *
 * Returns: { downloadUrl, filename, size, contentType, meta }
 * Throws on failure / timeout.
 */
async function resolveFile(fileId) {
  const browser = await getBrowser();
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  const captured = {
    tempInfo: null,
    signInfo: null,
    downloadUrl: null,
    filename: null,
    size: null,
    contentType: null,
  };

  try {
    const page = await ctx.newPage();

    // Capture any response from the signed API; /file/temp_info holds metadata,
    // /file/sign holds the actual download URL.
    page.on('response', async (resp) => {
      try {
        const u = resp.url();
        if (!u.includes(API_HOST)) return;
        if (u.includes('/file/temp_info') && resp.ok()) {
          captured.tempInfo = await resp.json();
        } else if (u.includes('/file/sign') && resp.ok()) {
          captured.signInfo = await resp.json();
        }
      } catch (_) { /* ignore body parse errors */ }
    });

    // Also watch for any traffic to the underlying file hosting domain — diskwala
    // serves actual video bytes from a CDN; we may see a Range request with the
    // final URL there too.
    ctx.on('request', (req) => {
      try {
        const u = req.url();
        if (
          !captured.downloadUrl &&
          /\.(mp4|mkv|webm|m4v|mov|avi)(\?|$)/i.test(u) &&
          !u.includes('diskwala.com/api')
        ) {
          captured.downloadUrl = u;
        }
      } catch (_) { /* ignore */ }
    });

    const url = `https://www.diskwala.com/app/${fileId}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: EXTRACT_TIMEOUT });

    // SPA files that 404 / are deleted / require login redirect to /404 within a
    // few seconds. Detect that and bail loudly so the bot doesn't try to send a
    // bogus "#download" placeholder as the file URL.
    const notFoundDeadline = Date.now() + 6000;
    let notFound = false;
    while (Date.now() < notFoundDeadline) {
      if (page.url().includes('/404')) { notFound = true; break; }
      if (captured.tempInfo || captured.signInfo || captured.downloadUrl) break;
      await page.waitForTimeout(300);
    }
    if (notFound) {
      throw new Error('This diskwala file was not found. It may be deleted, expired, private, or the link is invalid.');
    }

    // Many diskwala pages force the user through an interstitial/ad gate before
    // the Download button appears. We try to click through automatically, and
    // retry a few times so we survive ad-timer gating.
    for (let i = 0; i < 5 && !captured.signInfo && !captured.downloadUrl; i++) {
      await autoClickDownload(page).catch(() => {});
      await page.waitForTimeout(2500);
    }

    // Wait for one of the capture signals.
    const deadline = Date.now() + EXTRACT_TIMEOUT;
    while (Date.now() < deadline) {
      if (captured.signInfo || captured.downloadUrl) break;
      if (page.url().includes('/404')) {
        throw new Error('This diskwala file was not found. It may be deleted, expired, private, or the link is invalid.');
      }
      await page.waitForTimeout(500);
    }

    // Derive final URL. Prefer /file/sign response payload, fall back to scraping the rendered <video> src.
    if (!captured.downloadUrl) {
      const m = await extractMediaFromPage(page).catch(() => null);
      if (m && !m.startsWith('#') && !m.includes('diskwala.com/#')) captured.downloadUrl = m;
    }

    // Extract metadata from temp_info if present.
    const meta = captured.tempInfo || {};
    if (meta.file && meta.file.name) captured.filename = meta.file.name;
    if (meta.file && meta.file.size) captured.size = meta.file.size;
    if (!captured.filename && captured.downloadUrl) {
      try { captured.filename = decodeURIComponent(new URL(captured.downloadUrl).pathname.split('/').pop()); }
      catch { captured.filename = `${fileId}.mp4`; }
    }
    if (captured.signInfo && captured.signInfo.data && captured.signInfo.data.url) {
      captured.downloadUrl = captured.signInfo.data.url;
    } else if (captured.signInfo && typeof captured.signInfo === 'object') {
      // Try all common shapes
      const d = captured.signInfo.data || captured.signInfo;
      if (d.url) captured.downloadUrl = d.url;
      if (d.signed_url) captured.downloadUrl = d.signed_url;
      if (d.download_url) captured.downloadUrl = d.download_url;
      if (d.file && d.file.url) captured.downloadUrl = d.file.url;
    }

    if (!captured.downloadUrl) {
      throw new Error('Could not resolve a download URL for this diskwala file. It may be private, deleted, or require manual login.');
    }
    if (/^#|\/#|\/404?/.test(captured.downloadUrl) || captured.downloadUrl.length < 12) {
      throw new Error('diskwala returned a non-downloadable placeholder URL. The file may be deleted or require login.');
    }

    return {
      downloadUrl: captured.downloadUrl,
      filename: captured.filename || `${fileId}.mp4`,
      size: captured.size || null,
      contentType: captured.contentType || null,
      meta,
    };
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function autoClickDownload(page) {
  // diskwala pages typically render a "Download" or "Get Link" button after an
  // ad gate. Try common selectors.
  const sel = [
    'text=Download',
    'text=Get Link',
    'text=Get Download Link',
    'text=Proceed to Download',
    'button:has-text("Download")',
    'a:has-text("Download")',
  ];
  for (const s of sel) {
    try {
      const el = await page.locator(s).first({ timeout: 2500 }).catch(() => null);
      if (el) { await el.click({ timeout: 2000 }).catch(() => {}); }
    } catch (_) { /* ignore */ }
  }
}

async function extractMediaFromPage(page) {
  return await page.evaluate(() => {
    const v = document.querySelector('video');
    if (v && v.src) return v.src;
    const src = document.querySelector('video source');
    if (src && src.src) return src.src;
    const a = Array.from(document.querySelectorAll('a')).find(
      (x) => /download/i.test(x.textContent || '') && x.href
    );
    return a ? a.href : null;
  });
}

function downloadToFile(url, destPath, { maxBytes = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const f = fs.createWriteStream(destPath);
    let total = 0;
    const client = url.startsWith('http://') ? http : https;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        f.close(); fs.unlink(destPath, () => {});
        return downloadToFile(res.headers.location, destPath, { maxBytes }).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        f.close(); fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode} while downloading`));
      }
      res.on('data', (chunk) => {
        total += chunk.length;
        if (maxBytes && total > maxBytes) {
          f.close(); fs.unlink(destPath, () => {});
          reject(new Error('Exceeded max download size'));
          req.destroy();
        }
      });
      res.pipe(f);
      f.on('finish', () => f.close(() => resolve({ bytes: total })));
      f.on('error', (e) => { fs.unlink(destPath, () => {}); reject(e); });
    });
    req.on('error', (e) => { f.close(); fs.unlink(destPath, () => {}); reject(e); });
  });
}

module.exports = {
  extractFileId,
  resolveFile,
  downloadToFile,
};
