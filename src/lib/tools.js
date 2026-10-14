// Every calculator on the site, in one list. Navigation, the calculators hub,
// guide sidebars, llms.txt and the guide schema all read from here, so a new
// calculator is added in one place (plus its page and its page date).
// `key` is also the value of `tool` in guide frontmatter and in Supabase.

export const TOOLS = [
  { key: "concrete", name: "Concrete calculator", topic: "Concrete", href: "/concrete-calculator/", group: "Outdoor and structure", blurb: "Cubic yards and bag counts for slabs, columns and post holes." },
  { key: "gravel", name: "Gravel calculator", topic: "Gravel and sand", href: "/gravel-calculator/", group: "Outdoor and structure", blurb: "Cubic yards, tons and bags of gravel, sand or topsoil for any depth." },
  { key: "deck", name: "Deck calculator", topic: "Deck", href: "/deck-calculator/", group: "Outdoor and structure", blurb: "Deck boards, joists and screws, with real board lengths and offcuts." },
  { key: "roofing", name: "Roofing calculator", topic: "Roofing", href: "/roofing-calculator/", group: "Outdoor and structure", blurb: "Roof area from pitch, squares, shingle bundles and edge trim." },
  { key: "fence", name: "Fence calculator", topic: "Fence", href: "/fence-calculator/", group: "Outdoor and structure", blurb: "Posts, rails, pickets and bags of concrete for a wood fence with gates." },
  { key: "brick", name: "Brick and block calculator", topic: "Brick and block", href: "/brick-calculator/", group: "Outdoor and structure", blurb: "Bricks or concrete blocks and bags of mortar for a wall, plus pavers." },
  { key: "mulch", name: "Mulch calculator", topic: "Mulch and soil", href: "/mulch-calculator/", group: "Outdoor and structure", blurb: "Bags or cubic yards of mulch, compost or garden soil for beds and raised beds." },
  { key: "stairs", name: "Stair calculator", topic: "Stairs", href: "/stair-calculator/", group: "Outdoor and structure", blurb: "Risers, treads and stringer length, checked against IRC limits." },
  { key: "tile", name: "Tile calculator", topic: "Tile", href: "/tile-calculator/", group: "Inside the house", blurb: "Tiles and boxes, with grout joint and layout waste." },
  { key: "flooring", name: "Flooring calculator", topic: "Flooring", href: "/flooring-calculator/", group: "Inside the house", blurb: "Boxes of laminate, vinyl plank or wood flooring, plus underlayment." },
  { key: "drywall", name: "Drywall calculator", topic: "Drywall", href: "/drywall-calculator/", group: "Inside the house", blurb: "Sheets, screws, joint compound and tape for walls and ceilings." },
  { key: "carpet", name: "Carpet calculator", topic: "Carpet", href: "/carpet-calculator/", group: "Inside the house", blurb: "Square yards to buy from a 12 ft roll, with seams, pad and tack strip." },
  { key: "wallpaper", name: "Wallpaper calculator", topic: "Wallpaper", href: "/wallpaper-calculator/", group: "Inside the house", blurb: "Rolls of wallpaper counted strip by strip, with the pattern repeat." },
  { key: "paint", name: "Paint calculator", topic: "Paint", href: "/paint-calculator/", group: "Inside the house", blurb: "Gallons and quarts for walls, ceilings and primer." },
  { key: "area", name: "Square footage calculator", topic: "Measuring", href: "/square-footage-calculator/", group: "Measuring", blurb: "Square feet of any room or shape, in sq yd, m² and acres too." },
];

export const TOOL_KEYS = TOOLS.map((t) => t.key);
export const TOOL_BY_KEY = Object.fromEntries(TOOLS.map((t) => [t.key, t]));
export const TOOL_GROUPS = [...new Set(TOOLS.map((t) => t.group))].map((group) => ({
  group,
  tools: TOOLS.filter((t) => t.group === group),
}));
