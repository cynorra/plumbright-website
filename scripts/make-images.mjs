// Renders public/og.png (1200x630), public/logo-512.png and public/apple-touch-icon.png
// from HTML using the site's own fonts. Run after changing the brand name:
//   CHROME_PATH=/path/to/chrome node scripts/make-images.mjs
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { SITE } from "../src/site.config.js";

const font = (p) => `data:font/woff2;base64,${readFileSync(new URL(`../node_modules/${p}`, import.meta.url)).toString("base64")}`;
const archivo = font("@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2");
const geist = font("@fontsource-variable/geist/files/geist-latin-wght-normal.woff2");
const mono = font("@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2");

const css = `
@font-face{font-family:A;src:url(${archivo})}@font-face{font-family:G;src:url(${geist})}@font-face{font-family:M;src:url(${mono})}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#f4f6f8;color:#1a2430;font-family:G;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,#1a24300f 1px,transparent 1px),linear-gradient(to bottom,#1a24300f 1px,transparent 1px);background-size:30px 30px}
.wrap{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;font-family:A;font-weight:800;font-size:34px}
h1{font-family:A;font-weight:800;font-size:76px;line-height:1.02;letter-spacing:-.02em;margin-top:64px;max-width:900px}
.calc{margin-top:auto;font-family:M;font-size:26px;color:#4d5b6a}.calc b{color:#c0541a;font-weight:600}
.rule{position:absolute;left:80px;right:80px;bottom:56px;height:14px;opacity:.35;background-image:repeating-linear-gradient(90deg,#1a2430 0 2px,transparent 2px 60px),repeating-linear-gradient(90deg,#4d5b6a 0 1px,transparent 1px 15px);background-size:100% 14px,100% 7px;background-repeat:no-repeat;background-position:left bottom}`;
const bob = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><line x1="16" y1="1" x2="16" y2="11" stroke="#1a2430" stroke-width="2"/><path d="M10 12h12l-6 18z" fill="#c0541a"/><rect x="10" y="11" width="12" height="3" rx="1" fill="#1a2430"/></svg>`;

const og = `<style>${css}</style><div class="grid"></div><div class="wrap"><div class="brand">${bob(44)}${SITE.name}</div>
<h1>Know how much to buy before you load the truck.</h1>
<p class="calc">10 × 10 ft × 4 in ÷ 12 × 1.10 ÷ 27 = <b>1.36 yd³</b></p></div><div class="rule"></div>`;
const icon = (size) => `<style>*{margin:0}body{width:${size}px;height:${size}px;background:#1a2430;display:grid;place-items:center}</style>
<svg width="${size * 0.62}" height="${size * 0.62}" viewBox="0 0 32 32"><line x1="16" y1="1" x2="16" y2="11" stroke="#f4f6f8" stroke-width="2"/><path d="M10 12h12l-6 18z" fill="#f08a4b"/><rect x="10" y="11" width="12" height="3" rx="1" fill="#f4f6f8"/></svg>`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
async function shot(html, w, h, out) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/${out}`, import.meta.url).pathname });
  await page.close();
}
await shot(og, 1200, 630, "og.png");
await shot(icon(512), 512, 512, "logo-512.png");
await shot(icon(180), 180, 180, "apple-touch-icon.png");
await browser.close();
console.log("Wrote public/og.png, public/logo-512.png, public/apple-touch-icon.png");
