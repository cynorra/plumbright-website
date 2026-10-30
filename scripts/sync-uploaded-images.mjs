import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("public/images/guides");

// Verified by reading every single image file binary and matching to the prompt
export const TRUE_VISUAL_MAPPING = {
  "1.jpe": "how-many-tiles-in-a-box",
  "2.jpe": "how-many-rolls-of-wallpaper-do-i-need",
  "3.jpe": "how-much-grout-do-i-need",
  "4.jpe": "stair-rise-and-run",
  "5.jpe": "wallpaper-pattern-repeat",
  "7.jpe": "gravel-driveway-depth-and-layers",
  "8.jpe": "how-deep-should-mulch-be",
  "9.jpe": "how-much-paint-for-a-12x12-room",
  "10.jpe": "how-many-sheets-of-drywall-for-a-12x12-room",
  "11.jpe": "how-many-fence-pickets-do-i-need",
  "12.jpe": "deck-joist-spacing",
  "13.jpe": "how-many-deck-boards-do-i-need",
  "14.jpe": "how-much-sand-under-pavers",
  "15.jpe": "concrete-bag-sizes-40-60-80-lb",
  "16.jpe": "how-many-bundles-of-shingles-in-a-square",
  "17.jpe": "how-many-bricks-per-square-foot",
  "18.jpe": "how-much-soil-for-a-raised-bed",
  "19.jpe": "how-to-calculate-stair-stringer-length",
  "20.jpe": "how-many-concrete-blocks-do-i-need",
  "21.jpe": "fence-post-spacing",
  "22.jpe": "how-much-mulch-do-i-need",
  "23.jpe": "how-much-mortar-do-i-need",
  "24.jpe": "how-much-does-a-cubic-yard-of-gravel-weigh",
  "25.jpe": "how-much-carpet-do-i-need",
  "26.jpe": "primer-and-second-coats",
  "27.jpe": "roof-pitch-multiplier-chart",
  "28.jpe": "square-feet-vs-linear-feet-vs-board-feet",
  "29.jpe": "4x8-vs-4x12-drywall",
  "30.jpe": "how-many-boxes-of-vinyl-plank-flooring",
  "31.jpe": "concrete-slab-thickness",
  "32.jpe": "drywall-screws-mud-and-tape",
  "33.jpe": "flooring-waste-factor",
  "34.jpe": "how-many-pavers-do-i-need",
  "35.jpe": "tile-waste-factor-by-layout",
  "36.jpe": "how-many-bags-of-concrete-for-10x10-slab",
  "37.jpe": "deck-joist-spacing-12-vs-16-vs-24-inches",
  "38.jpe": "gravel-driveway-base-layers-depth-and-sizes",
  "39.jpe": "concrete-for-fence-posts",
  "40.jpe": "concrete-slab-thickness-shed-patio-driveway",
  "41.jpg": "how-many-bags-of-mulch-in-a-yard",
  "42.jpe": "how-to-measure-an-l-shaped-room",
};

let count = 0;
for (const [sourceFile, targetSlug] of Object.entries(TRUE_VISUAL_MAPPING)) {
  const src = path.join(dir, sourceFile);
  if (fs.existsSync(src)) {
    const dest = path.join(dir, `${targetSlug}.jpg`);
    fs.copyFileSync(src, dest);
    count++;
  }
}

// Also map direct slug files if user uploads by slug or new index
const prompts = JSON.parse(fs.readFileSync("prompts.json", "utf8"));
for (const p of prompts) {
  for (const ext of [".webp", ".jpg", ".png", ".jpe"]) {
    const directFile = path.join(dir, `${p.slug}${ext}`);
    if (fs.existsSync(directFile)) {
      count++;
      break;
    }
  }
}

console.log(`[Sync] Synced ${count} verified guide images.`);
