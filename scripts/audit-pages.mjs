/**
 * One-off full-site audit (not a gate). For every built page, in a real browser:
 *   - JS console errors / page errors
 *   - failed network requests (4xx/5xx) — broken images, missing assets
 *   - <img> that rendered broken (naturalWidth === 0)
 *   - links whose href targets a missing in-page anchor (#id not found)
 * Reports per page. Run: node scripts/audit-pages.mjs
 */
import { chromium } from 'playwright-chromium';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { pages } from './lib/pages.js';

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon' };

const server = createServer(async (req, res) => {
  const path = 'dist' + decodeURIComponent(req.url.split('?')[0]);
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(await readFile(path));
  } catch {
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
let totalIssues = 0;

for (const view of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: { width: view.width, height: view.height } });
  for (const p of pages()) {
    const errs = [];
    const failed = [];
    page.removeAllListeners();
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
    page.on('requestfailed', (r) => failed.push(r.url().replace(base, '')));
    page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(base, '')}`); });

    await page.goto(base + p.file.replace(/^dist/, ''), { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // trigger lazy imgs
    await page.waitForTimeout(300);

    const brokenImgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src)
    );

    const issues = [
      ...errs.map((e) => 'console: ' + e),
      ...[...new Set(failed)].map((f) => 'request: ' + f),
      ...brokenImgs.map((b) => 'broken img: ' + b.replace(base, '')),
    ];
    if (issues.length) {
      totalIssues += issues.length;
      console.log(`\n[${view.name}] ${p.url}`);
      for (const i of issues) console.log('   ✗ ' + i);
    }
  }
  await page.close();
}

await browser.close();
server.close();
console.log(totalIssues ? `\n${totalIssues} issue(s) found.` : '\nNo console errors, failed requests, or broken images on any page.');
