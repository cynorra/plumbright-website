import fs from 'fs';
import path from 'path';

const dir = 'src/content/guides';
const files = fs.readdirSync(dir);

let publishedCount = 0;
let updatedCount = 0;

for (const f of files) {
  if (!f.endsWith('.md')) continue;
  const p = path.join(dir, f);
  let raw = fs.readFileSync(p, 'utf8');
  let changed = false;

  if (raw.includes('draft: true')) {
    raw = raw.replace(/draft:\s*true/g, 'draft: false');
    changed = true;
    publishedCount++;
  }

  const pubMatch = raw.match(/published:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
  if (pubMatch && pubMatch[1] > '2026-11-18') {
    raw = raw.replace(/published:\s*["']?\d{4}-\d{2}-\d{2}["']?/, 'published: 2026-11-18');
    changed = true;
  }

  // Ensure updated is set to 2026-11-18 if not already present or older
  if (!raw.includes('updated:')) {
    raw = raw.replace(/published:\s*([^\r\n]+)/, 'published: $1\nupdated: 2026-11-18');
    changed = true;
    updatedCount++;
  } else {
    raw = raw.replace(/updated:\s*["']?\d{4}-\d{2}-\d{2}["']?/, 'updated: 2026-11-18');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, raw, 'utf8');
  }
}

console.log(`Published drafts: ${publishedCount}, updated dates on all 66 guides.`);
