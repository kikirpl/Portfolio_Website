// Generated site assets: favicon PNGs (from public/favicon.svg) and the Open Graph card
// (name + About headline + three real previews). Re-generated on every import.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);

export async function generateIcons(publicDir) {
  const svg = fs.readFileSync(path.join(publicDir, 'favicon.svg'));
  await sharp(svg, { density: 384 }).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  await sharp(svg, { density: 384 }).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function text(markup, { width, size, fontfile }) {
  return sharp({
    text: { text: markup, font: `Archivo Variable ${size}`, fontfile, width, rgba: true, dpi: 72, wrap: 'word' },
  })
    .png()
    .toBuffer();
}

/** 1200×630 card: name and headline on the left, three previews cascading on the right. */
export async function generateOgImage({ publicDir, name, headline, previews }) {
  const W = 1200;
  const H = 630;
  const fontfile = require.resolve('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
  const background = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <radialGradient id="g" cx="0.82" cy="0.05" r="0.75">
          <stop offset="0" stop-color="#a9bbff" stop-opacity="0.18"/>
          <stop offset="1" stop-color="#a9bbff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#07080b"/>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <line x1="64" y1="${H - 64}" x2="${W - 64}" y2="${H - 64}" stroke="#d6def5" stroke-opacity="0.12"/>
    </svg>`);

  const layers = [];
  const screens = previews.slice(0, 3);
  for (let i = screens.length - 1; i >= 0; i--) {
    const { file, glow } = screens[i];
    const width = 500;
    const image = await sharp(file).resize({ width }).png().toBuffer();
    const { height } = await sharp(image).metadata();
    const framed = await sharp({
      create: { width: width + 12, height: height + 12, channels: 4, background: '#11141b' },
    })
      .composite([{ input: image, left: 6, top: 6 }])
      .png()
      .toBuffer();
    const glowLayer = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width + 120}" height="${height + 120}">
        <defs><filter id="b"><feGaussianBlur stdDeviation="26"/></filter></defs>
        <rect x="60" y="60" width="${width}" height="${height}" fill="${glow}" fill-opacity="0.35" filter="url(#b)"/>
      </svg>`);
    const left = 600 + i * 40;
    const top = 64 + i * 108;
    layers.push({ input: glowLayer, left: left - 60, top: top - 60 });
    layers.push({ input: framed, left, top });
  }

  const nameImage = await text(`<span foreground="#eef1f7" font_weight="bold">${escape(name)}</span>`, {
    width: 520,
    size: 58,
    fontfile,
  });
  const nameHeight = (await sharp(nameImage).metadata()).height;
  layers.push({ input: nameImage, left: 64, top: 170 });
  if (headline) {
    const lead = await text(`<span foreground="#b4bac8">${escape(headline)}</span>`, { width: 500, size: 26, fontfile });
    layers.push({ input: lead, left: 64, top: 170 + nameHeight + 30 });
  }

  await sharp(background).composite(layers).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'og.png'));
}
