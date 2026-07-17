/**
 * Missing-space gate (DOM-level, layout-aware).
 *
 * In Astro/JSX, whitespace between a text node and an inline element or
 * {expression} that spans a line break collapses to NOTHING, so
 * `check our record with the\n<a>BBB A+ rating</a>` renders "theBBB". A regex on
 * innerText only catches joins where the second word starts with a capital or
 * digit; it can't tell "andstorm" (a bug) from a real word.
 *
 * So this walks the rendered DOM: for every element that is actually laid out
 * inline (display inline / inline-block — NOT flex buttons or block labels),
 * it checks whether an adjacent text node butts directly against the element's
 * text with no whitespace between them. That is the real "theBBB" signature,
 * regardless of letter case.
 */
import { chromium } from 'playwright-chromium';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { pages, ok, fail } from './lib/pages.js';

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

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
const page = await browser.newPage();

// Real joins that are correct: review-author proper nouns, the email, tech words.
const ALLOW = [/speedygonzalezz19/, /JavaScript/, /GoHighLevel/, /24hrs/];

let failed = 0;
for (const p of pages()) {
  await page.goto(base + p.file.replace(/^dist/, ''), { waitUntil: 'load' });
  const hits = await page.evaluate(() => {
    const out = [];
    const inline = (el) => {
      const d = getComputedStyle(el).display;
      return d === 'inline' || d === 'inline-block';
    };
    const wordEnd = /[A-Za-z0-9]$/;
    const wordStart = /^[A-Za-z0-9]/;
    for (const el of document.querySelectorAll('a, strong, em, b, i, span, code, abbr')) {
      if (!inline(el)) continue;
      const txt = (el.textContent || '').trim();
      if (!txt) continue;
      // Text node immediately before this inline element, no whitespace between.
      const prev = el.previousSibling;
      if (prev && prev.nodeType === 3 && wordEnd.test(prev.textContent) && wordStart.test(txt)) {
        out.push((prev.textContent.slice(-20) + '»' + txt.slice(0, 20)).replace(/\s+/g, ' '));
      }
      const next = el.nextSibling;
      if (next && next.nodeType === 3 && wordStart.test(next.textContent) && wordEnd.test(txt)) {
        out.push((txt.slice(-20) + '»' + next.textContent.slice(0, 20)).replace(/\s+/g, ' '));
      }
    }
    return out;
  });
  for (const h of new Set(hits)) {
    if (ALLOW.some((re) => re.test(h))) continue;
    fail(`${p.url} — "${h}"  (» marks the missing space)`);
    failed++;
  }
}

await browser.close();
server.close();

if (failed) {
  fail(`Spacing gate: ${failed} missing-space join(s). Add {' '} in the source before the wrapped element.`);
  process.exit(1);
}
ok('Spacing gate passed — no run-together words at inline boundaries.');
