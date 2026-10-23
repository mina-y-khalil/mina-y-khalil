// Renders index.html with its print stylesheet into assets/Mina-Khalil-Resume.pdf — the same pages the
// site's Print / PDF buttons produce, so the downloadable PDF always matches the live site.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const OUT = 'assets/Mina-Khalil-Resume.pdf';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('index.html')).href, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
// QR codes come from an API and the fonts from Google — wait until every picture and font is in
await page.waitForLoadState('networkidle').catch(() => {});
await page.evaluate(async () => {
  await Promise.all([...document.images].filter((img) => !img.complete)
    .map((img) => new Promise((done) => { img.onload = img.onerror = done; })));
  await document.fonts.ready;
});
await page.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
console.log(`wrote ${OUT}`);
