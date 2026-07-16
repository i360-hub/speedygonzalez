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

console.log('done');
