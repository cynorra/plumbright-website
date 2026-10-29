import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("public/images/guides");
const prompts = JSON.parse(fs.readFileSync("prompts.json", "utf8"));

let synced = 0;
for (const p of prompts) {
  const index = p.index;
  const slug = p.slug;

  const candidateExtensions = [".jpe", ".jpeg", ".jpg", ".webp", ".png"];
  for (const ext of candidateExtensions) {
    const indexFile = path.join(dir, `${index}${ext}`);
    if (fs.existsSync(indexFile)) {
      // Map to slug.jpg (or slug.webp if webp)
      const targetExt = (ext === ".webp") ? ".webp" : (ext === ".png" ? ".png" : ".jpg");
      const targetFile = path.join(dir, `${slug}${targetExt}`);
      
      fs.copyFileSync(indexFile, targetFile);
      synced++;
      console.log(`[Synced ${index}] ${index}${ext} -> ${slug}${targetExt}`);
      break;
    }
  }
}

console.log(`Total images mapped and synced: ${synced}`);
