/**
 * Readability gate — build spec §8.
 *
 * The spec's CI rule is a ceiling: "fail if grade > 8". It also states a target
 * band of grade 6-8. This site's copy is deliberately written simpler than the
 * band's floor (roofing customers in a hurry, often on a phone, often mid-leak),
 * so the floor is reported as a warning, not a failure. Reading ease >= 60 is
 * the spec's other stated target and is enforced as a floor.
 */
import { pages, textOf, readability, ok, fail, warn } from './lib/pages.js';

const MAX_GRADE = 8; // hard ceiling per spec §11
const MIN_EASE = 60; // spec §8
const TARGET_MIN_GRADE = 6; // spec §8 target band floor — advisory only

let failed = 0;
const rows = [];

for (const page of pages()) {
  const text = textOf(page.html);
  const r = readability(text);
  if (!r || r.words < 120) continue; // nav-only pages like /404 aren't body copy

  rows.push({ url: page.url, ...r });

  if (r.grade > MAX_GRADE) {
    fail(`${page.url} — grade ${r.grade.toFixed(1)} exceeds ${MAX_GRADE}`);
    failed++;
  } else if (r.ease < MIN_EASE) {
    fail(`${page.url} — reading ease ${r.ease.toFixed(0)} below ${MIN_EASE}`);
    failed++;
  }
}

rows.sort((a, b) => b.grade - a.grade);

console.log('\nReadability (Flesch-Kincaid grade / reading ease / avg words per sentence)\n');
for (const r of rows.slice(0, 8)) {
  console.log(
    `  ${r.url.padEnd(42)} grade ${r.grade.toFixed(1).padStart(4)}  ease ${r.ease
      .toFixed(0)
      .padStart(3)}  ${r.wordsPerSentence.toFixed(1)} w/sent`
  );
}
console.log(`  ... ${rows.length} pages checked\n`);

const below = rows.filter((r) => r.grade < TARGET_MIN_GRADE).length;
if (below) {
  warn(
    `${below} page(s) below the spec's grade-${TARGET_MIN_GRADE} target floor. Not a failure — simpler copy is intentional here.`
  );
}

if (failed) {
  fail(`Readability gate failed on ${failed} page(s).`);
  process.exit(1);
}

ok(`Readability gate passed — every page at or under grade ${MAX_GRADE}, ease >= ${MIN_EASE}.`);
