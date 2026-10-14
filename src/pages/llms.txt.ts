import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, AUTHOR } from "../site.config.js";
import { BAG_YIELDS } from "../lib/calc/concrete.js";
import { LAYOUTS } from "../lib/calc/tile.js";
import { DOOR_SQFT, WINDOW_SQFT, DEFAULT_COVERAGE } from "../lib/calc/paint.js";
import { FLOORING_LAYOUTS } from "../lib/calc/flooring.js";
import { MUD_GAL_PER_1000, TAPE_FT_PER_1000 } from "../lib/calc/drywall.js";
import { MATERIALS } from "../lib/calc/gravel.js";
import { DECKING_SPANS } from "../lib/calc/deck.js";
import { IRC } from "../lib/calc/stairs.js";
import { BUNDLES_PER_SQUARE, ROOF_STYLES } from "../lib/calc/roofing.js";
import { TOOLS } from "../lib/tools.js";
import { UNITS, BRICKS_PER_80LB_BAG, BLOCKS_PER_80LB_BAG } from "../lib/calc/masonry.js";

// A plain-text map of the site for AI assistants and answer engines
// (llmstxt.org format). Google says it does not need this; other engines may use it.
export const GET: APIRoute = async () => {
  const u = (p: string) => new URL(p, SITE.url).href;
  const guides = (await getCollection("guides", (g) => !g.data.draft)).sort((a, b) =>
    a.data.title.localeCompare(b.data.title),
  );

  const body = `# ${SITE.name}

> ${SITE.description} Written by ${AUTHOR.name}. US units throughout.

## Calculators

${TOOLS.map((t) => `- [${t.name}](${u(t.href)}): ${t.blurb}`).join("\n")}
- [All calculators](${u("/calculators/")})

## Guides

${guides.map((g) => `- [${g.data.title}](${u(`/guides/${g.id}/`)}): ${g.data.description}`).join("\n")}

## Key figures used by the calculators

- Concrete bag yields (standard mix): ${BAG_YIELDS.map((b) => `${b.weight} lb = ${b.yieldCuFt} cu ft`).join("; ")}. 1 cubic yard = 27 cu ft.
- Tile waste allowances: ${Object.values(LAYOUTS).map((l) => `${l.label} ${l.wastePct}%`).join("; ")}.
- Paint: ${DEFAULT_COVERAGE} sq ft per gallon default (labels range 250–400); door ${DOOR_SQFT} sq ft; window ${WINDOW_SQFT} sq ft.
- Flooring waste allowances: ${Object.values(FLOORING_LAYOUTS).map((l) => `${l.label} ${l.wastePct}%`).join("; ")}; +5% for rooms with closets or many corners.
- Drywall: 4x8 sheet = 32 sq ft, 4x12 = 48 sq ft; joint compound about ${MUD_GAL_PER_1000} gal and paper tape about ${TAPE_FT_PER_1000} ft per 1,000 sq ft of board; screws 12 in apart on ceilings, 16 in on walls framed 16 in on center.
- Gravel weights used (lb per cubic yard): ${Object.values(MATERIALS).map((m) => `${m.label} ${m.lbPerYd}`).join("; ")}.
- Deck board spans (IRC 2021 Table R507.7): ${DECKING_SPANS.map((d) => `${d.decking} ${d.perpendicular} in on center (${d.diagonal} in diagonal)`).join("; ")}.
- Stairs (IRC R311.7): riser max ${IRC.maxRiserIn} in; tread min ${IRC.minTreadIn} in; variation max ${IRC.maxVariationIn} in; headroom min 6 ft 8 in; width min ${IRC.minWidthIn} in.
- Roofing: 1 square = 100 sq ft; ${BUNDLES_PER_SQUARE} bundles per square for most shingles; pitch multiplier = sqrt(1 + (rise/12)^2); waste ${ROOF_STYLES.gable.wastePct}% gable, ${ROOF_STYLES.hip.wastePct}% hip.
- Mulch: cubic yards = sq ft x depth (in) / 12 / 27; 13.5 bags of 2 cu ft or 9 bags of 3 cu ft per cubic yard; depth 2-4 in (Iowa State Extension), 6 in clear of trunks.
- Fence: posts = sections + 1 + one per gate; 3 rails per section above 4 ft; 1x6 pickets (5.5 in) at no gap = about 17.5 per 8 ft section.
- Brick (BIA Technical Note 10, 3/8 in joints): ${Object.values(UNITS).map((u) => `${u.label} ${u.perSqFt}/sq ft`).join("; ")}. 80 lb Mason Mix lays up to ${BRICKS_PER_80LB_BAG} bricks or ${BLOCKS_PER_80LB_BAG} blocks.
- Wallpaper: count strips; strip = wall height + 4 in rounded up to the pattern repeat; US double roll typically 20.5 in x 33 ft.
- Carpet: bought in full roll-width drops (usually 12 ft wide) + 3 in trim per end; 1 sq yd = 9 sq ft.

## About

- [Methodology](${u("/methodology/")}): every formula, constant and rounding rule.
- [Editorial policy](${u("/editorial-policy/")})
- [About](${u("/about/")}) · [Author](${u(`/author/${AUTHOR.slug}/`)}) · [Contact](${u("/contact/")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
