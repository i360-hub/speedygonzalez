/**
 * Link + migration gate — build spec §11.5 and §10.
 *
 * 1. No internal link points at a page that doesn't exist.
 * 2. Every legacy URL resolves to a 200 or a 301 (zero orphan 404s).
 * 3. Every _redirects target itself resolves.
 */
import { readFileSync, existsSync } from 'node:fs';
import { pages, ok, fail } from './lib/pages.js';
import { LEGACY_URLS } from './lib/legacy-urls.js';

const built = new Set(pages().map((p) => p.url));
// Astro's `format: 'file'` writes /about.html, served at /about.
const resolves = (url) => built.has(url) || existsSync(`dist${url}.html`) || existsSync(`dist${url}/index.html`);

let failed = 0;

// --- 1. Internal links -------------------------------------------------------
const IGNORE = /^(https?:|mailto:|tel:|#|\/rss\.xml|\/sitemap|\/fonts\/|\/images\/|\/_astro\/|\/logo|\/og\.jpg|\/favicon|\/apple-touch-icon|\/robots\.txt)/;

let linkCount = 0;
for (const page of pages()) {
  const hrefs = [...page.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (IGNORE.test(href)) continue;
    const url = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    linkCount++;
    if (!resolves(url)) {
      fail(`${page.url} links to ${url} which does not exist`);
      failed++;
    }
  }
}
ok(`${linkCount} internal links checked across ${built.size} pages`);

// --- 2. Redirects parse + targets resolve ------------------------------------
const rulesText = readFileSync('dist/_redirects', 'utf8');
const rules = rulesText
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((line) => {
    const [from, to, code] = line.split(/\s+/);
    return { from, to, code: Number(code) };
  });

for (const rule of rules) {
  if (![301, 302, 308].includes(rule.code)) {
    fail(`redirect "${rule.from}" has bad status code: ${rule.code}`);
    failed++;
  }
  const target = rule.to.split('#')[0].split('?')[0];
  if (!resolves(target === '' ? '/' : target)) {
    fail(`redirect "${rule.from}" -> "${rule.to}" targets a page that does not exist`);
    failed++;
  }
}
ok(`${rules.length} redirect rules parsed, all targets resolve`);

// --- 3. Every legacy URL resolves --------------------------------------------
const match = (url) => {
  if (resolves(url)) return { how: '200' };
  for (const rule of rules) {
    if (rule.from === url) return { how: `301 -> ${rule.to}` };
    if (rule.from.endsWith('/*')) {
      const prefix = rule.from.slice(0, -1);
      if (url.startsWith(prefix)) return { how: `301 (splat) -> ${rule.to}` };
    }
  }
  return null;
};

const orphans = [];
for (const url of LEGACY_URLS) {
  if (!match(url)) orphans.push(url);
}

if (orphans.length) {
  for (const url of orphans) fail(`legacy URL 404s: ${url}`);
  failed += orphans.length;
} else {
  ok(`all ${LEGACY_URLS.length} legacy URLs resolve to a 200 or 301 — zero orphan 404s`);
}

if (failed) {
  fail(`Link gate failed with ${failed} problem(s).`);
  process.exit(1);
}

ok('Link gate passed.');
