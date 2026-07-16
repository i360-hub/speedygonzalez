# Review before launch

Nothing here blocks the build. Every item is a claim that goes public under the
client's name, or a step that has to happen outside this repo. Work top to bottom.

---

## 1. Blockers — the site is wrong until these are done

### 1.1 The lead form goes nowhere

`src/pages/contact.astro` posts to `https://formspree.io/f/FORM_ENDPOINT` — a
placeholder. **Every lead submitted right now is lost.** Replace with the
client's real endpoint, or swap in a Cloudflare Pages Function. Then submit the
form on the preview deploy and confirm the lead actually arrives.

If you change the form host, update `form-action` in `public/_headers` (the CSP
currently allows `formspree.io` only).

### 1.2 Price ranges are estimates, not the client's numbers

These are published as fact across the site and are **not client-supplied** — I
wrote them from general Arkansas market rates. The client must confirm or correct
each one:

| Claim | Where |
| --- | --- |
| Shingle roof **$8,500–$18,000** | `services/shingle-roofing.md`, home, financing, `blog/roof-replacement-cost-arkansas.md` |
| Metal roof **$14,000–$32,000** | `services/metal-roofing.md`, home, financing, blog posts |
| TPO, gutters, siding ranges | respective `src/content/services/*.md` |

They're consistent everywhere by design — change one, grep for the others.

### 1.3 The 4.9 / 157 review count is unverified

`src/data/business.ts` has `rating.verified = false`, which **suppresses the
AggregateRating JSON-LD on purpose**. Publishing a rating that doesn't match
reality is a rich-results violation and can cost the rich snippet entirely.

Check the live Google Business Profile, set `rating.value`/`rating.count` to the
real numbers, then flip `verified: true`. The schema gate already enforces that
reviews render on-page wherever AggregateRating appears.

The `4.9` figure shown in body copy is *not* gated by that flag — correct it in
`business.ts` and it updates everywhere.

### 1.4 NAP + hours against Google Business Profile

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

## 4. Decisions made — reverse if you disagree

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
