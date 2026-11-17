import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/site.config.js";
import { lastModified } from "./src/page-dates.js";
import { guideLastmods } from "./src/lib/articles-source.js";

// Real content dates for <lastmod>, from Supabase or the local Markdown guides.
// Bing and Google both use lastmod to decide what to recrawl, so it must change
// only when a page's content changes.
const GUIDE_DATES = Object.fromEntries(
  Object.entries(await guideLastmods()).map(([slug, d]) => [`/guides/${slug}/`, d]),
);
const toIso = (d) => (d ? `${d}T00:00:00+00:00` : undefined);

// A URL that public/_redirects sends elsewhere must not be in the sitemap
// (Search Console reports it as "Page with redirect" and it wastes crawl budget).
const REDIRECTED = new Set(
  readFileSync(new URL("./public/_redirects", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+/)[0])
    .filter((p) => p && p.startsWith("/") && !p.includes("*")),
);

export default defineConfig({
  site: SITE.url,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !/\/(404|thanks)\/?$/.test(page) && !REDIRECTED.has(new URL(page).pathname),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const date = GUIDE_DATES[path] ?? lastModified(path);
        if (!date) throw new Error(`Missing lastmod for ${path}: add it to src/page-dates.js`);
        // changefreq and priority are ignored by Google and Bing, so they are left out.
        return { url: item.url, lastmod: toIso(date) };
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
