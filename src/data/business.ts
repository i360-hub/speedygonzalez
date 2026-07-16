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
 * Rating shown on-page and in AggregateRating schema.
 * `verified` gates the schema block: publishing AggregateRating without real,
 * on-page reviews is a rich-results violation (spec §6). Flip to true only
 * after confirming the live count against Google Business Profile.
 */
export const rating = {
  value: 4.9,
  count: 157,
  verified: false,
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

/** Site-wide RoofingContractor node. Everything else @id-references it. */
export const businessSchema = () => {
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

  if (rating.verified) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(rating.value),
      reviewCount: String(rating.count),
    };
  }

  return node;
};
