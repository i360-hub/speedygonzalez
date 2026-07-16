/**
 * Horizontal-overflow gate.
 *
 * The page body must never scroll sideways at mobile width — wide content
 * (tables, code, embeds) scrolls inside its own container instead. Renders every
 * built page in headless Chrome at 375px and asserts scrollWidth <= viewport.
 *
 * This exists because a bare `grid-template-columns: 1fr` floors its track at
 * min-content, which a nowrap table silently blows past the viewport. Lighthouse
 * does not fail on that, so it needs its own check.
 */
import { chromium } from 'playwright-chromium';
import { pages, ok, fail } from './lib/pages.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

const WIDTH = 375;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer(async (req, res) => {
  const path = 'dist' + decodeURIComponent(req.url.split('?')[0]);
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 812 } });

let failed = 0;
for (const p of pages()) {
  const url = base + p.file.replace(/^dist/, '');
  await page.goto(url, { waitUntil: 'load' });
  const { scrollWidth, offenders } = await page.evaluate((w) => {
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 && r.width > 0) {
        bad.push(`<${el.tagName.toLowerCase()} class="${el.className}"> ${Math.round(r.width)}px`);
      }
    }
    return { scrollWidth: document.documentElement.scrollWidth, offenders: bad.slice(0, 3) };
  }, WIDTH);

  if (scrollWidth > WIDTH + 1) {
    fail(`${p.url} — scrolls horizontally at ${WIDTH}px (scrollWidth ${scrollWidth})`);
    for (const o of offenders) console.log(`      ${o}`);
    failed++;
  }
}

await browser.close();
server.close();

if (failed) {
  fail(`Overflow gate failed on ${failed} page(s).`);
  process.exit(1);
}

ok(`Overflow gate passed — no page scrolls horizontally at ${WIDTH}px.`);
