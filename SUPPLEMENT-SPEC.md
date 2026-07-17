# SUPPLEMENT-SPEC — Phase 2 additions to the built dev site

**For:** Claude Code, working in `site/` (the existing Astro build)
**Context:** The site is built and passing gates. This spec supplements it with verified findings from the July 2026 competitor deep-dive, review audit, imagery inventory, and BBB verification. Nothing here rewrites the architecture — every task plugs into mechanisms that already exist (`src/data/business.ts`, content collections, `scripts/build-images.mjs`, `check-claims.js`, `ReviewCard.astro`).

Work top to bottom. Re-run `npm run build && npm run gates && npx lhci autorun` after each numbered section — the §0 thresholds in the original build spec still govern.

---

## 1. BBB "A+ Rated" — now verified, unblock and add

The launch checklist excluded BBB as unverifiable. It has now been **verified on BBB.org** (profile: *Speedy Gonzalez Construction, Inc.*, Hot Springs AR, file opened 5/16/2024): **A+ rating, NOT accredited.**

1. `scripts/check-claims.js`: relax the BBB rule to allow **only** the exact strings `BBB A+ Rated` / `BBB A+ rating`. Keep failing the build on `BBB Accredited`, `BBB member`, and any use of the BBB torch/seal image — the business is not accredited, and the seal is licensed to accredited businesses only.
2. `src/data/business.ts`: add to `proofPoints`: `'BBB A+ Rated'`. Add a `bbb` field: `{ rating: 'A+', accredited: false, profileUrl: 'https://www.bbb.org/us/ar/hot-springs/profile/home-improvement/speedy-gonzalez-construction-inc-0935-90406229', verified: '2026-07-16' }`.
3. Surface it in the sitewide trust bar (Header or the trust strip component) and on `/about`:
   `★ 4.9 · 152 Google Reviews | BBB A+ Rated | AR Licensed RR0540931024 | 20+ Years · 500+ Roofs | Free Inspections`
   Link the BBB text to the profile URL (`rel="nofollow noopener"`).

## 2. Reviews — expand from 3 to the topic-matched map (3 per page)

All 152 Google reviews were audited via the connected Business Profile (4.9★, 100% owner-replied). Hand-picked placements below. **The `reviews.ts` warning stands:** genuine, verifiable reviews only, quoted verbatim (ellipses fine, no paraphrase).

1. Restructure `src/data/reviews.ts` to key by page slug:
   ```ts
   export const reviewsByPage: Record<string, Review[]> = { home: [...], 'shingle-roofing': [...], ... }
   ```
   Add fields: `gbpId: number`, `date?: string` (month/year). Keep the existing three (Jeffrey Erwin → home, Nicole → roof-leak-repair, Ashley Joy → shingle-roofing or reserve) — their full text is already in the file.
2. Render 3 `ReviewCard`s on each service page (`pages/services/[slug].astro`) and on home, pulled by slug. Attribute "via Google" with name + month/year.
3. **Schema:** per the existing `validate-schema.js` rule, pages that now render real review text may pass `showRating` — but keep `AggregateRating` to home + `/reviews` unless there's a reason; do NOT mark up individual Google reviews as `Review` JSON-LD (self-serving review markup no longer earns stars and risks the rich result).
4. Placement map (reviewer · GBP review ID — full text must be fetched, see 2.5):
   - **home:** Rush Fentress #19151851 (pre-closing replacement saved a home sale, Jun 2026) · Joanne Erickson #2143827 · Jeffrey Erwin #4916741 ✅(have full text)
   - **shingle-roofing:** Jamie Brock #16801167 ("23 square in a day", Mar 2026) · Deanna Layne #17258347 (same-day quote, Apr 2026) · Frank Wagner #2143805
   - **metal-roofing:** Karen Heil #2143818 (hail→metal upgrade) · K Miller #2143858 · Ross Hardy #5929479 (difficult metal repair)
   - **roof-repair:** Greg Carman #2143905 (fixed it, no upsell) · Qwertz Werks #2143903 · Lon Kidd #2143904 (protected roof from rain mid-job)
   - **roof-leak-repair:** Nicole #2938337 ✅ · Bonita Kent #2143816 (leak + insurance) · Living the Dream 4:20 #2143923 (emergency leak)
   - **storm-damage-repair:** Leslie Carey #2143835 (EF2 tornado, HSV) · Darrell Tigue #2143844 (same-day tarp + photos) · Debra Dilbeck #2143859 (house, carport, boat dock)
   - **hail-damage-repair:** Steve Erickson #2143847 (4 properties, impact-resistant upgrade) · Sue Smith #2143865 · Chad Smith #2143875
   - **gutters:** Jeff Erwin #5290550 (returned for gutters w/ covers) · Lashea Coleman #2143826 · Douglas Morehead #2143821
   - **siding:** David Miller #2143879 (full siding + gable vents) · Jackie Simineo #2143888 (metal siding) · Gina Barraclough #19151852 (Jun 2026)
   - **tpo-flat-roofing:** Jerry Parnell #2143930 (two buildings) · Andrew Baka #2143897 (shop wrapped in metal) · Tommy Caesar #2143870 ("beat every estimate")
   - **hot-springs-village (area page):** Leslie Carey #2143835 (reuse) · Hilltop Haven #2143822 (lake house + boat dock, June 2023 hail)
   - **Reserve:** Wanda Gale, Michael Mattingly, Kay Downey, Spencer Green, Shaun Roach #2143803 (posted his own before/after photos on Google — see §3).
5. **Full review text source:** John approves the `gbp_get_review` pull in the Cowork session (28 IDs above), or copy verbatim from the GBP dashboard / Google Maps review panel. Do not launch truncated quotes ending mid-sentence; trim at natural clause boundaries with ellipses.

## 3. Imagery — real photos inline + before/after component

Heroes exist (8 sets in `public/images/`, built by `scripts/build-images.mjs`). What's missing: inline mid-page photos, finished-work shots near CTAs, and before/after pairs. Sources (all in the parent folder, outside `site/`):

| Source | Use |
|---|---|
| `../2024-04-18_4b0fc3ae/Resources/images/` — ~40 unique Duda job photos (use originals, not `-640w`/`-1920w` derivatives) | finished-work inline shots, gallery |
| `../hail damage/` — 15 chalk-marked inspection photos (dedupe `(1)` copies) | "before"/damage shots: storm, hail, repair pages; damage-ID blog art |
| `../truck photos/Photos-001/` — 4 × 4K wrapped trucks | about, homepage trust section |
| GBP media library + Yelp (66+ photos; Shaun Roach's review has customer-posted before/afters) | gallery, before/after pairs |

Tasks:
1. Extend `scripts/build-images.mjs` to emit **inline-size** variants (e.g. 800w/500w AVIF/WebP/JPEG) alongside heroes, from a curated manifest file (`scripts/photo-manifest.json`) that maps source file → output name → alt text. Real, descriptive alt text ("Hail strikes chalk-marked during a roof inspection in Hot Springs, AR").
2. Placement rule per service page: hero (exists) + 1 mid-page damage/process photo + 1 finished-result photo near the CTA band. Area pages: ≥1 real local job photo. **No stock anywhere.**
3. New `<BeforeAfter>` component: single island, `client:visible`, vanilla JS ≤2KB, pairs from `src/data/before-after.json`. Ship on storm, hail, roof-repair, shingle, metal pages. Seed pairs from hail-damage close-ups → finished-roof shots; keep labels honest ("Hail damage found at inspection" → "Completed replacement") — pairs need not be the same house, and must never claim to be if they aren't. When crews deliver true same-angle pairs (SOP below), swap them in.
4. `/gallery` page: grid of job photos (lazy, LQIP), grouped by service. The old site's `/gallery` 404s and is already redirected — un-redirect it in `public/_redirects` when this page ships.
5. **Field SOP (outside repo, tell John):** crews shoot 3 photos per job — wide "before" from the street before tear-off, mid-job, same-angle "after." 5 jobs = the slider is fully real.

## 4. New pages (each is one markdown file or one .astro page)

1. `/insurance-claims` — claim-help hub. Process steps (inspection → documentation → adjuster meeting → build), what adjusters look for (use the chalk-mark photos), impact-resistant shingle discounts (Steve Erickson review), storm-deadline urgency. Reviews: Betty D #2143811 · Tami Fason #2143808 · Aaron Wessel #2143814. FAQPage schema. This is the top AEO priority page ("will insurance pay for my roof in Arkansas").
2. `/colors` — shingle & metal color explorer using real completed-roof photos from the manifest (beats Keith's swatches + Homestar's color page). No manufacturer swatch images unless licensed.
3. `/espanol` — one Spanish-language service overview page (human-quality Spanish, 6–8th grade equivalent), "Hablamos Español" text link in header/footer. `hreflang` pair with home. Unique in this market.
4. `/jobs/` collection — 4–6 "job story" mini case studies with photos, built from review narratives: EF2 tornado response (HSV), June 2023 hail lake house + boat dock, pre-closing replacement that saved a home sale (Jun 2026), 23-squares-in-one-day. Quote the matching review inside each story. `Article` schema.
5. Restore the 4 redirected legacy blog topics as real posts when convenient (TPO guide, storm-damage guide, gutters, maintenance) — flagged in `_redirects` comments as ranking opportunities; each removes one redirect.

## 5. "The Speedy Standard" block

New component, rendered on every service page under the hero and once on home:
> **Quote in 24 hours · Most roofs done in 1 day · Spotless cleanup — guaranteed**
Each line footnoted with a matching verbatim review snippet (Deanna Layne — same-day quote; Jamie Brock — 23 squares in a day; Randy Rowland/Monica Toby — cleanup). These are review-backed observations, not contractual warranties — word as "backed by 152 Google reviews," and get John's sign-off on the exact guarantee language before launch. `check-claims.js`: allow this specific block; keep blocking "beat any price"-type claims.

## 6. FAQ depth (AEO)

Competitor FAQ ceiling is 10 generic questions (Final Touch). Target 25+ Arkansas-specific Q&As across pages (each page's FAQPage schema already wires up):
hail season timing (Mar–Jun), insurance claim deadlines in AR, Garland County permits, metal vs shingle in AR heat/humidity, impact-resistant shingle insurance discounts, POA approval in HSV, storm-chaser warning signs, financing, how fast can you start, do you tarp same-day. Distribute 3–5 per service/area page; deepest set on `/insurance-claims`.

## 7. Honesty assets (optional but high-trust)

- `/reviews` page line (verified true, Jul 2026): every sub-5-star review concerns a missed estimate appointment — none concern completed work. Suggested copy: "Read every review, including the imperfect ones. You won't find a single complaint about the quality of a finished roof."
- **Ops fix for John (outside repo):** the only reputation leak is estimate no-shows (all 4 negative reviews). Same-day confirmation text + shared estimate calendar closes it.

## 8. Order of work

1. §1 BBB (15 min, unblocks trust bar)
2. §2 reviews data + rendering (the moment full texts are supplied)
3. §3 imagery manifest + inline placements + BeforeAfter
4. §5 Speedy Standard, §6 FAQs (copy work)
5. §4 new pages (insurance-claims first, then jobs, colors, espanol)
6. Gates + LHCI after each; Rich Results Test on one changed template at the end.
