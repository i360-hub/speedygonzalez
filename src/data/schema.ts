/**
 * JSON-LD builders (build spec §6). Every node @id-references the site-wide
 * RoofingContractor rather than restating NAP, so facts can never drift.
 */
import { SITE_URL, business } from './business';

const BUSINESS_ID = `${SITE_URL}/#business`;

export type Faq = { q: string; a: string };

export const faqSchema = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
});

export const breadcrumbSchema = (trail: { href: string; label: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ href: '/', label: 'Home' }, ...trail].map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.label,
    item: new URL(item.href, SITE_URL).href,
  })),
});

export const serviceSchema = (opts: {
  name: string;
  description: string;
  path: string;
  areas: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${new URL(opts.path, SITE_URL).href}#service`,
  name: opts.name,
  description: opts.description,
  serviceType: opts.name,
  url: new URL(opts.path, SITE_URL).href,
  provider: { '@id': BUSINESS_ID },
  areaServed: opts.areas.map((name) => ({ '@type': 'City', name })),
});

/** City page: the business scoped to one city. Distinct @id, no NAP restatement. */
export const localAreaSchema = (opts: {
  city: string;
  path: string;
  description: string;
  services: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'RoofingContractor',
  '@id': `${new URL(opts.path, SITE_URL).href}#business`,
  parentOrganization: { '@id': BUSINESS_ID },
  name: `${business.name} — ${opts.city}, AR`,
  description: opts.description,
  url: new URL(opts.path, SITE_URL).href,
  telephone: `+1-${business.phones.primary}`,
  image: `${SITE_URL}/og.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: business.address.country,
  },
  areaServed: { '@type': 'City', name: `${opts.city}, Arkansas` },
  openingHours: business.hoursSchema,
  priceRange: '$$',
  makesOffer: opts.services.map((name) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name },
  })),
});

export const articleSchema = (opts: {
  title: string;
  description: string;
  path: string;
  image: string;
  published: Date;
  modified?: Date;
  author: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: opts.title,
  description: opts.description,
  image: new URL(opts.image, SITE_URL).href,
  datePublished: opts.published.toISOString(),
  dateModified: (opts.modified ?? opts.published).toISOString(),
  author: { '@type': 'Organization', name: opts.author, '@id': BUSINESS_ID },
  publisher: { '@id': BUSINESS_ID },
  mainEntityOfPage: { '@type': 'WebPage', '@id': new URL(opts.path, SITE_URL).href },
});
