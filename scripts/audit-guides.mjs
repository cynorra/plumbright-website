// Complete Quality Audit for all Plumbright Markdown Guides
// Usage: node scripts/audit-guides.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGuide } from "../src/lib/frontmatter.js";
import { validateGuide } from "./lib/guide-quality.mjs";

const GUIDES_DIR = join(process.cwd(), "src", "content", "guides");
const files = readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md"));

console.log(`\n==================================================`);
console.log(`🔍 AUDITING ${files.length} GUIDES IN src/content/guides/`);
console.log(`==================================================\n`);

const summaryList = [];
for (const file of files) {
  try {
    const raw = readFileSync(join(GUIDES_DIR, file), "utf8");
    const { fm } = parseGuide(raw, file);
    summaryList.push({
      file,
      slug: file.replace(/\.md$/, ""),
      title: fm.title,
      date: fm.published,
      tool: fm.tool
    });
  } catch (e) {
    // handled in loop below
  }
}

let passedCount = 0;
let failedCount = 0;
let totalWarnings = 0;
const issues = [];

for (const file of files) {
  const filePath = join(GUIDES_DIR, file);
  const raw = readFileSync(filePath, "utf8");
  const slug = file.replace(/\.md$/, "");

  let parsed;
  try {
    parsed = parseGuide(raw, file);
  } catch (e) {
    failedCount++;
    issues.push({ file, slug, errors: [e.message], warnings: [] });
    continue;
  }

  const { fm, body } = parsed;
  const otherGuides = summaryList.filter((s) => s.slug !== slug);
  const result = validateGuide(fm, body, { existingArticles: otherGuides });

  if (result.valid) {
    passedCount++;
    if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      issues.push({ file, slug, errors: [], warnings: result.warnings, wordCount: result.wordCount });
    }
  } else {
    failedCount++;
    totalWarnings += result.warnings.length;
    issues.push({ file, slug, errors: result.errors, warnings: result.warnings, wordCount: result.wordCount });
  }
}

console.log(`Audit Summary:`);
console.log(`  ✅ Passed:   ${passedCount} / ${files.length}`);
console.log(`  ❌ Failed:   ${failedCount} / ${files.length}`);
console.log(`  ⚠️  Warnings: ${totalWarnings}`);
console.log(`--------------------------------------------------\n`);

if (issues.length > 0) {
  for (const item of issues) {
    const statusIcon = item.errors.length > 0 ? "❌ FAIL" : "⚠️ WARN";
    console.log(`${statusIcon}: ${item.file} (${item.wordCount || 0} words)`);
    for (const err of item.errors) {
      console.log(`   🚨 ERROR: ${err}`);
    }
    for (const w of item.warnings) {
      console.log(`   🔸 WARN:  ${w}`);
    }
    console.log();
  }
}

if (failedCount > 0) {
  console.error(`\n❌ Quality check found ${failedCount} file(s) with errors!`);
  process.exit(1);
} else {
  console.log(`\n🎉 All ${files.length} guides passed critical quality validation!`);
  process.exit(0);
}
