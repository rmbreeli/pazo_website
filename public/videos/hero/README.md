# Hero video

| File | Required? | What it is |
| --- | --- | --- |
| `hero-video.mp4` | **Yes** | The main wide hero video (desktop, tablet, and phones until the mobile cut exists). |
| `hero-video-mobile.mp4` | Optional | A **portrait 4:5** cut of the same video, played **only on phones**. |
| `hero-video.webm` | Optional | Smaller WebM copy of the main video. |

The poster photo lives at `public/images/hero/hero-poster.jpg` and is only shown when there is no hero video.

## Adding the phone version (`hero-video-mobile.mp4`)

Phones show the hero in a tall frame, so a wide video loses its sides. A
portrait cut fixes that.

1. **Edit a portrait version** of the hero video (CapCut, Premiere, Final Cut, etc.):
   - **Aspect ratio 4:5**, e.g. **1080 × 1350** px.
   - Reframe each shot so the subject (face, DJ, crowd) stays in the frame.
   - Same length and order as the main video, looping smoothly.
   - Keep the bottom-left corner free of important detail: the big "PAZO" lettering sits there.
2. **Export** as **MP4 (H.264)**, no audio needed (it plays muted), ideally **under ~5 MB**.
3. **Name it exactly** `hero-video-mobile.mp4` and put it **in this folder**:
   `public/videos/hero/hero-video-mobile.mp4`
4. **Commit and push.** No code changes are needed.

What changes on its own once the file exists:

- **Phones** (narrower than 640 px) switch to the tall 4:5 frame and play this file.
- **Tablets and desktops** keep playing `hero-video.mp4` and never download the phone file.
- Until the file exists, phones play `hero-video.mp4` in a wider 16:9 frame so most of the shot stays visible.

See the main guide: ../README.md
