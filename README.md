# Speedy Gonzalez Roofing

Static site for [speedygonzalezroofing.com](https://www.speedygonzalezroofing.com).
Astro → Git → Cloudflare Pages. Built to the spec in the companion build doc.

**Before going live, work through [REVIEW-BEFORE-LAUNCH.md](./REVIEW-BEFORE-LAUNCH.md).**
The lead form currently posts to a placeholder endpoint.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at localhost:4321 |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Serve the built site |
| `npm run gates` | Readability + schema + HTML + link gates (needs a build first) |
| `npx lhci autorun` | Lighthouse CI against the §0 thresholds |
| `node scripts/build-images.mjs` | Rebuild hero art from the photo library |

## How content works

Pages are markdown in `src/content/`, validated by zod in `src/content.config.ts`.
The schemas enforce the 60-char title / 155-char description limits at build time.

- `src/content/services/*.md` → `/services/<slug>`
- `src/content/areas/*.md` → `/service-areas/<slug>`
- `src/content/blog/*.md` → `/blog/<slug>`

Adding a service or city page means adding one markdown file. It automatically
appears in the hub, the footer, the sitemap, and the 404 page, and gets its own
`Service`/`RoofingContractor` + `FAQPage` + `BreadcrumbList` JSON-LD.

**Every business fact lives in `src/data/business.ts`.** NAP, phones, licenses,
hours, and rating are read from there by both the copy and the JSON-LD, so they
can't drift apart. Never hardcode a phone number or address in a template.

## Writing rules

These aren't style preferences — CI enforces them.

- One `<h1>` per page, from frontmatter. Body copy starts at `##`.
- Every `##` is a question a homeowner asks. The first 1–2 sentences under it
  answer that question in 40–60 words, self-contained, so an AI answer engine can
  lift the block whole.
- Flesch-Kincaid grade ≤ 8, reading ease ≥ 60. Short sentences, one idea each.
- At least one table of scannable facts per page.
- Cross-link the silos: service pages link to city pages and back.

## The gates

`npm run gates` runs against built HTML in `dist/`:

| Script | Enforces |
| --- | --- |
| `readability.js` | FK grade ≤ 8, ease ≥ 60 |
| `validate-schema.js` | JSON-LD parses, required props, `@id`s resolve, no AggregateRating without on-page reviews |
| `validate-html.js` | Single H1, title ≤ 60, description ≤ 155, canonical, `alt` + `width`/`height` on every image |
| `linkcheck.js` | No internal 404s; **all 84 legacy URLs resolve to 200/301**; every redirect target exists |
| `check-claims.js` | **No prices** (unapproved), no financing (offered none), no guarantee/warranty language, no unprovable certification/BBB claims |
| `check-nap.js` | Address + hours byte-match GBP on every page; no stale NAP, no non-canonical Albert Pike number |
| `check-reviews.js` | Every published review is **5-star** and traceable to a real GBP review id |
| `check-overflow.js` | No page scrolls horizontally at 375px (real headless Chrome) |

The legacy URL list is `scripts/lib/legacy-urls.js` — reconcile it against Search
Console before launch (see REVIEW-BEFORE-LAUNCH.md §3.2).

## Performance

Zero JS on content pages except a ~15-line mobile nav toggle. Self-hosted Inter
(one 48 KB woff2, preloaded). Heroes are pre-built AVIF/WebP/JPEG at 1600w/900w
by `scripts/build-images.mjs` and preloaded via responsive `imagesrcset`.

Measured on mobile, throttled, median of 3, on an idle machine:

| | Perf | SEO | A11y | BP | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 100 | 1.66s | 0.000 |
| Service | 100 | 100 | 100 | 100 | 1.58s | 0.000 |
| City | 100 | 100 | 100 | 100 | 1.65s | 0.000 |
| Blog | 100 | 100 | 100 | 100 | 1.58s | 0.000 |
| Contact | 100 | 100 | 100 | 79* | 1.28s | 0.016 |

\* `/contact` embeds the client's GoHighLevel form, whose origin sets a Cloudflare
cookie that Lighthouse counts against best-practices. Nothing on our side sets it
and it can't be turned off. `/contact` therefore has its own pinned thresholds in
`lighthouserc.json` — see [lighthouse-notes.md](./lighthouse-notes.md).

**Measure on an idle machine.** These runs use simulated throttling, so a busy CPU
tanks the numbers — a loaded laptop produced LCP 11s and perf 25 on the same
build that scores 100 idle. If you see a wild regression, check `uptime` first.

## Deploy

Host is a Cloudflare **Pages** project (`speedy-gonzalez-roofing`), output `dist`.

**The Pages project is NOT git-connected** (`Git Provider: No`). A raw `git push`
does not build or deploy anything on Cloudflare's side. Deploys happen one of two
ways, both a direct upload of `dist/`:

1. **Automatic (normal path):** push to `main` → GitHub Actions (`ci.yml`) runs
   build + gates + Lighthouse, then — only if all pass — runs
   `wrangler pages deploy dist --project-name=speedy-gonzalez-roofing --branch=main`.
   A red gate never ships. PRs run the gates but never deploy. This needs the
   `CLOUDFLARE_API_TOKEN` repo secret (Account → Cloudflare Pages → Edit).
2. **Manual fallback:** `npm run build && npx wrangler pages deploy dist --project-name=speedy-gonzalez-roofing --branch=main`
   from an authed machine. Use if CI is down or the token is missing.

`public/_redirects` and `public/_headers` ship as-is. **Host canonicalization
(http→https, non-www→www) must be a Cloudflare Redirect Rule** — `_redirects`
can't match on hostname.
