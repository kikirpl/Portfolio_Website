#!/usr/bin/env node
/**
 * Imports portfolio content from the original Vue site repository.
 *
 *   npm run import                                  source = parent folder (this repo)
 *   npm run import -- --source ../portfolio_website any local checkout
 *   npm run import -- --git https://github.com/kikirpl/portfolio_website --ref master
 *   npm run import -- --force                       re-encode every image
 *
 * The source is only ever read. Output (all generated, commit it):
 *   public/content/{profile,projects,experience}.json
 *   public/content/images/projects/*   AVIF/WebP sizes + WebGL textures
 *   public/content/files/*             the CV
 *   IMPORT_REPORT.md                   missing data and things that look wrong
 * Manual fixes go in content.overrides.json, never in the generated files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { readSfc, find, findAll, textOf, attr, hasClass, scriptProperty } from './lib/vue.mjs';
import { processPreview, removeStale, fileHash, TEXTURE_WIDTHS } from './lib/images.mjs';
import { parsePeriod, slugify, tidyFileName, sentences, readPdfText, findContact } from './lib/text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'content');
const IMAGES_OUT = path.join(OUT, 'images', 'projects');
const FILES_OUT = path.join(OUT, 'files');
const PUBLIC_BASE = '/content';

/** Where each piece of data lives in the source repo. Update this if the old site is restructured. */
const SOURCE = {
  home: 'src/views/HomeView.vue',
  about: 'src/views/AboutView.vue',
  projects: 'src/views/PortfolioView.vue',
  experience: 'src/views/BlogView.vue',
  app: 'src/App.vue',
  router: 'src/router/index.js',
  previews: 'public/img',
  publicDir: 'public',
};
const PREVIEW_FILE = /^portfolio-(.+)\.(png|jpe?g|webp|avif)$/i;
const KNOWN_TYPOS = { Profesional: 'Professional', developtment: 'development', Nairoby: 'Nairobi' };

const report = { todo: [], issues: [], notes: [] };

// ---------------------------------------------------------------- source

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
}

function resolveSource(values) {
  if (values.git) {
    const dir = path.join(ROOT, '.cache', 'source');
    const sameRemote = fs.existsSync(path.join(dir, '.git')) && git(['-C', dir, 'remote', 'get-url', 'origin']) === values.git;
    if (!sameRemote) {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(path.dirname(dir), { recursive: true });
      git(['clone', '--depth', '1', ...(values.ref ? ['--branch', values.ref] : []), values.git, dir]);
    } else {
      git(['-C', dir, 'fetch', '--depth', '1', 'origin', values.ref ?? 'HEAD']);
      git(['-C', dir, 'checkout', '--force', 'FETCH_HEAD']);
    }
    return dir;
  }
  const dir = path.resolve(ROOT, values.source ?? process.env.SOURCE_REPO ?? '..');
  if (dir === ROOT || dir.startsWith(ROOT + path.sep)) {
    throw new Error('The source must be the old site repository, not this project.');
  }
  return dir;
}

function sourceInfo(dir) {
  try {
    const commit = git(['-C', dir, 'rev-parse', '--short', 'HEAD']);
    const remote = git(['-C', dir, 'remote', 'get-url', 'origin']);
    const repo = remote.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1] ?? remote.match(/\/git\/([^/]+\/[^/]+?)(?:\.git)?$/)?.[1] ?? null;
    return { repo: repo?.toLowerCase() ?? null, commit };
  } catch {
    return { repo: null, commit: null };
  }
}

// ---------------------------------------------------------------- readers

function readHome(file) {
  const { template, script } = readSfc(file);
  const elements = findAll(template, () => true);
  const nameIndex = elements.findIndex((n) => n.tag === 'h1' && textOf(n));
  const greeting = elements.slice(0, nameIndex).reverse().find((n) => n.tag === 'p' && textOf(n));
  const welcome = elements.slice(nameIndex + 1).find((n) => n.tag === 'p' && textOf(n));
  const cv = find(template, (n) => n.tag === 'a' && /\.pdf$/i.test(attr(n, 'href') ?? ''));
  return {
    name: nameIndex >= 0 ? textOf(elements[nameIndex]) : null,
    greeting: greeting ? textOf(greeting) : null,
    welcome: welcome ? textOf(welcome) : null,
    roles: scriptProperty(script, 'toRotate') ?? [],
    cvLink: cv ? { label: textOf(cv), href: attr(cv, 'href') } : null,
  };
}

function readApp(file) {
  const { template } = readSfc(file);
  const nav = find(template, (n) => n.tag === 'nav');
  const brand = nav ? find(nav, (n) => n.tag === 'button') : null;
  const github = find(template, (n) => n.tag === 'a' && /github\.com\/[^/]+\/?$/i.test(attr(n, 'href') ?? ''));
  return { brand: brand ? textOf(brand) : null, github: github ? attr(github, 'href') : null };
}

function readAbout(file) {
  const { template, script } = readSfc(file);
  const [about, skills] = findAll(template, (n) => n.tag === 'article');
  const heading = about && find(about, (n) => hasClass(n, 'title-section'));
  const tabs = skills ? findAll(skills, (n) => n.tag === 'button').map(textOf) : [];
  const skillsHeading = skills && find(skills, (n) => hasClass(n, 'title-section'));
  return {
    heading: heading ? textOf(heading) : null,
    paragraphs: about ? findAll(about, (n) => n.tag === 'p').map(textOf).filter(Boolean) : [],
    skillsHeading: skillsHeading ? textOf(skillsHeading) : null,
    skillGroups: [
      { label: tabs[0] ?? null, items: scriptProperty(script, 'tech') ?? [] },
      { label: tabs[1] ?? null, items: scriptProperty(script, 'tools') ?? [] },
    ],
  };
}

function readProjects(file) {
  const { template, script } = readSfc(file);
  const header = find(template, (n) => n.tag === 'header');
  const headings = header ? findAll(header, (n) => /^h[1-6]$/.test(n.tag)).map(textOf).filter(Boolean) : [];
  return { heading: headings[0] ?? null, subheading: headings[1] ?? null, items: scriptProperty(script, 'items') ?? [] };
}

function readExperience(file) {
  const { template, script } = readSfc(file);
  const elements = findAll(template, () => true);
  const headingIndex = elements.findIndex((n) => /^h[1-6]$/.test(n.tag) && textOf(n));
  const sub = elements.slice(headingIndex + 1).find((n) => n.tag === 'p' && textOf(n));
  return {
    heading: headingIndex >= 0 ? textOf(elements[headingIndex]) : null,
    subheading: sub ? textOf(sub) : null,
    items: scriptProperty(script, 'experiences') ?? [],
  };
}

function readTitleSuffix(file) {
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, 'utf8').match(/document\.title\s*=[^\n]*?['"`]\s*[-|·:]\s*([^'"`]+?)['"`]/);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------- helpers

function readOverrides() {
  const file = path.join(ROOT, 'content.overrides.json');
  if (!fs.existsSync(file)) return {};
  const strip = (value) => {
    if (Array.isArray(value)) return value.map(strip);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, strip(v)]));
    }
    return value;
  };
  return strip(JSON.parse(fs.readFileSync(file, 'utf8')));
}

/** The old site stores "no link" as the string 'null'. */
function cleanLink(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' || text === 'null' || text === '#' ? null : text;
}

function linkKind(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (/(^|\.)github\.com$/.test(hostname)) return pathname.split('/').filter(Boolean).length <= 1 ? 'github-profile' : 'github-repo';
    if (/(^|\.)figma\.com$/.test(hostname)) return 'prototype';
    return 'site';
  } catch {
    return 'site';
  }
}

function toUrl(text) {
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function splitList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function pick(override, imported) {
  return override === undefined || override === null ? imported : override;
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
}

function checkTypos(label, text) {
  for (const [wrong, right] of Object.entries(KNOWN_TYPOS)) {
    if (new RegExp(`\\b${wrong}\\b`).test(text ?? '')) {
      report.issues.push(`Kemungkinan typo di ${label}: "${wrong}" (maksudnya "${right}"?). Tidak diubah.`);
    }
  }
}

const loose = (s) => String(s ?? '').toLowerCase().replace(/\bpt\b\.?/g, '').replace(/[^a-z0-9]+/g, '');

// ---------------------------------------------------------------- main

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      git: { type: 'string' },
      ref: { type: 'string' },
      force: { type: 'boolean', default: false },
    },
  });
  const src = resolveSource(values);
  const at = (rel) => path.join(src, rel);
  for (const rel of [SOURCE.home, SOURCE.about, SOURCE.projects, SOURCE.experience]) {
    if (!fs.existsSync(at(rel))) throw new Error(`Source file not found: ${at(rel)}\nPass --source <path to the old site repo>.`);
  }
  const overrides = readOverrides();
  const origin = sourceInfo(src);
  console.log(`Importing from ${src}${origin.commit ? ` @ ${origin.commit}` : ''}`);

  const home = readHome(at(SOURCE.home));
  const app = fs.existsSync(at(SOURCE.app)) ? readApp(at(SOURCE.app)) : { brand: null, github: null };
  const about = readAbout(at(SOURCE.about));
  const sourceProjects = readProjects(at(SOURCE.projects));
  const sourceExperience = readExperience(at(SOURCE.experience));
  const titleSuffix = readTitleSuffix(at(SOURCE.router));

  // ------------------------------------------------ projects + previews
  const previewDir = at(SOURCE.previews);
  const previewFiles = fs.existsSync(previewDir) ? fs.readdirSync(previewDir).filter((f) => PREVIEW_FILE.test(f)).sort() : [];
  const previews = new Map(previewFiles.map((f) => [f.match(PREVIEW_FILE)[1], f]));
  const otherImages = fs.existsSync(previewDir) ? fs.readdirSync(previewDir).filter((f) => !PREVIEW_FILE.test(f)) : [];
  if (otherImages.length) {
    report.notes.push(`File lain di \`${SOURCE.previews}\` yang bukan preview website dan tidak diimpor: ${otherImages.map((f) => `\`${f}\``).join(', ')}.`);
  }

  const drafts = [];
  const claimed = new Set();
  sourceProjects.items.forEach((item, index) => {
    const key = item.imageUrl ?? null;
    const previewFile = key && previews.get(key);
    if (key && previewFile) claimed.add(key);
    if (!previewFile) report.todo.push(`Proyek "${item.name}": file preview \`portfolio-${key}.*\` tidak ditemukan.`);
    drafts.push({
      id: key ?? slugify(item.name),
      name: item.name ?? null,
      description: item.status ?? null,
      tech: splitList(item.tech),
      links: { demo: cleanLink(item.demo), github: cleanLink(item.github) },
      rawLinks: { demo: item.demo, github: item.github },
      previewFile,
      placeholder: false,
      sourceIndex: index,
    });
  });
  for (const [key, file] of previews) {
    if (claimed.has(key)) continue;
    drafts.push({
      id: key,
      name: tidyFileName(key),
      description: null,
      tech: [],
      links: { demo: null, github: null },
      rawLinks: {},
      previewFile: file,
      placeholder: true,
      sourceIndex: Number.MAX_SAFE_INTEGER,
    });
  }

  const projectOverrides = overrides.projects ?? {};
  const nullLinks = [];
  const slugs = new Set();
  const projects = [];
  const keepImages = new Set();
  for (const draft of drafts) {
    const o = projectOverrides[draft.id] ?? {};
    const name = pick(o.name, draft.name);
    const project = {
      id: draft.id,
      slug: '',
      name,
      nameFromFile: draft.placeholder && (o.name === undefined || o.name === null),
      description: pick(o.description, draft.description),
      tech: o.tech ? splitList(o.tech) : draft.tech,
      links: {
        demo: pick(o.links?.demo, draft.links.demo),
        github: pick(o.links?.github, draft.links.github),
      },
      linkKinds: {},
      hidden: o.hidden === true,
      order: typeof o.order === 'number' ? o.order : null,
      image: null,
      source: { file: draft.placeholder ? null : SOURCE.projects, image: draft.previewFile ? `${SOURCE.previews}/${draft.previewFile}` : null },
      sourceIndex: draft.sourceIndex,
    };
    for (const [k, url] of Object.entries(project.links)) if (url) project.linkKinds[k] = linkKind(url);

    let slug = slugify(project.name) || project.id;
    while (slugs.has(slug)) slug += '-2';
    slugs.add(slug);
    project.slug = slug;

    // checks on the imported (not overridden) data
    const label = `proyek "${project.name}"`;
    if (project.hidden) {
      report.todo.push(`Proyek \`${draft.id}\` disembunyikan lewat \`content.overrides.json\` — lihat catatan di file itu.`);
    } else {
      if (project.nameFromFile) report.todo.push(`Preview \`${draft.previewFile}\` tidak punya data proyek. Nama sementara dari nama file: "${project.name}". Lengkapi nama, deskripsi, tech, dan link di \`content.overrides.json\` → projects.${draft.id}.`);
      else {
        if (!project.description) report.todo.push(`${label}: deskripsi kosong.`);
        if (!project.tech.length) report.todo.push(`${label}: daftar tech kosong di repo.`);
      }
    }
    for (const [k, raw] of Object.entries(draft.rawLinks)) {
      if (raw === 'null') nullLinks.push(`${project.name} (${k})`);
    }
    if (project.linkKinds.github === 'github-profile') {
      report.issues.push(`${label}: link "github" (${project.links.github}) mengarah ke profil GitHub, bukan repo proyek. Ditampilkan sebagai "GitHub profile".`);
    }
    checkTypos(label, `${project.name} ${project.description ?? ''}`);

    if (draft.previewFile && !project.hidden) {
      const { descriptor, files } = await processPreview({
        input: path.join(previewDir, draft.previewFile),
        id: draft.id,
        outDir: IMAGES_OUT,
        publicBase: `${PUBLIC_BASE}/images/projects`,
        force: values.force,
      });
      files.forEach((f) => keepImages.add(f));
      project.image = { ...descriptor, alt: `Preview of ${project.name}` };
      process.stdout.write(`  ✓ ${draft.previewFile} → ${descriptor.width}×${descriptor.height}, accent ${descriptor.accent ?? '—'}\n`);
    }
    projects.push(project);
  }
  if (nullLinks.length) {
    report.notes.push(`Link yang berisi teks 'null' di repo dianggap tidak ada: ${nullLinks.join(', ')}.`);
  }
  projects.sort((a, b) => (a.order ?? a.sourceIndex) - (b.order ?? b.sourceIndex) || a.id.localeCompare(b.id));
  const removed = removeStale(IMAGES_OUT, keepImages);
  if (removed.length) console.log(`  removed ${removed.length} stale image file(s)`);

  // ------------------------------------------------ experience
  const order = overrides.experience?.order ?? 'start-desc';
  const experience = sourceExperience.items.map((e, index) => {
    const period = parsePeriod(e.year);
    if (!period.start) report.issues.push(`Pengalaman "${e.role}" (${e.company}): periode "${e.year}" tidak bisa dibaca sebagai tanggal.`);
    checkTypos(`pengalaman "${e.role}"`, `${e.role} ${e.company} ${e.description}`);
    for (const field of ['role', 'company', 'year', 'description']) {
      if (!e[field]) report.todo.push(`Pengalaman #${index + 1}: field "${field}" kosong.`);
    }
    return {
      id: String(e.id ?? index + 1),
      role: e.role ?? null,
      company: e.company ?? null,
      period: e.year ?? null,
      start: period.start,
      end: period.end,
      ongoing: period.ongoing,
      description: e.description ?? null,
      sourceIndex: index,
    };
  });
  const chronological = [...experience].sort((a, b) => (b.start ?? '').localeCompare(a.start ?? '') || a.sourceIndex - b.sourceIndex);
  if (chronological.some((e, i) => e !== experience[i])) {
    report.notes.push(
      order === 'start-desc'
        ? 'Urutan pengalaman di repo tidak kronologis; situs menampilkannya dari yang terbaru (bulan mulai). Ubah `experience.order` ke "source" di `content.overrides.json` untuk memakai urutan repo.'
        : 'Urutan pengalaman di repo tidak kronologis; dipertahankan sesuai repo (`experience.order: "source"`).',
    );
  }
  const experienceItems = order === 'start-desc' ? chronological : experience;

  // company names written differently between projects and experience
  for (const e of experience) {
    const twin = projects.find((p) => loose(p.name) === loose(e.company) && p.name !== e.company);
    if (twin) report.issues.push(`Penulisan nama tidak konsisten: "${e.company}" (Pengalaman) vs "${twin.name}" (Proyek). Tidak diubah.`);
  }

  // ------------------------------------------------ skills
  const skillGroups = about.skillGroups
    .filter((g) => g.items.length)
    .map((g) => ({ label: g.label, items: g.items.map((i) => ({ name: i.name, detail: i.status ?? null })) }));
  const levels = [...new Set(about.skillGroups[0]?.items.map((i) => i.status).filter(Boolean) ?? [])];
  for (const a of levels) {
    const b = levels.find((l) => l !== a && l.toLowerCase().startsWith(a.toLowerCase()));
    if (b) report.issues.push(`Level skill tidak konsisten: "${a}" dan "${b}" dipakai bersamaan. Tidak diubah (level tidak ditampilkan di situs).`);
  }

  // ------------------------------------------------ CV + contact
  const publicDir = at(SOURCE.publicDir);
  const publicFiles = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
  const pdfs = publicFiles.filter((f) => /\.pdf$/i.test(f) && /cv|resume/i.test(f));
  let cv = null;
  let cvContact = { email: null, linkedin: null, phone: null };
  if (pdfs.length) {
    const hrefName = home.cvLink ? decodeURIComponent(path.posix.basename(home.cvLink.href)) : null;
    const byHash = new Map();
    for (const f of pdfs) byHash.set(fileHash(path.join(publicDir, f)), [...(byHash.get(fileHash(path.join(publicDir, f))) ?? []), f]);
    for (const group of byHash.values()) {
      if (group.length > 1) report.issues.push(`File CV duplikat (isi identik): ${group.map((f) => `\`${f}\``).join(', ')}.`);
    }
    const chosen =
      pdfs.find((f) => f === hrefName) ??
      pdfs.find((f) => hrefName && f.toLowerCase() === hrefName.toLowerCase()) ??
      [...pdfs].sort((a, b) => a.length - b.length)[0];
    if (hrefName && !publicFiles.includes(hrefName)) {
      report.issues.push(
        `Tombol "${home.cvLink.label}" di situs lama mengarah ke \`${home.cvLink.href}\`, tapi file itu tidak ada (yang ada: ${pdfs.map((f) => `\`${f}\``).join(', ')}). Di hosting yang peka huruf besar/kecil link ini rusak. Situs baru memakai \`${chosen}\`.`,
      );
    }
    fs.mkdirSync(FILES_OUT, { recursive: true });
    removeStale(FILES_OUT, new Set([chosen]));
    fs.copyFileSync(path.join(publicDir, chosen), path.join(FILES_OUT, chosen));
    cv = {
      label: home.cvLink?.label ?? null,
      href: `${PUBLIC_BASE}/files/${encodeURIComponent(chosen)}`,
      fileName: chosen,
      bytes: fs.statSync(path.join(publicDir, chosen)).size,
    };
    cvContact = findContact(await readPdfText(path.join(publicDir, chosen)));
    report.notes.push(`Email dan LinkedIn diambil dari teks CV \`${chosen}\` (situs lama tidak punya halaman kontak).`);
    if (cvContact.phone) report.notes.push('CV juga berisi nomor HP dan alamat rumah; keduanya tidak dipublikasikan (lihat `contact.showPhone`).');
  } else {
    report.todo.push('Tidak ada file CV (PDF) di folder public repo sumber.');
  }
  for (const f of publicFiles) {
    const size = fs.statSync(path.join(publicDir, f)).size;
    if (/\.(exe|msi|dmg|zip)$/i.test(f) || size > 20 * 1024 * 1024) {
      report.issues.push(`File \`${SOURCE.publicDir}/${f}\` (${(size / 1048576).toFixed(1)} MB) ikut dipublikasikan oleh situs lama dan membengkakkan repo. Tidak diimpor.`);
    }
  }

  const contactOverrides = overrides.contact ?? {};
  const email = pick(contactOverrides.email, cvContact.email);
  const linkedin = pick(contactOverrides.linkedin, cvContact.linkedin);
  const github = pick(contactOverrides.github, app.github);
  const contact = {
    email,
    linkedin: linkedin ? { label: linkedin.replace(/^https?:\/\//i, ''), url: toUrl(linkedin) } : null,
    github: github ? { label: github.replace(/^https?:\/\//i, '').replace(/\/$/, ''), url: github } : null,
    ...(contactOverrides.showPhone && cvContact.phone ? { phone: cvContact.phone } : {}),
  };
  if (!email) report.todo.push('Email kontak tidak ditemukan (isi `contact.email` di `content.overrides.json`).');
  if (!linkedin) report.todo.push('Link LinkedIn tidak ditemukan.');
  if (linkedin && !/^https?:\/\//i.test(linkedin)) report.notes.push(`Link LinkedIn di CV ditulis tanpa "https://" (${linkedin}); situs menambahkan https:// pada link-nya.`);

  // ------------------------------------------------ hero headline
  let headline = null;
  const headlineOverride = overrides.hero?.headline;
  const aboutSentences = about.paragraphs.map((p) => sentences(p));
  if (typeof headlineOverride === 'string') headline = headlineOverride;
  else if (headlineOverride && typeof headlineOverride === 'object') headline = aboutSentences[headlineOverride.paragraph]?.[headlineOverride.sentence] ?? null;
  else headline = aboutSentences.flat().find((s) => /^(I'm|I’m|I am)\b/.test(s)) ?? aboutSentences[0]?.[0] ?? null;
  if (headline) report.notes.push(`Kalimat hero diambil dari Tentang Saya: "${headline}"`);

  for (const role of home.roles) checkTypos(`peran hero "${role}"`, role);
  about.paragraphs.forEach((p, i) => checkTypos(`paragraf Tentang Saya #${i + 1}`, p));

  // ------------------------------------------------ write
  fs.mkdirSync(OUT, { recursive: true });
  const visibleProjects = projects.filter((p) => !p.hidden);
  writeJson('profile.json', {
    _generated: { by: 'scripts/import-content.mjs', source: origin, note: 'Do not edit. Run npm run import; put fixes in content.overrides.json.' },
    name: home.name,
    brand: app.brand,
    titleSuffix,
    greeting: home.greeting,
    roles: home.roles,
    welcome: home.welcome,
    headline,
    about: { heading: about.heading, paragraphs: about.paragraphs },
    skills: { heading: about.skillsHeading, groups: skillGroups },
    cv,
    contact,
  });
  writeJson('projects.json', {
    heading: sourceProjects.heading,
    subheading: sourceProjects.subheading,
    textureWidths: TEXTURE_WIDTHS,
    items: visibleProjects.map(({ sourceIndex, hidden, order: _order, ...p }) => p),
  });
  writeJson('experience.json', {
    heading: sourceExperience.heading,
    subheading: sourceExperience.subheading,
    order,
    items: experienceItems.map(({ sourceIndex, ...e }) => e),
  });

  writeReport({ origin, src, home, about, projects, visibleProjects, experienceItems, contact });
  console.log(
    `\nDone: ${visibleProjects.length} projects (${projects.length - visibleProjects.length} hidden), ${experienceItems.length} experience entries, ` +
      `${about.paragraphs.length} About paragraphs.\n${report.todo.length} item(s) to complete and ${report.issues.length} issue(s) — see IMPORT_REPORT.md`,
  );
}

function writeReport({ origin, src, home, about, projects, visibleProjects, experienceItems, contact }) {
  const list = (items) => (items.length ? items.map((i) => `- ${i}`).join('\n') : '- (tidak ada)');
  const md = `# Laporan impor konten

Dibuat otomatis oleh \`npm run import\`. Jangan diedit; isi data yang kurang di \`content.overrides.json\` lalu jalankan impor lagi.

- Sumber: ${origin.repo ? `\`${origin.repo}\`` : `\`${path.relative(ROOT, src) || src}\``}${origin.commit ? ` @ \`${origin.commit}\`` : ''}
- Nama: ${home.name ?? '—'}
- Proyek: ${visibleProjects.length} tampil, ${projects.length - visibleProjects.length} disembunyikan
- Pengalaman: ${experienceItems.length} entri
- Tentang Saya: ${about.paragraphs.length} paragraf
- Kontak: ${[contact.email && 'email', contact.linkedin && 'LinkedIn', contact.github && 'GitHub'].filter(Boolean).join(', ') || '—'}

## Data yang perlu dilengkapi

${list(report.todo)}

## Data janggal di repo sumber (tidak diubah)

${list(report.issues)}

## Catatan impor

${list(report.notes)}
`;
  fs.writeFileSync(path.join(ROOT, 'IMPORT_REPORT.md'), md);
}

main().catch((error) => {
  console.error(`\nImport failed: ${error.message}`);
  process.exit(1);
});
