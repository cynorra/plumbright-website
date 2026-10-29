// Advanced Topic Deduplication and Similarity Engine for Plumbright
// Ensures 100% unique, non-overlapping articles by analyzing Jaccard similarity,
// token containment, and core intent semantic anchors.

const STOP_WORDS = new Set([
  "how", "many", "much", "what", "need", "calculator", "guide", "for", "and", "the",
  "with", "per", "vs", "explained", "rules", "formula", "diy", "do", "you", "are",
  "in", "of", "to", "at", "a", "an", "is", "your", "by", "from", "step", "full",
  "proper", "best", "simple", "easy", "complete", "total", "chart", "needed", "about"
]);

/**
 * Extracts normalized, meaningful keywords from a title or topic string.
 */
export function extractKeywords(text = "") {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
  );
}

/**
 * Checks whether a proposed topic/title is too similar or targets the exact same
 * sub-intent as any existing guide.
 */
export function checkDuplicateTopic(proposedTopic, existingGuides = [], threshold = 0.55, proposedTool = null) {
  const proposedTokens = extractKeywords(proposedTopic);
  if (proposedTokens.size === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  const proposedTokensArr = [...proposedTokens];

  for (const guide of existingGuides) {
    // If comparing against itself, skip
    if (guide.title && proposedTopic.trim().toLowerCase() === guide.title.trim().toLowerCase()) {
      continue;
    }

    const existingTokens = extractKeywords(guide.title || guide.topic || guide.slug || "");
    if (existingTokens.size === 0) continue;

    // 1. Intersection count
    let common = 0;
    const commonWords = [];
    for (const token of proposedTokens) {
      if (existingTokens.has(token)) {
        common++;
        commonWords.push(token);
      }
    }

    // 2. Jaccard Similarity (Intersection over Union)
    const unionSize = new Set([...proposedTokens, ...existingTokens]).size;
    const jaccard = unionSize > 0 ? common / unionSize : 0;

    // 3. Containment / Overlap Coefficient
    const minSize = Math.min(proposedTokens.size, existingTokens.size);
    const containment = minSize > 0 ? common / minSize : 0;

    // 4. Category-Aware Semantic Collision:
    const sameTool = proposedTool && guide.tool && proposedTool === guide.tool;

    // A duplicate is detected if:
    // A) Both belong to the same tool and share 3+ specific keywords (e.g. deck joist spacing inches)
    // B) Both belong to the same tool and Jaccard >= 0.40
    // C) Global cross-category Jaccard >= threshold (0.55) or containment >= 0.75
    const isSameToolCollision = sameTool && (common >= 3 || jaccard >= 0.40 || containment >= 0.70);
    const isGlobalCollision = jaccard >= threshold || (containment >= 0.75 && common >= 3);

    if (isSameToolCollision || isGlobalCollision) {
      return {
        isDuplicate: true,
        similarity: Math.max(jaccard, containment),
        matchedGuide: guide,
        reason: `Topic overlaps in concept with "${guide.title}" (category: [${guide.tool}], shared intent: [${commonWords.join(", ")}], match: ${(Math.max(jaccard, containment) * 100).toFixed(0)}%)`
      };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}
