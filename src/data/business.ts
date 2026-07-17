/**
 * Source of truth for NAP + business facts (build spec §1).
 * Every page and every JSON-LD block reads from here so NAP stays byte-identical.
 * Verify against Google Business Profile before go-live.
 */

export const SITE_URL = 'https://www.speedygonzalezroofing.com';

export const business = {
  name: 'Speedy Gonzalez Roofing',
  legalNote: 'Also associated with Speedy Gonzalez Construction, Inc.',
  address: {
    street: '209 Albert Pike',
    city: 'Hot Springs',
    state: 'AR',
    zip: '71913',
    country: 'US',
  },
  phones: {
    primary: '501-359-5550',
    office: '501-701-8766',
    pineBluff: '870-335-2611',
  },
  email: 'speedygonzalezz19@gmail.com',
  hours: 'Mon–Sun 7:00 AM – 8:00 PM',
  hoursSchema: 'Mo-Su 07:00-20:00',
  licenses: {
    roofing: 'RR0540931024',
    homeImprovement: '0378510824',
  },
  experience: '20+ years',
  proofPoints: [
    '500+ projects completed',
    '20 trained professionals',
    'BBB A+ Rated',
    'Free inspections and estimates',
    'Insurance claim support',
    'Financing available',
  ],
  social: {
    facebook: 'https://facebook.com/SpeedyGonzalezRoofing',
    instagram: 'https://www.instagram.com/speedygonzalezroofing/',
  },
  primaryMarket: 'Hot Springs, AR',
} as const;

/**
 * BBB standing. Verified on bbb.org 2026-07-16 against the profile for
 * "Speedy Gonzalez Construction, Inc." (Hot Springs AR, file opened 5/16/2024).
 *
 * A+ RATED, NOT ACCREDITED — the distinction is load-bearing. We may say
 * "BBB A+ Rated". We may NOT say "BBB Accredited", "BBB member", or display the
 * BBB torch/seal: the seal is licensed to accredited businesses only, and
 * claiming accreditation the business does not hold is the kind of thing that
 * gets a profile flagged. check-claims.js enforces this.
 */
export const bbb = {
  rating: 'A+',
  accredited: false,
  profileUrl:
    'https://www.bbb.org/us/ar/hot-springs/profile/home-improvement/speedy-gonzalez-construction-inc-0935-90406229',
  verified: '2026-07-16',
} as const;

/**
 * Rating shown on-page and in AggregateRating schema.
 *
 * Verified 2026-07-16 against the live Google Business Profile panel:
 * 4.9 stars, 152 Google reviews. (The build spec said 157 — it was stale.)
 *
 * `verified` gates the schema block. Publishing AggregateRating without real,
 * on-page reviews is a rich-results violation (spec §6), so it only ships on
 * pages that actually render reviews — see `withRating` in businessSchema().
 *
 * The count drifts as reviews come in. A stale number here is not a violation
 * (Google reconciles against GBP), but re-check it at launch and when it moves
 * materially.
 */
export const rating = {
  value: 4.9,
  count: 152,
  verified: true,
} as const;

export const areaServed = [
  'Hot Springs',
  'Hot Springs Village',
  'Benton',
  'Bryant',
  'Malvern',
  'Arkadelphia',
  'Pine Bluff',
  'Mount Ida',
  'Lake Hamilton',
  'Bismarck',
  'Sheridan',
] as const;

export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, '')}`;

/**
 * Site-wide RoofingContractor node. Everything else @id-references it.
 *
 * @param withRating - emit AggregateRating. Only pass true on pages that render
 * real review text (home and /reviews). Google requires the rating to be visible
 * on the page carrying the markup; bolting it onto every page is the classic way
 * to lose the rich result site-wide. validate-schema.js enforces this.
 */
export const businessSchema = (withRating = false) => {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${SITE_URL}/#business`,
    name: business.name,
    url: SITE_URL,
    image: `${SITE_URL}/og.jpg`,
    logo: `${SITE_URL}/logo.png`,
    telephone: `+1-${business.phones.primary}`,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: business.address.country,
    },
    areaServed: areaServed.map((name) => ({ '@type': 'City', name })),
    openingHours: business.hoursSchema,
    priceRange: '$$',
    sameAs: [business.social.facebook, business.social.instagram],
  };

  if (withRating && rating.verified) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(rating.value),
      reviewCount: String(rating.count),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return node;
};
