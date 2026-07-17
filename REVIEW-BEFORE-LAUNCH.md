# Review before launch

Nothing here blocks the build. Every item is a claim that goes public under the
client's name, or a step that has to happen outside this repo. Work top to bottom.

---

## 1. Blockers — the site is wrong until these are done

### 1.1 Send one real test lead

The site embeds the client's **live GoHighLevel form** — the same one from the old
site (form id `OOpsQ604HEsoYDXv6444`, "Website Contact"), so leads land in the
existing CRM with no migration. Verified rendering and submitting locally.

**Still do this on the preview deploy:** submit one real test lead and confirm it
arrives in GHL, then delete it. A CSP or DNS difference between local and
production would break it silently, and a contact page that looks fine but drops
leads is the worst failure mode here.

If the embed ever goes blank, check `public/_headers` first — the CSP must keep
`api.leadconnectorhq.com` in `frame-src`/`connect-src` and `link.msgsndr.com` in
`script-src`.

### ~~1.2 The 4.9 / 157 review count is unverified~~ — RESOLVED 2026-07-16

Verified against the live Google Business Profile panel: **4.9 stars, 152 Google
reviews**. The build spec's 157 was stale. `src/data/business.ts` now carries
4.9 / 152 with `verified: true`, so the AggregateRating JSON-LD ships.

It ships on **`/` and `/reviews` only** — the two pages that render real review
text. Google requires the rating to be visible on the page carrying the markup,
and `validate-schema.js` fails the build if AggregateRating appears anywhere
without on-page reviews. To add it to another page, render real reviews there and
pass `showRating` to the layout.

The count drifts as reviews come in. A stale count is not a violation (Google
reconciles against GBP), but re-check `rating.count` at launch and whenever it
moves materially — it's stated in body copy on both pages, from the same
constant.

### 1.3 NAP + hours against Google Business Profile

Spec §1 says verify before go-live; I couldn't. Confirm byte-for-byte in
`src/data/business.ts`, especially **hours (Mon–Sun 7:00 AM – 8:00 PM)** — that's
an unusual 7-day schedule and it's stated on every page and in schema.

---

## 2. Facts I could not verify

Two local landmarks on city pages are best-guess and should be confirmed by
someone local:

- **Lake Coronado** — `src/content/areas/hot-springs-village.md`
- **Lake Saracen** — `src/content/areas/pine-bluff.md`

`src/content/areas/arkadelphia.md` references the **1997 tornado** by year, with
no casualty or damage figures. Pull the year if you'd rather it read generally.

`src/content/areas/hot-springs-village.md` describes the POA architectural
approval process. It's written in general terms and tells homeowners to confirm
current rules with the POA — but if the POA has changed its process, tighten it.

**Deliberately excluded** (asked for by the spec's competitor analysis, but
unverifiable): manufacturer certifications (CertainTeed SELECT, GAF, etc.), BBB
ratings, awards, founding year, employee names, warranty lengths. Add them only
with proof — they're exactly the claims that draw complaints.

Note: `426413272_...jpg` in the parent folder is a signage mockup reading
**"AR License# 123456"**. It's a placeholder, not the real license, so it's not
used anywhere on the site. Don't add it.

---

## 3. Outside this repo

### 3.1 Canonical host (required — spec §10)

`_redirects` **cannot match on hostname.** Create Cloudflare **Redirect Rules**
for `http→https` and `non-www→www` or only one host will be canonical. Without
this, `speedygonzalezroofing.com` and `www.` both resolve and split equity.

### 3.2 Reconcile the legacy URL list against Search Console

`scripts/lib/legacy-urls.js` holds the **84 URLs crawled from the live site**
(via `.firecrawl/speedy-map.json`), and the link gate proves all 84 resolve.

But a crawl only sees what's linked. **GSC knows about URLs that aren't.** Export
Coverage/Pages from Search Console, diff against that file, add anything missing,
re-run `npm run gates`. Do this *before* launch — the spec's zero-404 requirement
is only as complete as this list.

### 3.3 At launch

- Submit `https://www.speedygonzalezroofing.com/sitemap-index.xml` to GSC.
- Run each template through the **Rich Results Test** (the schema gate validates
  structure offline; it is not Google's parser).
- Request reindex of home, `/services`, `/service-areas`, and the top service pages.
- Re-baseline Core Web Vitals + rankings against pre-launch, then watch GSC
  coverage for 2–4 weeks.

### 3.4 Parallel track (spec §12 — not code)

Disavow the PBN/spam backlinks (`seol.store`, `*.sbs`, `goooogla.com`, etc.).
Consolidate typo domains (`speedygonzalesroofing.com`,
`speedygonzalezroofingar.com`) — 301 to canonical if owned, disavow if not.
Claim/verify GBP, Yelp, BBB with identical NAP. Stand up review-request
automation.

---

## 4. Pricing — removed, and how to put it back

**No price appears anywhere on the site.** Earlier drafts carried market-rate
estimates I wrote; those were never client-approved, so they're gone —
frontmatter, prose, tables, FAQs, and meta descriptions.

`scripts/check-claims.js` now **fails the build** on any dollar figure, worded
price ("a few hundred dollars", "ten grand", "$8.5k"), or per-square-foot rate.
It also blocks unprovable trust claims: manufacturer certifications, BBB
references, and "beat any price" promises.

The cost **pages and headings stayed** — "How much does a metal roof cost in Hot
Springs?" is a real query and `/roof-replacement-cost-hot-springs-ar` 301s to the
cost post. They now answer with what drives the price (size, pitch, shape,
decking) and route to the free estimate. That's a defensible answer, and it's the
one the client actually gives on the phone.

**To publish real prices once the client approves them:**

1. Add `priceRange: "$X–$Y for a typical Hot Springs home"` to the relevant
   `src/content/services/*.md`. The field is still in the zod schema (optional)
   and the templates still render it — service sidebar, homepage cards, services
   hub. Nothing else to wire up.
2. Relax the price rules in `scripts/check-claims.js`, or the build will reject
   them. Keep the trust-claim rules.
3. Keep numbers consistent across the service page, homepage FAQ, financing page,
   and the two cost blog posts.

Note: `priceRange: '$$'` in `business.ts`/`schema.ts` is the schema.org
price-tier indicator for LocalBusiness markup, not an estimate. Leave it.

## 5. Decisions made — reverse if you disagree

**44 town pages were not rebuilt.** The old site had 51 `/service-areas/*` pages;
8 have real local content here, and the other 44 (Alexander, Altheimer, Amity,
Bauxite, Bismarck…) 301 to the `/service-areas` hub via a splat rule. Spec §2
was explicit: *"a city page must have genuinely local content or it doesn't ship…
Start with the 8 above, not 80."* Promote towns to real pages as real content
justifies it. If you want a specific town back, add `src/content/areas/<slug>.md`
— the splat only catches what has no page.

**Four old blog posts redirect to service pages, not new posts.** No successor
existed for the TPO guide, storm-damage guide, gutters post, and maintenance
guide, so they point at the closest-intent service page. Rewriting them as posts
later is a ranking opportunity — see the comments in `public/_redirects`.

**Reading level runs below the spec's target band.** Spec §8 asks for FK grade
6–8; pages land ~4–7. The enforceable CI rule in §11 is a *ceiling* ("fail if
grade > 8") and reading ease ≥ 60 — both pass, and the gate reports the shortfall
as a warning. Simpler copy is the right call for a homeowner reading this on a
phone with a leak. Raise `TARGET_MIN_GRADE` handling in `scripts/readability.js`
if you disagree.

**Content collections use the modern loader API.** Spec §4's snippet used
`type: 'content'`, removed in Astro 5 (this is Astro 7). Same schema, current API.
