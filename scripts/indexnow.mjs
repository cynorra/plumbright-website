// Tell IndexNow engines (Bing, Yandex, Seznam, Naver, Yep...) which URLs are new
// or changed, right after a deploy. Google does not use IndexNow; it reads the
// sitemap (submit it once in Search Console).
//
//   node scripts/indexnow.mjs                 # every URL in the built sitemap
//   node scripts/indexnow.mjs --since 2026-10-20   # only URLs with lastmod on/after that date
//   node scripts/indexnow.mjs --dry-run       # print, don't send
//
// Run it after the new version is live, so the engines fetch the new content.
import { readFileSync, readdirSync } from "node:fs";
import { SITE } from "../src/site.config.js";

const args = process.argv.slice(2);
const since = args.includes("--since") ? args[args.indexOf("--since") + 1] : null;
const dry = args.includes("--dry-run");

const dist = new URL("../dist/", import.meta.url);
const files = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f));
if (!files.length) throw new Error("No sitemap in dist/. Run npm run build first.");

const urls = [];
for (const f of files) {
  const xml = readFileSync(new URL(f, dist), "utf8");
  for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)) {
    const [, loc, lastmod] = m;
    if (!since || (lastmod && lastmod.slice(0, 10) >= since)) urls.push(loc);
  }
}
if (!urls.length) {
  console.log("Nothing to submit.");
  process.exit(0);
}

const baseUrl = process.env.INDEXNOW_URL || SITE.url;
const host = process.env.INDEXNOW_HOST || new URL(baseUrl).host;

const body = {
  host,
  key: SITE.indexNowKey,
  keyLocation: `${baseUrl}/indexnow-key.txt`,
  urlList: urls.map((u) => (baseUrl !== SITE.url ? u.replace(SITE.url, baseUrl) : u)).slice(0, 10000),
};
console.log(`Submitting ${body.urlList.length} URL(s) to IndexNow${dry ? " (dry run)" : ""}:`);
for (const u of body.urlList) console.log("  " + u);
if (dry) process.exit(0);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
// 200 = received, 202 = received and key check pending. 403 = key file not reachable yet.
console.log(`IndexNow responded ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exit(1);
