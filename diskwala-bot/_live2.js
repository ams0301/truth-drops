require("dotenv").config();
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", viewport: {width:1366,height:900} });
  const page = await ctx.newPage();
  const captured = [];
  page.on("response", async (r) => {
    const u = r.url();
    if (!u.includes("ddudapidd")) return;
    let body = "";
    try { body = await r.text(); } catch {}
    captured.push({ s: r.status(), u: u.replace("https://ddudapidd.diskwala.com/api/v1",""), body: body.slice(0,1500) });
  });
  await page.goto("https://www.diskwala.com/app/6a65c72a06ba7ea03da1bdc7", { waitUntil: "domcontentloaded", timeout: 30000 });
  for (let i=0; i<60; i++) {
    if (captured.some(c => c.u.includes("temp_info"))) break;
    if (page.url().includes("/404")) break;
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2500);
  console.log("FINAL URL:", page.url());
  console.log("CAPTURED ddudapidd CALLS:");
  captured.forEach((c,i) => console.log(i, c.s, c.u, "|", c.body.replace(/\n/g," ").slice(0,800)));
  // also dump any visible text + buttons
  const txt = await page.evaluate(() => document.body && document.body.innerText).catch(()=> "");
  console.log("BODY:", (txt||"").slice(0,600).replace(/\n+/g,"\n"));
  await browser.close();
  process.exit(0);
})().catch(e=>{ console.error("ERR",e); process.exit(1); });
