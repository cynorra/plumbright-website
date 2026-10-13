// The real content dates of every non-guide page, in one place.
// Pages show these dates and the sitemap's <lastmod> uses them, so search
// engines (Bing in particular) recrawl a page only when its content changed.
// Change a page's date ONLY when you change what the page says.
// Guides keep their dates in their own frontmatter (published / updated).

export const PAGE_DATES = {
  "/": { published: "2026-10-13" },
  "/concrete-calculator/": { published: "2026-10-13" },
  "/tile-calculator/": { published: "2026-10-13" },
  "/paint-calculator/": { published: "2026-10-13" },
  "/flooring-calculator/": { published: "2026-10-13" },
  "/drywall-calculator/": { published: "2026-10-13" },
  "/gravel-calculator/": { published: "2026-10-13" },
  "/deck-calculator/": { published: "2026-10-13" },
  "/stair-calculator/": { published: "2026-10-13" },
  "/roofing-calculator/": { published: "2026-10-13" },
  "/square-footage-calculator/": { published: "2026-10-13" },
  "/calculators/": { published: "2026-10-13" },
  "/guides/": { published: "2026-10-13" },
  "/about/": { published: "2026-10-13" },
  "/author/eren-simsir/": { published: "2026-10-13" },
  "/contact/": { published: "2026-10-13" },
  "/methodology/": { published: "2026-10-13" },
  "/editorial-policy/": { published: "2026-10-13" },
  "/privacy/": { published: "2026-10-13" },
  "/terms/": { published: "2026-10-13" },
  "/disclaimer/": { published: "2026-10-13" },
};

/** { published: Date, updated?: Date } for a path. */
export function pageDates(path) {
  const d = PAGE_DATES[path];
  if (!d) throw new Error(`No date for ${path} in src/page-dates.js`);
  return {
    published: new Date(d.published),
    updated: d.updated ? new Date(d.updated) : undefined,
  };
}

/** The date that should appear as <lastmod>: updated if set, else published. */
export function lastModified(path) {
  const d = PAGE_DATES[path];
  return d ? d.updated ?? d.published : undefined;
}
