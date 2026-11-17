# Video guide

All website videos live in this folder. Paths are referenced in
**`src/config/media.ts`**. Missing videos never show a broken player. The
site shows a branded panel until the file exists.

**Videos never have an image in front of them.** If a video exists, it is
what visitors see from the very first moment. No poster or still frame is
needed.

## Where each video goes

| What | Path |
| --- | --- |
| **Hero video** | `public/videos/hero/hero-video.mp4` |
| Hero video for phones, optional (portrait 4:5) | `public/videos/hero/hero-video-mobile.mp4` (see `hero/README.md`) |
| Hero video, optional WebM | `public/videos/hero/hero-video.webm` |
| Wedding highlight film | `public/videos/weddings/wedding-highlight-01.mp4` |
| Live performance | `public/videos/performances/performance-01.mp4` |
| Booth & lighting | `public/videos/dj-setup/dj-setup-01.mp4` |
| Fiesta | `public/videos/private-events/fiesta-01.mp4` |
| More nightlife clips | `public/videos/nightlife/nightlife-01.mp4` (add to media.ts) |
| Behind the scenes | `public/videos/behind-the-scenes/bts-01.mp4` (add to media.ts) |

> The hero also accepts `public/images/hero/hero-video.mp4` if you prefer to
> keep the hero files together. The first one found is used.
>
> `public/images/hero/hero-poster.jpg` is only shown when there is **no**
> hero video. Keep it anyway: it is also the business photo search engines see.

## How the hero video behaves

- Plays **muted, looping forever, inline**, with no controls, as soon as the
  page opens. It has no pause button.
- **Phones:** if `hero-video-mobile.mp4` exists, phones play that portrait cut
  in a tall 4:5 frame. Otherwise they play the main video in a 16:9 frame so
  most of the wide shot stays visible. Directions: `hero/README.md`.
- Visitors with *Reduce Motion* or *Data Saver* enabled see the video's
  first frame instead.

### Recommended hero export

- **Format:** MP4 (H.264), no audio track needed
- **Aspect:** 16:9 or wider (it is framed at 21:9 on desktop, 16:10 on tablets
  and 16:9 on phones, cropped from the center, so keep the action centered)
- **Length:** 8–20 seconds, loops seamlessly
- **Size:** 1920 px wide, **under ~8 MB** (lower bitrate = faster site)
- Example with ffmpeg:
  `ffmpeg -i input.mov -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart hero-video.mp4`

## Gallery videos

- Play **muted, looping forever, inline** right in their tile while it is on
  screen, and pause when scrolled away. The file is only downloaded once the
  tile scrolls into view, so videos never slow down the initial page load.
- Tiles have no buttons and can't be clicked.
- Visitors with *Reduce Motion* or *Data Saver* enabled see the video's first
  frame, without playback.
- Keep gallery clips short and light (ideally **under ~8 MB**), and make them
  loop smoothly. Portrait clips suit `tall` tiles, landscape clips suit `wide`
  tiles.
- **Format:** MP4 (H.264), `-movflags +faststart` recommended. Videos are
  muted, so audio is optional.

## Add a new video

1. Upload the video, e.g. `public/videos/weddings/wedding-highlight-02.mp4`.
2. Add an entry to `gallery` in `src/config/media.ts`:

   ```ts
   {
     id: 'wedding-highlight-02',
     type: 'video',
     src: '/videos/weddings/wedding-highlight-02.mp4',
     category: 'weddings',
     title: 'Reception highlights',
     alt: 'Highlight film from a wedding reception with DJ PAZO',
     layout: 'wide',
   },
   ```

Netlify's free tier is fine for a few short clips. For long or many videos,
consider uploading to YouTube and linking from the Listen section instead.
