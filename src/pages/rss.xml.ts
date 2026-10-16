import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, AUTHOR } from "../site.config.js";

function escapeXml(unsafe: string): string {
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

export const GET: APIRoute = async () => {
  const guides = (await getCollection("guides", (g) => !g.data.draft)).sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime(),
  );

  const rssFeedUrl = new URL("/rss.xml", SITE.url).href;
  const siteUrl = SITE.url;

  const items = guides
    .map((guide) => {
      const link = new URL(`/guides/${guide.id}/`, SITE.url).href;
      const pubDate = guide.data.published.toUTCString();
      const title = escapeXml(guide.data.title);
      const description = escapeXml(guide.data.description);
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

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
