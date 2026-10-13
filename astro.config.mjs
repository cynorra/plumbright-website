import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync } from "node:fs";
import { SITE } from "./src/site.config.js";
import { lastModified } from "./src/page-dates.js";

// Real content dates for <lastmod>. Bing and Google both use lastmod to decide
// what to recrawl, so it must change only when a page's content changes.
function guideDates() {
  const dir = new URL("./src/content/guides/", import.meta.url);
  const map = {};
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const text = readFileSync(new URL(file, dir), "utf8");
    const fm = text.split("---")[1] ?? "";
    if (/^draft:\s*true/m.test(fm)) continue;
    const pick = (k) => fm.match(new RegExp(`^${k}:\\s*["']?([0-9-]+)`, "m"))?.[1];
    map[`/guides/${file.replace(/\.md$/, "")}/`] = pick("updated") ?? pick("published");
  }
  return map;
}
const GUIDE_DATES = guideDates();
const toIso = (d) => (d ? `${d}T00:00:00+00:00` : undefined);

export default defineConfig({
  site: SITE.url,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(404|thanks)\/?$/.test(page),
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
