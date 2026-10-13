import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/site.config.js";

export default defineConfig({
  site: SITE.url,
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !/\/(404|thanks)\/?$/.test(page),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
