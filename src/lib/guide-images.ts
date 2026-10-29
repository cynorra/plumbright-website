import fs from "node:fs";
import path from "node:path";

let promptMap: Record<string, number> | null = null;

function getPromptIndex(slug: string): number | null {
  if (!promptMap) {
    try {
      const promptsPath = path.resolve(process.cwd(), "prompts.json");
      if (fs.existsSync(promptsPath)) {
        const list = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
        promptMap = {};
        for (const item of list) {
          promptMap[item.slug] = item.index;
        }
      }
    } catch {
      promptMap = {};
    }
  }
  return promptMap?.[slug] ?? null;
}

/**
 * Resolves the best available cover image for a guide.
 * Checks for:
 * 1. public/images/guides/<slug>.(webp|jpg|jpeg|jpe|png)
 * 2. public/images/guides/<index>.(webp|jpg|jpeg|jpe|png)
 * 3. Fallback: /images/guides/<tool>.svg
 */
export function getGuideCoverImage(slug: string, tool: string): string {
  const publicDir = path.resolve(process.cwd(), "public/images/guides");

  const candidates = [
    `${slug}.webp`,
    `${slug}.jpg`,
    `${slug}.jpeg`,
    `${slug}.jpe`,
    `${slug}.png`,
  ];

  const index = getPromptIndex(slug);
  if (index !== null) {
    candidates.push(
      `${index}.webp`,
      `${index}.jpg`,
      `${index}.jpeg`,
      `${index}.jpe`,
      `${index}.png`
    );
  }

  candidates.push(`${slug}.svg`);

  for (const file of candidates) {
    const fullPath = path.join(publicDir, file);
    if (fs.existsSync(fullPath)) {
      return `/images/guides/${file}`;
    }
  }

  // Default to tool SVG if unique image not yet placed
  return `/images/guides/${tool}.svg`;
}
