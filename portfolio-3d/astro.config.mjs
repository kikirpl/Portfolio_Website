// @ts-check
import { defineConfig } from 'astro/config';

// Absolute site URL for canonical and Open Graph links. Set SITE_URL yourself, or let
// Netlify (URL) / Vercel (VERCEL_PROJECT_PRODUCTION_URL) provide it during their builds.
const site =
  process.env.SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export default defineConfig({
  site,
  // GitHub Pages project sites live under /<repo>/; set BASE_PATH=/<repo>/ there.
  base: process.env.BASE_PATH || '/',
  devToolbar: { enabled: false },
  vite: {
    build: { chunkSizeWarningLimit: 1400 },
  },
});
