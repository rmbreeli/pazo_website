#!/usr/bin/env node
/**
 * Optimize photos for the web.
 *
 *   npm run media:optimize
 *       Scans public/images and optimizes any photo that is larger than
 *       MAX_EDGE px or still carries EXIF metadata. Files are rewritten in
 *       place (same name, same format). Already-optimized files are skipped,
 *       so it is safe to run repeatedly.
 *
 *   npm run media:optimize -- <input-file> <output-file> [max-edge]
 *       Optimize a single photo from anywhere into the site, e.g.
 *       npm run media:optimize -- ~/Desktop/IMG_1234.JPG public/images/events/weddings/wedding-02.jpg
 *       Optional max-edge (px) overrides the default, e.g. 900 for thumbnails.
 *
 * What "optimize" means: apply EXIF rotation, resize so the longest edge is
 * at most MAX_EDGE, strip metadata (including GPS location), and compress.
 */
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const MAX_EDGE = 2000;
const IMAGES_DIR = resolve('public/images');
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const encoders = {
  '.jpg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.jpeg': (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  '.png': (img) => img.png({ compressionLevel: 9, palette: true }),
  '.webp': (img) => img.webp({ quality: 80 }),
};

async function needsWork(file) {
  const meta = await sharp(file).metadata();
  const tooBig = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;
  return tooBig || Boolean(meta.exif) || Boolean(meta.orientation && meta.orientation !== 1);
}

async function optimize(input, output, maxEdge = MAX_EDGE) {
  const ext = extname(output).toLowerCase();
  const encode = encoders[ext];
  if (!encode) throw new Error(`Unsupported output format: ${ext}`);

  const pipeline = sharp(input)
    .rotate() // bake in EXIF orientation before metadata is stripped
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
  const buffer = await encode(pipeline).toBuffer();

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, buffer);
  console.log(`  optimized  ${output}  (${Math.round(buffer.length / 1024)} KB)`);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (PHOTO_EXTENSIONS.has(extname(entry.name).toLowerCase())) yield path;
  }
}

async function main() {
  const [input, output, maxEdge] = process.argv.slice(2);

  if (input && output) {
    await optimize(resolve(input), resolve(output), maxEdge ? Number(maxEdge) : MAX_EDGE);
    return;
  }
  if (input) {
    console.error('Usage: npm run media:optimize [-- <input-file> <output-file>]');
    process.exit(1);
  }

  console.log(`Scanning ${IMAGES_DIR} ...`);
  let count = 0;
  for await (const file of walk(IMAGES_DIR)) {
    if (await needsWork(file)) {
      await optimize(file, file);
      count += 1;
    }
  }
  console.log(count ? `Done. ${count} file(s) optimized.` : 'All photos are already optimized.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
