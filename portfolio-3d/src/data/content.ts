// Build-time access to the generated content in public/content (written by `npm run import`).
// Everything is validated here so a broken import fails the build with a readable message.
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'astro/zod';
import { glowFrom } from '../lib/color';
import type { SceneData } from '../lib/types';

const CONTENT_DIR = path.resolve(process.cwd(), 'public/content');

const link = z.string().url().nullable();
const imageSource = z.object({ src: z.string(), width: z.number() });
const imageSchema = z.object({
  width: z.number(),
  height: z.number(),
  aspect: z.number(),
  src: z.string(),
  sources: z.object({ avif: z.array(imageSource), webp: z.array(imageSource) }),
  texture: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
  lqip: z.string(),
  dominant: z.string(),
  accent: z.string().nullable(),
  luminance: z.number(),
  alt: z.string(),
});

const profileSchema = z.object({
  name: z.string(),
  brand: z.string().nullable(),
  titleSuffix: z.string().nullable(),
  greeting: z.string().nullable(),
  roles: z.array(z.string()),
  welcome: z.string().nullable(),
  headline: z.string().nullable(),
  about: z.object({ heading: z.string().nullable(), paragraphs: z.array(z.string()) }),
  photo: imageSchema.nullable().default(null),
  skills: z.object({
    heading: z.string().nullable(),
    groups: z.array(
      z.object({
        label: z.string().nullable(),
        items: z.array(z.object({ name: z.string(), detail: z.string().nullable() })),
      }),
    ),
  }),
  cv: z.object({ label: z.string().nullable(), href: z.string(), fileName: z.string(), bytes: z.number() }).nullable(),
  contact: z.object({
    email: z.string().email().nullable(),
    linkedin: z.object({ label: z.string(), url: z.string().url() }).nullable(),
    github: z.object({ label: z.string(), url: z.string().url() }).nullable(),
    phone: z.string().optional(),
  }),
});

const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nameFromFile: z.boolean(),
  description: z.string().nullable(),
  tech: z.array(z.string()),
  links: z.object({ demo: link, github: link }),
  linkKinds: z.record(z.string(), z.enum(['site', 'prototype', 'github-profile', 'github-repo'])),
  image: imageSchema.nullable(),
});

const projectsSchema = z.object({
  heading: z.string().nullable(),
  subheading: z.string().nullable(),
  items: z.array(projectSchema),
});

const experienceSchema = z.object({
  heading: z.string().nullable(),
  subheading: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      role: z.string().nullable(),
      company: z.string().nullable(),
      period: z.string().nullable(),
      start: z.string().nullable(),
      end: z.string().nullable(),
      ongoing: z.boolean(),
      description: z.string().nullable(),
    }),
  ),
});

function read<S extends z.ZodTypeAny>(file: string, schema: S): z.infer<S> {
  const full = path.join(CONTENT_DIR, file);
  if (!fs.existsSync(full)) throw new Error(`Missing ${full}. Run "npm run import" first.`);
  const result = schema.safeParse(JSON.parse(fs.readFileSync(full, 'utf8')));
  if (!result.success) throw new Error(`public/content/${file} does not match the expected shape:\n${result.error.message}`);
  return result.data;
}

/** Prefixes site-relative paths with the deploy base (e.g. /repo/ on GitHub Pages). */
export function withBase(p: string): string {
  if (/^(https?:|mailto:|data:)/.test(p)) return p;
  return import.meta.env.BASE_URL.replace(/\/$/, '') + p;
}

const LINK_LABELS = {
  site: 'Visit site',
  prototype: 'View prototype',
  'github-profile': 'GitHub profile',
  'github-repo': 'Source code',
} as const;

export function loadContent() {
  const profile = read('profile.json', profileSchema);
  const projectsFile = read('projects.json', projectsSchema);
  const experienceFile = read('experience.json', experienceSchema);

  const total = projectsFile.items.length;
  const projects = projectsFile.items.map((p, index) => ({
    ...p,
    index,
    number: String(index + 1).padStart(2, '0'),
    total,
    glow: glowFrom(p.image?.accent),
    links: (['demo', 'github'] as const)
      .filter((k) => p.links[k])
      .map((k) => {
        const kind = p.linkKinds[k] ?? 'site';
        return { kind, label: LINK_LABELS[kind], url: p.links[k] as string };
      }),
  }));
  const experience = experienceFile.items.map((e, index) => ({ ...e, index }));

  // "I'm a Full-stack developer with ..." -> "Full-stack developer" for the page title.
  const role = profile.headline?.match(/^I(?:'|’)?m an? (.+?)(?: with| who| based|[.,]|$)/i)?.[1] ?? null;

  return {
    profile: { ...profile, role },
    projects: { heading: projectsFile.heading, subheading: projectsFile.subheading, items: projects },
    experience: { heading: experienceFile.heading, subheading: experienceFile.subheading, items: experience },
  };
}

export type Content = ReturnType<typeof loadContent>;
export type Project = Content['projects']['items'][number];
export type ExperienceEntry = Content['experience']['items'][number];

export function sceneData(content: Content): SceneData {
  return {
    projects: content.projects.items.map((p) => ({
      slug: p.slug,
      name: p.name,
      aspect: p.image?.aspect ?? 16 / 9,
      glow: p.glow,
      textures: p.image
        ? { sm: withBase(p.image.texture.sm), md: withBase(p.image.texture.md), lg: withBase(p.image.texture.lg) }
        : null,
    })),
    experienceCount: content.experience.items.length,
    portrait: content.profile.photo
      ? {
          aspect: content.profile.photo.aspect,
          textures: {
            sm: withBase(content.profile.photo.texture.sm),
            md: withBase(content.profile.photo.texture.md),
            lg: withBase(content.profile.photo.texture.lg),
          },
        }
      : null,
  };
}
