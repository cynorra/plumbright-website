// Cover image for a freshly generated guide.
// 1. Try a Gemini image model (photo, matches the hand-made covers). Needs a paid/enabled image quota.
// 2. Otherwise write a guide-specific SVG blueprint cover (title on the category colour), which
//    src/lib/guide-images.ts picks up as public/images/guides/<slug>.svg.
// Either way the guide never ships with only the generic category graphic.
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ACCENT = {
  concrete: "#ea580c", gravel: "#d97706", deck: "#b45309", roofing: "#dc2626", fence: "#16a34a",
  brick: "#b91c1c", mulch: "#65a30d", stairs: "#0284c7", tile: "#0d9488", flooring: "#ca8a04",
  drywall: "#64748b", carpet: "#6366f1", wallpaper: "#ec4899", paint: "#2563eb", area: "#059669",
};
const LABEL = {
  concrete: "CONCRETE & SLABS", gravel: "GRAVEL & AGGREGATE", deck: "DECKING & FRAMING", roofing: "ROOFING & SHINGLES",
  fence: "FENCE & PRIVACY", brick: "MASONRY & BRICK", mulch: "LANDSCAPING & MULCH", stairs: "STAIRS & STRINGERS",
  tile: "TILE & GROUT", flooring: "FLOORING & VINYL", drywall: "DRYWALL & TAPING", carpet: "CARPET & PADDING",
  wallpaper: "WALLPAPER & PATTERNS", paint: "PAINT & COATINGS", area: "AREA & MEASURING",
};
const IMAGE_MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(text, max, maxLines) {
  const lines = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    if ((line + " " + w).trim().length > max && line) {
      lines.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s,;:]*\S*$/, "") + "…";
  }
  return lines;
}

export function coverSvg({ title, tool, description = "" }) {
  const accent = ACCENT[tool] || "#ea580c";
  const titleLines = wrap(title, 26, 3);
  const descLines = wrap(description, 62, 2);
  const titleSvg = titleLines
    .map((l, i) => `<text x="50" y="${190 + i * 54}" fill="#f8fafc" font-size="44" font-weight="900" letter-spacing="-1">${esc(l)}</text>`)
    .join("\n  ");
  const descY = 190 + titleLines.length * 54 + 12;
  const descSvg = descLines
    .map((l, i) => `<text x="50" y="${descY + i * 24}" fill="#94a3b8" font-size="16">${esc(l)}</text>`)
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" role="img" aria-label="${esc(title)}" style="background:#0f172a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" stroke-width="1"/></pattern>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect x="20" y="20" width="760" height="410" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="25" y="25" width="750" height="400" fill="none" stroke="#1e293b" stroke-width="1"/>
  <path d="M 15 20 L 30 20 M 20 15 L 20 30 M 785 20 L 770 20 M 780 15 L 780 30 M 15 430 L 30 430 M 20 435 L 20 420 M 785 430 L 770 430 M 780 435 L 780 420" stroke="${accent}" stroke-width="2"/>
  <rect x="50" y="52" width="${LABEL[tool] ? LABEL[tool].length * 9 + 24 : 180}" height="28" rx="6" fill="${accent}" opacity="0.18"/>
  <text x="62" y="71" fill="${accent}" font-size="13" font-weight="800" letter-spacing="1.5">${esc(LABEL[tool] || "FIELD GUIDE")}</text>
  <line x1="50" y1="110" x2="750" y2="110" stroke="${accent}" stroke-width="2" stroke-dasharray="6 5"/>
  ${titleSvg}
  ${descSvg}
  <text x="750" y="405" fill="#475569" font-size="12" font-weight="700" letter-spacing="1.5" text-anchor="end">FIELD GUIDE</text>
</svg>
`;
}

async function geminiImage(prompt, apiKey) {
  for (const model of IMAGE_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "16:9" } },
        }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) return { data: Buffer.from(part.inlineData.data, "base64"), mime: part.inlineData.mimeType };
    } catch {
      // try the next model, then fall back to the SVG cover
    }
  }
  return null;
}

/** Writes public/images/guides/<slug>.(png|jpg|svg) unless a cover already exists. Returns the file name. */
export async function ensureCover({ slug, title, tool, description, apiKey, dir = join(process.cwd(), "public", "images", "guides") }) {
  for (const ext of ["webp", "jpg", "jpeg", "jpe", "png", "svg"]) {
    if (existsSync(join(dir, `${slug}.${ext}`))) return `${slug}.${ext}`;
  }
  if (apiKey) {
    const prompt = `Photorealistic 16:9 editorial photo for a DIY home-improvement guide titled "${title}". Authentic job-site detail of the materials and tools involved, natural daylight, shallow depth of field, no people, no text, no watermark, no logos.`;
    const img = await geminiImage(prompt, apiKey);
    if (img) {
      const ext = img.mime.includes("jpeg") ? "jpg" : "png";
      writeFileSync(join(dir, `${slug}.${ext}`), img.data);
      return `${slug}.${ext}`;
    }
  }
  writeFileSync(join(dir, `${slug}.svg`), coverSvg({ title, tool, description }), "utf8");
  return `${slug}.svg`;
}
