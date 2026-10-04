import { getCollection } from 'astro:content';

/**
 * Published blog posts, newest first.
 *
 * A post is published when it is not a draft and its pubDate has arrived.
 * Future-dated posts stay in the repo but get no page, no sitemap entry, no
 * RSS item, and no link from a service page until the first build on or after
 * their date. CI rebuilds daily (see .github/workflows/ci.yml), so a scheduled
 * post goes live on its date without anyone pushing.
 *
 * Every place that lists or links posts must use this, never getCollection('blog')
 * directly. scripts/unlink-unpublished.mjs (run after the build) turns any link
 * to a not-yet-published post into plain text.
 *
 * Preview switches (build-time environment variables, never set in a deploy):
 *   PUBLISH_AS_OF=2027-04-01  build the site as it will look on that date
 *   INCLUDE_DRAFTS=1          also build posts marked draft: true
 * `npm run gates:scheduled` uses both so every scheduled post passes the
 * content gates today, not on the morning it is due to publish.
 */
export async function getPublishedPosts() {
  const asOf = process.env.PUBLISH_AS_OF;
  const now = asOf ? new Date(asOf) : new Date();
  const includeDrafts = process.env.INCLUDE_DRAFTS === '1';
  const posts = await getCollection(
    'blog',
    ({ data }) => (includeDrafts || !data.draft) && data.pubDate <= now
  );
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
