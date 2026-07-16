import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.speedygonzalezroofing.com',
  output: 'static',
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto', format: 'file' },
  image: { formats: ['avif', 'webp'] },
  integrations: [sitemap({ changefreq: 'weekly', priority: 0.7 })],
});
