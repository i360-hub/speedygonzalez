/**
 * Real Google reviews, pulled verbatim from the connected Google Business
 * Profile (location 15761) on 2026-07-16 via the GBP API.
 *
 * ── RULES. Read before touching this file. ────────────────────────────────────
 *
 * 1. GENUINE ONLY. Every entry must correspond to a real review with a real
 *    `gbpId`. Never write a review. Never paraphrase one. Never soften one.
 *    These are real people's words about a real business.
 *
 * 2. VERBATIM. Quote exactly as posted, typos and all ("Antiono", "reccommend",
 *    lowercase names). Trimming is allowed ONLY at a natural clause or sentence
 *    boundary, marked with an ellipsis. Never trim mid-sentence, and never trim
 *    in a way that changes the meaning.
 *
 * 3. DATES ARE NOT WHAT THEY LOOK LIKE. The API's `created_at` is the platform's
 *    import stamp, not the Google review date — the whole 2143xxx block reads
 *    2025-01-28 while carrying owner replies from 2024-02. A reply cannot
 *    predate its review. So `date` is set ONLY where `created_at` is
 *    corroborated by a matching reply date; otherwise it is omitted. Do not
 *    backfill dates from `created_at` — that invents a date on a real quote.
 *
 * 4. NO Review JSON-LD. Self-serving review markup no longer earns stars and
 *    risks the rich result. AggregateRating stays on home + /reviews only.
 *    (validate-schema.js enforces this.)
 *
 * To add: pull the review via gbp_get_review, copy `comment` exactly, record the
 * id, and only add a date if the reply date corroborates it.
 */

export type Review = {
  /** Google Business Profile review id — proof this review is real. */
  gbpId: number;
  name: string;
  rating: 5;
  text: string;
  source: 'Google';
  /** Month/year. Only present where the platform date is corroborated. */
  date?: string;
  location?: string;
};

/** Reviews keyed by the page slug they were hand-matched to (supplement §2.4). */
export const reviewsByPage: Record<string, Review[]> = {
  home: [
    {
      gbpId: 19151851,
      name: 'Rush Fentress',
      rating: 5,
      date: 'June 2026',
      text: 'We sold our home in May with a June closing date. When the home inspection revealed major roof damage, we chose Speedy Gonzales for a whole roof replacement. Antonio and the office staff provided quick and considerate customer service along with a fair price. The roofing team was equally professional and considerate, arriving early in the day to get started. The project was completed ahead of time, as promised, with 10 days to spare on closing. I highly recommend Speedy Gonzales for all of your Hot Springs area roofing needs.',
      source: 'Google',
    },
    {
      gbpId: 2143827,
      name: 'Joanne Erickson',
      rating: 5,
      text: 'Saw good reviews for Speedy Gonzalez online and so had the owner, Antonio Gonzalez, give me an estimate for roofing my home, which needed replaced immediately. He came the same day and was able to get to my roof the next day. The crew was great, the work looks great, and the clean-up was just amazing. Very professional, respectful, best price, and did exactly what we agreed on. I could not be any happier. Thank you Antonio.',
      source: 'Google',
    },
    {
      gbpId: 4916741,
      name: 'Jeffrey Erwin',
      rating: 5,
      date: 'May 2025',
      location: 'Hot Springs, AR',
      text: "Our recommendation would be to look no further for a roofing company. These guys are reasonably priced, very professional and unbelievably fast. I would say this company is the finest roofing company in our area. I would highly recommend this fine company for your roofing or construction needs. They have earned and will keep our business. We are now looking at using them for new gutters. I cannot recommend them enough, they were fantastic.",
      source: 'Google',
    },
  ],

  'shingle-roofing': [
    {
      gbpId: 16801167,
      name: 'Jamie Brock',
      rating: 5,
      date: 'March 2026',
      text: "I have never had such a wonderful experience. I called on a Friday and they started the next day at 7:15 and finished at 4:15. That's 23 square in a day. I highly recommend them for whatever you need done.",
      source: 'Google',
    },
    {
      gbpId: 17258347,
      name: 'Deanna Layne',
      rating: 5,
      date: 'April 2026',
      text: 'They live up to the name - Speedy! Antonio was great to work with. Gave me a same day quote and started the strip and reroof the next day. Great work done with care at a fair price. I highly recommend Speedy Gonzalez.',
      source: 'Google',
    },
    {
      gbpId: 2143805,
      name: 'Frank Wagner',
      rating: 5,
      text: 'Speedy Gonzalez roofing company Did an amazing job on our home.. They had my homes new roof on In a day and a half. From tearing off the old shingles and replacing the new.. Out of 1 to 5 stars. I give them a 5 Highly recommend',
      source: 'Google',
    },
  ],

  'metal-roofing': [
    {
      gbpId: 2143818,
      name: 'Karen Heil',
      rating: 5,
      text: 'Speedy Gonzalez put a metal roof on my house due to the hail storm we had in May. They did a wonderful job. Once the materials came in they were here, got my roof done quickly. I would highly recommend them . Very nice group of people.',
      source: 'Google',
    },
    {
      gbpId: 5929479,
      name: 'Ross hardy',
      rating: 5,
      date: 'July 2025',
      text: 'Speedy Gonzalez Roofing has put on a new roof for me and completed a difficult repair on a metal roof. I have found them honest, fast, fair priced and they do excellent work. I highly recommend them.',
      source: 'Google',
    },
    {
      gbpId: 2143858,
      name: 'K Miller',
      rating: 5,
      text: 'Did a great job on our metal roof replacement and will call again. Very responsive and professional.',
      source: 'Google',
    },
  ],

  'roof-repair': [
    {
      gbpId: 2143905,
      name: 'greg carman',
      rating: 5,
      text: 'Antonio came when he said he would. Didn’t try to up charge for repair just explained issue and fixed it. I would highly recommend for jobs big or small.',
      source: 'Google',
    },
    {
      gbpId: 2143904,
      name: 'Lon Kidd',
      rating: 5,
      text: 'Could not get a call back from others. Antonio was here within hour, took care of my roof the next day. It rained in between and he made sure to protect it before hand. The job, him and his people are pros. They are now on my go to list and I’m very happy for it! Thank you Tony!',
      source: 'Google',
    },
    {
      gbpId: 2143903,
      name: 'Qwertz Werks',
      rating: 5,
      text: 'Quick inspection and repair for reasonable price, HIGHLY RECOMMENDED',
      source: 'Google',
    },
  ],

  'roof-leak-repair': [
    {
      gbpId: 2938337,
      name: 'Nicole',
      rating: 5,
      date: 'March 2025',
      text: "I had a wonderful experience with Speedy Gonzalez Roofing. A few weeks ago, a roof leak woke me just one day before wintery weather was expected. I called them, and they responded promptly. Antonio came out immediately to assess the damage, and within three hours, his team had the roof repaired. He assured me he'd return if there were any issues during the storm. Since then, the roof has been leak-free. Antonio and his crew were not only professional and kind but also took the time to explain everything in detail. I'm really impressed with their service and would highly recommend them!",
      source: 'Google',
    },
    {
      gbpId: 2143816,
      name: 'Bonita kent',
      rating: 5,
      text: 'I had a roof leak that damaged some ceiling & wall. SGR came out immediately and helped identify more damage that we were able to work thru with my insurance to cover. SGR replaced the entire roof with new shingles, new gutters and repaired and painted the damaged wall & ceiling. They did a good job with all 3 projects. I really liked that they were able to complete all the repairs without having to use other contractors. I would use them again if needed.',
      source: 'Google',
    },
    {
      gbpId: 2143923,
      name: 'Living the Dream 4:20',
      rating: 5,
      text: 'Had a small emergency, some damaged shingles and a leaking roof. They came out and repaired my roof in a very timely and professional manner. Plan to use them to replace roof in the near future.. I would recommend Speedy Gonzalez Roofing for all roofing needs.',
      source: 'Google',
    },
  ],

  'storm-damage-repair': [
    {
      gbpId: 2143835,
      name: 'Leslie Carey',
      rating: 5,
      text: 'Truth in the name- speedy! Antonio many thanks for restoring our roof ASAP after suffering from EF2 tornado that hit Hot Springs Village. Speedy Gonzalez got his crew on the job in 24hrs and was able to prevent, replace and restore our home FAST and with high quality. Worked with inspectors to make sure everything was up to code. And at a very fair price! You were my angel and hero sent during a homeowners worst nightmare. I will ALWAYS call you first and highly recommend your services. A very grateful and loyal customer!',
      source: 'Google',
    },
    {
      gbpId: 2143844,
      name: 'darrell tigue',
      rating: 5,
      text: 'Had roof damage from the bad storm a few weeks back when I called Speedy Gonzalez Roofing they came out the same day and took photos and covered up the damaged area then came back and replaced the roof and did an excellent job. They were very professional and did an outstanding job',
      source: 'Google',
    },
    {
      gbpId: 2143859,
      name: 'Debra Dilbeck',
      rating: 5,
      text: 'New roof from storm damage on house, carport and boat dock. Crew was always on time and clean up was great! Very professional and came back any time requested for touch ups. Would highly recommend Speedy and his crew. They are the best!',
      source: 'Google',
    },
  ],

  'hail-damage-repair': [
    {
      gbpId: 2143847,
      name: 'Steve Erickson',
      rating: 5,
      text: 'Antonio and his crews did great work on all my properties (4) after the hail storm. He worked with me to upgrade to impact resistant shingles which saved 15% on insurance.',
      source: 'Google',
    },
    {
      gbpId: 2143875,
      name: 'Chad Smith',
      rating: 5,
      text: 'Called for an estimate after massive hail storm. Antonio came out quickly, we signed the contract, shingles showed up next day and roof was completed the following. The workmanship looks great, the clean up was outstanding. It was like nothing had taken place but a nice new roof. Highly reccommend, professional company.',
      source: 'Google',
    },
    {
      gbpId: 2143865,
      name: 'Sue Smith',
      rating: 5,
      text: 'We needed a new roof and porch awning because of hail damage. Antonio came out the same day and we sealed the deal. The following week his crew came out and the new roof was on that day. Nice crew, good work and excellent clean up. The following week they installed a new awning. Because of the way the porch is built the awning leaked a little in the first rain. Texted Antonio a short video of the problem and he came out within the hour to check it out. Two days later a crew came out and redid the entire thing with all new materials and a slightly different design. It is beautiful and no leaks. Great work and excellent customer service. Would recommend them to anyone.',
      source: 'Google',
    },
  ],

  gutters: [
    {
      gbpId: 5290550,
      name: 'Jeff Erwin',
      rating: 5,
      date: 'June 2025',
      text: 'So these guys did such a great job with our roof, we got them to bid and install our gutters with covers. Once again, they did a fantastic job. I’m telling yall don’t look no further, this is a very impressive company that is staffed by artisans and provide shelter wherever they go.',
      source: 'Google',
    },
    {
      gbpId: 2143826,
      name: 'Lashea Coleman',
      rating: 5,
      text: 'Antiono and his crew did an amazing job on our roof and gutters! I was really impressed with everything they did. Fast service, he even allowed them to come and work on Saturday. I was so nervous with this being my first time having to replace a roof/gutters, but he worked with me to ensure this was an easy-going process. Please take the time to get your free estimate today!!',
      source: 'Google',
    },
    {
      gbpId: 2143821,
      name: 'Douglas Morehead',
      rating: 5,
      text: "black metal board and batten siding, black gutters, covered pool deck. Brandon and the guys were extremely professional, fast, and used high quality materials. They were always open to my input and communicated with me throughout the entire process. I'll be calling them again for my next project!",
      source: 'Google',
    },
  ],

  siding: [
    {
      gbpId: 2143879,
      name: 'David Miller',
      rating: 5,
      text: 'Antônio and his crew were Amazing! They removed and replaced all the siding on our home and installed new gable vents‘s, they paid attention to details and were a pleasure to work with. They completed the job in a rapid pace, and every day cleaned up their work area. I would highly recommend Antonio and his crew.',
      source: 'Google',
    },
    {
      gbpId: 19151852,
      name: 'Gina Barraclough',
      rating: 5,
      date: 'June 2026',
      text: 'So far we are very pleased and happy with this company…professional, very knowledgeable and hard working…its looking great…I’ll up date when all siding, roof and carport is done!',
      source: 'Google',
    },
    {
      gbpId: 2143888,
      name: 'Jackie Simineo',
      rating: 5,
      text: 'Metal siding, they did an excellent job!',
      source: 'Google',
    },
  ],

  'tpo-flat-roofing': [
    {
      gbpId: 2143930,
      name: 'Jerry Parnell',
      rating: 5,
      text: 'Excellent service with very quick response. They did an excellent job roofing two buildings for me. They got on the job right away and finished it very quickly. I would highly recommend this roofing service. Friendly and very accommodating!!',
      source: 'Google',
    },
    {
      gbpId: 2143897,
      name: 'Andrew Baka',
      rating: 5,
      text: 'Speedy and his crew installed my roof and wrapped my whole shop in metal. They took care of us. They handled any little details we missed or didn’t think of without any interruption. They worked and got it done “speedy” as well. Would definitely recommend.',
      source: 'Google',
    },
    {
      gbpId: 2143870,
      name: 'Tommy Caesar',
      rating: 5,
      text: 'Got a quote on Tuesday and job completed on Wednesday. Workers left job site cleaner than it was before they arrived. Beat every estimate I received.',
      source: 'Google',
    },
  ],

  'hot-springs-village': [
    {
      gbpId: 2143835,
      name: 'Leslie Carey',
      rating: 5,
      text: 'Truth in the name- speedy! Antonio many thanks for restoring our roof ASAP after suffering from EF2 tornado that hit Hot Springs Village. Speedy Gonzalez got his crew on the job in 24hrs and was able to prevent, replace and restore our home FAST and with high quality. Worked with inspectors to make sure everything was up to code. And at a very fair price! You were my angel and hero sent during a homeowners worst nightmare. I will ALWAYS call you first and highly recommend your services. A very grateful and loyal customer!',
      source: 'Google',
    },
    {
      /**
       * Trimmed at the sentence boundary. The full review continues "...because
       * all reviews were a 5 star and he has been in business for 30 years" —
       * the customer's own recollection, which contradicts the verified 20+
       * years in business.ts. Quoting it would publish a number we know to be
       * off, so the quote ends at the sentence before it. Nothing is softened;
       * the trimmed part is praise.
       */
      gbpId: 2143822,
      name: 'Hilltop Haven Hot Springs',
      rating: 5,
      text: 'Speedy did an excellent job replacing the roof on our lake house, boat dock, and gutters after the June 2023 hail storm…',
      source: 'Google',
    },
  ],

  'insurance-claims': [
    {
      gbpId: 2143811,
      name: 'Betty D',
      rating: 5,
      text: 'If you need a roofer that is more than insurance knowledgeable and will go beyond the norm for you this is the company. Eric was wonderful. We were denied by Allstate and Eric knocked on our door. The rest is history. He took care of everything. All I had to do was give him the rejection papers. Two days later I had a check for a new roof. Unbelievable. I did not know what I was going to do about my roof. I have never work with such a good company as this.',
      source: 'Google',
    },
    {
      gbpId: 2143814,
      name: 'Aaron Wessel',
      rating: 5,
      text: 'Our house had hail damage, and Brandon met with me and helped us walk through the process of getting a new roof for the house. He was very helpful and informative for when it came time to deal with the insurance company. The new roof and gutters look great, and were installed very quickly. Impressive work, couldn’t have asked for anything more. Don’t hesitate to give them a call.',
      source: 'Google',
    },
    {
      gbpId: 2143808,
      name: 'Tami Fason',
      rating: 5,
      text: 'Great bunch of guys, fixed everything back to brand new and the salesman Eric worked with insurance to ensure everything would be covered! You definitely can’t go wrong with this bunch!! Totally 5+ stars!!!',
      source: 'Google',
    },
  ],
};

/**
 * Footnotes for the Speedy Standard block (supplement §5). Each claim in that
 * block must point at a real review that substantiates it — the block is
 * "here is what customers report", not a warranty we are offering.
 */
export const standardProof = {
  quote: {
    gbpId: 17258347,
    name: 'Deanna Layne',
    snippet: 'Gave me a same day quote and started the strip and reroof the next day.',
  },
  speed: {
    gbpId: 16801167,
    name: 'Jamie Brock',
    snippet: "I called on a Friday and they started the next day at 7:15 and finished at 4:15. That's 23 square in a day.",
  },
  cleanup: {
    gbpId: 2143881,
    name: 'Monica Toby',
    snippet:
      'Antonio came and did a final inspection and had his crew come back and do a second sweep just to be sure all nails were picked up with out us asking.',
  },
} as const;

/**
 * The four sub-5-star reviews, for the /reviews honesty block (supplement §7).
 *
 * NOTE — the supplement's wording was wrong on two counts and is corrected here:
 *   1. It said "every sub-5-star review concerns a missed estimate appointment."
 *      There are FIVE sub-5-star reviews. The fifth is a 4★ from WILLIAM GEORGE
 *      reading "Excellent work and professionalism personified!" — sub-5-star,
 *      but praise, not a complaint. It is not listed here.
 *   2. William Nickels is not an estimate no-show; he says the job was agreed
 *      and then abandoned. Still pre-work, but not "an estimate appointment".
 *
 * What IS true, and what the page says: all four negative reviews concern
 * scheduling and follow-up BEFORE any work started. None concerns a finished
 * roof. Verified against all 152 reviews on 2026-07-16.
 */
export const criticalReviews: { gbpId: number; name: string; rating: number; text: string }[] = [
  {
    gbpId: 2143830,
    name: 'Whitney Hilton',
    rating: 1,
    text: 'Called and had an appointment made for an estimate, the owner Tony never showed up and said he forgot when I called. I appreciated the honesty so setup another time in which he came out. He gave me a quote and told me he’d be on vacation but would contact me about getting everything setup once back. Never heard from him. Reached out to him and several times he was supposed to come out and never showed. Not professional nor reliable.',
  },
  {
    gbpId: 2143832,
    name: 'Janet Bissell',
    rating: 1,
    text: "My experience with Speedy Gonzales was I called for a quote for my single wide mobile home (they were recommended by the guy who cut a tree for me). They came out to give an estimate and I called back twice when I didn't hear from them and have yet to hear or see anyone from this business since and that was around late October.",
  },
  {
    gbpId: 2143848,
    name: 'Don Everright',
    rating: 2,
    text: "Didn't even bother to show up. Lied to me twice.",
  },
  {
    gbpId: 2143857,
    name: 'William Nickels',
    rating: 2,
    text: 'Agreed to do job and then disappeared. Repeated failed attempts to reach via text and messages.',
  },
];

/** Wall on /reviews: every placed review, de-duplicated by gbpId. */
export const allReviews: Review[] = Object.values(reviewsByPage)
  .flat()
  .filter((review, i, arr) => arr.findIndex((r) => r.gbpId === review.gbpId) === i);

/** Back-compat for any import still expecting the old flat export. */
export const reviews = reviewsByPage.home;
