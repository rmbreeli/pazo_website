/**
 * SITE COPY — headlines and section text.
 *
 * Change wording here; components only handle layout. Keep it honest:
 * no unsupported claims about awards, rankings or certifications.
 */

export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'sound', label: 'The Sound' },
  { id: 'reviews-media', label: 'Reviews + Media' },
  { id: 'packages', label: 'Packages' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof navigation)[number]['id'];

export const heroCopy = {
  eyebrow: 'Professional DJ Entertainment',
  /** Each array item renders on its own line on larger screens. */
  headline: ['Music that', 'moves people.'],
  supporting:
    'Professional DJ entertainment based in Northwest Arkansas, bringing carefully curated music, unforgettable energy, and an experience built around every event.',
  primaryCta: 'Explore Packages',
  secondaryCta: 'Book DJ PAZO',
  highlights: ['Weddings', 'Private Events', 'Nightlife'],
} as const;

export const soundCopy = {
  index: '01',
  label: 'The Pazo Sound',
  headline: 'Every event deserves its own soundtrack.',
  intro: [
    'DJ PAZO is about creating experiences through music. Every event has its own personality, audience, atmosphere, and energy, so no two sets are ever the same.',
    'Instead of recycling a playlist, every private event gets its own set, curated around the occasion and the people in the room. The goal is simple: a night where everyone feels connected to the music and completely immersed in the moment.',
  ],
  pillars: [
    {
      title: 'Curated, never recycled',
      body: 'Every event tells a different story. Music is selected for your occasion, your crowd, and the atmosphere you want, never pulled from a one-size-fits-all playlist.',
    },
    {
      title: 'Read the room',
      body: 'Knowing what to play, and when, matters as much as the music itself. The energy of the crowd guides every transition through the night.',
    },
    {
      title: 'Details matter',
      body: 'Preparation, equipment, timing and seamless transitions. The details guests never notice are what make the night feel effortless.',
    },
    {
      title: 'More than a playlist',
      body: 'Not just showing up and pressing play. The goal is moments people remember long after the last song ends.',
    },
  ],
  servicesHeadline: 'Built for every kind of celebration.',
  servicesIntro:
    'From first dances to last call, sets are shaped around the event, whether it is an intimate gathering or a packed venue.',
  genresLabel: 'On the decks',
} as const;

export const reviewsCopy = {
  index: '02',
  label: 'Reviews + Media',
  headline: 'Heard on the dance floor.',
  reviewsLabel: 'Client testimonials',
  galleryLabel: 'In the booth',
  galleryHeadline: 'See the experience.',
  listenLabel: 'Beyond the booth',
  listenHeadline: 'Original music & mixes.',
  listenIntro:
    'Away from events, PAZO produces original tracks and records mixes. Here is a taste of the sound.',
} as const;

export const pricingCopy = {
  index: '03',
  label: 'Prices + Packaging',
  headline: 'Transparent pricing. Thoughtful service.',
  intro:
    'Clear starting points for every kind of event. Each one includes the same preparation and care, whatever the size of the celebration.',
} as const;

export const contactCopy = {
  index: '04',
  label: 'Contact Me',
  headline: "Let's make something memorable.",
  intro:
    "Tell me a little about your event, the atmosphere you're envisioning, and what you're looking for. Let's create an experience worth remembering.",
  submitLabel: 'Send Inquiry',
  successTitle: 'Inquiry received.',
  successBody:
    'Thank you. Your details are on their way and you can expect a reply within 24–48 hours.',
  errorBody:
    'Your inquiry could not be sent. Please try again, or reach out directly by email or phone.',
} as const;

export const closingCopy = {
  headline: 'Your night. Your sound.',
  cta: 'Start Your Inquiry',
} as const;
