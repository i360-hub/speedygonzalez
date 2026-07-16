/**
 * Hero art is pre-built by scripts/build-images.mjs into AVIF/WebP/JPEG at
 * 1600w and 900w. Frontmatter stores the extension-less base path
 * (e.g. "/images/metal-roofing"); these helpers expand it.
 */

export const srcset = (base: string, ext: 'avif' | 'webp' | 'jpg') =>
  `${base}-900.${ext} 900w, ${base}.${ext} 1600w`;

export const fallback = (base: string) => `${base}.jpg`;

/** Sized for a full-bleed hero. */
export const HERO_SIZES = '100vw';
