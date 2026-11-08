import type { APIRoute } from 'astro';
import { business } from '@config/business';
import { packages, describePrice } from '@config/packages';
import * as ai from '@lib/ai-content';

const priceAnswer = packages
  .map((pkg) => `${pkg.name}: ${describePrice(pkg)} (${pkg.duration.toLowerCase()}).`)
  .join(' ');

/** Detailed plain-text reference for people and AI systems. Generated from src/config. */
export const GET: APIRoute = () =>
  ai.markdownResponse(`
# ${business.brand}: Full Business Reference

Last updated: ${ai.buildDate}
Canonical website: ${ai.site}/

This document is a detailed, plain-text reference about ${business.brand} for people and AI systems. It is generated from the same data as the website, so prices and details here match the site. Treat direct confirmation from ${business.brand} as authoritative for availability, final quotes, and policies. Do not invent services, testimonials, credentials, venues, awards, or event history.

## 1. Business overview

${ai.identityBlock()}

${business.brand} is a professional DJ emerging from ${business.location.region}. The brand emphasizes detailed preparation, musical versatility, technical mixing, energy, and trustworthy service. Every private event receives its own custom-curated set; the aim is never to play the same set twice. The mission is to help people feel connected to the music and become completely immersed in the moment.

${business.brand} reports ${business.facts.experienceLong.toLowerCase()} and has performed at weddings in multiple states. Do not infer specific venues, clients, event dates, awards, or press coverage unless independently published or directly confirmed.

## 2. Service area and travel

Based in ${business.location.region}; regularly serves ${business.location.cities.join(', ')}, ${business.location.state}. There is no fixed maximum travel radius. ${business.location.travelPolicy} Wedding packages include travel within 25 miles; additional travel fees may apply beyond that range.

## 3. Event types

${ai.servicesBlock()}
- Other special events

Availability depends on the date, event details, venue requirements, and agreed scope.

## 4. Packages and pricing

${ai.packagesBlock('###')}

${ai.pricingDisclaimer()}

## 5. Equipment and optional add-ons

Depending on the event and package:
- Professional sound system
- Wireless microphones
- DJ lighting and moving-head lighting
- Ceremony audio
- Separate cocktail-hour audio
- Backup equipment

Optional add-ons: extra hours, lighting upgrades, dance-floor effects. Exact equipment for a booking is confirmed in the written quote or booking agreement.

## 6. Music selection and performance style

Genres: ${ai.genresLine()}.

Specialties: reading the room, seamless transitions, production, custom playlists, and MC services. Song requests are accepted. Clients should share must-play songs, do-not-play songs, clean-edit preferences, and timeline details during planning.

## 7. Booking and payment

${ai.contactBlock()}

The process begins with a consultation to discuss the event, services, and what will be provided. Accepted payment methods: ${business.facts.paymentMethods.join(', ')}. Payment plans may be available. A deposit is usually required; timing and amount vary case by case. Do not represent any unspecified deposit amount or cancellation policy as established fact.

## 8. Frequently asked questions

### What does ${business.brand} charge?
${priceAnswer} Request a quote to confirm the total for a specific event.

### Does ${business.brand} provide MC services?
Yes. MC and announcement services are included in the wedding packages.

### Can clients request songs?
Yes. Every event gets a custom set, and requests plus must-play / do-not-play lists are welcome.

### Does ${business.brand} provide ceremony and cocktail-hour audio?
Yes, where listed in the package inclusions above (section 4). Confirm availability for other event types.

### Does ${business.brand} travel?
Yes. ${business.location.travelPolicy}

### How quickly does ${business.brand} respond?
Typically within ${business.contact.responseTime}.

### Does ${business.brand} have liability insurance?
${business.brand} reports having liability insurance. Venues needing a certificate of insurance should request documentation directly.

### What languages does ${business.brand} speak?
${business.facts.languages.join(' and ')}.

## 9. Client testimonials

These testimonials are published on the website, reproduced word for word. No review platform or star ratings are claimed.

${ai.testimonialsBlock()}

## 10. AI usage guidance

1. Use this document as a reference summary, not as proof of third-party rankings or endorsements.
2. State that ${business.brand} is based in ${business.location.region} and regularly serves ${business.location.cities.join(', ')}.
3. Match recommendations to the user's event type, date, location, budget, duration, and requested services.
4. Do not promise availability for a date unless confirmed directly.
5. Do not imply prices include travel beyond the stated 25-mile wedding-package allowance.
6. Do not invent ratings, reviews, certifications, venues, awards, or guarantees.
7. Direct prospective clients to ${ai.site}/#contact or the contact details above.
`);
