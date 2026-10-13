import type { APIRoute } from "astro";
import { SITE } from "../site.config.js";

// Allow everything, including Googlebot and the AdSense crawler (Mediapartners-Google).
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nUser-agent: Mediapartners-Google\nAllow: /\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
