import type { APIRoute } from "astro";
import { SITE } from "../site.config.js";

// Proves to IndexNow that we own the host. scripts/indexnow.mjs points to it.
export const GET: APIRoute = () =>
  new Response(SITE.indexNowKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
