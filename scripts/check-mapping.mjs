import fs from "node:fs";

const prompts = JSON.parse(fs.readFileSync("prompts.json", "utf8"));
console.log("=== PROMPTS.JSON vs MAPPED IMAGES ===");
for (const p of prompts) {
  const imgSlug = `public/images/guides/${p.slug}.jpg`;
  const imgExists = fs.existsSync(imgSlug);
  const rawJpe = `public/images/guides/${p.index}.jpe`;
  const rawJpg = `public/images/guides/${p.index}.jpg`;
  const rawExists = fs.existsSync(rawJpe) || fs.existsSync(rawJpg);
  console.log(`[#${p.index}] ${p.slug} | TargetExists: ${imgExists} | RawIndexExists: ${rawExists} | Title: ${p.title}`);
}

console.log("\n=== HOMEPAGE SORTED ORDER ===");
const guides = fs.readdirSync("src/content/guides").filter(f => f.endsWith(".md")).map(f => {
  const c = fs.readFileSync("src/content/guides/" + f, "utf8");
  const pubMatch = c.match(/published:\s*([^\n]+)/);
  const titleMatch = c.match(/title:\s*\"([^\"]+)\"/);
  return {
    id: f.replace(".md", ""),
    pub: new Date(pubMatch ? pubMatch[1].trim() : 0),
    title: titleMatch ? titleMatch[1] : f
  };
}).sort((a, b) => b.pub - a.pub);

for (let i = 0; i < 6; i++) {
  const g = guides[i];
  console.log(`[Home #${i}] ${g.id} -> Title: ${g.title}`);
}
