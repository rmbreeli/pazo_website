import { canAutoplay } from './autoplay-video';

/**
 * Muted, looping previews on gallery video tiles.
 *
 *  - A tile's video file is only requested once the tile scrolls into view,
 *    so gallery videos never slow down the initial page load.
 *  - Plays while on screen, pauses off screen (battery & data).
 *  - Every tile has its own pause/play button (WCAG 2.2.2), and a visitor's
 *    choice sticks.
 *  - suspend()/resume() let the lightbox silence previews while it is open.
 *
 * Expected markup: [data-gallery-preview] > video[data-gallery-video][data-src]
 *                                         + button[data-gallery-toggle][data-label]
 */
interface Preview {
  tile: HTMLElement;
  video: HTMLVideoElement;
  toggle: HTMLButtonElement;
  visible: boolean;
  userPaused: boolean;
}

export const initGalleryPreviews = () => {
  const startPaused = !canAutoplay();
  const previews = new Map<Element, Preview>();
  let suspended = false;

  const sync = ({ tile, toggle }: Preview, playing: boolean) => {
    tile.toggleAttribute('data-playing', playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${toggle.dataset.label ?? 'video'} preview`);
  };

  const play = (preview: Preview) => {
    const { video } = preview;
    if (!video.hasAttribute('src')) video.src = video.dataset.src ?? '';
    video
      .play()
      .then(() => sync(preview, true))
      .catch(() => sync(preview, false));
  };

  const pause = (preview: Preview) => {
    preview.video.pause();
    sync(preview, false);
  };

  const update = (preview: Preview) =>
    preview.visible && !preview.userPaused && !suspended ? play(preview) : pause(preview);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const preview = previews.get(entry.target);
        if (!preview) continue;
        preview.visible = entry.isIntersecting;
        update(preview);
      }
    },
    { threshold: 0.25 },
  );

  document.querySelectorAll<HTMLElement>('[data-gallery-preview]').forEach((tile) => {
    const video = tile.querySelector<HTMLVideoElement>('[data-gallery-video]');
    const toggle = tile.querySelector<HTMLButtonElement>('[data-gallery-toggle]');
    if (!video || !toggle) return;

    const preview: Preview = { tile, video, toggle, visible: false, userPaused: startPaused };
    previews.set(tile, preview);

    // Reveal the video only once frames are playing; the still image stays underneath.
    video.addEventListener('playing', () => video.classList.remove('opacity-0'), { once: true });
    // A file the browser can't play falls back to the still tile, never a broken player.
    video.addEventListener(
      'error',
      () => {
        observer.unobserve(tile);
        previews.delete(tile);
        tile.removeAttribute('data-playing');
        video.remove();
        toggle.remove();
      },
      { once: true },
    );

    toggle.addEventListener('click', () => {
      preview.userPaused = !video.paused;
      update(preview);
    });

    sync(preview, false);
    toggle.hidden = false;
    observer.observe(tile);
  });

  return {
    suspend: () => {
      suspended = true;
      previews.forEach(pause);
    },
    resume: () => {
      suspended = false;
      previews.forEach(update);
    },
  };
};
