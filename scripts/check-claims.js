/**
 * Unapproved-claims gate.
 *
 * The client has not approved published prices, so no dollar figure or worded
 * price estimate may ship. Cost *topics* are deliberately kept (they're ranking
 * targets) — they answer with what drives the price plus a free estimate.
 *
 * Also blocks trust claims we have no proof for. These are exactly the claims
 * that draw complaints, and they're easy to reintroduce by accident.
 *
 * If the client later approves real numbers, drop the price rules here and
 * repopulate `priceRange` in the service frontmatter.
 */
import { pages, textOf, ok, fail } from './lib/pages.js';

const RULES = [
  { name: 'dollar figure', re: /\$\s?[0-9][0-9,.]*/g },
  { name: 'worded price', re: /\b(?:[0-9,]+\s+dollars|[0-9]+\s?k\b|(?:a\s+)?few\s+hundred\s+dollars|couple\s+hundred\s+dollars|(?:five|six)\s+figures|(?:ten|twenty|thirty)\s+grand)\b/gi },
  { name: 'per-unit price', re: /\bper\s+(?:square\s+foot|square|linear\s+foot)\b\s*[:,-]?\s*\$?[0-9]/gi },
  // Unprovable trust claims (spec: no invented certifications/ratings).
  { name: 'certification claim', re: /\b(?:certainteed|gaf\b|owens\s+corning|select\s+shinglemaster|master\s+elite|preferred\s+contractor)\b/gi },
  { name: 'BBB claim', re: /\bBBB\b|better\s+business\s+bureau/gi },
  { name: 'price-beat promise', re: /\b(?:beat\s+any\s+(?:price|quote)|lowest\s+price\s+guaranteed|cheapest\s+in\s+town)\b/gi },
];

let failed = 0;

for (const page of pages()) {
  const text = textOf(page.html);
  for (const rule of RULES) {
    const hits = [...new Set(text.match(rule.re) ?? [])];
    for (const hit of hits) {
      fail(`${page.url} — ${rule.name}: "${hit.trim()}"`);
      failed++;
    }
  }
}

if (failed) {
  fail(`Claims gate failed with ${failed} unapproved claim(s).`);
  process.exit(1);
}

ok('Claims gate passed — no prices or unprovable trust claims published.');
