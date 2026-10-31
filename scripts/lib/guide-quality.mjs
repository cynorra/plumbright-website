import { checkDuplicateTopic } from "./topic-dedup.mjs";
// Strictly rejects hallucinated statistics, first-person fictions, clickbait hype,
// and ensures proper Markdown format with structured calculation tables and AEO snippet.

const FIRST_PERSON_CREDENTIALS = [
  /\b(?:as|being) (?:a|an) (?:former |veteran |longtime |professional |licensed )?(?:general contractor|building inspector|structural engineer|master plumber|carpenter|tile setter)\b/i,
  /\bmy (?:own )?(?:crew|construction company|contracting firm|job sites|clients)\b/i,
  /\b(?:in my|after my) \d+\+? years (?:contracting|building|remodeling|framing|pouring concrete)\b/i,
  /\bwe(?:['’]ve| have) (?:tested on job sites|poured hundreds of|built dozens of)\b/i,
];

const BARE_FIRST_PERSON = /(?<![A-Za-z])I(?:['’](?:ve|m|d|ll))?\s+(?:personally|poured|built|framed|mixed|tiled|painted|installed|noticed|prefer|recommend)\b/i;

const HYPE_PATTERNS = [
  /\b(?:guaranteed|foolproof|mind-blowing|game-changing|shocking|insane|skyrocket|unbelievable)\b/i,
  /\b(?:what if I told you|you won['’]t believe|contractors hate this|builders secret trick|magic formula)\b/i,
  /\b(?:100% foolproof|secret trick contractors don't want you to know)\b/i,
];

// Content policies for AdSense & Plumbright:
const FORBIDDEN_CONTENT = [
  /\b(?:torrent|cracked software|keygen|warez|pirated copy)\b/i,
  /\b(?:real-money gambling|stake\.com|crypto casino|sportsbook)\b/i,
];

export function stripMarkdown(md = "") {
  return md
    .replace(/^---[\s\S]*?---/, "") // strip frontmatter
    .replace(/<[^>]+>/g, " ")       // strip HTML
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // strip links
    .replace(/[*_#`~>]/g, "")       // strip symbols
    .replace(/\s+/g, " ")
    .trim();
}

export function validateGuide(frontmatter, markdownBody, options = {}) {
  const errors = [];
  const warnings = [];

  // 1. Frontmatter validation
  if (!frontmatter.title || frontmatter.title.length < 15 || frontmatter.title.length > 80) {
    errors.push(`Title length invalid: "${frontmatter.title}" (${frontmatter.title?.length || 0} chars, should be 15-80)`);
  }
  if (!frontmatter.description || frontmatter.description.length < 70 || frontmatter.description.length > 165) {
    errors.push(`Description length invalid: (${frontmatter.description?.length || 0} chars, must be 70-165 for SEO and Supabase schema)`);
  }
  const validTools = [
    "concrete", "gravel", "deck", "roofing", "fence", "brick", "mulch",
    "stairs", "tile", "flooring", "drywall", "carpet", "wallpaper", "paint", "area"
  ];
  if (!validTools.includes(frontmatter.tool)) {
    errors.push(`Invalid tool category "${frontmatter.tool}". Must be one of: ${validTools.join(", ")}`);
  }
  if (!frontmatter.published || !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.published)) {
    errors.push(`Invalid published date format: "${frontmatter.published}". Expected YYYY-MM-DD.`);
  }

  // Check year in title/description - evergreen titles preferred
  const currentYear = new Date().getUTCFullYear();
  const titleHasOldYear = /\b(20[12]\d)\b/.test(frontmatter.title);
  if (titleHasOldYear) {
    const matchYear = Number(frontmatter.title.match(/\b(20[12]\d)\b/)[1]);
    if (matchYear < currentYear && !frontmatter.title.toLowerCase().includes("history")) {
      errors.push(`Title mentions stale year ${matchYear}. Must be relevant to ${currentYear} or later.`);
    }
  }

  // 2. Body checks
  const plain = stripMarkdown(markdownBody);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  if (wordCount < 400) {
    errors.push(`Content too short: ${wordCount} words (minimum 400 required for a quality guide).`);
  }

  // A guide must end on a finished sentence, table, list item or link, not mid-thought
  if (!/[.!?:)>*`\]]\s*$/.test(markdownBody.trim()) || /[=(,]\s*`?$/.test(markdownBody.trim())) {
    errors.push("Guide looks truncated: it does not end on a complete sentence.");
  }

  // First-person checks
  for (const re of FIRST_PERSON_CREDENTIALS) {
    const m = plain.match(re);
    if (m) errors.push(`Fabricated credential / first-person claim found: "${m[0]}"`);
  }
  const bareFp = plain.match(BARE_FIRST_PERSON);
  if (bareFp) {
    errors.push(`First person singular narrator used: "${bareFp[0]}" (Use objective third-person instructional tone).`);
  }

  // Hype / Clickbait check
  for (const re of HYPE_PATTERNS) {
    const m = plain.match(re);
    if (m) errors.push(`Clickbait / hype language detected: "${m[0]}"`);
  }

  // Forbidden content check
  for (const re of FORBIDDEN_CONTENT) {
    const m = plain.match(re);
    if (m) errors.push(`Forbidden content policy violation: "${m[0]}"`);
  }

  // Structure checks:
  // Must have an opening lead in bold (AEO direct answer)
  if (!markdownBody.trim().startsWith("**") && !markdownBody.includes("\n**")) {
    errors.push("Missing bold Quick Answer / Rule-of-Thumb opening summary for AEO snippet.");
  }

  // Must have at least 2 ## headings
  const h2Count = (markdownBody.match(/^##\s+.+$/gm) || markdownBody.match(/<h2[^>]*>/gi) || []).length;
  if (h2Count < 2) {
    errors.push(`Not enough sections: found ${h2Count} '##' headings (minimum 2 required). Body must use '## Section Name' on separate lines.`);
  }

  // Must have a calculation table (Markdown table or HTML table)
  const hasTable = /<table[\s>]|\|(?:\s*[-:]+[-|\s:]*)\|/.test(markdownBody);
  if (!hasTable) {
    errors.push("Missing material estimation or comparison table. A table wrapped in <div class=\"table-wrap\"><table>...</table></div> is mandatory for AEO and zero-click value.");
  }

  // Check for internal calculator link
  const toolSlugMap = {
    stairs: "stair",
    area: "square-footage"
  };
  const calcSlug = toolSlugMap[frontmatter.tool] || frontmatter.tool;
  const hasCalculatorLink = new RegExp(`\\[[^\\]]+\\]\\(/${calcSlug}-calculator/?\\)`).test(markdownBody);
  if (!hasCalculatorLink) {
    errors.push(`Missing required internal link: [${frontmatter.tool} calculator](/${calcSlug}-calculator/) must be included.`);
  }

  // Check for repetitive/cookie-cutter formula titles
  const formulaRe = /^(the ultimate guide to|complete guide to|everything you need to know about|all you need to know about)\b/i;
  if (formulaRe.test(frontmatter.title)) {
    errors.push(`Cookie-cutter title detected: "${frontmatter.title}". Avoid generic formulas like 'The Ultimate Guide to'. Use specific, high-intent titles.`);
  }

  // 3. Duplicate content and similarity check against existing articles
  if (Array.isArray(options.existingArticles) && options.existingArticles.length > 0) {
    const dupCheck = checkDuplicateTopic(frontmatter.title, options.existingArticles, 0.55, frontmatter.tool);
    if (dupCheck.isDuplicate) {
      errors.push(`Duplicate topic detected: ${dupCheck.reason}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    wordCount
  };
}
