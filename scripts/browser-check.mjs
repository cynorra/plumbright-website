// Smoke test against a running preview (npm run build && npm run preview):
// screenshots in both themes and two widths, overflow and console-error checks,
// and a few real interactions with the calculators.
//   CHROME_PATH=/path/to/chrome OUT=/tmp/shots node scripts/browser-check.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { TOOLS } from "../src/lib/tools.js";

const B = process.env.BASE ?? "http://localhost:4321";
const OUT = process.env.OUT ?? "./.shots";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const errors = [];

for (const [w, h, tag] of [[1280, 900, "desk"], [390, 844, "phone"]]) {
  for (const scheme of ["light", "dark"]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: scheme });
    p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${tag}/${scheme}: ${m.text().slice(0, 200)}`));
    p.on("pageerror", (e) => errors.push(e.message));
    for (const path of ["/", "/calculators/", ...TOOLS.map((t) => t.href), "/guides/", "/guides/concrete-for-fence-posts/", "/about/"]) {
      await p.goto(B + path, { waitUntil: "networkidle" });
      await p.waitForTimeout(400);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) errors.push(`overflow ${tag} ${scheme} ${path}`);
      const name = (path === "/" ? "home" : path.replace(/\//g, "_")) + `-${tag}-${scheme}.png`;
      await p.screenshot({ path: `${OUT}/${name}`, fullPage: tag === "desk" && (path === "/" || path === "/concrete-calculator/") });
    }
    await p.close();
  }
}

const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
p.on("pageerror", (e) => errors.push(e.message));
const big = "[aria-live] .sr-only";
await p.goto(B + "/concrete-calculator/?l=20&w=20&t=6", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
const fromUrl = await p.textContent(big);
await p.getByRole("radio", { name: "Post holes" }).click();
await p.waitForTimeout(900);
const posts = await p.textContent(big);
await p.fill("#cc-depth", "4");
const err = await p.textContent("[role=alert]").catch(() => "none");
const url = p.url();
await p.goto(B + "/tile-calculator/", { waitUntil: "networkidle" });
await p.getByRole("radio", { name: "Herringbone" }).click();
await p.waitForTimeout(900);
const waste = await p.inputValue("#tc-waste");
const tiles = await p.textContent(big);
await p.goto(B + "/", { waitUntil: "networkidle" });
await p.getByRole("tab", { name: "Paint" }).click();
await p.waitForTimeout(900);
const homePaint = await p.textContent(`[role=tabpanel] ${big}`);
// Newer calculators
await p.goto(B + "/square-footage-calculator/", { waitUntil: "networkidle" });
await p.getByRole("button", { name: "Add another area" }).click();
await p.fill("#ac-a2", "8");
await p.fill("#ac-b2", "6");
await p.waitForTimeout(900);
const lshape = await p.textContent(big);
await p.goto(B + "/flooring-calculator/", { waitUntil: "networkidle" });
await p.getByRole("radio", { name: "Diagonal" }).click();
await p.waitForTimeout(900);
const floorWaste = await p.inputValue("#fl-waste");
const floorBoxes = await p.textContent(big);
await p.goto(B + "/stair-calculator/?rise=120", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
const risers = await p.textContent(big);
await p.fill("#st-tread", "9");
await p.waitForTimeout(300);
const codeWarn = await p.locator("[aria-label='Code checks'] .text-destructive").count();
await p.goto(B + "/roofing-calculator/", { waitUntil: "networkidle" });
await p.getByRole("radio", { name: "Hip" }).click();
await p.waitForTimeout(900);
const hipBundles = await p.textContent(big);
await p.goto(B + "/deck-calculator/?l=20&w=12", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
const deckBoards = await p.textContent(big);
await p.goto(B + "/gravel-calculator/", { waitUntil: "networkidle" });
const gravelSsr = await p.textContent(big);
await p.goto(B + "/drywall-calculator/", { waitUntil: "networkidle" });
const drywall = await p.textContent(big);
const wave2 = {};
for (const [path, key] of [["/mulch-calculator/", "mulch"], ["/fence-calculator/?len=80", "fencePosts"], ["/brick-calculator/?unit=block", "blocks"], ["/wallpaper-calculator/?rep=0", "rolls"], ["/carpet-calculator/?l=18&w=15", "carpetSqYd"]]) {
  await p.goto(B + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  wave2[key] = await p.textContent(big);
}
const raw = await (await fetch(B + "/concrete-calculator/")).text();
console.log(wave2);
console.log({ fromUrl, posts, err, url, waste, tiles, homePaint, ssrHasResult: raw.includes(">1.36<"), ssrHasH2Ids: raw.includes('id="how-to-use-the-concrete-calculator"') });
console.log({ lshape, floorWaste, floorBoxes, risers, codeWarn, hipBundles, deckBoards, gravelSsr, drywall });
console.log("errors:", errors);
await b.close();
