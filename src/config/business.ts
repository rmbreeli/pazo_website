/**
 * BUSINESS INFORMATION — single source of truth.
 *
 * Everything here feeds the page, the footer, the JSON-LD structured data,
 * and the generated AI files (/llms.txt, /llms-full.txt, /agents.md).
 * Edit a value once and it updates everywhere on the next build.
 *
 * Only put verifiable facts here. Do not add addresses, hours, awards or
 * ratings that cannot be backed up.
 */

export interface SocialLink {
  label: string;
  /** Visible handle, e.g. "@DJ_Pazo_official" */
  handle: string;
  url: string;
  icon: 'instagram' | 'soundcloud' | 'youtube';
}

export const business = {
  brand: 'DJ PAZO',
  wordmark: 'PAZO',
  legalName: 'Pazo Entertainment LLC',
  /** Canonical site URL (no trailing slash). Mirror in astro.config.mjs `site`. */
  website: 'https://www.djpazo.com',

  tagline: 'Professional DJ Entertainment',
  shortDescription:
    'DJ PAZO is a professional DJ and MC based in Northwest Arkansas, curating music and unforgettable experiences for weddings, private events, nightlife, and celebrations.',

  contact: {
    email: 'pazobeatzz@gmail.com',
    /** Human-friendly display format */
    phoneDisplay: '(479) 426-6076',
    /** E.164 format, used for tel: links and structured data */
    phoneE164: '+14794266076',
    /** Stated typical response window */
    responseTime: '24–48 hours',
  },

  location: {
    region: 'Northwest Arkansas',
    regionShort: 'NWA',
    state: 'Arkansas',
    stateCode: 'AR',
    country: 'US',
    cities: ['Bentonville', 'Rogers', 'Fayetteville', 'Springdale'],
    travelNote: 'Available for events throughout Arkansas and beyond.',
    travelPolicy:
      'Bookings outside Arkansas are welcome. Travel fees are assessed case by case, usually based on mileage.',
  },

  facts: {
    experience: '5+ years',
    experienceLong: 'More than five years of DJ experience',
    languages: ['English', 'Conversational Spanish'],
    paymentMethods: ['Venmo', 'Cash App', 'Zelle', 'Cash'],
    insured: true,
  },

  socials: [
    {
      label: 'Instagram',
      handle: '@DJ_Pazo_official',
      url: 'https://www.instagram.com/DJ_Pazo_official/',
      icon: 'instagram',
    },
    {
      label: 'SoundCloud',
      handle: 'dj-pazo',
      url: 'https://soundcloud.com/dj-pazo',
      icon: 'soundcloud',
    },
    {
      label: 'YouTube',
      handle: '@pazobeats',
      url: 'https://www.youtube.com/@pazobeats',
      icon: 'youtube',
    },
  ] satisfies SocialLink[],

  /** Event types DJ PAZO accepts. Used in The Pazo Sound, the form, and AI files. */
  services: [
    'Weddings & receptions',
    'Nightclubs & clubs',
    'Bars & restaurants',
    'Private parties',
    'Birthday parties',
    'Quinceañeras',
    'Corporate events',
    'School dances & proms',
    'College events',
    'Festivals',
    'Concerts & live events',
    'Holiday parties',
  ],

  genres: [
    'Pop',
    '2000s & 2010s hits',
    'EDM',
    'House',
    'Hip-hop',
    'R&B',
    'Latin',
    'Top 40',
    'Remixes',
    'Throwbacks',
    'Christian',
    'Custom playlists',
  ],
} as const;

/** Helpers so components never hand-build contact links. */
export const contactLinks = {
  email: `mailto:${business.contact.email}`,
  phone: `tel:${business.contact.phoneE164}`,
  instagram: business.socials[0].url,
} as const;

/**
 * Contact form delivery (Web3Forms — preserved from the previous site).
 * The access key is public by design; override via PUBLIC_WEB3FORMS_ACCESS_KEY.
 */
export const formConfig = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey:
    import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || 'b39607be-1255-4469-a842-3e3e7982d886',
  subject: 'New booking inquiry from djpazo.com',
  fromName: 'DJ PAZO Website',
} as const;
