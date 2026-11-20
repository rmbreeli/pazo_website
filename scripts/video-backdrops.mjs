#!/usr/bin/env node
/**
 * Generate the tiny blurred "backdrop" shown BEHIND each video while it loads.
 *
 *   npm run video:backdrops
 *
 * For every .mp4 under public/ it grabs the first frame, shrinks it to a ~1 KB
 * blurred JPEG and stores it (as a data URI, keyed by the video's public path)
 * in src/config/video-backdrops.json. Components inline it as a CSS background,
 * so visitors see a soft preview of the video instead of a black box. The video
 * paints over it the moment its first frame decodes, so no image is ever in
 * front of a video.
 *
 * Run it whenever a video is added or replaced, then commit the JSON.
 * Needs ffmpeg (brew install ffmpeg), but only here: the site build just reads the JSON.
 */
import { execFileSync } from 'node:child_process';
import { readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = resolve('public');
const OUTPUT = resolve('src/config/video-backdrops.json');
const WIDTH = 32; // px. Browsers upscale it smoothly, which is the point.

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extname(entry.name).toLowerCase() === '.mp4') yield path;
  }
}

/** First frame of the video, as PNG bytes. */
const firstFrame = (file) =>
  execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], {
    maxBuffer: 64 * 1024 * 1024,
  });

async function backdrop(file) {
  const jpeg = await sharp(firstFrame(file))
    .resize({ width: WIDTH })
    .blur(1.5)
    .jpeg({ quality: 55, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
}

async function main() {
  const backdrops = {};
  for await (const file of walk(PUBLIC_DIR)) {
    const key = `/${relative(PUBLIC_DIR, file).split(sep).join('/')}`;
    backdrops[key] = await backdrop(file);
    console.log(`  ${key}  (${backdrops[key].length} bytes)`);
  }
  const sorted = Object.fromEntries(Object.entries(backdrops).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(OUTPUT, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Done. ${Object.keys(sorted).length} backdrop(s) written to ${relative(resolve('.'), OUTPUT)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
