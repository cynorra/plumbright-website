import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, AUTHOR } from "../site.config.js";
import { BAG_YIELDS } from "../lib/calc/concrete.js";
import { LAYOUTS } from "../lib/calc/tile.js";
import { DOOR_SQFT, WINDOW_SQFT, DEFAULT_COVERAGE } from "../lib/calc/paint.js";

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

- [Concrete calculator](${u("/concrete-calculator/")}): cubic yards and 40/50/60/80 lb bag counts for slabs, round columns and fence post holes.
- [Tile calculator](${u("/tile-calculator/")}): tiles and boxes for floors and walls, including grout joint width and layout waste.
- [Paint calculator](${u("/paint-calculator/")}): gallons and quarts of paint and primer for a room, minus doors and windows.

## Guides

${guides.map((g) => `- [${g.data.title}](${u(`/guides/${g.id}/`)}): ${g.data.description}`).join("\n")}

## Key figures used by the calculators

- Concrete bag yields (standard mix): ${BAG_YIELDS.map((b) => `${b.weight} lb = ${b.yieldCuFt} cu ft`).join("; ")}. 1 cubic yard = 27 cu ft.
- Tile waste allowances: ${Object.values(LAYOUTS).map((l) => `${l.label} ${l.wastePct}%`).join("; ")}.
- Paint: ${DEFAULT_COVERAGE} sq ft per gallon default (labels range 250–400); door ${DOOR_SQFT} sq ft; window ${WINDOW_SQFT} sq ft.

## About

- [Methodology](${u("/methodology/")}): every formula, constant and rounding rule.
- [Editorial policy](${u("/editorial-policy/")})
- [About](${u("/about/")}) · [Author](${u(`/author/${AUTHOR.slug}/`)}) · [Contact](${u("/contact/")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
