import { canAutoplay, firstFrame } from './autoplay-video';

/**
 * Muted, endlessly looping videos on gallery tiles. No image is ever shown
 * in front of a video.
 *
 *  - A tile's video file is only requested once the tile scrolls into view,
 *    so gallery videos never slow down the initial page load.
 *  - Loops while on screen, pauses off screen (battery & data).
 *  - Reduce Motion / Data Saver: the video shows its first frame, no playback.
 *
 * Expected markup: [data-gallery-preview] > video[data-gallery-video][data-src]
 */
export const initGalleryPreviews = () => {
  const autoplay = canAutoplay();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        const video = target.querySelector<HTMLVideoElement>('[data-gallery-video]');
        if (!video) continue;
        if (!isIntersecting) {
          video.pause();
          continue;
        }
        if (!video.hasAttribute('src')) video.src = firstFrame(video.dataset.src ?? '');
        if (autoplay) video.play().catch(() => {}); // Blocked (e.g. Low Power Mode): rests on its first frame.
      }
    },
    { threshold: 0.25 },
  );

  document.querySelectorAll('[data-gallery-preview]').forEach((tile) => {
    const video = tile.querySelector<HTMLVideoElement>('[data-gallery-video]');
    if (!video) return;
    // A file the browser can't play falls back to the plain titled tile, never a broken player.
    video.addEventListener(
      'error',
      () => {
        observer.unobserve(tile);
        video.remove();
      },
      { once: true },
    );
    observer.observe(tile);
  });
};
