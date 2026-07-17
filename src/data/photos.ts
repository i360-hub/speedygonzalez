import manifest from '../../scripts/photo-manifest.json';

export type Photo = { src: string; name: string; alt: string };

export const photos: Photo[] = manifest.photos;

export const photoByName = (name: string) => photos.find((p) => p.name === name);

/** srcset/fallback helpers for inline photos (public/images/inline/<name>). */
export const inlineSrc = (name: string, ext: 'avif' | 'webp' | 'jpg', w?: number) =>
  `/images/inline/${name}${w ? `-${w}` : ''}.${ext}`;

export const inlineSet = (name: string, ext: 'avif' | 'webp' | 'jpg') =>
  `${inlineSrc(name, ext, 500)} 500w, ${inlineSrc(name, ext)} 800w`;
