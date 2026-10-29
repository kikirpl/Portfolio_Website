// Colour helpers. A project's sampled accent can be muddy (dark gold, olive); the site
// lifts it to a consistent lightness in OKLCH so every project glows with equal weight.

type Vec3 = [number, number, number];

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex: string): Vec3 {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as Vec3;
}

export function rgbToHex([r, g, b]: Vec3): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
}

function linearRgbToOklab([r, g, b]: Vec3): Vec3 {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinearRgb([L, a, b]: Vec3): Vec3 {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex: string): Vec3 {
  const [L, a, b] = linearRgbToOklab(hexToRgb(hex).map(srgbToLinear) as Vec3);
  return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI];
}

export function oklchToHex(L: number, C: number, h: number): string {
  // Reduce chroma until the colour fits in sRGB.
  for (let c = C; c >= 0; c -= 0.005) {
    const rad = (h * Math.PI) / 180;
    const rgb = oklabToLinearRgb([L, c * Math.cos(rad), c * Math.sin(rad)]);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgbToHex(rgb.map(linearToSrgb) as Vec3);
  }
  return rgbToHex(oklabToLinearRgb([L, 0, 0]).map(linearToSrgb) as Vec3);
}

/** Moonlight: the scene's own light when no project is in view. */
export const MOONLIGHT = '#a9bbff';

/** Lifts a sampled accent to a glow colour that reads on the dark ground (contrast > 7:1). */
export function glowFrom(hex: string | null | undefined): string {
  if (!hex) return MOONLIGHT;
  const [, C, h] = hexToOklch(hex);
  if (C < 0.03) return MOONLIGHT;
  return oklchToHex(0.8, Math.min(Math.max(C * 1.4, 0.11), 0.17), h);
}
