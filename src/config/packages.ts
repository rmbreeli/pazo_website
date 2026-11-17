/**
 * PACKAGES & PRICING — single source of truth.
 *
 * EDITABLE CONTENT. Change names, prices, durations, descriptions,
 * inclusions, featured status and CTA text here. The pricing cards, the
 * "Package of interest" dropdown in the contact form, the structured data,
 * and /llms.txt + /llms-full.txt are all generated from this file.
 *
 * Inclusions were migrated from the existing published package details
 * (previous llms-full.txt). Private Events inclusions are initial
 * suggestions — confirm or edit them before launch.
 *
 * Do not add discounts, taxes, deposits, or guarantees here unless they are
 * real, confirmed business policies.
 */

export interface Price {
  /** Whole US dollars */
  amount: number;
  /** Optional unit, e.g. "hour" renders as "$100 / hour" */
  per?: string;
}

export interface Package {
  /** Stable id — used for anchors and form preselection. Don't change casually. */
  id: string;
  /** Small label above the name */
  category: string;
  name: string;
  /** Short name used in phrases like "Everything in Essential, plus" */
  shortName?: string;
  price: Price;
  /** Shown separately from the main price, e.g. a flat fee */
  additionalFee?: Price & { label: string };
  /** Human-readable coverage, e.g. "4 hours" */
  duration: string;
  description: string;
  /** If set, the list is introduced as "Everything in <that package>, plus:" */
  includesEverythingFrom?: string;
  inclusions: string[];
  /** Visually emphasized card (champagne accent) */
  featured?: boolean;
  featuredLabel?: string;
  ctaLabel: string;
}

export const packages: Package[] = [
  {
    id: 'private-events',
    category: 'Hourly',
    name: 'Private Events',
    price: { amount: 100, per: 'hour' },
    additionalFee: { amount: 150, label: 'flat fee' },
    duration: 'Typical events run 4–6 hours',
    description:
      'Professional DJ entertainment tailored to your event, with music curated around your guests, atmosphere, and vision. For private parties, birthdays, corporate events, and other special occasions.',
    // EDITABLE: initial suggestions — confirm before launch.
    inclusions: [
      'Personalized music selection',
      'Professional DJ performance',
      'Sound system for the event',
      'Pre-event planning and coordination',
      'Setup and breakdown',
    ],
    ctaLabel: 'Inquire About This Package',
  },
  {
    id: 'essential-wedding',
    category: 'Weddings',
    name: 'Essential Wedding Reception',
    shortName: 'Essential',
    price: { amount: 995 },
    duration: '6 hours of reception coverage',
    description:
      'A polished DJ experience for couples looking for professional music, smooth transitions, and an unforgettable reception.',
    inclusions: [
      'DJ and MC / announcement services',
      'Professional reception sound system',
      'Microphone for speeches and toasts',
      'Dance-floor lighting with two party lights',
      'DJ booth facade',
      'Custom playlist planning and music requests',
      'Grand entrance, first dance and parent dance coordination',
      'Setup and breakdown',
      'Travel included within 25 miles',
    ],
    ctaLabel: 'Inquire About This Package',
  },
  {
    id: 'signature-wedding',
    category: 'Weddings',
    name: 'Signature Wedding Reception',
    price: { amount: 1495 },
    duration: 'Up to 10 hours of total coverage',
    description:
      'An elevated wedding experience with ceremony and cocktail-hour coverage, upgraded lighting, and more time to celebrate.',
    includesEverythingFrom: 'essential-wedding',
    inclusions: [
      'Wedding ceremony audio coverage',
      'Additional microphone for the officiant',
      'Cocktail-hour music',
      'Upgraded dance-floor lighting effects',
      'Dedicated pre-wedding planning consultation',
      'Timeline coordination with venue and vendors',
      'Early setup before guests arrive',
    ],
    featured: true,
    featuredLabel: 'The complete experience',
    ctaLabel: 'Inquire About This Package',
  },
];

/** Extra options shown in the form's "Package of interest" field. */
export const extraPackageOptions = [{ id: 'custom', label: 'Custom event / not sure yet' }] as const;

export const pricingNote =
  'Every event is different. Custom arrangements, add-ons like extra hours or lighting upgrades, and events outside these packages can be discussed through the contact form.';

export const formatDollars = (amount: number): string => `$${amount.toLocaleString('en-US')}`;

export const formatPrice = (price: Price): string =>
  `${formatDollars(price.amount)}${price.per ? ` / ${price.per}` : ''}`;

export const findPackage = (id: string): Package | undefined =>
  packages.find((pkg) => pkg.id === id);

/** One-line summary used by structured data and AI files. */
export const describePrice = (pkg: Package): string =>
  [formatPrice(pkg.price), pkg.additionalFee && `+ ${formatPrice(pkg.additionalFee)} ${pkg.additionalFee.label}`]
    .filter(Boolean)
    .join(' ');
