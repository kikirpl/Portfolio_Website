// sitemap.xml needs absolute URLs, so it is only generated when the site URL is known
// (SITE_URL, or the URL Netlify/Vercel provide at build time; see astro.config.mjs).
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => (import.meta.env.SITE ? [{ params: { sitemap: 'sitemap' } }] : []);

export const GET: APIRoute = ({ site }) => {
  const home = new URL(import.meta.env.BASE_URL, site).href;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${home}</loc></url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
