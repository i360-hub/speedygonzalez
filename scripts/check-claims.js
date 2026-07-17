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
  /**
   * BBB: verified 2026-07-16 as A+ rated but NOT accredited.
   * "BBB A+ Rated" / "BBB A+ rating" are allowed and stripped before this runs.
   * Everything else mentioning BBB still fails — accreditation the business does
   * not hold is a real misrepresentation, not a wording nitpick.
   */
  { name: 'BBB accreditation claim', re: /\bBBB\s+(?:accredited|member|accreditation)\b|accredited\s+by\s+the\s+BBB|better\s+business\s+bureau\s+accredited/gi },
  { name: 'unapproved BBB mention', re: /\bBBB\b|better\s+business\s+bureau/gi },
  { name: 'price-beat promise', re: /\b(?:beat\s+any\s+(?:price|quote)|lowest\s+price\s+guaranteed|cheapest\s+in\s+town)\b/gi },
  /**
   * No guarantee or warranty language. Owner instruction 2026-07-16:
   * "no guarantee.....simply can't".
   *
   * The supplement spec's §5 drafted "Spotless cleanup — guaranteed"; a roofer
   * cannot promise a future outcome on an unseen roof, and a guarantee on a web
   * page is a term the business would be held to. The Speedy Standard block
   * reports what reviewers describe instead.
   *
   * Neutral uses are allowed via ALLOWED_GUARANTEE below (e.g. explaining that
   * a manufacturer warranty exists, or that we will NOT guarantee a claim
   * outcome) — those inform the customer rather than promise them something.
   */
  { name: 'guarantee/warranty promise', re: /\bguarantee(?:d|s)?\b|\bwarrant(?:y|ies|ed)\b/gi },
  /**
   * NO FINANCING. Confirmed 2026-07-16: the business offers none. The spec's
   * proof_points said "financing available" and that claim shipped across 24
   * files — a homeowner would have called expecting a payment plan that does
   * not exist. Most jobs are insurance claims; that is the honest answer.
   *
   * If they sign a third-party lender, delete this rule and name the lender.
   */
  {
    name: 'financing claim',
    re: /\bfinanc(?:e|es|ed|ing)\b|\bpayment plan(?:s)?\b|\bmonthly payments?\b|\bpay over time\b|\bspread the cost\b/gi,
  },
];

/**
 * Guarantee-adjacent phrasing that is informational, not a promise. Stripped
 * before the guarantee rule runs. Keep this list tight and specific — each entry
 * should be a sentence we have actually reviewed.
 */
const ALLOWED_GUARANTEE = [
  // Explaining that we do NOT promise an insurance outcome — the opposite of a claim.
  /Anyone who guarantees a paid claim is telling you a story\./g,
  /We do not guarantee what your insurance will pay\./g,
  // Answering "will a repair void my roof warranty?" — describes a third-party warranty.
  /\bvoid my roof warranty\b/g,
  /\bmanufacturer(?:'s|’s)? warranty\b/g,
  /\bwarranty terms\b/g,
];

/**
 * Exact BBB strings cleared for publication. Removed from the text before the
 * BBB rules run, so any *other* BBB phrasing still trips the gate.
 * The torch/seal image is blocked separately below.
 */
const ALLOWED_BBB = [/\bBBB A\+ Rated\b/g, /\bBBB A\+ rating\b/g];

let failed = 0;

for (const page of pages()) {
  let text = textOf(page.html);

  // Clear approved phrasings first; anything else still trips the rules below.
  for (const allowed of ALLOWED_BBB) text = text.replace(allowed, '');
  for (const allowed of ALLOWED_GUARANTEE) text = text.replace(allowed, '');

  for (const rule of RULES) {
    const hits = [...new Set(text.match(rule.re) ?? [])];
    for (const hit of hits) {
      fail(`${page.url} — ${rule.name}: "${hit.trim()}"`);
      failed++;
    }
  }

  // The BBB torch/seal is licensed to accredited businesses only. This one
  // checks raw HTML, not text — an <img> never appears in the text pass.
  const seal = page.html.match(/<img[^>]+(?:src|alt)="[^"]*(?:bbb|torch|better-business)[^"]*"[^>]*>/gi);
  for (const hit of seal ?? []) {
    fail(`${page.url} — BBB seal/torch image (licensed to accredited businesses only): ${hit.slice(0, 80)}`);
    failed++;
  }
}

if (failed) {
  fail(`Claims gate failed with ${failed} unapproved claim(s).`);
  process.exit(1);
}

ok('Claims gate passed — no prices or unprovable trust claims published.');
