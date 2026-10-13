import type { APIRoute } from "astro";
import { SITE } from "../site.config.js";

// Every search engine and AI crawler is welcome. The named groups below say
// so explicitly for each bot; a bot that finds its own group follows only that
// group, so each one repeats "Allow: /".
//
// Search engines: Google, Bing (also powers Copilot, DuckDuckGo results and
// ChatGPT's web index), Apple, DuckDuckGo, Yandex, Brave, Yahoo Japan, Naver, Seznam.
// AI answer engines and assistants: OpenAI, Anthropic, Perplexity, Google Gemini,
// Apple Intelligence, Meta, Amazon, Mistral, Cohere, DuckDuckGo Assist, You.com.
// Training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended,
// meta-externalagent) are allowed too, so the site is known to future models.
// Remove any line you do not want.
const BOTS = [
  // Search engines
  "Googlebot", "Googlebot-Image", "Bingbot", "MSNBot", "Applebot", "DuckDuckBot", "YandexBot",
  "Slurp", "Baiduspider", "Naverbot", "SeznamBot",
  // Ads
  "Mediapartners-Google", "AdsBot-Google",
  // AI search and answers
  "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User",
  "DuckAssistBot", "MistralAI-User", "YouBot", "Amazonbot", "meta-externalfetcher", "cohere-ai",
  // AI training / model knowledge
  "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent",
];

export const GET: APIRoute = () => {
  const groups = BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n");
  const body = `# ${SITE.name}: open to all search engines and AI crawlers.\n\nUser-agent: *\nAllow: /\n\n${groups}\n\nSitemap: ${SITE.url}/sitemap-index.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
