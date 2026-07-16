import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Build spec §4. The spec's snippet used the legacy `type: 'content'` API,
 * which Astro removed in v5; this is the same schema on the current loader API.
 */

const faq = z.object({ q: z.string(), a: z.string() });

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    h1: z.string(),
    summary: z.string(),
    priceRange: z.string().optional(),
    faqs: z.array(faq).min(3),
    relatedAreas: z.array(z.string()),
    heroImage: z.string(),
    order: z.number().default(0),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    city: z.string(),
    metaTitle: z.string().max(60),
    metaDescription: z.string().max(155),
    h1: z.string(),
    localIntro: z.string(),
    landmarks: z.array(z.string()).optional(),
    servicesOffered: z.array(z.string()),
    faqs: z.array(faq).min(3),
    heroImage: z.string(),
    order: z.number().default(0),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string().max(60),
    description: z.string().max(155),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Speedy Gonzalez Roofing'),
    heroImage: z.string(),
    tags: z.array(z.string()),
    faqs: z.array(faq).optional(),
  }),
});

export const collections = { services, areas, blog };
