// Usage: node tools/check.js <page.html> <out-dir> <t1> <t2> ...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [, , page_, outDir_, ...times] = process.argv;
  const pageFile = path.resolve(page_), outDir = path.resolve(outDir_);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[console]', m.type(), m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('file://' + pageFile);
  await page.waitForFunction('window.__ready === true', null, { timeout: 20000 });
  for (const ts of times.map(Number)) {
    await page.evaluate(f => window.renderFrame(f), Math.round(ts * 30));
    await page.locator('#c').screenshot({ path: path.join(outDir, 'check-' + ts.toFixed(2) + '.png') });
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
