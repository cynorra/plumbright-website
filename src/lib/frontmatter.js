// Minimal frontmatter reader for guide files: flat `key: value` lines only,
// which is all the guide schema uses. Shared by the build and push-guides.mjs
// so both read a file the same way.

export function parseGuide(text, file = "guide") {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  for (const k of ["title", "description", "published", "tool"]) {
    if (!fm[k]) throw new Error(`${file}: frontmatter is missing "${k}"`);
  }
  return { fm, body: m[2].trim() + "\n" };
}

/** A guide file as a row shaped like the Supabase `articles` table. */
export function guideRow(file, text) {
  const { fm, body } = parseGuide(text, file);
  const isDraft = fm.draft === "true";
  return {
    slug: file.replace(/\.md$/, ""),
    title: fm.title,
    description: fm.description,
    body_md: body,
    tool: fm.tool,
    status: isDraft ? "draft" : "published",
    // Noon UTC keeps the calendar date the same across US time zones.
    published_at: isDraft ? null : `${fm.published}T12:00:00Z`,
    // Local files carry an explicit updated date instead of a trigger.
    content_updated_at: fm.updated ? `${fm.updated}T12:00:00Z` : null,
    author_slug: "eren-simsir",
  };
}
