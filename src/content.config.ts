import { defineCollection, z } from "astro:content";
import type { Loader } from "astro/loaders";
import { glob } from "astro/loaders";
import { useSupabase, fetchLiveArticles, day, updatedDay } from "./lib/articles-source.js";

const schema = z.object({
  title: z.string().max(80),
  description: z.string().min(70).max(165),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  // Which calculator this guide supports: drives the tool box and internal links.
  tool: z.enum(["concrete", "tile", "paint"]),
  draft: z.boolean().default(false),
});

/** Live articles from Supabase, rendered to HTML at build time. */
const supabaseArticles: Loader = {
  name: "supabase-articles",
  async load({ store, parseData, renderMarkdown, generateDigest, logger }) {
    const rows = await fetchLiveArticles();
    logger.info(`Loaded ${rows.length} live article(s) from Supabase`);
    store.clear();
    for (const row of rows) {
      const data = await parseData({
        id: row.slug,
        data: {
          title: row.title,
          description: row.description,
          published: day(row.published_at),
          updated: updatedDay(row),
          tool: row.tool,
          draft: false,
        },
      });
      store.set({
        id: row.slug,
        data,
        body: row.body_md,
        rendered: await renderMarkdown(row.body_md),
        digest: generateDigest(row),
      });
    }
  },
};

const guides = defineCollection({
  loader: useSupabase ? supabaseArticles : glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema,
});

export const collections = { guides };
