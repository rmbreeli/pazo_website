/**
 * TESTIMONIALS — real client reviews only.
 *
 * All four testimonials below were migrated word-for-word from the previous
 * djpazo.com site. Never invent or paraphrase reviews.
 *
 * To add one: copy an entry, paste the client's exact words, and fill in
 * their name. `context` and `source` are optional — only fill them in if
 * they are accurate (e.g. source: 'Google' only if it came from Google).
 * Set `featured: true` on the one review to show large at the top.
 */

export interface Testimonial {
  quote: string;
  name: string;
  /** Organization or affiliation, if provided by the client */
  affiliation?: string;
  /** Short description of the event, e.g. "Wedding" */
  context?: string;
  /** Platform the review came from. Leave undefined if unknown. */
  source?: string;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'DJ Pazo absolutely killed it at our wedding. The energy was incredible and the dance floor stayed moving all night. Highly recommend!',
    name: 'Wendy Echeverria',
    context: 'Wendy & Troy · Wedding',
    featured: true,
  },
  {
    quote:
      'Professional, punctual, and pure talent. He knows exactly how to read the room and keep the vibe perfect for our events!',
    name: 'Carlos Zamora',
  },
  {
    quote:
      "We've had countless DJs perform at our parties, but DJ Pazo stands out. His technical skills and stage presence are unmatched.",
    name: 'Jalal Altal',
    affiliation: 'GDF',
  },
  {
    quote: 'The DJ Khaled of our time!',
    name: 'Isaac Montgomery',
  },
];

/** How many supporting (non-featured) reviews show before "More reviews". */
export const visibleSupportingReviews = 3;

/** "GDF · Wedding · via Google": only the parts that exist. */
export const attributionFor = (t: Testimonial): string =>
  [t.affiliation, t.context, t.source && `via ${t.source}`].filter(Boolean).join(' · ');
