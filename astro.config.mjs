import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/site.config.js";

export default defineConfig({
  site: SITE.url,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({
      // Utility pages carry no search value; keep them out of the sitemap.
      filter: (page) => !/\/(404|thanks)\/?$/.test(page),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
