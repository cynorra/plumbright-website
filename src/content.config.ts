import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().min(70).max(165),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    // Which calculator this guide supports: drives the tool box and internal links.
    tool: z.enum(["concrete", "tile", "paint"]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
