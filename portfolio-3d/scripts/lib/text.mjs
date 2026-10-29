// Small text utilities shared by the importer. None of these rewrite content;
// they only add structure (dates, slugs, sentence boundaries) next to it.
import fs from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';

const MONTHS = {
  jan: 1, january: 1, januari: 1,
  feb: 2, february: 2, februari: 2,
  mar: 3, march: 3, maret: 3,
  apr: 4, april: 4,
  may: 5, mei: 5,
  jun: 6, june: 6, juni: 6,
  jul: 7, july: 7, juli: 7,
  aug: 8, august: 8, agu: 8, agustus: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, okt: 10, oktober: 10,
  nov: 11, november: 11, nop: 11, nopember: 11,
  dec: 12, december: 12, des: 12, desember: 12,
};
const ONGOING = /^(present|now|current|sekarang|saat ini)$/i;

function parseMonth(part) {
  const m = part.trim().match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (!m) return null;
  const month = MONTHS[m[1].toLowerCase()];
  return month ? `${m[2]}-${String(month).padStart(2, '0')}` : null;
}

/** "Jul 2025 - Sep 2025" -> { start: "2025-07", end: "2025-09", ongoing: false } */
export function parsePeriod(period) {
  const [from, to] = String(period ?? '').split(/\s+[-–—]\s+|\s+to\s+|\s+s\.?d\.?\s+/i);
  const start = from ? parseMonth(from) : null;
  const ongoing = to ? ONGOING.test(to.trim()) : false;
  const end = to && !ongoing ? parseMonth(to) : null;
  return { start, end, ongoing };
}

export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "portfolio_v1" -> "Portfolio V1" (used only when a project has no name in the source). */
export function tidyFileName(key) {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function sentences(paragraph) {
  return paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9"“'])/).filter(Boolean);
}

export async function readPdfText(file) {
  const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(file)));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

/** Contact details found anywhere in a CV's text (labels and values are often split apart). */
export function findContact(text) {
  const email = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0] ?? null;
  const linkedin = text.match(/(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?/i)?.[0] ?? null;
  const phone = text.match(/(?:\+62|\b62|\b0)8\d{1,3}[-\s.]?\d{3,4}[-\s.]?\d{3,5}\b/)?.[0] ?? null;
  return { email, linkedin, phone };
}
