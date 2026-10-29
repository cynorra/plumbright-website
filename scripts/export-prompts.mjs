import fs from "node:fs";

const guides = JSON.parse(fs.readFileSync("scripts/guide-prompts-data.json", "utf8"));

const scenarios = {
  // Concrete
  "how-many-bags-of-concrete-for-10x10-slab": "Authentic jobsite close-up of a 10x10 wooden formwork frame for a patio slab, rebar grid on plastic chairs, stacked 80-pound concrete mix bags in the background, contractor trowel on edge of form, warm morning sunlight, Canon EOS R5 50mm f/1.8, editorial construction photography --ar 16:9 --style raw --v 6.0",
  "concrete-bag-sizes-40-60-80-lb": "Side-by-side comparison of 40lb, 60lb, and 80lb commercial concrete mix bags stacked on a wooden pallet in a hardware yard, texture of heavy kraft paper, yellow tape measure lying nearby, realistic workshop lighting, 35mm lens --ar 16:9 --style raw --v 6.0",
  "concrete-slab-thickness": "Cross-section view of a poured concrete slab showing crushed stone compacted subbase, moisture vapor barrier, welded wire mesh reinforcement, and smooth screeded concrete top, realistic depth of field, construction field manual photography --ar 16:9 --style raw --v 6.0",
  "concrete-slab-thickness-shed-patio-driveway": "Deep concrete footing trench dug into earth, sonotube cardboard form extending above ground with rebar cage inserted, wooden stakes and level string line, early morning jobsite lighting, authentic contractor perspective --ar 16:9 --style raw --v 6.0",
  "concrete-for-fence-posts": "Close-up of a 4x4 pressure-treated wooden post set in a clean cylindrical post hole, freshly mixed wet concrete poured around the base, steel spirit level magnetically clamped to the side showing plumb, gravel drainage at base --ar 16:9 --style raw --v 6.0",

  // Tile & Grout
  "how-many-tiles-in-a-box": "Unboxing opened cardboard cartons of ceramic subway tiles on a workbench, showing stacked tiles with protective corner paper, notched steel trowel, spacers, and architectural measuring tape, authentic craft detail, shallow depth of field --ar 16:9 --style raw --v 6.0",
  "how-much-grout-do-i-need": "Close-up macro shot of a rubber grout float pressing sanded cementitious grout diagonally across newly laid floor tiles, clean 1/8 inch grout lines, damp sponge resting on tile rim, high texture detail, natural bathroom lighting --ar 16:9 --style raw --v 6.0",
  "tile-waste-factor-by-layout": "Herringbone tile pattern being laid out on subfloor with cross spacers, diagonal corner cuts resting near an electric wet saw, chalk snap lines visible, professional tiler hand adjusting a tile, 50mm macro lens --ar 16:9 --style raw --v 6.0",

  // Flooring & Carpet
  "how-many-boxes-of-vinyl-plank-flooring": "Realistic living room renovation scene, stack of luxury vinyl plank (LVP) flooring cartons, half-installed wood-grain interlocking floorboards, tapping block, rubber mallet, and pull bar resting on acoustic underlayment, natural window light --ar 16:9 --style raw --v 6.0",
  "flooring-waste-factor": "Hardwood floor installation scene with cut angled end pieces, measuring tape, pencil marks, and staggered planks laid out along a room perimeter, realistic wood dust and grain texture, editorial home improvement magazine shot --ar 16:9 --style raw --v 6.0",
  "carpet-roll-width-and-seams": "Unrolled 12-foot broadloom textured berber carpet across a plywood subfloor, carpet seam iron and seaming heat tape visible along a tight joint, knee kicker and linoleum knife nearby, authentic installer perspective --ar 16:9 --style raw --v 6.0",
  "how-much-carpet-do-i-need": "Overhead architectural shot of a living room floor prepared for wall-to-wall carpeting with tack strips nailed along baseboards and dense foam underlayment pads laid out, rolled carpet roll in background, crisp natural lighting --ar 16:9 --style raw --v 6.0",

  // Drywall
  "how-many-sheets-of-drywall-for-a-12x12-room": "A 12x12 room framed in 2x4 studs with partial 4x8 drywall panels hung on walls, drywall screw gun, collated screws, and T-square resting against unfinished gypsum panel, realistic contractor jobsite lighting --ar 16:9 --style raw --v 6.0",
  "4x8-vs-4x12-drywall": "Comparison of stacked 4x8 and 4x12 foot gypsum boards leaning against wood stud framing in a high-ceiling residential room, drywall lift in background, natural daylight streaming through framed windows --ar 16:9 --style raw --v 6.0",
  "drywall-screws-mud-and-tape": "Close-up of a stainless steel drywall taping knife smoothing joint compound over paper tape on a tapered drywall seam, mud pan, screw heads driven just below paper surface, authentic plaster texture, 50mm lens --ar 16:9 --style raw --v 6.0",

  // Decking & Lumber
  "deck-joist-spacing": "Underneath view of a residential deck framing showing pressure-treated 2x8 joists resting on a heavy beam, metal hurricane ties, joist hangers with structural screws, and galvanized hardware, realistic outdoor carpentry --ar 16:9 --style raw --v 6.0",
  "deck-joist-spacing-12-vs-16-vs-24-inches": "Framing inspection shot of a deck structure with joists spaced on center, heavy 6x6 support posts notched with galvanized carriage bolts, tape measure hooked on joist showing center spacing, sunny yard background --ar 16:9 --style raw --v 6.0",
  "how-many-deck-boards-do-i-need": "Installation of composite or cedar decking boards onto framing, hidden fastener clips being screwed in, spacer tool maintaining uniform gaps, cordless impact driver resting on finished boards, warm outdoor lighting --ar 16:9 --style raw --v 6.0",

  // Fence
  "privacy-fence-materials-list": "Western red cedar privacy fence under construction in a suburban backyard, plumb 4x4 posts in concrete footings, horizontal 2x4 rails attached, vertical dog-ear pickets stacked on grass, string line guiding top height --ar 16:9 --style raw --v 6.0",
  "fence-post-spacing": "Straight line of wooden fence posts installed every 8 feet across a green lawn, high-contrast taut string line running along post faces, post-hole digger and bag of quick-setting concrete resting on grass --ar 16:9 --style raw --v 6.0",
  "how-many-fence-pickets-do-i-need": "Close-up of pneumatic nail gun fastening vertical cedar fence pickets to horizontal backer rails, consistent spacing block between pickets, wood grain detail, soft late afternoon sunlight --ar 16:9 --style raw --v 6.0",

  // Paint & Wallpaper
  "how-much-paint-for-a-12x12-room": "Interior painting setup in a bedroom with canvas drop cloths, painter's blue tape cleanly masking baseboards, paint tray with matte eggshell paint, 9-inch roller loaded on drywall wall, natural window daylight --ar 16:9 --style raw --v 6.0",
  "how-much-paint-for-kitchen-cabinets": "Close-up of a kitchen cabinet door being primed with an angled sash brush, satin finish enamel paint can, fine-grit sanding sponge, and de-glossed wood grain visible on worktable, realistic workshop scene --ar 16:9 --style raw --v 6.0",
  "primer-and-second-coats": "Split-wall visual demonstration showing raw drywall, first coat of tinted PVA primer, and a smooth topcoat of interior latex paint, roller stipple texture visible under directional lighting, professional painter perspective --ar 16:9 --style raw --v 6.0",
  "how-many-rolls-of-wallpaper-do-i-need": "Rolls of textured designer wallpaper unrolled on a long pasting table, metal wallpaper straight edge, smoothing brush, and snap-off utility knife, plumb plumb-bob hanging against wall in background --ar 16:9 --style raw --v 6.0",
  "wallpaper-pattern-repeat": "Close-up of aligning an intricate floral geometric wallpaper repeat seam on a wall, wallpaper smoothing tool pressing out air bubbles, laser level line projected vertically down the seam, crisp macro detail --ar 16:9 --style raw --v 6.0",

  // Gravel, Mulch & Landscape
  "gravel-driveway-depth-and-layers": "Cross-section excavation edge of a gravel driveway showing geofabric underlayment, large #3 crushed stone base layer, and fine compacted crusher run topping, commercial vibratory plate compactor nearby --ar 16:9 --style raw --v 6.0",
  "gravel-driveway-base-layers-depth-and-sizes": "Side-by-side display of gravel types: large angular road base #411 crushed stone vs round pea gravel, sitting on geotextile fabric with measuring caliper, outdoor landscape supply yard daylight --ar 16:9 --style raw --v 6.0",
  "how-much-does-a-cubic-yard-of-gravel-weigh": "Commercial dump truck bed tipping a load of 3/4 inch clean crushed stone gravel onto a residential driveway, dust plume, heavy steel shovel and wheelbarrow waiting in foreground, realistic construction shot --ar 16:9 --style raw --v 6.0",
  "how-deep-should-mulch-be": "Gardener inserting a wooden ruler into dark organic shredded hardwood mulch around shrub root flare, showing exact 3-inch depth measurement, drip irrigation tube visible, rich fertile earth textures --ar 16:9 --style raw --v 6.0",
  "how-much-mulch-do-i-need": "Freshly delivered pile of dark brown double-shredded bark mulch on driveway tarp, steel landscaping rake, commercial wheelbarrow with pneumatic tire, suburban flower beds in background --ar 16:9 --style raw --v 6.0",
  "how-many-bags-of-mulch-in-a-yard": "Stack of 2-cubic-foot plastic mulch bags beside a garden bed edge, plastic mulch shovel, natural cedar mulch spilled slightly showing fibrous texture, warm sunny garden setting --ar 16:9 --style raw --v 6.0",
  "how-much-soil-for-a-raised-bed": "Cedar raised garden bed filled with rich dark compost loam potting mix, small garden trowel, bag of perlite, and wooden corner brackets with stainless hardware, lush vegetable garden background --ar 16:9 --style raw --v 6.0",

  // Roofing
  "how-many-bundles-of-shingles-in-a-square": "Roofing jobsite showing bundles of architectural asphalt fiberglass shingles stacked across roof ridge, coil roofing nailer with yellow hose, chalk lines snapped on synthetic underlayment, steep pitch perspective --ar 16:9 --style raw --v 6.0",
  "roof-pitch-multiplier-chart": "Close-up of a carpenter speed square measuring roof rafter pitch angle against a sloped fascia board, plumb line, metal drip edge and ice-and-water shield membrane visible, blue sky background --ar 16:9 --style raw --v 6.0",

  // Stairs
  "stair-rise-and-run": "Wooden stair stringer layout on a 2x12 framing lumber plank, framing square fitted with brass stair gauges marking 7.5 inch rise and 10 inch run, carpenter pencil lines clearly visible, sawdust texture, workshop scene --ar 16:9 --style raw --v 6.0",
  "how-to-calculate-stair-stringer-length": "Three precision-cut 2x12 stair stringers mounted with metal stringer hanger brackets to a deck header beam, level resting across tread cutouts, ground gravel pad below, authentic outdoor building photo --ar 16:9 --style raw --v 6.0",

  // Masonry & Pavers
  "how-many-bricks-per-square-foot": "Masons laying standard modular red clay facing bricks with 3/8 inch concave mortar joints, steel brick trowel with wet gray mortar, mason line stretched between corner corner-blocks, rich terracotta texture --ar 16:9 --style raw --v 6.0",
  "how-many-concrete-blocks-do-i-need": "Stack of standard 8x8x16 hollow core concrete masonry units (CMU blocks) on jobsite, mason mortar board with freshly mixed mortar, rebar dowels protruding from footing, crisp morning jobsite light --ar 16:9 --style raw --v 6.0",
  "how-much-mortar-do-i-need": "Commercial electric paddle mixer inside a heavy mortar tub blending sand, portland cement and lime, buttery smooth mortar texture clinging to mason trowel, bags of Type N mortar mix in background --ar 16:9 --style raw --v 6.0",
  "how-many-pavers-do-i-need": "Interlocking concrete herringbone patio pavers being laid on a screeded sand bed, edge restraint spiked into compacted base, deadblow rubber mallet and chalk line, authentic patio construction detail --ar 16:9 --style raw --v 6.0",
  "how-much-sand-under-pavers": "Cross-section of paver patio preparation: compacted crushed stone base, two 1-inch metal screed pipes set in washed concrete sand, long aluminum screed bar smoothing the flat sand bedding, crisp detail --ar 16:9 --style raw --v 6.0",

  // General & Area
  "how-to-measure-an-l-shaped-room": "Interior room floor plan perspective of an L-shaped living space, digital laser distance measure emitting red beam across walls, clipboard with architectural hand sketch and dimensions, natural daylight --ar 16:9 --style raw --v 6.0",
  "square-feet-vs-linear-feet-vs-board-feet": "Woodworker workbench with dimensional 2x4 framing lumber, wide rough-sawn hardwood board, tape measure extended showing inches and feet, steel carpenter ruler, natural craftsman workshop atmosphere --ar 16:9 --style raw --v 6.0"
};

const items = guides.map((g, idx) => {
  const prompt = scenarios[g.slug] || `Authentic editorial construction and DIY field photograph of ${g.title}, focusing on real materials, professional tools, precise measurements, natural workshop or jobsite daylight, Canon EOS R5 50mm f/1.8 lens, high texture detail, no stock poses --ar 16:9 --style raw --v 6.0`;
  return {
    index: idx + 1,
    slug: g.slug,
    fileName: `${g.slug}.webp`,
    targetPath: `public/images/guides/${g.slug}.webp`,
    title: g.title,
    tool: g.tool,
    prompt: prompt
  };
});

// 1. Clean plain text format for quick one-click copying
let txt = `================================================================================
PLUMBRIGHT - BLOG KAPAK GÖRSEL PROMPTLARI (44 REHBER)
================================================================================
KAYIT KLASÖRÜ: public/images/guides/
ÖNERİLEN FORMAT: .webp (veya .jpg)
ÖLÇÜ: 16:9 (1200x675 veya 1280x720)
NEGATİF PROMPT:
no corporate stock photos, no fake smiling models looking at camera, no artificial 3D cartoon, no floating text, no distorted tools, no watermark, no blurred low-res
================================================================================

`;

items.forEach(it => {
  txt += `[${it.index}/44] DOSYA ADI: ${it.fileName}\n`;
  txt += `BAŞLIK: ${it.title} (${it.tool})\n`;
  txt += `KAYDEDİLECEK YER: ${it.targetPath}\n`;
  txt += `PROMPT:\n${it.prompt}\n\n`;
  txt += `--------------------------------------------------------------------------------\n\n`;
});

fs.writeFileSync("prompts.txt", txt, "utf8");

// 2. Structured JSON format for automated generation or scripts
fs.writeFileSync("prompts.json", JSON.stringify(items, null, 2), "utf8");

console.log("Created prompts.txt and prompts.json successfully!");
