// Renders index.html with its print stylesheet into assets/Mina-Khalil-Resume.pdf — the same pages the
// site's Print / PDF buttons produce, so the downloadable PDF always matches the live site.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const OUT = 'assets/Mina-Khalil-Resume.pdf';

// the Google Chrome already installed on GitHub's runners — nothing to download
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('index.html')).href, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
// QR codes come from an API and the fonts from Google — wait until every picture and font is in
await page.waitForLoadState('networkidle').catch(() => {});
// (lazy pictures in the hidden pop-ups never load, so they're skipped; 20 s cap either way)
await page.evaluate(async () => {
  const pictures = Promise.all([...document.images].filter((img) => !img.complete && img.loading !== 'lazy')
    .map((img) => new Promise((done) => { img.onload = img.onerror = done; })));
  await Promise.race([Promise.all([pictures, document.fonts.ready]), new Promise((done) => setTimeout(done, 20000))]);
});
await page.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true, tagged: true });
await browser.close();
console.log(`wrote ${OUT}`);
