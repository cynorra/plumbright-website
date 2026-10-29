import { localRows } from "../src/lib/articles-source.js";

const rows = localRows();
const report = rows.map((r) => {
  const plain = r.body_md
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_#`~>]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const h2Matches = (r.body_md.match(/^##\s+.+$/gm) || []).map((h) => h.replace(/^##\s+/, ""));
  const hasTable = /<table[\s>]|\|(?:\s*[-:]+[-|\s:]*)\|/.test(r.body_md);
  
  // Detect cookie-cutter scripted headings
  const hasGenericHeadings = h2Matches.some((h) =>
    /how the formula works|material estimation table|worked project example/i.test(h)
  );

  return {
    slug: r.slug,
    words,
    h2Count: h2Matches.length,
    h2Matches,
    hasTable,
    hasGenericHeadings,
    title: r.title,
    tool: r.tool,
  };
});

report.sort((a, b) => a.words - b.words);

console.log("==================================================");
console.log("📊 ADSENSE & THIN CONTENT AUDIT REPORT");
console.log("==================================================\n");

console.log("--- 1. EN KISA MAKALELER (< 550 KELİME) ---");
const under550 = report.filter((r) => r.words < 550);
for (const r of under550) {
  console.log(`[${r.words} words] ${r.slug} (Table: ${r.hasTable ? "YES" : "NO"}, H2s: ${r.h2Count})`);
}

console.log("\n--- 2. TABLOSU OLMAYAN MAKALELER ---");
const noTable = report.filter((r) => !r.hasTable);
for (const r of noTable) {
  console.log(`- ${r.slug} (${r.words} words)`);
}

console.log("\n--- 3. ŞABLONİK BAŞLIK KULLANAN MAKALELER ---");
const scripted = report.filter((r) => r.hasGenericHeadings);
for (const r of scripted) {
  console.log(`- ${r.slug}: [${r.h2Matches.join(" | ")}]`);
}

console.log("\n--- GENEL İSTATİSTİKLER ---");
const avg = Math.round(report.reduce((acc, r) => acc + r.words, 0) / report.length);
console.log(`Toplam Rehber Sayısı:       ${report.length}`);
console.log(`Ortalama Kelime Sayısı:     ${avg}`);
console.log(`500 Kelime Altı (Riskli):   ${report.filter((r) => r.words < 500).length}`);
console.log(`600 Kelime Altı:            ${report.filter((r) => r.words < 600).length}`);
console.log(`700+ Kelime (Çok Güçlü):    ${report.filter((r) => r.words >= 700).length}`);
