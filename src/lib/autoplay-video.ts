/**
 * Shared rules for every muted, looping video on the site.
 * Visitors who ask for less motion or less data never get autoplay;
 * they see the video's first frame (never a separate image) and the hero
 * offers a play button.
 */
export const canAutoplay = (): boolean => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduceMotion && !saveData;
};

/** Media-fragment trick that makes every browser (notably Safari) paint the first frame of a paused video. */
export const firstFrame = (src: string): string => `${src}#t=0.001`;
