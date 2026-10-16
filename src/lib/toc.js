// Give every <h2> in rendered HTML a stable id and return a table of contents.
// Used on calculator pages, whose body is a slot rather than a content entry.

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function addHeadingIds(html) {
  const toc = [];
  const used = new Set();
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (match, attrs = "", inner) => {
    if (/\sid=/.test(attrs)) return match;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text) || "section";
    while (used.has(id)) id += "-2";
    used.add(id);
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

/** Extracts questions (<h3>) and answers (<p>) following "Questions people ask" */
export function extractFaqItems(html) {
  const faqSection = html.split(/<h2[^>]*id="questions-people-ask"[^>]*>|<h2[^>]*>Questions people ask<\/h2>/i)[1];
  if (!faqSection) return [];
  const afterH2 = faqSection.split(/<h2[^>]*>/i)[0];
  const items = [];
  const regex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = regex.exec(afterH2)) !== null) {
    const q = match[1].replace(/<[^>]+>/g, "").trim();
    const a = match[2].replace(/<[^>]+>/g, "").trim();
    if (q && a) items.push({ q, a });
  }
  return items;
}

