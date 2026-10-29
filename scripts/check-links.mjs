// Two link checks, run after `npm run build`:
// 1. Every internal link in dist/ points to a page that was built.
// 2. Scheduled guides only link to guides published on or before their own
//    date, so no live page ever links to a guide that isn't out yet.
//   node scripts/check-links.mjs
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { localRows } from "../src/lib/articles-source.js";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

if (existsSync(DIST)) {
  for (const file of walk(DIST)) {
    const html = readFileSync(file, "utf8");
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (href.startsWith("//")) continue;
      const target = join(DIST, href);
      const ok = href.endsWith("/") ? existsSync(join(target, "index.html")) : existsSync(target);
      if (!ok) problems.push(`${file.replace(DIST, "/")} -> ${href}`);
    }
  }
} else {
  console.warn("dist/ not found: run npm run build first. Checking guide dates only.");
}

const rows = localRows();
const date = Object.fromEntries(rows.map((r) => [r.slug, r.published_at]));
for (const r of rows) {
  for (const m of r.body_md.matchAll(/\]\(\/guides\/([^/)]+)\/?\)|href="\/guides\/([^/"]+)/g)) {
    const slug = m[1] ?? m[2];
    if (!(slug in date)) problems.push(`${r.slug}: links to missing guide ${slug}`);
    else if (r.published_at && date[slug] && date[slug] > r.published_at) {
      problems.push(`${r.slug} (${r.published_at.slice(0, 10)}) links to ${slug}, which publishes later (${date[slug].slice(0, 10)})`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} link problem(s):\n` + [...new Set(problems)].join("\n"));
  process.exit(1);
}
console.log("Links OK");
