# Video guide

All website videos live in this folder. Paths are referenced in
**`src/config/media.ts`**. Missing videos never show a broken player. The
site falls back to the poster image or a branded panel until the file exists.

## Where each video goes

| What | Path | Poster image (still frame) |
| --- | --- | --- |
| **Hero video** | `public/videos/hero/hero-video.mp4` | `public/images/hero/hero-poster.jpg` |
| Hero video, optional WebM | `public/videos/hero/hero-video.webm` | (same) |
| Wedding highlight film | `public/videos/weddings/wedding-highlight-01.mp4` | `public/images/events/weddings/wedding-highlight-01.jpg` |
| Live performance | `public/videos/performances/performance-01.mp4` | `public/images/events/nightlife/performance-01.jpg` |
| Booth & lighting | `public/videos/dj-setup/dj-setup-01.mp4` | `public/images/dj-setup/dj-setup-01.jpg` |
| More nightlife clips | `public/videos/nightlife/nightlife-01.mp4` | add to media.ts |
| Behind the scenes | `public/videos/behind-the-scenes/bts-01.mp4` | add to media.ts |

> The hero also accepts `public/images/hero/hero-video.mp4` if you prefer to
> keep the hero files together. The first one found is used.

## How the hero video behaves

- Plays **muted, looping, inline**, with no controls, after the page has finished loading.
- A small play/pause button sits in the corner (required for accessibility).
- Visitors with *Reduce Motion* or *Data Saver* enabled see the poster instead,
  and can press play.
- The poster stays visible until the video is actually playing, so there is
  no black flash and no broken player.

### Recommended hero export

- **Format:** MP4 (H.264), no audio track needed
- **Aspect:** 16:9 or wider (it is framed at 21:9 on desktop, 4:5 on phones,
  so keep the action near the center-right)
- **Length:** 8–20 seconds, loops seamlessly
- **Size:** 1920 px wide, **under ~8 MB** (lower bitrate = faster site)
- Example with ffmpeg:
  `ffmpeg -i input.mov -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart hero-video.mp4`

## Gallery videos

- Play **muted, looping, inline** right in their tile once it scrolls into view,
  and pause when scrolled away. The file is only downloaded at that point, so
  videos never slow down the initial page load.
- Each video tile has a small pause/play button (required for accessibility).
  Visitors with *Reduce Motion* or *Data Saver* enabled see the still image
  and can press play.
- Tapping the tile opens the full video with sound and controls.
- Keep gallery clips short and light (ideally **under ~8 MB**), since they
  autoplay. Portrait clips suit `tall` tiles, landscape clips suit `wide` tiles.
- **Format:** MP4 (H.264 + AAC audio), `-movflags +faststart` recommended.
- Always add a poster `.jpg` (a nice still frame). Without one, the tile shows
  a dark panel with a play button.

## Add a new video

1. Upload the video, e.g. `public/videos/weddings/wedding-highlight-02.mp4`.
2. Upload a poster, e.g. `public/images/events/weddings/wedding-highlight-02.jpg`.
3. Add an entry to `gallery` in `src/config/media.ts`:

   ```ts
   {
     id: 'wedding-highlight-02',
     type: 'video',
     src: '/videos/weddings/wedding-highlight-02.mp4',
     poster: '/images/events/weddings/wedding-highlight-02.jpg',
     category: 'weddings',
     title: 'Reception highlights',
     alt: 'Highlight film from a wedding reception with DJ PAZO',
     layout: 'wide',
   },
   ```

Netlify's free tier is fine for a few short clips. For long or many videos,
consider uploading to YouTube and linking from the Listen section instead.
