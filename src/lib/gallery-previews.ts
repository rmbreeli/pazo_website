import { canAutoplay } from './autoplay-video';

/**
 * Longest a preview may run. Moving content that stops within 5 seconds needs
 * no pause control (WCAG 2.2.2), which is why the tiles have no buttons.
 */
const MAX_PREVIEW_SECONDS = 5;

/**
 * Silent, one-time previews on gallery video tiles.
 *
 *  - A tile's video file is only requested once the tile scrolls into view,
 *    so gallery videos never slow down the initial page load.
 *  - Each preview plays once, for at most 5 seconds, then rests on its last
 *    frame. Scrolling away pauses it; scrolling back finishes the run.
 *  - Reduce Motion / Data Saver: nothing plays or downloads.
 *
 * Expected markup: [data-gallery-preview] > video[data-gallery-video][data-src]
 */
export const initGalleryPreviews = () => {
  if (!canAutoplay()) return;

  const onVisibility = new Map<Element, (visible: boolean) => void>();
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(({ target, isIntersecting }) => onVisibility.get(target)?.(isIntersecting)),
    { threshold: 0.25 },
  );

  document.querySelectorAll('[data-gallery-preview]').forEach((tile) => {
    const video = tile.querySelector<HTMLVideoElement>('[data-gallery-video]');
    if (!video) return;

    let done = false;
    let stopTimer: number | undefined;

    const finish = () => {
      done = true;
      video.pause();
      observer.unobserve(tile);
    };

    onVisibility.set(tile, (visible) => {
      if (!visible) return video.pause();
      if (done) return;
      if (!video.hasAttribute('src')) video.src = video.dataset.src ?? '';
      video.play().catch(() => {}); // Autoplay blocked (e.g. Low Power Mode): the tile simply stays still.
    });

    video.addEventListener('playing', () => {
      // Reveal the video only once frames are playing; the still image stays underneath.
      video.classList.remove('opacity-0');
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(finish, (MAX_PREVIEW_SECONDS - video.currentTime) * 1000);
    });
    video.addEventListener('pause', () => window.clearTimeout(stopTimer));
    video.addEventListener('ended', finish);
    // A file the browser can't play falls back to the still tile, never a broken player.
    video.addEventListener(
      'error',
      () => {
        finish();
        video.remove();
      },
      { once: true },
    );

    observer.observe(tile);
  });
};
