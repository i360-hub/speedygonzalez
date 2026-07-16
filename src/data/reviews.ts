/**
 * Real reviews carried over from the live site (speedygonzalezroofing.com).
 * Do not add anything here that isn't a genuine, verifiable review — the
 * AggregateRating in business.ts is only valid if real reviews show on-page.
 */

export type Review = {
  name: string;
  location?: string;
  rating: 5;
  text: string;
  source: string;
};

export const reviews: Review[] = [
  {
    name: 'Jeffrey Erwin',
    location: 'Hot Springs, AR',
    rating: 5,
    text: "Our recommendation would be to look no further for a roofing company. These guys are reasonably priced, very professional and unbelievably fast. I would say this company is the finest roofing company in our area. I would highly recommend this fine company for your roofing or construction needs. They have earned and will keep our business. We are now looking at using them for new gutters. I cannot recommend them enough, they were fantastic.",
    source: 'Google',
  },
  {
    name: 'Nicole',
    rating: 5,
    text: "I had a wonderful experience with Speedy Gonzalez Roofing. A few weeks ago, a roof leak woke me just one day before wintery weather was expected. I called them, and they responded promptly. Antonio came out immediately to assess the damage, and within three hours, his team had the roof repaired. He assured me he'd return if there were any issues during the storm. Since then, the roof has been leak-free. Antonio and his crew were not only professional and kind but also took the time to explain everything in detail. I'm really impressed with their service and would highly recommend them!",
    source: 'Google',
  },
  {
    name: 'Ashley Joy',
    rating: 5,
    text: 'Brandon and his guys went above and beyond! We had a deadline to get the new roof on and not only did they get it done, but this crew worked in the dark and in the rain to meet the deadline. I was quoted over twice as much elsewhere! Nobody else could match or beat their price. The new roof looks so amazing, its noticeable from a distance.',
    source: 'Google',
  },
];
