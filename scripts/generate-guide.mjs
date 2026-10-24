// Automated High-Quality Article Generator for Checkpoint Brief
// Tailored for gaming, GTA 6, AdSense compliance, and ZERO-CLICK AI OVERVIEW RESISTANCE.
//
// Usage:
//   node scripts/generate-guide.mjs                                  # Picks next topic from zero-click bank
//   node scripts/generate-guide.mjs --topic "GTA 6 Weapons & Combat"  # Custom topic
//   node scripts/generate-guide.mjs --tool gta6                      # Category filter (gta6|releases|deals|general)
//   node scripts/generate-guide.mjs --dry-run                        # Preview without saving to disk

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";
import { loadEnv } from "vite";
import { ZERO_CLICK_TOPIC_BANK } from "./lib/topic-bank.mjs";
import { validateGuide } from "./lib/guide-quality.mjs";

const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const GEMINI_API_KEY = env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing from .env file!");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const customTopicIdx = args.indexOf("--topic");
const customTopic = customTopicIdx !== -1 ? args[customTopicIdx + 1] : null;
const toolFilterIdx = args.indexOf("--tool");
const toolFilter = toolFilterIdx !== -1 ? args[toolFilterIdx + 1] : null;

const GUIDES_DIR = join(process.cwd(), "src", "content", "guides");
const existingFiles = existsSync(GUIDES_DIR) ? readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md")) : [];
const existingSlugs = new Set(existingFiles.map((f) => f.replace(/\.md$/, "")));

// Read existing guides for internal linking context
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

function getNextTopic() {
  if (customTopic) {
    const slug = customTopic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return {
      topic: customTopic,
      slug,
      tool: toolFilter || "gta6",
      primaryKeyword: customTopic,
      formatType: "In-Depth Analysis & Guide",
      clickHook: "Provides high-value comparison and actionable steps beyond simple search snippets.",
      sources: [{ label: "Official Documentation / Press Releases", href: "https://www.rockstargames.com" }]
    };
  }

  // Filter out topics already written
  const candidateTopics = ZERO_CLICK_TOPIC_BANK.filter((t) => {
    if (existingSlugs.has(t.slug)) return false;
    if (toolFilter && t.tool !== toolFilter) return false;
    return true;
  });

  if (candidateTopics.length === 0) {
    throw new Error("All pre-configured zero-click topic bank ideas have been written! Provide --topic or add more topics to scripts/lib/topic-bank.mjs.");
  }

  return candidateTopics[0];
}

function getNextPublishDate() {
  const dates = existingGuidesSummary.map((g) => g.date).filter(Boolean).sort();
  const today = new Date().toISOString().slice(0, 10);
  if (!dates.length) return today;

  const latest = dates[dates.length - 1];
  if (latest < today) return today;

  const nextDate = new Date(`${latest}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().slice(0, 10);
}

const targetTopic = getNextTopic();
const targetDate = getNextPublishDate();

console.log(`\n==================================================`);
console.log(`Zero-Click Resistant Guide: "${targetTopic.topic}"`);
console.log(`Format Strategy: ${targetTopic.formatType || 'Actionable Guide'}`);
console.log(`Click Hook: ${targetTopic.clickHook || 'Detailed matrix and walkthrough'}`);
console.log(`Slug: ${targetTopic.slug}`);
console.log(`Target Tool: ${targetTopic.tool}`);
console.log(`Scheduled Date: ${targetDate}`);
console.log(`==================================================\n`);

const relevantGuides = existingGuidesSummary
  .filter((g) => (g.tool === targetTopic.tool || g.tool === "concrete") && g.date <= targetDate)
  .slice(-6);

const internalLinksContext = relevantGuides
  .map((g) => `- "${g.title}": href="${g.href}"`)
  .join("\n");

const systemInstruction = `You are a licensed building estimator and materials calculation specialist at Plumbright (https://plumbright.com), an authoritative DIY construction and home improvement platform.

PRIMARY OBJECTIVE: BEAT ZERO-CLICK SEARCH / AI OVERVIEWS
Provide actionable formulas, dimensional tables, and waste allowances that cannot be answered by a 1-sentence AI snippet:
1. Exact Formula Breakdown: Step-by-step imperial math (cubic feet, cubic yards, square footage, bag weights).
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
6. STRICT ANTI-DUPLICATION & TEMPLATE DIVERSITY:
   - NEVER repeat or paraphrase any topic already written. Here are existing published titles to AVOID overlapping with:
   ${existingGuidesSummary.slice(-15).map((g) => `- "${g.title}"`).join("\n   ")}
   - NEVER use generic formula titles like "The Ultimate Guide to...", "Complete Guide to...", "Everything You Need to Know".
   - You MUST tailor the headings and structure specifically to this topic's Format Type ("${targetTopic.formatType || 'Actionable Guide'}").
7. INTERNAL LINKING:
   - Naturally integrate link to the corresponding Plumbright calculator: [${targetTopic.tool} calculator](${targetTopic.calculatorLink || '/' + targetTopic.tool + '-calculator/'}).
   - Also integrate 1-2 relevant internal links to existing Plumbright guides from this list:
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
Target Word Count: 550 - 900 words.

Structure Requirements:
1. Opening bold AEO summary paragraph.
2. Step-by-step formula math with real numbers.
3. Complete material conversion table wrapped in <div class="table-wrap"><table>...</table></div>.
4. Worked real-world project example.
5. Direct link to [${targetTopic.tool} calculator](${targetTopic.calculatorLink || '/' + targetTopic.tool + '-calculator/'}).`;

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

async function generateWithRetry(maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`[Gemini] Generating zero-click resistant guide (attempt ${attempt}/${maxAttempts})...`);
    try {
      const payload = {
        contents: [
          { role: "user", parts: [{ text: userPrompt }] }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 3500
        }
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
      const body = fmMatch[2].replace(/\r\n/g, "\n").trim();
      const validation = validateGuide(fm, body, { existingArticles: existingGuidesSummary });
      if (!validation.valid) {
        console.warn(`[Quality Reject] Guide failed validation:`);
        for (const err of validation.errors) {
          console.warn(`  - ${err}`);
        }
        console.warn(`[Rejected Body Snippet (first 300 chars)]:\n${body.slice(0, 300)}\n---`);
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
        fullContent: cleaned
      };
    } catch (err) {
      console.error(`[Attempt ${attempt} Failed]:`, err.message);
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

async function main() {
  const result = await generateWithRetry(3);
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
