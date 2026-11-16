// Extra checks used by scripts/audit-guides.mjs only (the generator's own validator, guide-quality.mjs, is untouched).
// They look for the problems found in the AdSense-readiness review of Nov 2026: leftover drafting notes, half
// sentences, meta descriptions of the wrong length, guides without a source or calculator link, and simple
// arithmetic statements ("72 / 5 = 14.4") that do not add up.
// Pure functions, no I/O.

const DRAFT_NOTES = [
  [/self-correction/i, "drafting note (\"Self-correction\")"],
  [/\blet['’]s (?!encourage)/i, "drafting voice (\"Let's ...\")"],
  [/\blet us (?:re|try|simplify|assume|calculate)/i, "drafting voice (\"Let us ...\")"],
  [/to be safe/i, "hedging filler (\"to be safe\")"],
  [/\bTODO\b|\bTBD\b|\bFIXME\b/, "TODO / TBD marker"],
  [/\bwait,|\bhmm\b|\bactually, (?:let|that)/i, "thinking-aloud text"],
  [/\bas an ai\b|\blanguage model\b/i, "AI boilerplate"],
  [/\*\*[^*\n]*(?:revised|re-evaluate)[^*\n]*\*\*/i, "revision heading left in the text"],
];

/** @returns {string[]} problems */
export function draftingProblems(body) {
  const out = [];
  for (const [re, label] of DRAFT_NOTES) {
    const m = re.exec(body);
    if (m) out.push(`${label}: "${body.slice(Math.max(0, m.index - 20), m.index + 50).replace(/\s+/g, " ").trim()}"`);
  }
  return out;
}

/** Half sentences: ",." / "and." endings, a last line that stops mid-sentence, a description that is cut off. */
export function truncationProblems(fm, body) {
  const out = [];
  const bad = /(?:\band|\bor|\bincluding|,)\s*\.(?=\s|$)/g;
  for (const line of body.split("\n")) {
    const m = bad.exec(line);
    if (m) out.push(`half sentence: "...${line.slice(Math.max(0, m.index - 25), m.index + m[0].length).trim()}"`);
    bad.lastIndex = 0;
  }
  const last = body.trim().split("\n").filter((l) => l.trim()).pop() || "";
  if (!/[.!?:)>|*`]$/.test(last.trim()) && !/^\s*[-*]\s*\[/.test(last)) out.push(`the guide ends mid-sentence: "...${last.slice(-40)}"`);
  const d = String(fm.description || "").trim();
  if (!/[.!?)]$/.test(d) || /,\.$/.test(d)) out.push(`meta description is cut off: "...${d.slice(-30)}"`);
  if (/\\+"/.test(d) || /\\\\/.test(d)) out.push("meta description has escaped quotes");
  return out;
}

export function descriptionLength(fm) {
  const n = String(fm.description || "").length;
  return n < 120 || n > 155 ? [`meta description is ${n} characters (want 120 to 155)`] : [];
}

/** Needs a calculator link and at least one source (an external link or the methodology page). */
export function linkProblems(body) {
  const out = [];
  if (!/\]\(\/[a-z-]+-calculator\/\)/.test(body)) out.push("no link to a calculator page");
  const src = /^## Sources\s*\n([\s\S]*)$/m.exec(body);
  if (!src) out.push('no "## Sources" section');
  else if (!/\]\(https?:\/\//.test(src[1]) && !/\]\(\/methodology\/\)/.test(src[1])) out.push("the Sources section has no external or methodology link");
  return out;
}

const NUM = String.raw`(\d[\d,]*(?:\.\d+)?)`;
const UNIT = String.raw`(?:\s?(?:ft|in|inches|feet|sq ft|cu ft|cubic feet|cu yd|lb|lbs|gal|gallons|%|sq yd|yards?))?`;
// A "/" counts as division only when it has spaces around it ("7/12" is a pitch, not a quotient). A result in sq yd is a
// converted figure (sq ft ÷ 9), so it is skipped.
const ARITH = new RegExp(String.raw`(?<![\d.,×x*/÷+\-−]\s?)${NUM}${UNIT}(\s[/÷]\s|\s?[×x*]\s?)${NUM}${UNIT}\s?=\s?~?${NUM}(?![\d.])(?!\s?\d+/\d+)(?!\s?(?:sq yd|yd))(?!\s?[×x*/÷+\-−]\s?\d)`, "g");

/** Statements "a op b = c" that are wrong by more than rounding. Chained expressions are skipped. */
export function arithmeticProblems(body) {
  const out = [];
  const text = body.replace(/`/g, "").replace(/\*\*/g, "");
  for (const m of text.matchAll(ARITH)) {
    const a = parseFloat(m[1].replace(/,/g, ""));
    const op = m[2].trim();
    const b = parseFloat(m[3].replace(/,/g, ""));
    const c = parseFloat(m[4].replace(/,/g, ""));
    const want = op === "/" || op === "÷" ? a / b : a * b;
    if (!Number.isFinite(want) || want === 0) continue;
    const tol = Math.max(0.011, Math.abs(want) * 0.015); // two-decimal rounding in the text
    if (Math.abs(want - c) > tol) out.push(`arithmetic: "${m[0].trim()}" but ${a} ${op} ${b} = ${Math.round(want * 1000) / 1000}`);
  }
  return out;
}
