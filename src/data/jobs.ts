/**
 * Job stories (supplement §4.4) — the single source for /jobs and for the
 * "jobs from around here" block on city pages.
 *
 * Each story is anchored to a REAL, verbatim 5-star Google review, looked up by
 * gbpId from reviews.ts, so quotes cannot drift and the review gate governs them.
 *
 * HONESTY: `where` is where the job actually happened. A city page may show a
 * story from another town only under a heading that says so (see AreaJobs.astro).
 * Never relabel a story to a different city. Photos are representative of the
 * WORK TYPE, captioned by what they show — never "this customer's home."
 */
export type JobStory = {
  id: string;
  headline: string;
  where: string;
  body: string[];
  gbpId: number;
  photo: string;
  photoCap: string;
};

export const jobStories: JobStory[] = [
  {
    id: 'ef2-tornado-hsv',
    headline: 'On the job in 24 hours after an EF2 tornado',
    where: 'Hot Springs Village',
    body: [
      'An EF2 tornado tore through Hot Springs Village and left a family with a torn-up roof and an open home. That is a homeowner’s worst day.',
      'Our crew was on the job within 24 hours — covering the roof, replacing it, and working with the inspectors to bring everything back up to code. Fast, because a damaged roof does not wait for the weather.',
    ],
    gbpId: 2143835,
    photo: 'storm-damaged-roof',
    photoCap: 'Storm-torn shingles and exposed decking — the kind of damage we move fast to cover and replace.',
  },
  {
    id: 'lake-house-hail-2023',
    headline: 'A lake house, boat dock, and gutters after the June 2023 hail',
    where: 'Lake area, Hot Springs',
    body: [
      'The June 2023 hail storm hammered the lake. One homeowner needed the whole property put back together — the lake house roof, the boat dock, and the gutters.',
      'They researched roofers across Hot Springs and Little Rock before calling us, and we handled all three. One crew, one company, start to finish.',
    ],
    gbpId: 2143822,
    photo: 'metal-roof-lakefront',
    photoCap: 'A lakefront metal roof by our crew — the kind of lake-area work we take on.',
  },
  {
    id: 'pre-closing-replacement',
    headline: 'A whole new roof in time to close on a home sale',
    where: 'Hot Springs',
    body: [
      'A family sold their home in May with a June closing date. Then the buyer’s inspection turned up major roof damage — the kind of surprise that can sink a sale.',
      'They picked us for a full roof replacement. Our crew started early, worked to the deadline, and finished ahead of time with 10 days to spare before closing.',
    ],
    gbpId: 19151851,
    photo: 'reroof-in-progress-tyvek',
    photoCap: 'A full re-roof in progress on a Hot Springs home.',
  },
  {
    id: '23-squares-one-day',
    headline: '23 squares torn off and re-roofed in a single day',
    where: 'Hot Springs',
    body: [
      'Some roofs really do go on in a day. This homeowner called on a Friday. The crew started the next morning at 7:15 and finished at 4:15 — a full 23-square roof, tear-off to clean-up, in one day.',
      'Big or cut-up roofs take longer, and we always tell you which yours is up front. But when it can be a one-day job, it is.',
    ],
    gbpId: 16801167,
    photo: 'roof-rebuild-crew',
    photoCap: 'Our crew at work on a Hot Springs roof.',
  },
];

export const jobById = (id: string): JobStory => {
  const story = jobStories.find((s) => s.id === id);
  if (!story) throw new Error(`jobs.ts: no job story with id "${id}"`);
  return story;
};
