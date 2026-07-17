/**
 * Pre-builds hero art from the client's photo library into public/images.
 * These live in public/ (not src/assets) because content-collection frontmatter
 * stores hero paths as plain strings, so astro:assets can't process them.
 * Each hero emits AVIF + WebP + JPEG at 1600w and 900w; Hero.astro picks via <picture>.
 *
 * Run manually after adding photos:  node scripts/build-images.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = '/Users/admin/Documents/Websites/SpeedyGonzalez';
const OUT = './public/images';
mkdirSync(OUT, { recursive: true });

/** [source file, output basename, crop gravity] */
const heroes = [
  ['315007268_825543838752894_1363591010502945079_n.jpg', 'hot-springs-roofing-hero', 'north'],
  ['286385864_787873899288418_3665387937227585004_n.jpg', 'shingle-roofing', 'centre'],
  ['418834973_1140770950563513_6598900865051243617_n.jpg', 'metal-roofing', 'centre'],
  ['91856680_225167662225714_5327004394850353152_n.jpg', 'storm-damage', 'centre'],
  ['315032150_825543828752895_7214751172069961744_n.jpg', 'roof-repair', 'centre'],
  ['419440401_1140770987230176_2038978181543240103_n.jpg', 'metal-roof-home', 'centre'],
  ['hail damage/358645875_1015483163092293_6520329698732062486_n.jpg', 'hail-damage', 'centre'],
  ['hail damage/354075334_995396945100915_8230297471038908778_n.jpg', 'hail-inspection', 'centre'],
  ['hail damage/359430832_1015482026425740_2794852448700541750_n.jpg', 'roof-inspection', 'centre'],
  // PUBLIC-DOMAIN stock (Wikimedia "FinishedEPDMcoveredRoof.jpg") — the ONLY
  // non-client photo on the site. Speedy has no real TPO/flat-membrane photo;
  // owner approved a public-domain image for this one hero. See
  // ../public-domain-img/CREDITS.md. Replace when a real job photo exists.
  ['public-domain-img/tpo-flat-roof.jpg', 'tpo-flat-roof', 'centre'],
];

// Heroes sit under a heavy dark scrim, so aggressive quality still looks clean.
const WIDTHS = [1600, 900];

for (const [src, name, position] of heroes) {
  for (const w of WIDTHS) {
    const suffix = w === 1600 ? '' : `-${w}`;
    const base = sharp(`${SRC}/${src}`).resize(w, Math.round((w / 16) * 9), {
      fit: 'cover',
      position,
    });
    await base.clone().avif({ quality: 45, effort: 6 }).toFile(`${OUT}/${name}${suffix}.avif`);
    await base.clone().webp({ quality: 68, effort: 6 }).toFile(`${OUT}/${name}${suffix}.webp`);
    await base
      .clone()
      .jpeg({ quality: 70, mozjpeg: true, progressive: true })
      .toFile(`${OUT}/${name}${suffix}.jpg`);
  }
  console.log('hero', name);
}

await sharp(`${SRC}/Speedy-Gonzales-Logo.png`)
  .resize({ height: 96 })
  .png({ compressionLevel: 9, palette: true })
  .toFile('./public/logo.png');

await sharp(`${SRC}/SPEEDY-GONZALEZ-ROOFING-wh.png`)
  .resize({ height: 108 })
  .png({ compressionLevel: 9, palette: true })
  .toFile('./public/logo-white.png');

await sharp(`${SRC}/315007268_825543838752894_1363591010502945079_n.jpg`)
  .resize(1200, 630, { fit: 'cover', position: 'north' })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile('./public/og.jpg');

await sharp(`${SRC}/Speedy-Gonzales-Logo.png`)
  .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile('./public/apple-touch-icon.png');

// --- Inline photos (supplement §3) ------------------------------------------
// Mid-page and gallery photos from scripts/photo-manifest.json, emitted at 800w
// and 500w so they never rival the hero for bytes. Landscape framing (4:3) keeps
// them honest — no aggressive crop that hides context.
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('./scripts/photo-manifest.json', 'utf8'));
const INLINE_OUT = './public/images/inline';
mkdirSync(INLINE_OUT, { recursive: true });

const INLINE_WIDTHS = [800, 500];

for (const photo of manifest.photos) {
  for (const w of INLINE_WIDTHS) {
    const suffix = w === 800 ? '' : `-${w}`;
    const base = sharp(`${SRC}/${photo.src}`).resize(w, Math.round((w / 4) * 3), {
      fit: 'cover',
      position: 'entropy',
    });
    await base.clone().avif({ quality: 50, effort: 5 }).toFile(`${INLINE_OUT}/${photo.name}${suffix}.avif`);
    await base.clone().webp({ quality: 72, effort: 5 }).toFile(`${INLINE_OUT}/${photo.name}${suffix}.webp`);
    await base
      .clone()
      .jpeg({ quality: 74, mozjpeg: true, progressive: true })
      .toFile(`${INLINE_OUT}/${photo.name}${suffix}.jpg`);
  }
  console.log('inline', photo.name);
}

// --- Before/after pairs (supplement §3.3) -----------------------------------
// Both images in a pair are cropped to the SAME box (position 'centre', same
// dims) so the reveal slider lines up. Emitted into public/images/beforeafter/.
const ba = JSON.parse(readFileSync('./src/data/before-after.json', 'utf8'));
const BA_OUT = './public/images/beforeafter';
mkdirSync(BA_OUT, { recursive: true });

const baImage = async (src, outName) => {
  for (const w of [1000, 640]) {
    const suffix = w === 1000 ? '' : `-${w}`;
    const base = sharp(`${SRC}/${src}`).resize(w, Math.round((w / 4) * 3), {
      fit: 'cover',
      position: 'centre',
    });
    await base.clone().avif({ quality: 52, effort: 5 }).toFile(`${BA_OUT}/${outName}${suffix}.avif`);
    await base.clone().webp({ quality: 74, effort: 5 }).toFile(`${BA_OUT}/${outName}${suffix}.webp`);
    await base
      .clone()
      .jpeg({ quality: 76, mozjpeg: true, progressive: true })
      .toFile(`${BA_OUT}/${outName}${suffix}.jpg`);
  }
};

for (const pair of ba.pairs) {
  await baImage(pair.beforeSrc, `${pair.id}-before`);
  await baImage(pair.afterSrc, `${pair.id}-after`);
  console.log('before/after', pair.id);
}

console.log('done');
