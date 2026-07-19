/**
 * Source of truth for NAP + business facts (build spec §1).
 * Every page and every JSON-LD block reads from here so NAP stays byte-identical.
 * Verify against Google Business Profile before go-live.
 */

export const SITE_URL = 'https://www.speedygonzalezroofing.com';

export const business = {
  name: 'Speedy Gonzalez Roofing',
  legalNote: 'Also associated with Speedy Gonzalez Construction, Inc.',
  /**
   * Byte-identical to the Google Business Profile record (location 15761),
   * verified 2026-07-16: address_lines ["207 Albert Pike Rd"], Hot Springs,
   * AR 71913. NAP consistency with GBP is the whole point — do not "tidy" this
   * string. Google's own record is the spelling that counts.
   *
   * The build spec said "209 Albert Pike"; that came from the old Duda footer
   * and is stale. The business owns 207 AND 209, side by side: 207 opened first
   * as the office while 209 was rehabbed into a showroom, and the GBP was moved
   * to 207 years ago (away from a residence). The truck wrap and the building
   * signage both read 207 Albert Pike Rd, so 207 is what customers see and what
   * Google knows. 209 is the showroom — see `showroom` below.
   */
  address: {
    street: '207 Albert Pike Rd',
    city: 'Hot Springs',
    state: 'AR',
    zip: '71913',
    country: 'US',
  },
  /**
   * The showroom next door. Deliberately NOT part of the NAP and never emitted
   * in schema — a second address in structured data splits the local entity.
   * Mention it in prose only if the client wants it surfaced.
   */
  showroom: {
    street: '209 Albert Pike Rd',
    note: 'Showroom next door to the office',
  },
  phones: {
    primary: '501-359-5550',
    office: '501-701-8766',
  },
  email: 'speedygonzalezz19@gmail.com',
  /**
   * Open 24 hours, 7 days — confirmed by the owner 2026-07-16 and matching the
   * GBP record (all days 00:00-24). The build spec said 7:00 AM – 8:00 PM; that
   * was stale, and the old Duda site's "Contact 24/7" was the truer signal.
   *
   * `hoursSchema` uses the schema.org 00:00-23:59 convention for all-day, which
   * is how Google reads "open 24 hours" in openingHours.
   */
  // No leading "Open" — every consumer prefixes "Open "/"open " already, so this
  // is just the hours themselves (otherwise the footer reads "Open Open 24…").
  hours: '24 hours a day, 7 days a week',
  hoursShort: '24/7',
  hoursSchema: 'Mo-Su 00:00-23:59',
  licenses: {
    roofing: 'RR0540931024',
    homeImprovement: '0378510824',
  },
  experience: '20+ years',
  /**
   * NO FINANCING. Confirmed 2026-07-16: the business does not offer financing of
   * any kind. The build spec's proof_points listed "financing available" and it
   * was wrong — the claim shipped across 24 files before this was caught. A
   * homeowner reading it would call expecting a payment plan that does not
   * exist.
   *
   * Most jobs are insurance claims; that is the real answer to "how do I pay for
   * this", and it lives on /insurance-claims.
   *
   * check-claims.js fails the build on financing language. If they later sign up
   * a third-party lender, relax that rule and add the proof point back — with
   * the lender named.
   */
  proofPoints: [
    '500+ projects completed',
    '20 trained professionals',
    'BBB A+ Rated',
    'Free inspections and estimates',
    'Insurance claim support',
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
  'Amity',
  'Glenwood',
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
    // State licenses as machine-readable identifiers (not just body text).
    identifier: [
      {
        '@type': 'PropertyValue',
        name: 'Arkansas Roofing License',
        value: business.licenses.roofing,
      },
      {
        '@type': 'PropertyValue',
        name: 'Arkansas Home Improvement License',
        value: business.licenses.homeImprovement,
      },
    ],
    // sameAs disambiguates the entity in Google's Knowledge Graph. The BBB
    // profile is filed under "Speedy Gonzalez Construction, Inc." — the same
    // real business (see legalNote) — so it belongs here alongside the socials.
    sameAs: [business.social.facebook, business.social.instagram, bbb.profileUrl],
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
