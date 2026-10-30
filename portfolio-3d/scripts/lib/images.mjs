// Preview image pipeline: responsive AVIF/WebP for HTML, capped WebP textures for WebGL,
// a tiny blurred placeholder, and colours sampled from the image itself.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

/** Widths for <picture> srcsets. The original width is always added as the largest. */
export const RESPONSIVE_WIDTHS = [480, 800, 1200];
/** WebGL texture widths. `md` is the cap used for every texture loaded up front. */
export const TEXTURE_WIDTHS = { sm: 512, md: 1024 };
/** The sharper texture swapped in only for the project open in detail view. */
export const DETAIL_TEXTURE_MAX = 2048;

const AVIF = { quality: 52, effort: 4 };
const WEBP = { quality: 80, effort: 5 };
const TEXTURE_WEBP = { quality: 82, effort: 5 };

export function fileHash(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
}

const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max / 255 };
}

/**
 * The most vivid hue family in the image (used as the light a screen casts),
 * plus the average luminance. Falls back to null for near-grey images.
 */
async function sampleColours(input) {
  const { data, info } = await sharp(input)
    .resize(64, 32, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bins = Array.from({ length: 18 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  let luminance = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    luminance += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const { h, s, v } = rgbToHsv(r, g, b);
    if (s < 0.28 || v < 0.22) continue;
    const weight = s * s * v;
    const bin = bins[Math.floor(h / 20) % 18];
    bin.w += weight;
    bin.r += r * weight;
    bin.g += g * weight;
    bin.b += b * weight;
  }
  const best = bins.reduce((a, b) => (b.w > a.w ? b : a));
  const coverage = best.w / pixels;
  const accent =
    coverage > 0.004 ? toHex({ r: best.r / best.w, g: best.g / best.w, b: best.b / best.w }) : null;
  return { accent, luminance: +(luminance / pixels).toFixed(3) };
}

async function writeIfMissing(file, build, force) {
  if (!force && fs.existsSync(file)) return;
  await build().toFile(file);
}

/**
 * Converts one preview into every variant the site needs.
 * Returns the image descriptor stored in projects.json (paths are site-relative).
 */
export async function processPreview({ input, id, outDir, publicBase, force = false, sizes = RESPONSIVE_WIDTHS }) {
  fs.mkdirSync(outDir, { recursive: true });
  const hash = fileHash(input);
  const meta = await sharp(input).metadata();
  const stats = await sharp(input).stats();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;

  // Opaque PNGs often still carry an alpha channel; dropping it keeps files smaller.
  const base = () => {
    const img = sharp(input).autoOrient();
    return stats.isOpaque ? img.removeAlpha() : img;
  };
  const written = [];
  const out = (name) => {
    written.push(name);
    return path.join(outDir, name);
  };
  const url = (name) => `${publicBase}/${name}`;

  const widths = [...new Set([...sizes.filter((w) => w < width), width])];
  const sources = { avif: [], webp: [] };
  for (const w of widths) {
    const avifName = `${id}-${w}.${hash}.avif`;
    const webpName = `${id}-${w}.${hash}.webp`;
    await writeIfMissing(out(avifName), () => base().resize({ width: w }).avif(AVIF), force);
    await writeIfMissing(out(webpName), () => base().resize({ width: w }).webp(WEBP), force);
    sources.avif.push({ src: url(avifName), width: w });
    sources.webp.push({ src: url(webpName), width: w });
  }

  const texture = {};
  for (const [key, w] of Object.entries(TEXTURE_WIDTHS)) {
    const name = `${id}-tex${w}.${hash}.webp`;
    await writeIfMissing(
      out(name),
      () =>
        base()
          .flatten({ background: '#05070f' })
          .resize({ width: Math.min(w, width) })
          .webp(TEXTURE_WEBP),
      force,
    );
    texture[key] = url(name);
  }
  if (width > DETAIL_TEXTURE_MAX) {
    const name = `${id}-tex${DETAIL_TEXTURE_MAX}.${hash}.webp`;
    await writeIfMissing(
      out(name),
      () => base().flatten({ background: '#05070f' }).resize({ width: DETAIL_TEXTURE_MAX }).webp(TEXTURE_WEBP),
      force,
    );
    texture.lg = url(name);
  } else {
    texture.lg = sources.webp.at(-1).src;
  }

  const lqipBuffer = await base().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const { accent, luminance } = await sampleColours(input);
  const fallback = sources.webp.filter((s) => s.width <= 800).at(-1) ?? sources.webp[0];

  return {
    descriptor: {
      width,
      height,
      aspect: +(width / height).toFixed(4),
      src: fallback.src,
      sources,
      texture,
      lqip: `data:image/webp;base64,${lqipBuffer.toString('base64')}`,
      dominant: toHex(stats.dominant),
      accent,
      luminance,
    },
    files: written,
    hash,
  };
}

/** Deletes generated files that are no longer referenced (e.g. after a source image changed). */
export function removeStale(dir, keep) {
  if (!fs.existsSync(dir)) return [];
  const removed = [];
  for (const name of fs.readdirSync(dir)) {
    if (!keep.has(name)) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
      removed.push(name);
    }
  }
  return removed;
}
