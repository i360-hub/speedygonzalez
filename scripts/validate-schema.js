/**
 * JSON-LD validation gate — build spec §11.4.
 *
 * Checks structure, required properties, and @id resolution offline. This does
 * not replace Google's Rich Results Test — run that on the preview deploy before
 * launch (spec §6).
 */
import { pages, ok, fail } from './lib/pages.js';

const REQUIRED = {
  RoofingContractor: ['name', 'address', 'telephone', 'url'],
  Service: ['name', 'provider', 'areaServed'],
  FAQPage: ['mainEntity'],
  BreadcrumbList: ['itemListElement'],
  Article: ['headline', 'datePublished', 'author', 'image'],
};

let failed = 0;
const seen = new Map();
const ids = new Set();
const refs = [];

for (const page of pages()) {
  const blocks = [
    ...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].map((m) => m[1]);

  if (!blocks.length) {
    fail(`${page.url} — no JSON-LD at all`);
    failed++;
    continue;
  }

  for (const raw of blocks) {
    let node;
    try {
      node = JSON.parse(raw);
    } catch (e) {
      fail(`${page.url} — invalid JSON-LD: ${e.message}`);
      failed++;
      continue;
    }

    const type = node['@type'];
    seen.set(type, (seen.get(type) ?? 0) + 1);

    if (!node['@context']) {
      fail(`${page.url} — ${type} missing @context`);
      failed++;
    }

    for (const prop of REQUIRED[type] ?? []) {
      if (node[prop] === undefined) {
        fail(`${page.url} — ${type} missing required "${prop}"`);
        failed++;
      }
    }

    if (node['@id']) ids.add(node['@id']);

    // Collect @id references so we can prove they resolve to a real node.
    for (const value of Object.values(node)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && value['@id'] && Object.keys(value).length === 1) {
        refs.push({ url: page.url, ref: value['@id'] });
      }
    }

    // AggregateRating is a rich-results violation without real on-page reviews.
    if (node.aggregateRating) {
      const hasReviews = /class="[^"]*review/.test(page.html);
      if (!hasReviews) {
        fail(`${page.url} — AggregateRating published but no reviews render on this page`);
        failed++;
      }
    }

    if (type === 'FAQPage') {
      const questions = node.mainEntity ?? [];
      if (!questions.length) {
        fail(`${page.url} — FAQPage with zero questions`);
        failed++;
      }
      for (const q of questions) {
        if (!q.acceptedAnswer?.text) {
          fail(`${page.url} — FAQ "${q.name}" has no acceptedAnswer.text`);
          failed++;
        }
      }
    }
  }
}

for (const { url, ref } of refs) {
  if (!ids.has(ref)) {
    fail(`${url} — @id reference "${ref}" resolves to nothing`);
    failed++;
  }
}

console.log('\nJSON-LD node counts\n');
for (const [type, count] of [...seen].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(3)} × ${type}`);
}
console.log();

if (failed) {
  fail(`Schema gate failed with ${failed} problem(s).`);
  process.exit(1);
}

ok('Schema gate passed — all JSON-LD parses, required props present, @ids resolve.');
