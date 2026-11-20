import { canAutoplay, firstFrame } from './autoplay-video';

/**
 * Muted, endlessly looping videos on gallery tiles. No image is ever shown
 * in front of a video.
 *
 *  - Loading and playing are separate jobs with separate observers:
 *      LOADER  starts the download LOOK_AHEAD px before a tile scrolls into view, so the
 *              file is already buffering (not starting from zero) when the visitor arrives.
 *      PLAYER  plays only while the tile is actually on screen and pauses off screen
 *              (battery & data).
 *  - Nothing is requested on page load: tiles far below the fold stay untouched.
 *  - Reduce Motion / Data Saver: the video shows its first frame, no playback, no pre-buffering.
 *
 * Expected markup: [data-gallery-preview] > video[data-gallery-video][data-src]
 */
const LOOK_AHEAD = '300px 0px';
const MOSTLY_VISIBLE = 0.25;

/** Idempotent: safe to call from both observers, whichever fires first. */
const loadSource = (video: HTMLVideoElement, buffer: boolean) => {
  if (video.hasAttribute('src')) return;
  video.preload = buffer ? 'auto' : 'metadata';
  video.src = firstFrame(video.dataset.src ?? '');
};

const videoOf = (tile: Element) => tile.querySelector<HTMLVideoElement>('[data-gallery-video]');

export const initGalleryPreviews = () => {
  const autoplay = canAutoplay();

  const loader = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        const video = videoOf(target);
        if (video) loadSource(video, autoplay);
        loader.unobserve(target); // One-time job: the file is on its way.
      }
    },
    { rootMargin: LOOK_AHEAD },
  );

  const player = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const video = videoOf(target);
        if (!video) continue;
        if (!isIntersecting) {
          video.pause();
          continue;
        }
        loadSource(video, autoplay); // Fast scroll: the player can win the race against the loader.
        if (autoplay) video.play().catch(() => {}); // Blocked (e.g. Low Power Mode): rests on its first frame.
      }
    },
    { threshold: MOSTLY_VISIBLE },
  );

  document.querySelectorAll('[data-gallery-preview]').forEach((tile) => {
    const video = videoOf(tile);
    if (!video) return;
    // A file the browser can't play falls back to the plain titled tile, never a broken player.
    video.addEventListener(
      'error',
      () => {
        loader.unobserve(tile);
        player.unobserve(tile);
        video.remove();
      },
      { once: true },
    );
    loader.observe(tile);
    player.observe(tile);
  });
};
