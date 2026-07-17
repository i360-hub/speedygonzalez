/**
 * 5-star-only gate. Owner instruction, 2026-07-16:
 * "do not under any circumstance use any reviews other than 5 star throughout
 * the site."
 *
 * Enforces three things:
 *   1. Every review in src/data/reviews.ts is 5 stars.
 *   2. Every review has a real gbpId (it corresponds to an actual Google review
 *      — reviews are never written, only quoted).
 *   3. No built page renders a partial star rating, which is what a sub-5-star
 *      review would look like on the page.
 *
 * The supplement spec's §7 honesty block displayed the four critical reviews.
 * It was built, then removed at the owner's direction. Reinstating it is the
 * owner's call to make, not a developer's — this gate is the tripwire.
 */
import { readFileSync } from 'node:fs';
import { pages, ok, fail } from './lib/pages.js';
import { reviewsByPage, allReviews, standardProof } from '../src/data/reviews.ts';

let failed = 0;

// 1 + 2. Data-level: every review 5 stars, every review traceable to GBP.
for (const [slug, reviews] of Object.entries(reviewsByPage)) {
  for (const review of reviews) {
    if (review.rating !== 5) {
      fail(`reviews.ts [${slug}] — "${review.name}" is ${review.rating} stars. 5-star only.`);
      failed++;
    }
    if (!Number.isInteger(review.gbpId) || review.gbpId <= 0) {
      fail(`reviews.ts [${slug}] — "${review.name}" has no valid gbpId. Every review must trace to a real Google review.`);
      failed++;
    }
    if (!review.text?.trim()) {
      fail(`reviews.ts [${slug}] — "${review.name}" has empty text.`);
      failed++;
    }
  }
}

// The Speedy Standard footnotes quote reviews too — same rule applies.
for (const [key, proof] of Object.entries(standardProof ?? {})) {
  if (!Number.isInteger(proof.gbpId) || proof.gbpId <= 0) {
    fail(`standardProof.${key} — no valid gbpId.`);
    failed++;
  }
}

// 3. Rendered: a sub-5-star review would show fewer than 5 filled stars.
// Our 5-star markup is exactly five ★ in a row inside .stars / .crit-stars.
for (const page of pages()) {
  // The removed §7 block used class="critical" / "crit-stars"; if either
  // reappears, someone has put non-5-star reviews back on the page.
  if (/class="[^"]*\bcrit(ical|-stars)\b/.test(page.html)) {
    fail(`${page.url} — renders a critical-review block. 5-star only.`);
    failed++;
  }
  if (/\b(?:1|2|3|4) out of 5 stars\b/.test(page.html)) {
    fail(`${page.url} — renders a sub-5-star rating label. 5-star only.`);
    failed++;
  }
}

// The data file must not carry a critical-review export at all.
const src = readFileSync('src/data/reviews.ts', 'utf8');
if (/export\s+const\s+criticalReviews/.test(src)) {
  fail('reviews.ts still exports criticalReviews — remove it. 5-star only.');
  failed++;
}

if (failed) {
  fail(`Review gate failed with ${failed} problem(s).`);
  process.exit(1);
}

ok(`Review gate passed — all ${allReviews.length} published reviews are 5-star and traceable to a real GBP review id.`);
