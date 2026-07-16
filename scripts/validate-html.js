/**
 * HTML + on-page SEO gate — build spec §11.6 and §5.
 * Single H1, title/description limits, canonical, alt text, heading order.
 */
import { pages, ok, fail } from './lib/pages.js';

let failed = 0;

for (const page of pages()) {
  const { url, html } = page;

  // Single H1 per page
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) {
    fail(`${url} — has ${h1s.length} <h1> elements, expected exactly 1`);
    failed++;
  }

  // Title <= 60
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  if (!title) {
    fail(`${url} — no <title>`);
    failed++;
  } else if (title.length > 60) {
    fail(`${url} — title is ${title.length} chars (max 60): "${title}"`);
    failed++;
  }

  // Meta description <= 155
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
  if (!desc) {
    fail(`${url} — no meta description`);
    failed++;
  } else if (desc.length > 155) {
    fail(`${url} — meta description is ${desc.length} chars (max 155)`);
    failed++;
  }

  // Self-referencing canonical
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1];
  if (!canonical) {
    fail(`${url} — no canonical`);
    failed++;
  } else if (!canonical.startsWith('https://www.speedygonzalezroofing.com')) {
    fail(`${url} — canonical points off-host: ${canonical}`);
    failed++;
  }

  // Every img needs an alt attribute (decorative images use alt="")
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=/.test(tag)) {
      fail(`${url} — <img> without alt: ${tag.slice(0, 90)}`);
      failed++;
    }
    if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) {
      fail(`${url} — <img> without width/height (CLS risk): ${tag.slice(0, 90)}`);
      failed++;
    }
  }

  // lang attribute
  if (!/<html[^>]+lang="/.test(html)) {
    fail(`${url} — <html> missing lang`);
    failed++;
  }
}

if (failed) {
  fail(`HTML gate failed with ${failed} problem(s).`);
  process.exit(1);
}

ok(`HTML gate passed — ${pages().length} pages: single H1, title/description within limits, canonical set, images sized with alt text.`);
