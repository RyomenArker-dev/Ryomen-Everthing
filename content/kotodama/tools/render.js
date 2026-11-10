// Usage: node tools/render.js <page.html> <out-dir> <total-frames>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [, , page_, outDir_, total_] = process.argv;
  const pageFile = path.resolve(page_), outDir = path.resolve(outDir_);
  const TOTAL = parseInt(total_ || '900', 10);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('file://' + pageFile);
  await page.waitForFunction('window.__ready === true', null, { timeout: 20000 });
  const el = page.locator('#c');
  const t0 = Date.now();
  for (let f = 0; f < TOTAL; f++) {
    await page.evaluate(n => window.renderFrame(n), f);
    await el.screenshot({ path: path.join(outDir, 'f' + String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  await browser.close();
  console.log('rendered', TOTAL, 'frames in', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})().catch(e => { console.error(e); process.exit(1); });
