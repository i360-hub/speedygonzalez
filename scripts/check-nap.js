/**
 * NAP-drift gate.
 *
 * Build spec §1: "Keep NAP byte-identical to GBP everywhere." The single source
 * of truth is src/data/business.ts, verified against the Google Business Profile
 * (location 15761) on 2026-07-16.
 *
 * This exists because prose can't interpolate constants — 21 markdown files and
 * several .astro pages hardcoded "209 Albert Pike" and "7:00 AM to 8:00 PM" long
 * after business.ts was corrected, and a line-wrapped "209\nAlbert Pike" survived
 * a find-and-replace. A NAP mismatch quietly costs local rankings, and nothing
 * else in the pipeline notices.
 *
 * If the business genuinely moves or changes hours: update business.ts, update
 * GBP, then update STALE below. Never silence a failure by deleting a rule.
 */
import { pages, ok, fail } from './lib/pages.js';
import { business } from '../src/data/business.ts';

/**
 * Full-page text, NOT textOf() — that one scopes to <main>, and the NAP lives in
 * the footer and trust bar, outside it. Stale NAP in a footer is just as wrong
 * as stale NAP in body copy.
 */
const fullText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;|&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ');

/** Strings that were once true (or were never true) and must not reappear. */
const STALE = [
  {
    re: /\b209 Albert Pike\b(?!\s*Road[^.]{0,40}showroom)/gi,
    why: 'stale office address — GBP says 207 Albert Pike Road. 209 is the showroom next door and is not part of the NAP.',
  },
  { re: /\b7:00 ?AM to 8:00 ?PM\b/gi, why: 'stale hours — the business is open 24 hours (confirmed by owner + GBP).' },
  { re: /\b7 ?AM ?[–—-] ?8 ?PM\b/gi, why: 'stale hours — the business is open 24 hours.' },
  { re: /Mon[–—-]Sun 7:00/gi, why: 'stale hours — the business is open 24 hours.' },
];

let failed = 0;
let addressPages = 0;

for (const page of pages()) {
  const text = fullText(page.html);

  for (const rule of STALE) {
    for (const hit of new Set(text.match(rule.re) ?? [])) {
      fail(`${page.url} — "${hit.trim()}": ${rule.why}`);
      failed++;
    }
  }

  if (text.includes(business.address.street)) addressPages++;

  /**
   * Any Albert Pike address that isn't the canonical one or the showroom is
   * drift. Catches a re-typed "207 Albert Pike" (no "Road") as well as a new
   * wrong number.
   */
  for (const hit of new Set(text.match(/\b\d{2,4} Albert Pike(?: Road| Rd)?\b/gi) ?? [])) {
    const canonical = hit.toLowerCase() === business.address.street.toLowerCase();
    const showroom = hit.toLowerCase() === business.showroom.street.toLowerCase();
    if (!canonical && !showroom) {
      fail(`${page.url} — "${hit}" is not the canonical NAP ("${business.address.street}") or the showroom.`);
      failed++;
    }
  }
}

// The footer carries the address, so every page should state it.
if (addressPages < pages().length) {
  fail(`only ${addressPages}/${pages().length} pages state the canonical address — the footer should put it on all of them`);
  failed++;
}

if (failed) {
  fail(`NAP gate failed with ${failed} problem(s).`);
  process.exit(1);
}

ok(`NAP gate passed — "${business.address.street}" on all ${addressPages} pages, no stale address or hours.`);
