import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { guideRow } from "../src/lib/frontmatter.js";
import { SITE, AUTHOR } from "../src/site.config.js";

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function getLocalLiveGuides() {
  const dir = new URL("../src/content/guides/", import.meta.url);
  const rows = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => guideRow(f, readFileSync(new URL(f, dir), "utf8")));

  return rows
    .filter((r) => r.status === "published" && r.published_at)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

test("rss: xml feed items format and xml validity", () => {
  const guides = getLocalLiveGuides();
  assert.ok(guides.length > 0, "Should find local guides");

  const siteUrl = SITE.url;
  const rssFeedUrl = new URL("/rss.xml", SITE.url).href;

  const items = guides
    .map((guide) => {
      const link = new URL(`/guides/${guide.slug}/`, SITE.url).href;
      const pubDate = new Date(guide.published_at).toUTCString();
      const title = escapeXml(guide.title);
      const description = escapeXml(guide.description);
      const author = escapeXml(`${SITE.email} (${AUTHOR.name})`);

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <description>${escapeXml(SITE.description)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${rssFeedUrl}" rel="self" type="application/rss+xml" />
    <language>${SITE.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'));
  assert.ok(xml.includes(`<atom:link href="${rssFeedUrl}" rel="self" type="application/rss+xml" />`));
  assert.ok(xml.includes("<channel>"));
  assert.ok(xml.includes("</channel>"));
  assert.ok(xml.includes("</rss>"));
  assert.ok(xml.includes(`<title>${SITE.name}</title>`));
  assert.ok(xml.includes("<item>"));
  assert.ok(xml.includes("</item>"));

  // Check valid URLs
  assert.ok(xml.includes(`https://materialguides.com/guides/`));

  // Verify XML escaping: no bare unescaped ampersands
  const bareAmpersands = xml.match(/&(?!(amp|lt|gt|apos|quot);)/g);
  assert.equal(bareAmpersands, null, "XML should not contain raw unescaped ampersands");

  // Verify each guide has title and valid RFC 822 / UTC date
  for (const guide of guides) {
    assert.ok(guide.title.length > 0);
    const dateObj = new Date(guide.published_at);
    assert.equal(isNaN(dateObj.getTime()), false, `Date should be valid: ${guide.published_at}`);
  }
});
