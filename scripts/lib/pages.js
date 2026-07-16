/** Shared helpers for the CI gate scripts. Operates on the built dist/ HTML. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const DIST = 'dist';

/** Every built .html file, as { file, url, html }. */
export function pages() {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.html')) {
        const rel = relative(DIST, full);
        const url = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '');
        out.push({ file: full, url: url === '/' ? '/' : url.replace(/\/$/, ''), html: readFileSync(full, 'utf8') });
      }
    }
  };
  walk(DIST);
  return out;
}

/** Strips scripts, styles, and tags to get human-readable body text. */
export function textOf(html) {
  const body = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const syllables = (word) => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  return (word.match(/[aeiouy]{1,2}/g) || []).length || 1;
}

/** Flesch-Kincaid grade level + Flesch reading ease (spec §8). */
export function readability(text) {
  const sentences = text.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim().split(/\s+/).length > 2);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (!sentences.length || !words.length) return null;

  const syl = words.reduce((n, w) => n + syllables(w), 0);
  const wps = words.length / sentences.length;
  const spw = syl / words.length;

  return {
    grade: 0.39 * wps + 11.8 * spw - 15.59,
    ease: 206.835 - 1.015 * wps - 84.6 * spw,
    words: words.length,
    sentences: sentences.length,
    wordsPerSentence: wps,
  };
}

export const ok = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
export const fail = (msg) => console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
export const warn = (msg) => console.log(`  \x1b[33m!\x1b[0m ${msg}`);
