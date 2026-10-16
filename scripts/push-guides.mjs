// Upload Markdown guides from src/content/guides/ to Supabase (insert or update by slug).
// Write a guide locally, review it, then push it:
//
//   node scripts/push-guides.mjs                      # every file
//   node scripts/push-guides.mjs concrete-for-fence-posts   # one slug
//   node scripts/push-guides.mjs --dry-run
//
// Frontmatter decides publishing:
//   draft: true              -> saved as draft, not on the site
//   published: 2026-10-20    -> goes live on that date (a future date schedules it)
// Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (never commit the service key,
// never put it in the site build).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { guideRow } from "../src/lib/frontmatter.js";

const parseDotEnv = () => {
  const env = { ...process.env };
  if (existsSync(".env")) {
    const lines = readFileSync(".env", "utf8").split(/\r?\n/);
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!env[k]) env[k] = v;
      }
    }
  }
  return env;
};

const env = parseDotEnv();
const URL_ = env.SUPABASE_URL?.replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const only = args.filter((a) => !a.startsWith("--"));

if (!dry && (!URL_ || !KEY)) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}

const parse = (file) => {
  const { content_updated_at, author_slug, ...row } = guideRow(file, readFileSync(new URL(`../src/content/guides/${file}`, import.meta.url), "utf8"));
  return row; // the database sets content_updated_at and author_slug itself
};

const files = readdirSync(new URL("../src/content/guides/", import.meta.url))
  .filter((f) => f.endsWith(".md"))
  .filter((f) => !only.length || only.includes(f.replace(/\.md$/, "")));
const rows = files.map(parse);

for (const r of rows) {
  const when = r.status === "draft" ? "draft" : new Date(r.published_at) > new Date() ? `scheduled ${r.published_at.slice(0, 10)}` : `live since ${r.published_at.slice(0, 10)}`;
  console.log(`${r.slug.padEnd(48)} ${r.tool.padEnd(9)} ${when}`);
}
if (dry || !rows.length) process.exit(0);

const res = await fetch(`${URL_}/rest/v1/articles?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});
if (!res.ok) {
  console.error(`Supabase returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}
console.log(`Pushed ${rows.length} article(s). Rebuild the site (or wait for the webhook) to publish.`);
