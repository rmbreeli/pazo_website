#!/usr/bin/env bash
# Optimize a video for the web, in place.
#
#   npm run video:optimize -- <preset> <file> [<file> ...]
#
# Presets (pick by how the video is shown on the site):
#   hero      wide hero loop            1920 px wide, up to ~3 Mbps
#   wide      wide gallery tiles        1280 px wide, up to ~2 Mbps
#   portrait  tall tiles / phone hero    720 px wide, up to ~1.5 Mbps
#
# What every preset does (and why):
#   - H.264 + yuv420p: plays everywhere (HEVC fails in Firefox and some Android/Windows browsers)
#   - faststart:       moves the index to the front so playback can begin before the full download
#   - no audio:        every site video is muted, so the audio track is wasted bytes
#   - capped bitrate:  phones on 4G can't stream 9-13 Mbps, which causes stalls and black frames
#
# Requires ffmpeg (brew install ffmpeg). The original is replaced only if encoding succeeds.
set -euo pipefail

usage() {
  sed -n '2,/^set -/p' "$0" | sed '$d' | sed 's/^# \{0,1\}//'
  exit 1
}

[[ $# -ge 2 ]] || usage
command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it with: brew install ffmpeg" >&2; exit 1; }

preset="$1"
shift

case "$preset" in
  hero)     width=1920; crf=26; maxrate=3M;   bufsize=6M ;;
  wide)     width=1280; crf=27; maxrate=2M;   bufsize=4M ;;
  portrait) width=720;  crf=27; maxrate=1500k; bufsize=3M ;;
  *) echo "Unknown preset '$preset' (use hero, wide or portrait)" >&2; usage ;;
esac

for input in "$@"; do
  [[ -f "$input" ]] || { echo "Not a file: $input" >&2; exit 1; }
  temp="${input%.mp4}.optimizing.mp4"
  before=$(stat -f %z "$input" 2>/dev/null || stat -c %s "$input")

  ffmpeg -y -loglevel error -i "$input" \
    -an \
    -vf "scale=${width}:-2" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf "$crf" -preset slow -maxrate "$maxrate" -bufsize "$bufsize" \
    -movflags +faststart \
    "$temp"

  mv "$temp" "$input"
  after=$(stat -f %z "$input" 2>/dev/null || stat -c %s "$input")
  printf '%-55s %6.1f MB -> %5.1f MB\n' "$input" "$(bc -l <<< "$before/1048576")" "$(bc -l <<< "$after/1048576")"
done
