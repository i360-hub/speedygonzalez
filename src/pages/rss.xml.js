import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: 'Speedy Gonzalez Roofing — Roofing Blog',
    description:
      'Straight answers on roof costs, hail season, and repairs for Hot Springs, Arkansas homeowners.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
    })),
    customData: '<language>en-us</language>',
  });
}
