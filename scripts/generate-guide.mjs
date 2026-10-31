// Automated High-Quality Article Generator for Plumbright (plumbright.com)
// Tailored for DIY construction, material calculations, and ZERO-CLICK AI OVERVIEW RESISTANCE.
// Features 100% Unique Topic Deduplication + Autonomous AI Topic Discovery.
//
// Usage:
//   node scripts/generate-guide.mjs                                  # Picks next unique topic from bank or discovers via AI
//   node scripts/generate-guide.mjs --today                          # Sets publish date to today for immediate live display
//   node scripts/generate-guide.mjs --topic "Concrete Slab Sizing"   # Custom topic
//   node scripts/generate-guide.mjs --tool concrete                  # Category filter (concrete|gravel|deck|paint|drywall|...)
//   node scripts/generate-guide.mjs --publish                        # Generates and pushes immediately to Supabase
//   node scripts/generate-guide.mjs --dry-run                        # Preview without saving to disk

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";
import { loadEnv } from "vite";
import { ZERO_CLICK_TOPIC_BANK } from "./lib/topic-bank.mjs";
import { validateGuide } from "./lib/guide-quality.mjs";
import { checkDuplicateTopic } from "./lib/topic-dedup.mjs";

const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const GEMINI_API_KEY = env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing from .env file!");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const forceToday = args.includes("--today") || args.includes("--immediate");
const customTopicIdx = args.indexOf("--topic");
const customTopic = customTopicIdx !== -1 ? args[customTopicIdx + 1] : null;
const toolFilterIdx = args.indexOf("--tool");
const toolFilter = toolFilterIdx !== -1 ? args[toolFilterIdx + 1] : null;

const GUIDES_DIR = join(process.cwd(), "src", "content", "guides");
const existingFiles = existsSync(GUIDES_DIR) ? readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md")) : [];
const existingSlugs = new Set(existingFiles.map((f) => f.replace(/\.md$/, "")));

// Read existing guides for internal linking and strict deduplication
const existingGuidesSummary = existingFiles.map((file) => {
  const content = readFileSync(join(GUIDES_DIR, file), "utf8");
  const title = content.match(/^title:\s*["']?([^"'\r\n]+)["']?/m)?.[1] || "";
  const date = content.match(/^published:\s*(\S+)/m)?.[1] || "";
  const tool = content.match(/^tool:\s*(\S+)/m)?.[1] || "";
  return {
    slug: file.replace(/\.md$/, ""),
    title,
    date,
    tool,
    href: `/guides/${file.replace(/\.md$/, "")}/`
  };
});

function callGeminiAPI(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: "generativelanguage.googleapis.com",
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode !== 200) {
            return reject(new Error(`Gemini API Error (${res.statusCode}): ${JSON.stringify(json.error || json)}`));
          }
          const finishReason = json.candidates?.[0]?.finishReason;
          if (finishReason === "MAX_TOKENS") {
            return reject(new Error("Gemini output was cut off (MAX_TOKENS); refusing to publish a truncated guide"));
          }
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            return reject(new Error("Empty response from Gemini API"));
          }
          resolve(text);
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Autonomous AI topic brainstorming that generates 100% unique topics
 * when all static topics in topic-bank.mjs are exhausted or match existing articles.
 */
async function discoverUniqueTopicWithAI() {
  console.log(`[AI Discovery] Searching for a high-intent, 100% unique topic not yet written...`);

  const existingTitles = existingGuidesSummary.map((g) => `- [${g.tool}] ${g.title}`).join("\n");
  const validTools = [
    "concrete", "gravel", "deck", "roofing", "fence", "brick", "mulch",
    "stairs", "tile", "flooring", "drywall", "carpet", "wallpaper", "paint", "area"
  ];
  const targetCategory = toolFilter || validTools[Math.floor(Math.random() * validTools.length)];

  const discoveryPrompt = `You are a principal SEO strategist and civil estimation specialist for Plumbright (https://plumbright.com).
We need a BRAND NEW, HIGH-INTENT, ZERO-CLICK RESISTANT calculation topic for our '${targetCategory}' tool category.

STRICT MANDATE - ZERO DUPLICATION:
Here is the complete list of ALL 44 articles currently published on Plumbright:
${existingTitles}

RULES:
1. NEVER repeat, rephrase, or closely mirror any existing title above.
2. Must address a real construction/DIY math problem (e.g. bag counts, thickness vs load, fastener spacing, waste factors, span tables).
3. Return ONLY a valid JSON object (no markdown quotes, no other text):
{
  "topic": "Specific Keyword-Targeted Title Under 75 Chars",
  "slug": "url-friendly-lowercase-slug-under-60-chars",
  "tool": "${targetCategory}",
  "primaryKeyword": "exact target search phrase",
  "formatType": "Material Estimation & Bag Count Guide | Code & Thickness Decision Matrix | Step-by-Step Substrate & Installation Walkthrough",
  "clickHook": "Why this needs a table and calculation rather than a 1-sentence answer"
}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: discoveryPrompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
  };

  const raw = await callGeminiAPI(payload);
  const cleanJson = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleanJson);

  // Validate that AI did not hallucinate a duplicate
  const dupCheck = checkDuplicateTopic(parsed.topic, existingGuidesSummary, 0.45);
  if (dupCheck.isDuplicate || existingSlugs.has(parsed.slug)) {
    console.warn(`[AI Discovery Retry] AI proposed topic was too similar to existing: "${parsed.topic}" -> Retrying...`);
    return discoverUniqueTopicWithAI();
  }

  return parsed;
}

async function getNextTopic() {
  if (customTopic) {
    const slug = customTopic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    const dup = checkDuplicateTopic(customTopic, existingGuidesSummary, 0.55);
    if (dup.isDuplicate) {
      console.warn(`[Warning] Custom topic "${customTopic}" is very similar to existing guide "${dup.matchedGuide.title}".`);
    }

    return {
      topic: customTopic,
      slug,
      tool: toolFilter || "concrete",
      primaryKeyword: customTopic,
      formatType: "Material Estimation & Bag Count Guide",
      clickHook: "Provides detailed imperial math formulas, material tables, and waste allowances.",
      calculatorLink: `/${toolFilter || "concrete"}-calculator/`
    };
  }

  // 1. First, search pre-configured topic bank for non-duplicate candidates
  for (const cand of ZERO_CLICK_TOPIC_BANK) {
    if (existingSlugs.has(cand.slug)) continue;
    if (toolFilter && cand.tool !== toolFilter) continue;

    // Strict similarity check against all existing guide titles
    const dupCheck = checkDuplicateTopic(cand.topic, existingGuidesSummary, 0.40, cand.tool);
    if (dupCheck.isDuplicate) {
      console.log(`[Skip Existing Concept] "${cand.topic}" skipped -> ${dupCheck.reason}`);
      continue;
    }

    // Found a genuinely unique topic from the bank!
    return cand;
  }

  // 2. If topic bank candidates are exhausted or all duplicate existing content,
  // autonomously discover a brand new unique topic via AI:
  return await discoverUniqueTopicWithAI();
}

function getNextPublishDate() {
  const today = new Date().toISOString().slice(0, 10);
  if (forceToday) {
    return today;
  }

  const dates = existingGuidesSummary.map((g) => g.date).filter(Boolean).sort();
  if (!dates.length) return today;

  const latest = dates[dates.length - 1];
  if (latest < today) return today;

  const nextDate = new Date(`${latest}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().slice(0, 10);
}

async function generateWithRetry(targetTopic, targetDate, maxAttempts = 3) {
  const toolSlugMap = {
    stairs: "stair",
    area: "square-footage"
  };
  const calcSlug = toolSlugMap[targetTopic.tool] || targetTopic.tool;
  const calcPath = `/${calcSlug}-calculator/`;

  const relevantGuides = existingGuidesSummary
    .filter((g) => (g.tool === targetTopic.tool || g.tool === "concrete") && g.date <= targetDate)
    .slice(-6);

  const internalLinksContext = relevantGuides
    .map((g) => `- "${g.title}": href="${g.href}"`)
    .join("\n");

  const systemInstruction = `You are a licensed building estimator and materials calculation specialist at Plumbright (https://plumbright.com), an authoritative DIY construction and home improvement platform.

PRIMARY OBJECTIVE: BEAT ZERO-CLICK SEARCH / AI OVERVIEWS
Provide actionable formulas, dimensional tables, and waste allowances that cannot be answered by a 1-sentence AI snippet:
1. Exact Formula Breakdown: Step-by-Step imperial math (cubic feet, cubic yards, square footage, bag weights).
2. Material Conversion Table: Must include a comprehensive Markdown/HTML table wrapped in <div class="table-wrap"><table>...</table></div>.
3. Realistic DIY Considerations: Excavation depth, gravel base drainage, fastener spacing, and 10% waste buffer.

EDITORIAL QUALITY MANDATES:
1. NO CLICKBAIT: No "guaranteed", "miracle", "secret trick", "contractors hate this".
2. NO FIRST-PERSON FICTION: Do not write "I poured", "in my 20 years contracting". Write with third-person instructional clarity.
3. NO INVENTED NUMBERS: Use real standard dimensions (e.g. 2x4 is 1.5x3.5 in, concrete bags: 50 lb = 0.375 cu ft, 80 lb = 0.60 cu ft).
4. OPENING SNIPPET (AEO TEASER):
   - The very first paragraph MUST start with **bold text** summarizing the direct rule-of-thumb answer in 40-50 words.
   - Then explain why hole depth, gravel base, or waste margins dictate checking the full table below.
5. MANDATORY MATERIAL TABLE & HEADINGS:
   - You MUST structure the article using at least 3-4 distinct '## Section Heading' markdown headers (e.g. ## How the Formula Works, ## Material Estimation Table, ## Worked Project Example, ## Setting Tips and Waste Allowance).
   - Must include a complete Markdown/HTML table wrapped in <div class="table-wrap"><table>...</table></div>.
6. MANDATORY LENGTH: The body MUST be detailed and comprehensive, containing at least 600 words of thorough technical explanation.
7. STRICT ANTI-DUPLICATION:
   - NEVER repeat or paraphrase any topic already written.
   - NEVER use generic formula titles like "The Ultimate Guide to...", "Complete Guide to...", "Everything You Need to Know".
   - Tailor the headings and structure specifically to this topic's Format Type ("${targetTopic.formatType || 'Actionable Guide'}").
8. INTERNAL LINKING:
   - You MUST explicitly include this exact link in the body text: [${targetTopic.tool} calculator](${calcPath}).
   - Also naturally integrate 1-2 relevant internal links to existing Plumbright guides from this list:
   ${internalLinksContext}

FORMAT REQUIRED:
Return ONLY valid raw Markdown with frontmatter:
---
title: "Crisp, keyword-focused title under 75 chars"
description: "Accurate, high-CTR meta description between 80-160 chars with exact dimensions or bags."
published: ${targetDate}
tool: ${targetTopic.tool}
---
**Bold rule-of-thumb answer paragraph...**

## How the Formula Works
Formula explanation...

## Material Estimation Table
<div class="table-wrap"><table>...</table></div>

## Worked Project Example
Step-by-step math...
`;

  const userPrompt = `Write an authoritative, high-value calculation guide for Plumbright:

Topic: "${targetTopic.topic}"
Target Tool: "${targetTopic.tool}"
Format Type: "${targetTopic.formatType || 'Material Calculation'}"
Strategic Hook: "${targetTopic.clickHook || 'Provide step-by-step formula math and bag conversion tables.'}"
Target Keyword: "${targetTopic.primaryKeyword}"
Target Word Count: 600 - 950 words.

Structure Requirements:
1. Opening bold AEO summary paragraph.
2. Step-by-step formula math with real numbers.
3. Complete material conversion table wrapped in <div class="table-wrap"><table>...</table></div>.
4. Worked real-world project example.
5. You MUST include the link: [${targetTopic.tool} calculator](${calcPath}).`;

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`[Gemini] Generating zero-click resistant guide (attempt ${attempt}/${maxAttempts})...`);
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.25, maxOutputTokens: 8192 }
      };

      const rawResponse = await callGeminiAPI(payload);
      
      const cleaned = rawResponse
        .replace(/^```markdown\s*/i, "")
        .replace(/^```md\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const fmMatch = cleaned.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!fmMatch) {
        throw new Error("Generated content is missing frontmatter wrapper (---)!");
      }

      const fm = {};
      for (const line of fmMatch[1].split(/\r?\n/)) {
        const kv = line.match(/^(\w+):\s*(.*)$/);
        if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
      }
      // Auto-trim description if model returned slightly above 165 chars
      if (fm.description && fm.description.length > 165) {
        fm.description = fm.description.slice(0, 160).replace(/\s+\S*$/, "") + ".";
      }
      // Auto-trim title if model returned slightly above 80 chars
      if (fm.title && fm.title.length > 80) {
        fm.title = fm.title.slice(0, 77).replace(/\s+\S*$/, "");
      }
      // Write trimmed values back: the saved file and Supabase use the content, not `fm`
      let finalContent = cleaned;
      for (const key of ["description", "title"]) {
        if (fm[key]) {
          finalContent = finalContent.replace(
            new RegExp(`^${key}:.*$`, "m"),
            () => `${key}: "${fm[key].replace(/"/g, '\\"')}"`
          );
        }
      }
      // Strip hallucinated internal guide links (they break the deploy link check)
      finalContent = finalContent.replace(
        /\[([^\]]+)\]\(\/guides\/([a-z0-9-]+)\/?\)/g,
        (m, text, slug) => (existingSlugs.has(slug) ? m : text)
      );
      const body = fmMatch[2].replace(/\r\n/g, "\n").trim();
      const validation = validateGuide(fm, body, { existingArticles: existingGuidesSummary });
      if (!validation.valid) {
        console.warn(`[Quality Reject] Guide failed validation:`);
        for (const err of validation.errors) {
          console.warn(`  - ${err}`);
        }
        if (attempt < maxAttempts) {
          console.log(`Retrying generation with stricter constraints...`);
          continue;
        } else {
          throw new Error(`Failed to generate a valid guide after ${maxAttempts} attempts.`);
        }
      }

      if (validation.warnings.length > 0) {
        console.log(`[Quality Notices]:`);
        for (const warn of validation.warnings) {
          console.log(`  * ${warn}`);
        }
      }

      console.log(`[Success] Guide passed all quality checks (${validation.wordCount} words).`);
      return {
        frontmatter: fm,
        body,
        fullContent: finalContent
      };
    } catch (err) {
      console.error(`[Attempt ${attempt} Failed]:`, err.message);
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

async function main() {
  const targetTopic = await getNextTopic();
  const targetDate = getNextPublishDate();

  console.log(`\n==================================================`);
  console.log(`Zero-Click Resistant Guide: "${targetTopic.topic}"`);
  console.log(`Format Strategy: ${targetTopic.formatType || 'Actionable Guide'}`);
  console.log(`Click Hook: ${targetTopic.clickHook || 'Detailed matrix and walkthrough'}`);
  console.log(`Slug: ${targetTopic.slug}`);
  console.log(`Target Tool: ${targetTopic.tool}`);
  console.log(`Scheduled Publish Date: ${targetDate} ${forceToday ? '(TODAY - Immediate Live)' : ''}`);
  console.log(`==================================================\n`);

  const result = await generateWithRetry(targetTopic, targetDate, 3);
  const targetFile = join(GUIDES_DIR, `${targetTopic.slug}.md`);

  if (dryRun) {
    console.log(`\n[DRY RUN] Guide preview for: ${targetFile}\n`);
    console.log(result.fullContent.slice(0, 800) + "\n...\n");
    console.log(`[DRY RUN] Complete. No files written.`);
    return;
  }

  writeFileSync(targetFile, result.fullContent + "\n", "utf8");
  console.log(`\nFile saved successfully to:\n  ${targetFile}`);

  if (args.includes("--publish")) {
    console.log(`\nPushing ${targetTopic.slug} to Supabase...`);
    const { execSync } = await import("node:child_process");
    execSync(`node scripts/push-guides.mjs ${targetTopic.slug}`, { stdio: "inherit" });
  } else {
    console.log(`\nNext steps:`);
    console.log(`1. Review the file: src/content/guides/${targetTopic.slug}.md`);
    console.log(`2. Push to Supabase when ready: npm run push-guides`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
