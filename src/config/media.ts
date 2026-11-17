/**
 * MEDIA MANIFEST — every photo and video path on the site lives here.
 *
 * How it works:
 *  - Paths are relative to /public (so "/images/x.jpg" = public/images/x.jpg).
 *  - At build time each path is checked. If the file is missing, the site
 *    shows an elegant branded panel instead of a broken image. Upload the
 *    file to the documented path, rebuild, and it appears automatically.
 *  - To add media: upload the file, then add an entry to `gallery` below.
 *  - Big phone photos? Run `npm run media:optimize` first (resizes, fixes
 *    rotation, strips GPS/EXIF metadata).
 *
 * See public/images/README.md and public/videos/README.md for details.
 */

// ---------------------------------------------------------------------------
// Categories — add a new one here and it becomes available to gallery items.
// ---------------------------------------------------------------------------
export const mediaCategories = {
  weddings: { label: 'Weddings' },
  nightlife: { label: 'Nightlife' },
  'private-events': { label: 'Private Events' },
  corporate: { label: 'Corporate' },
  'bars-restaurants': { label: 'Bars & Restaurants' },
  'holiday-parties': { label: 'Holiday Parties' },
  'dj-setup': { label: 'DJ Setup' },
  production: { label: 'Production' },
} as const;

export type MediaCategory = keyof typeof mediaCategories;

/**
 * Tile size in the gallery grid (desktop is 4 columns):
 *  feature  = 2 x 2   (hero moment, landscape or square)
 *  wide     = 2 x 1   (landscape photos & videos)
 *  tall     = 1 x 2   (portrait photos & phone videos)
 *  standard = 1 x 1
 */
export type TileLayout = 'feature' | 'wide' | 'tall' | 'standard';

interface MediaBase {
  id: string;
  category: MediaCategory;
  /** Short title shown on the tile */
  title: string;
  /** Describe what is actually in the photo, for screen readers & SEO */
  alt: string;
  layout: TileLayout;
  /** CSS object-position to control cropping, e.g. "50% 30%" */
  focus?: string;
}

export interface ImageItem extends MediaBase {
  type: 'image';
  src: string;
}

export interface VideoItem extends MediaBase {
  type: 'video';
  /** Plays muted and on loop in its tile. No still image is ever shown in front of it. */
  src: string;
}

export type MediaItem = ImageItem | VideoItem;

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
export const hero = {
  /** First file that exists wins. Upload an .mp4 (H.264) to either path. */
  videoCandidates: ['/videos/hero/hero-video.mp4', '/images/hero/hero-video.mp4'],
  /** Optional WebM version for smaller downloads (used if present). */
  videoWebm: '/videos/hero/hero-video.webm',
  /**
   * Only shown when there is NO hero video (a video always wins, with no image
   * before it). Also the business photo search engines see. A real DJ PAZO photo.
   */
  poster: '/images/hero/hero-poster.jpg',
  posterAlt: 'DJ PAZO mixing on a Pioneer DJ controller at an outdoor pavilion event',
  /** Keeps the DJ's face in frame when the video/poster is cropped (x% y%). */
  focus: '66% 6%',
} as const;

// ---------------------------------------------------------------------------
// GALLERY — order here = order on the page.
// ---------------------------------------------------------------------------
export const gallery: MediaItem[] = [
  {
    id: 'private-event-01',
    type: 'image',
    src: '/images/events/private-events/private-event-01.jpg',
    category: 'private-events',
    title: 'Private party set',
    alt: 'DJ PAZO in a white cap and tie-dye shirt mixing on a Pioneer DJ controller at a private party',
    layout: 'feature',
    focus: '40% 40%',
  },
  {
    id: 'private-event-02',
    type: 'image',
    src: '/images/events/private-events/private-event-02.jpg',
    category: 'private-events',
    title: 'The dance floor',
    alt: 'Guests dancing and celebrating directly in front of DJ PAZO’s booth under string lights',
    layout: 'tall',
  },
  {
    id: 'dj-setup-01',
    type: 'video',
    src: '/videos/dj-setup/dj-setup-01.mp4',
    category: 'dj-setup',
    title: 'Booth & lighting',
    alt: 'DJ PAZO’s booth, sound system and lighting setup',
    layout: 'tall',
  },
  {
    id: 'holiday-party-01',
    type: 'image',
    src: '/images/events/holiday-parties/holiday-party-01.jpg',
    category: 'holiday-parties',
    title: 'Holiday party',
    alt: 'DJ PAZO mixing beside an illuminated speaker at a holiday party decorated with snowflakes',
    layout: 'tall',
  },
  {
    id: 'wedding-highlight-01',
    type: 'video',
    src: '/videos/weddings/wedding-highlight-01.mp4',
    category: 'weddings',
    title: 'Wedding reception highlights',
    alt: 'Highlight film from a wedding reception with DJ PAZO',
    layout: 'wide',
  },
  {
    id: 'fiesta-01',
    type: 'video',
    src: '/videos/private-events/fiesta-01.mp4',
    category: 'private-events',
    title: 'Fiesta',
    alt: 'Guests celebrating at a fiesta private event with DJ PAZO on the decks',
    layout: 'tall',
  },
  {
    id: 'wedding-01',
    type: 'image',
    src: '/images/events/weddings/wedding-01.jpg',
    category: 'weddings',
    title: 'Wedding reception',
    alt: 'DJ PAZO performing at a wedding reception',
    layout: 'standard',
  },
  {
    id: 'nightlife-01',
    type: 'image',
    src: '/images/events/nightlife/nightlife-01.jpg',
    category: 'nightlife',
    title: 'Club night',
    alt: 'DJ PAZO performing a nightclub set',
    layout: 'standard',
  },
  {
    id: 'performance-01',
    type: 'video',
    src: '/videos/performances/performance-01.mp4',
    category: 'nightlife',
    title: 'Live performance',
    alt: 'Live performance video of DJ PAZO',
    layout: 'wide',
  },
  {
    id: 'bars-restaurants-01',
    type: 'image',
    src: '/images/events/bars-restaurants/bars-restaurants-01.jpg',
    category: 'bars-restaurants',
    title: 'Restaurant daytime set',
    alt: 'DJ PAZO performing at a brick-walled restaurant while guests dine at tables in the background',
    layout: 'standard',
    focus: '50% 30%',
  },
  {
    id: 'production-01',
    type: 'image',
    src: '/images/production/production-01.jpg',
    category: 'production',
    title: 'In the studio',
    alt: 'DJ PAZO producing music in the studio',
    layout: 'standard',
  },
];

/**
 * When true, gallery items whose files are missing are hidden instead of
 * showing a branded placeholder panel. Leave false until media is uploaded.
 */
export const hideMissingMedia = false;

// ---------------------------------------------------------------------------
// LISTEN — original music & mixes (the producer side of the brand).
// ---------------------------------------------------------------------------
export interface ListenItem {
  title: string;
  kind: string;
  description: string;
  platform: 'SoundCloud' | 'YouTube';
  url: string;
  thumbnail: string;
  alt: string;
}

export const listen: ListenItem[] = [
  {
    title: 'Throwbacks & Hip-Hop',
    kind: 'DJ setlist · 60 min',
    description: 'A high-energy hour of throwbacks and hip-hop.',
    platform: 'SoundCloud',
    url: 'https://soundcloud.com/dj-pazo/throwbacks-hip-hop-dj-setlist',
    thumbnail: '/images/production/throwbacks-hip-hop.jpg',
    alt: 'DJ PAZO mixing outdoors on a Pioneer DJ controller',
  },
  {
    title: 'EDM & House',
    kind: 'Short performance',
    description: 'A short EDM and house set, filmed from above the decks.',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=H6E2ZaXPPWM&t=132s',
    thumbnail: '/images/production/edm-house-set.jpg',
    alt: 'Overhead view of hands mixing on a Pioneer DDJ-FLX4 controller with waveforms above',
  },
  {
    title: 'Moonlight',
    kind: 'Original track',
    description: 'An original production by PAZO.',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=u26VNPv-oXs',
    thumbnail: '/images/production/moonlight.jpg',
    alt: 'Cover art for Moonlight: a bright moon against a black sky',
  },
];
