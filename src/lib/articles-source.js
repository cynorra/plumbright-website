// Where guides come from.
// - SUPABASE_URL and SUPABASE_ANON_KEY set: live articles are fetched from
//   Supabase at build time and rendered to static HTML.
// - Not set: the Markdown files in src/content/guides/ are used (local work,
//   first launch before the database exists).
// Either way, only "live" guides are built: not drafts, and not guides whose
// publish date is still in the future. Set PREVIEW_FUTURE=1 to see
// scheduled local guides while writing them (never in a deploy).
// Used by both the content collection and the sitemap, so they always agree.
import { loadEnv } from "vite";
import { readdirSync, readFileSync } from "node:fs";
import { guideRow } from "./frontmatter.js";

const env = { ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""), ...process.env };

export const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY ?? "";
export const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const previewFuture = env.PREVIEW_FUTURE === "1";

const COLUMNS = "slug,title,description,body_md,tool,published_at,content_updated_at,author_slug";

/**
 * Published articles whose publish time has passed. RLS enforces the same
 * rule on the server; the filters here keep the request explicit.
 * Throws on any error so a failed fetch fails the build instead of
 * deploying a site with its guides missing.
 */
export async function fetchLiveArticles() {
  const now = new Date().toISOString();
  const url =
    `${SUPABASE_URL}/rest/v1/articles?select=${COLUMNS}` +
    `&status=eq.published&published_at=lte.${encodeURIComponent(now)}&order=published_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase returned ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  return res.json();
}

/** "2026-10-20" from an ISO timestamp. */
export const day = (iso) => (iso ? iso.slice(0, 10) : undefined);

/** Updated date only when the words changed on a later day than publication. */
export function updatedDay(row) {
  const pub = day(row.published_at);
  const upd = day(row.content_updated_at);
  return upd && upd > pub ? upd : undefined;
}

/** Every local guide file as an articles row (drafts and scheduled included). */
export function localRows() {
  const dir = new URL("../content/guides/", import.meta.url);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => guideRow(f, readFileSync(new URL(f, dir), "utf8")));
}

/** Local guides that would be live right now, newest first. */
export function localLiveArticles(now = new Date()) {
  return localRows()
    .filter((r) => r.status === "published" && (previewFuture || new Date(r.published_at) <= now))
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}

/** Live articles from whichever source is active. */
export async function liveArticles() {
  return useSupabase ? fetchLiveArticles() : localLiveArticles();
}

/** { slug: lastmodDay } for the sitemap. */
export async function guideLastmods() {
  const rows = await liveArticles();
  return Object.fromEntries(rows.map((r) => [r.slug, updatedDay(r) ?? day(r.published_at)]));
}
