/** Slug ⇄ city-name helpers shared by service and area templates. */

export const CITY_NAMES: Record<string, string> = {
  'hot-springs': 'Hot Springs',
  'hot-springs-village': 'Hot Springs Village',
  benton: 'Benton',
  bryant: 'Bryant',
  malvern: 'Malvern',
  arkadelphia: 'Arkadelphia',
  'pine-bluff': 'Pine Bluff',
  'mount-ida': 'Mount Ida',
};

export const slugToCity = (slug: string) =>
  CITY_NAMES[slug] ??
  slug
    .split('-')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');

export const SERVICE_NAMES: Record<string, string> = {
  'shingle-roofing': 'Shingle roofing',
  'metal-roofing': 'Metal roofing',
  'tpo-flat-roofing': 'TPO & flat roofing',
  'roof-repair': 'Roof repair',
  'roof-leak-repair': 'Roof leak repair',
  'storm-damage-repair': 'Storm damage repair',
  'hail-damage-repair': 'Hail damage repair',
  gutters: 'Gutter installation & repair',
  siding: 'Siding',
};

export const slugToService = (slug: string) => SERVICE_NAMES[slug] ?? slug;
