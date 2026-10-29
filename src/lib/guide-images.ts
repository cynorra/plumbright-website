import fs from "node:fs";
import path from "node:path";

/**
 * Resolves the best available cover image for a guide.
 * Checks for:
 * 1. public/images/guides/<slug>.webp
 * 2. public/images/guides/<slug>.jpg
 * 3. public/images/guides/<slug>.png
 * 4. Fallback: /images/guides/<tool>.svg
 */
export function getGuideCoverImage(slug: string, tool: string): string {
  const publicDir = path.resolve(process.cwd(), "public/images/guides");

  const candidates = [
    `${slug}.webp`,
    `${slug}.jpg`,
    `${slug}.png`,
    `${slug}.svg`,
  ];

  for (const file of candidates) {
    const fullPath = path.join(publicDir, file);
    if (fs.existsSync(fullPath)) {
      return `/images/guides/${file}`;
    }
  }

  // Default to tool SVG if unique image not yet placed
  return `/images/guides/${tool}.svg`;
}
