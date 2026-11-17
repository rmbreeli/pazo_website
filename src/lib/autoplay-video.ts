/**
 * Shared rule for every muted, looping background video on the site.
 * Visitors who ask for less motion or less data never get autoplay;
 * they see the still image and can press play themselves.
 */
export const canAutoplay = (): boolean => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !reduceMotion && !saveData;
};
