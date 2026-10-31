// Adds cover-photo prompts for guides that do not have one yet, then rewrites
//   prompts.json, prompts.txt and GUIDE_IMAGE_PROMPTS.md (same format as before).
// Existing prompts are never changed.
//
//   node scripts/update-prompts.mjs            # add missing prompts (Gemini text model, template fallback)
//   node scripts/update-prompts.mjs --dry-run  # show what would be added
//   node scripts/update-prompts.mjs --rewrite  # re-render the txt/md files from prompts.json (after hand-editing a prompt)
//
// Workflow: generate the image with the prompt, save it as public/images/guides/<slug>.webp (or .jpg/.png)
// and delete the generated public/images/guides/<slug>.svg; the site picks the photo up on the next build.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { parseGuide } from "../src/lib/frontmatter.js";

const SUFFIX = "--ar 16:9 --style raw --v 6.0";
const NEGATIVE =
  "no corporate stock photos, no fake smiling models looking at camera, no artificial 3D cartoon, no floating text, no distorted tools, no watermark, no blurred low-res";
const dryRun = process.argv.includes("--dry-run");

const env = { ...process.env };
if (existsSync(".env")) {
  for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const i = l.indexOf("=");
    if (i > 0 && !l.trim().startsWith("#")) env[l.slice(0, i).trim()] ??= l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const items = JSON.parse(readFileSync("prompts.json", "utf8"));
const have = new Set(items.map((i) => i.slug));
const dir = new URL("../src/content/guides/", import.meta.url);
const missing = readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => ({ slug: f.replace(/\.md$/, ""), ...parseGuide(readFileSync(new URL(f, dir), "utf8"), f).fm }))
  .filter((g) => !have.has(g.slug))
  .sort((a, b) => a.published.localeCompare(b.published) || a.slug.localeCompare(b.slug));

if (!missing.length && !process.argv.includes("--rewrite")) {
  console.log("Every guide already has a prompt.");
  process.exit(0);
}

const examples = items.slice(-6).map((i) => `- ${i.title}: ${i.prompt}`).join("\n");

async function geminiPrompt(g) {
  if (!env.GEMINI_API_KEY) return null;
  const ask = `Write ONE image-generation prompt (Midjourney style, one line, 35-60 words) for the cover photo of a DIY home-improvement guide.
Guide title: "${g.title}"
Category: ${g.tool}
Summary: ${g.description}

Style rules, copy the style of these existing prompts:
${examples}

Rules: photorealistic editorial jobsite photo, concrete real objects and tools that match the topic, a camera/lens or lighting hint, no people looking at camera, no text or numbers in the image. Do NOT end with parameters. Output only the prompt text.`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: ask }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } } }),
    });
    if (!res.ok) return null;
    const text = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return null;
    const clean = text.replace(/\s+--(ar|style|v).*$/s, "").replace(/\s+/g, " ").replace(/^["`]|["`]$/g, "").trim();
    return clean.split(" ").length >= 20 ? clean : null; // a cut-off answer is worse than the template
  } catch {
    return null;
  }
}

const fallback = (g) =>
  `Authentic jobsite close-up illustrating "${g.title.replace(/[?:]/g, "")}", real ${g.tool} materials and the tools used for the job, tape measure for scale, natural daylight, shallow depth of field, editorial construction photography`;

for (const g of missing) {
  const body = (await geminiPrompt(g)) || fallback(g);
  const index = items.length + 1;
  items.push({
    index,
    slug: g.slug,
    fileName: `${g.slug}.webp`,
    targetPath: `public/images/guides/${g.slug}.webp`,
    title: g.title,
    tool: g.tool,
    prompt: `${body} ${SUFFIX}`,
  });
  console.log(`+ [${index}] ${g.slug}\n    ${items.at(-1).prompt}`);
}
if (dryRun) process.exit(0);

const N = items.length;
const bar = "=".repeat(80);
const dash = "-".repeat(80);

let txt = `${bar}\nPLUMBRIGHT - BLOG KAPAK GÖRSEL PROMPTLARI (${N} REHBER)\n${bar}\nKAYIT KLASÖRÜ: public/images/guides/\nÖNERİLEN FORMAT: .webp (veya .jpg)\nÖLÇÜ: 16:9 (1200x675 veya 1280x720)\nNEGATİF PROMPT:\n${NEGATIVE}\n${bar}\n\n`;
for (const i of items) {
  txt += `[${i.index}/${N}] DOSYA ADI: ${i.fileName}\nBAŞLIK: ${i.title} (${i.tool})\nKAYDEDİLECEK YER: ${i.targetPath}\nPROMPT:\n${i.prompt}\n\n${dash}\n\n`;
}
writeFileSync("prompts.txt", txt, "utf8");
writeFileSync("prompts.json", JSON.stringify(items, null, 2), "utf8");

// The markdown guide keeps its hand-written intro; only the count and the table change.
const md = readFileSync("GUIDE_IMAGE_PROMPTS.md", "utf8").replace(/\r\n/g, "\n");
const head = md.slice(0, md.indexOf("## Tüm ")).trimEnd();
const rows = items
  .map((i) => `| ${i.index} | \`${i.fileName}\` | **${i.title}** (${i.tool}) | \`${i.prompt}\` |`)
  .join("\n");
writeFileSync(
  "GUIDE_IMAGE_PROMPTS.md",
  `${head}\n\n## Tüm ${N} Blog Yazısı İçin Özel Görsel Promptları\n\n| # | Dosya Adı (\`public/images/guides/\`) | Konu / Başlık | Midjourney / Flux Promptu |\n|---|---|---|---|\n${rows}\n`,
  "utf8"
);
console.log(`\nUpdated prompts.json, prompts.txt, GUIDE_IMAGE_PROMPTS.md (${N} guides).`);
