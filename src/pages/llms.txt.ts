import type { APIRoute } from 'astro';
import { business } from '@config/business';
import * as ai from '@lib/ai-content';

/** Concise AI-oriented overview, following the llms.txt convention. Generated from src/config. */
export const GET: APIRoute = () =>
  ai.markdownResponse(`
# ${business.brand}

> ${business.shortDescription} Every event receives its own custom-curated set.

Last updated: ${ai.buildDate}

## Business identity

${ai.identityBlock()}

## Services

${business.brand} provides DJ and MC services for:

${ai.servicesBlock()}

Equipment can include a professional sound system, wireless microphones, DJ and moving-head lighting, ceremony audio, separate cocktail-hour audio, and backup equipment, depending on the event and package. Optional add-ons include extra hours, lighting upgrades, and dance-floor effects.

## Music and approach

Genres: ${ai.genresLine()}.

${business.brand} does not recycle playlists: music is curated around each event, its guests, and its atmosphere. Emphasis on reading the room, seamless transitions, technical mixing, MC services, and preparation. Song requests and must-play / do-not-play lists are welcome.

## Published pricing

${ai.packagesSummary()}

Full package inclusions: ${ai.site}/llms-full.txt

${ai.pricingDisclaimer()}

## Booking

${ai.contactBlock()}

Booking begins with a consultation. Accepted payment methods: ${business.facts.paymentMethods.join(', ')}. Deposit requirements vary by event; confirm terms during booking.

## Website sections

${ai.sectionsBlock()}

## Optional

- [Full business reference](${ai.site}/llms-full.txt): packages, FAQs, policies
- [Agent guidance](${ai.site}/agents.md)
`);
