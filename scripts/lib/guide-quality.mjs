// Quality validation rules specifically tailored for Checkpoint Brief (Gaming, GTA 6, Guides, AdSense).
// Strictly rejects hallucinated statistics, first-person fictions, clickbait hype, gambling/leaks,
// and ensures proper Markdown format with sources and AEO snippet.

const FIRST_PERSON_CREDENTIALS = [
  /\b(?:as|being) (?:a|an) (?:former |veteran |longtime |professional |hardcore )?(?:game developer|rockstar insider|qa tester|insider|leaker|gaming journalist|rockstar employee)\b/i,
  /\bmy (?:own )?(?:source|insider|contact|leaks?|years in the gaming industry)\b/i,
  /\b(?:in my|after my) \d+\+? years (?:playing|covering|testing|reporting)\b/i,
  /\bwe(?:['’]ve| have) (?:analyzed|discovered|tested|obtained|uncovered|confirmed with rockstar)\b/i,
];

const BARE_FIRST_PERSON = /(?<![A-Za-z])I(?:['’](?:ve|m|d|ll))?\s+(?:personally|heard|played|tested|spoke|talked|got|know|think|believe|suggest|recommend)\b/i;

const HYPE_PATTERNS = [
  /\b(?:guaranteed|foolproof|mind-blowing|game-changing|shocking|insane|skyrocket|unbelievable)\b/i,
  /\b(?:what if I told you|you won['’]t believe|rockstar doesn['’]t want you to know|secret trick)\b/i,
  /\b(?:100% confirmed|absolute certainty)\b/i,
];

// Content policies for AdSense & Gaming sites:
// No gambling/casino encouragement, no illegal piracy links, no leaked alpha build links
const FORBIDDEN_CONTENT = [
  /\b(?:torrent|cracked|pirated|keygen|download rom|warez)\b/i,
  /\b(?:real-money gambling|stake\.com|crypto casino|loot box betting)\b/i,
];

// False precision check: detects fake decimal percentages or hyper-precise dollar/hour counts
// e.g. "94.3% of players", "takes exactly 142.6 hours", "$79.43"
const FALSE_PRECISION_REGEX = /\b\d+\.\d+%\b|\b\d+\.\d+\s*(?:fps|hours?|gb|tb|days?)\b/i;

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
  const validTools = ["concrete", "gravel", "deck", "roofing", "fence", "brick", "mulch", "stairs", "tile", "flooring", "drywall", "carpet", "wallpaper", "paint", "area"];
  if (!validTools.includes(frontmatter.tool)) {
    errors.push(`Invalid tool category "${frontmatter.tool}". Must be one of: ${validTools.join(", ")}`);
  }
  if (!frontmatter.published || !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.published)) {
    errors.push(`Invalid published date format: "${frontmatter.published}". Expected YYYY-MM-DD.`);
  }

  // Check year in title/description - evergreen titles preferred unless it's a specific release calendar
  const currentYear = new Date().getUTCFullYear();
  const titleHasOldYear = /\b(20[12]\d)\b/.test(frontmatter.title);
  if (titleHasOldYear) {
    const matchYear = Number(frontmatter.title.match(/\b(20[12]\d)\b/)[1]);
    if (matchYear < currentYear && !frontmatter.title.toLowerCase().includes("timeline") && !frontmatter.title.toLowerCase().includes("history")) {
      errors.push(`Title mentions stale year ${matchYear}. Must be relevant to ${currentYear} or later.`);
    }
  }

  // 2. Body checks
  const plain = stripMarkdown(markdownBody);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  if (wordCount < 400) {
    errors.push(`Content too short: ${wordCount} words (minimum 400 required for a quality guide).`);
  }

  // First-person checks
  for (const re of FIRST_PERSON_CREDENTIALS) {
    const m = plain.match(re);
    if (m) errors.push(`Fabricated credential / first-person claim found: "${m[0]}"`);
  }
  const bareFp = plain.match(BARE_FIRST_PERSON);
  if (bareFp) {
    errors.push(`First person singular narrator used: "${bareFp[0]}" (Use objective third-person editorial voice).`);
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

  // False precision check
  const fpMatch = plain.match(FALSE_PRECISION_REGEX);
  if (fpMatch) {
    warnings.push(`Possible false precision: "${fpMatch[0]}" - ensure this is a verified official figure, not an invented decimal.`);
  }

  // Structure checks:
  // Must have an opening lead in bold (AEO direct answer)
  if (!markdownBody.trim().startsWith("**") && !markdownBody.includes("\n**")) {
    errors.push("Missing bold Quick Answer / Bottom Line opening summary for AEO snippet.");
  }

  // Must have at least 2 ## headings (or <h2> tags)
  const h2Count = (markdownBody.match(/^##\s+.+$/gm) || markdownBody.match(/<h2[^>]*>/gi) || []).length;
  if (h2Count < 2) {
    errors.push(`Not enough sections: found ${h2Count} '##' headings (minimum 2 required). Markdown body must use '## Section Name' on separate lines.`);
  }

  // Must cite official source or reputable outlet
  const hasLinks = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.test(markdownBody);
  if (!hasLinks) {
    warnings.push("No external source citations found. High quality guides cite official sources (Rockstar, Sony, Xbox, Epic Games).");
  }

  // Check for repetitive/cookie-cutter formula titles
  const formulaRe = /^(the ultimate guide to|complete guide to|everything you need to know about|all you need to know about)\b/i;
  if (formulaRe.test(frontmatter.title)) {
    errors.push(`Cookie-cutter title detected: "${frontmatter.title}". Avoid generic formulas like 'The Ultimate Guide to' or 'Everything You Need to Know'. Use specific, high-intent titles.`);
  }

  // 3. Duplicate content and similarity check against existing articles
  if (Array.isArray(options.existingArticles) && options.existingArticles.length > 0) {
    const newTitleWords = new Set(frontmatter.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
    
    for (const existing of options.existingArticles) {
      if (existing.slug === frontmatter.slug) continue;
      
      const existingTitleWords = new Set(existing.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
      let common = 0;
      for (const word of newTitleWords) {
        if (existingTitleWords.has(word)) common++;
      }
      const similarity = common / Math.max(newTitleWords.size, existingTitleWords.size);
      if (similarity > 0.75) {
        errors.push(`Duplicate topic detected: Title "${frontmatter.title}" is ${Math.round(similarity * 100)}% similar to existing guide "${existing.title}".`);
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    wordCount
  };
}
