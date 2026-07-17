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

const seenFrom = new Map();

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

  /**
   * Cloudflare _redirects cannot match query strings — it matches on path only.
   * So `/?utm_source=x  /  301` silently becomes `/ -> / 301`: an infinite loop
   * that takes the page down. This shipped once and was only caught on the
   * preview deploy, because "does the target exist?" says yes about a self-loop.
   */
  if (rule.from.includes('?')) {
    fail(
      `redirect "${rule.from}" has a query string. _redirects matches path only, so this ` +
        `collapses to "${rule.from.split('?')[0]}" — likely a self-redirect loop. ` +
        `Use a Cloudflare Redirect Rule instead.`
    );
    failed++;
  }

  // Self-redirect: infinite loop.
  const fromPath = rule.from.split('?')[0].replace(/\/$/, '') || '/';
  const toPath = target.replace(/\/$/, '') || '/';
  if (fromPath === toPath) {
    fail(`redirect "${rule.from}" -> "${rule.to}" redirects to itself (infinite loop)`);
    failed++;
  }

  /**
   * Cloudflare Pages evaluates _redirects BEFORE serving static assets, so any
   * rule matching a real page takes that page off the site. A splat is the
   * dangerous case: `/service-areas/* -> /service-areas` 301s all eight real
   * city pages to the hub. That shipped and was caught on the preview deploy.
   */
  if (rule.from.endsWith('/*')) {
    const prefix = rule.from.slice(0, -2);
    const shadowed = [...built].filter((u) => u.startsWith(prefix + '/') && u !== toPath);
    for (const page of shadowed) {
      fail(
        `splat "${rule.from}" shadows the real page ${page} — _redirects is evaluated before ` +
          `static assets, so this 301s it away. Enumerate the legacy slugs instead.`
      );
      failed++;
    }
  } else if (resolves(fromPath) && fromPath !== toPath) {
    fail(`redirect "${rule.from}" shadows a real page at ${fromPath}, making it unreachable`);
    failed++;
  }

  if (seenFrom.has(fromPath)) {
    fail(`duplicate redirect for "${fromPath}" — first match wins, the later one is dead`);
    failed++;
  }
  seenFrom.set(fromPath, rule.to);
}

// Multi-hop chains: every 301 should land on a 200 in one hop.
for (const rule of rules) {
  const target = rule.to.split('?')[0].replace(/\/$/, '') || '/';
  const next = seenFrom.get(target);
  if (next && next !== rule.to) {
    fail(`redirect "${rule.from}" -> "${rule.to}" -> "${next}" is a chain; point it at the final URL`);
    failed++;
  }
}

ok(`${rules.length} redirect rules: targets resolve, no loops, no chains, no shadowed pages`);

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
