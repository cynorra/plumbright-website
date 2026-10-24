// High-Intent, Zero-Click Resistant Topic Bank for Plumbright (Home Improvement & Construction Calculators).
// Designed specifically to beat Google AI Overview by focusing on:
// 1. Precise Material Math & Formula Breakdown (Bags, cubic yards, square feet, waste factors)
// 2. Clear Comparison Tables (Slab thickness, bag sizes, fastener counts)
// 3. Trade Best Practices (Gravel base depths, expansion joints, frost line codes)

export const CONTENT_FORMATS = [
  {
    type: 'Material Estimation & Bag Count Guide',
    description: 'Exact formulas and bag/unit counts for slabs, walls, or rooms with waste margins',
    structureRequirements: [
      'Core math formula clearly explained step-by-step',
      'Material conversion table in <div class=" table-wrap\> (Length/Width vs Bags/Yards needed)',
 'Worked real-world project example'
 ]
 },
 {
 type: 'Code & Thickness Decision Matrix',
 description: 'Comparison of dimensions, thicknesses, and lumber spans against IRC building codes',
 structureRequirements: [
 'Comparative specification table',
 'Structural recommendations based on load requirements',
 'Common DIY sizing mistakes to avoid'
 ]
 },
 {
 type: 'Step-by-Step Substrate & Installation Walkthrough',
 description: 'Underlayment, base preparation, spacing, and fastening instructions',
 structureRequirements: [
 'Numbered prep steps with tools and material specs',
 'Depth and slope requirements table',
 'Crucial setting and curing checkpoints'
 ]
 }
];

export const ZERO_CLICK_TOPIC_BANK = [
 {
 topic: 'Concrete Slab Thickness for Sheds, Patios and Driveways',
 slug: 'concrete-slab-thickness-shed-patio-driveway',
 tool: 'concrete',
 primaryKeyword: 'concrete slab thickness shed patio driveway',
 formatType: 'Code & Thickness Decision Matrix',
 clickHook: 'Compares 4-inch vs 6-inch slabs, gravel base depth, and rebar reinforcement rules for different weight loads.',
 calculatorLink: '/concrete-calculator/'
 },
 {
 topic: 'How Many Bags of Concrete for a 10x10 Slab at 4 Inches?',
 slug: 'how-many-bags-of-concrete-for-10x10-slab',
 tool: 'concrete',
 primaryKeyword: 'bags of concrete for 10x10 slab 4 inches',
 formatType: 'Material Estimation & Bag Count Guide',
 clickHook: 'Breaks down the 1.23 cubic yard formula, converting into 40 lb, 60 lb, and 80 lb bag counts with a 10% waste buffer.',
 calculatorLink: '/concrete-calculator/'
 },
 {
 topic: 'Gravel Driveway Base Layers: Proper Depth and Stone Sizes',
 slug: 'gravel-driveway-base-layers-depth-and-sizes',
 tool: 'gravel',
 primaryKeyword: 'gravel driveway base layers depth stone size',
 formatType: 'Step-by-Step Substrate & Installation Walkthrough',
 clickHook: 'Explains the 3-layer system (#3 stone base, #57 middle, and crusher run top) with tonnage calculation per 100 feet.',
 calculatorLink: '/gravel-calculator/'
 },
 {
 topic: 'Deck Joist Spacing: 12 vs 16 vs 24 Inches on Center Explained',
 slug: 'deck-joist-spacing-12-vs-16-vs-24-inches',
 tool: 'deck',
 primaryKeyword: 'deck joist spacing 12 vs 16 vs 24 inches',
 formatType: 'Code & Thickness Decision Matrix',
 clickHook: 'Details when composite boards require 12-inch centers vs standard 16-inch framing for pressure-treated wood.',
 calculatorLink: '/deck-calculator/'
 },
 {
 topic: 'How Many Gallons of Paint for a 15x15 Room (Walls and Ceiling)?',
 slug: 'how-many-gallons-of-paint-for-15x15-room',
 tool: 'paint',
 primaryKeyword: 'paint gallons for 15x15 room walls ceiling',
 formatType: 'Material Estimation & Bag Count Guide',
 clickHook: 'Subtracts standard doors and windows from wall surface area, comparing 1-coat vs 2-coat primer coverage math.',
 calculatorLink: '/paint-calculator/'
 },
 {
 topic: 'Tile Waste Factor: How Much Extra Tile to Order by Pattern',
 slug: 'tile-waste-factor-percentage-by-pattern-layout',
 tool: 'tile',
 primaryKeyword: 'tile waste factor percentage layout',
 formatType: 'Code & Thickness Decision Matrix',
 clickHook: 'Provides exact waste allowances: 10% for straight grid, 15% for diagonal herringbone, and 20% for large-format porcelain.',
 calculatorLink: '/tile-calculator/'
 },
 {
 topic: 'Fence Post Depth and Frost Line Rules: How Deep to Dig',
 slug: 'fence-post-depth-frost-line-rules-how-deep-to-dig',
 tool: 'fence',
 primaryKeyword: 'fence post depth frost line how deep to dig',
 formatType: 'Step-by-Step Substrate & Installation Walkthrough',
 clickHook: 'Covers the 1/3 rule (post depth relative to height) and how to anchor below local frost heave zones.',
 calculatorLink: '/fence-calculator/'
 },
 {
 topic: 'How Many Drywall Screws per 4x8 Sheet (Ceilings vs Walls)?',
 slug: 'how-many-drywall-screws-per-sheet-walls-ceilings',
 tool: 'drywall',
 primaryKeyword: 'how many drywall screws per sheet walls ceilings',
 formatType: 'Material Estimation & Bag Count Guide',
 clickHook: 'Compares 12-inch spacing for ceilings (approx 32 screws) vs 16-inch spacing for walls (approx 28 screws) with pound conversions.',
 calculatorLink: '/drywall-calculator/'
 }
];
