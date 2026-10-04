/**
 * Post-build step: a link to a blog post that is not published yet renders as
 * plain text instead of a link.
 *
 * Why: posts are scheduled by pubDate (src/lib/posts.ts), and an unpublished
 * post has no page. A live post or service page that links ahead to a scheduled
 * post would ship a 404 link until that date. This rewrites the built HTML:
 *
 *   - A paragraph that is a single sentence and whose blog links ALL point to
 *     scheduled posts is removed whole. Write a forward reference that way
 *     ("Our guide on X covers Y.") and it simply does not exist until X is live.
 *   - Any other link to a scheduled post keeps its text and loses the <a>.
 *
 * Everything turns itself on in the first build on or after the target's
 * pubDate (CI rebuilds daily).
 *
 * It runs on dist/, after `astro build`, so it does not depend on which
 * Markdown processor Astro uses and it also covers links written in .astro files.
 *
 * A link to a post that has no source file at all is left alone, so the link
 * gate (scripts/linkcheck.js) still catches it as a real broken link.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const BLOG_SRC = join(process.cwd(), 'src/content/blog');
const LINK = /<a\b[^>]*\bhref="\/blog\/([^"/#?]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });

const PARAGRAPH = /<p\b[^>]*>([\s\S]*?)<\/p>\s*/g;
const ANY_BLOG_LINK = /<a\b[^>]*\bhref="\/blog\/([^"/#?]+)[^"]*"/g;

/** A slug that has a source file but no built page: scheduled, not live yet. */
const isScheduled = (slug) =>
  !existsSync(join(DIST, 'blog', `${slug}.html`)) && existsSync(join(BLOG_SRC, `${slug}.md`));

const sentenceCount = (html) =>
  (html.replace(/<[^>]+>/g, '').trim().match(/[.!?](?=\s|$)/g) ?? []).length;

let unlinked = 0;
let dropped = 0;
const targets = new Set();

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');

  // 1. One-sentence paragraphs that only point at scheduled posts: remove.
  let out = html.replace(PARAGRAPH, (whole, inner) => {
    const slugs = [...inner.matchAll(ANY_BLOG_LINK)].map((m) => m[1]);
    if (!slugs.length || !slugs.every(isScheduled) || sentenceCount(inner) !== 1) return whole;
    dropped++;
    slugs.forEach((s) => targets.add(s));
    return '';
  });

  // 2. Any remaining link to a scheduled post: keep the text, drop the <a>.
  out = out.replace(LINK, (whole, slug, text) => {
    if (!isScheduled(slug)) return whole;
    unlinked++;
    targets.add(slug);
    return text;
  });

  if (out !== html) writeFileSync(file, out);
}

console.log(
  unlinked || dropped
    ? `unlink-unpublished: ${dropped} forward-reference paragraph(s) removed, ${unlinked} link(s) rendered as text. Scheduled targets: ${[...targets].join(', ')}`
    : 'unlink-unpublished: no links to scheduled posts.'
);
