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
      'Material conversion table in <div class="table-wrap"> (Length/Width vs Bags/Yards needed)',
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
    topic: 'Deck Mud Calculator & Coverage Chart: Shower Pan Dry Pack Ratios',
    slug: 'deck-mud-calculator-coverage-chart-shower-pan',
    tool: 'tile',
    primaryKeyword: 'deck mud calculator square feet coverage chart',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Calculates 4:1 and 5:1 sand-to-portland cement mix, pre-slope thickness (1/4 in per foot), and 50 lb bag counts per shower pan square foot.',
    calculatorLink: '/tile-calculator/'
  },
  {
    topic: 'Garage Floor Concrete Slab Thickness: 4 vs 5 vs 6 Inches Guide',
    slug: 'garage-floor-concrete-slab-thickness-guide',
    tool: 'concrete',
    primaryKeyword: 'garage floor concrete slab thickness',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Compares 4-inch standard car floors, 5-inch SUV/truck parking, and 6-inch 2-post car lift slabs with rebar grid specs.',
    calculatorLink: '/concrete-calculator/'
  },
  {
    topic: 'How Much Paint to Paint a Door (Interior & Exterior Quart Guide)',
    slug: 'how-much-paint-to-paint-a-door-quart-vs-gallon',
    tool: 'paint',
    primaryKeyword: 'how much paint to paint a door quart gallon',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Breaks down door surface area (approx 20 sq ft per side), explaining when 1 quart covers 2 coats vs when a gallon is needed.',
    calculatorLink: '/paint-calculator/'
  },
  {
    topic: 'How to Calculate Square Feet and Yardage for Carpet: Full Formula',
    slug: 'how-to-calculate-square-feet-and-yardage-for-carpet',
    tool: 'carpet',
    primaryKeyword: 'how to calculate square feet for carpet yardage measurement',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Covers length x width in feet divided by 9 to get square yards, seam orientation, and waste buffer for 12 ft vs 15 ft rolls.',
    calculatorLink: '/carpet-calculator/'
  },
  {
    topic: 'How Many Bags of Concrete for a Mailbox Post and 6x6 Fence Post?',
    slug: 'concrete-bags-for-mailbox-and-6x6-posts',
    tool: 'concrete',
    primaryKeyword: 'how many bags of concrete for mailbox post 6x6',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Specific bag calculations for shallow mailbox footings (18-24 in) vs deep 12-inch diameter holes for heavy 6x6 gate posts.',
    calculatorLink: '/concrete-calculator/'
  },
  {
    topic: 'How Many Deck Blocks Do I Need for a Floating Deck?',
    slug: 'how-many-deck-blocks-do-i-need-floating-deck',
    tool: 'deck',
    primaryKeyword: 'how many deck blocks do i need floating deck spacing',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Calculates concrete deck block pier layout grids (5 to 6 ft spacing along beams) for freestanding low-profile decks.',
    calculatorLink: '/deck-calculator/'
  },
  {
    topic: 'Drip Edge Calculator: How Many 10-Foot Pieces for Eaves & Rakes',
    slug: 'drip-edge-calculator-how-many-pieces-for-roof',
    tool: 'roofing',
    primaryKeyword: 'drip edge calculator how many pieces roof linear feet',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Linear footage formula for perimeter eaves and gable rakes, accounting for 2 to 3 inch corner overlaps and 10-foot stock pieces.',
    calculatorLink: '/roofing-calculator/'
  },
  {
    topic: 'Herringbone Flooring Waste Factor: How Much Extra Planks to Order',
    slug: 'herringbone-flooring-waste-factor-and-box-math',
    tool: 'flooring',
    primaryKeyword: 'how much wastage does herringbone flooring have waste factor',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Explains why 45-degree herringbone layouts require 15% to 20% waste allowance due to double 45-degree perimeter wall cuts.',
    calculatorLink: '/flooring-calculator/'
  },
  {
    topic: 'Concrete Sidewalk Thickness: Standard Depth for Walkways & Paths',
    slug: 'concrete-sidewalk-thickness-walkway-depth-rules',
    tool: 'concrete',
    primaryKeyword: 'concrete sidewalk thickness how thick concrete walkway',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Municipal code standards: 4 inches for residential sidewalks, thickened 6-inch driveway apron crossings, and 4-inch gravel bases.',
    calculatorLink: '/concrete-calculator/'
  },
  {
    topic: 'Concrete Slab Thickness: 4 vs 6 Inches for Sheds, Patios and Driveways',
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
  },
  {
    topic: 'Architectural vs 3-Tab Shingles: Bundles per Square and Lifespan',
    slug: 'architectural-vs-3-tab-shingles-bundles-per-square',
    tool: 'roofing',
    primaryKeyword: 'architectural vs 3 tab shingles bundles per square',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Breaks down 3 bundles per square math, weight differences (240 lbs vs 190 lbs per square), and wind resistance ratings.',
    calculatorLink: '/roofing-calculator/'
  },
  {
    topic: 'Rebar Spacing and Size for Concrete Patios and Slabs',
    slug: 'rebar-spacing-and-size-for-concrete-slabs',
    tool: 'concrete',
    primaryKeyword: 'rebar spacing size concrete slab patio grid',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Details #3 (3/8 in) vs #4 (1/2 in) rebar grids on 12-inch or 18-inch centers, chair placement, and lap splice clearance.',
    calculatorLink: '/concrete-calculator/'
  },
  {
    topic: 'Mortar Mix Ratio for Brick Laying: Type N vs Type S Proportions',
    slug: 'mortar-mix-ratio-brick-laying-type-n-vs-s',
    tool: 'brick',
    primaryKeyword: 'mortar mix ratio brick laying type n type s',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Explains sand-to-cement ratios (1:1:6 vs 1:0.5:4.5) for non-bearing vs load-bearing exterior brick walls.',
    calculatorLink: '/brick-calculator/'
  },
  {
    topic: 'Paver Base Depth: How Deep to Excavate Sand and Crushed Stone',
    slug: 'paver-base-depth-sand-and-crushed-stone-layers',
    tool: 'gravel',
    primaryKeyword: 'paver base depth sand crushed stone gravel',
    formatType: 'Step-by-Step Substrate & Installation Walkthrough',
    clickHook: 'Detailed 7-inch to 9-inch excavation blueprint: 4-6 inches compacted quarry process, 1 inch coarse bedding sand, and paver thickness.',
    calculatorLink: '/gravel-calculator/'
  },
  {
    topic: 'Deck Beam Span Rules and Sizing: 2x8, 2x10, and 2x12 Joists',
    slug: 'deck-beam-span-rules-and-sizing-joists',
    tool: 'deck',
    primaryKeyword: 'deck beam span rules sizing 2x8 2x10 2x12',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'IRC span tables comparing Southern Pine vs Douglas Fir beam cantilevers and post spacing requirements.',
    calculatorLink: '/deck-calculator/'
  },
  {
    topic: 'Hardwood Flooring Waste Factor for Straight vs Diagonal Layouts',
    slug: 'hardwood-flooring-waste-factor-straight-vs-diagonal',
    tool: 'flooring',
    primaryKeyword: 'hardwood flooring waste factor straight diagonal',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'How to calculate 7-10% extra for parallel runs vs 15-20% for diagonal, herringbone, and bordered room designs.',
    calculatorLink: '/flooring-calculator/'
  },
  {
    topic: 'How Many Retaining Wall Blocks Do I Need: Trench and Step Math',
    slug: 'how-many-retaining-wall-blocks-formula',
    tool: 'brick',
    primaryKeyword: 'how many retaining wall blocks do i need formula',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Step-by-step wall block calculation accounting for buried starter course, capstones, and geogrid reinforcement.',
    calculatorLink: '/brick-calculator/'
  },
  {
    topic: 'Carpet Padding Thickness and Density: 7/16 vs 1/2 Inch Rebond',
    slug: 'carpet-padding-thickness-and-density-rebond-guide',
    tool: 'carpet',
    primaryKeyword: 'carpet padding thickness density rebond weight',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Compares 6 lb vs 8 lb density and 7/16 vs 1/2 inch thickness against manufacturer warranty requirements.',
    calculatorLink: '/carpet-calculator/'
  },
  {
    topic: 'Thinset Mortar Coverage per Bag: Trowel Notch Sizing Rules',
    slug: 'thinset-mortar-coverage-per-bag-trowel-notch-guide',
    tool: 'tile',
    primaryKeyword: 'thinset mortar coverage per bag trowel notch size',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Covers 50 lb bag square foot yield across 1/4-inch square, 1/2-inch square, and U-notch trowels.',
    calculatorLink: '/tile-calculator/'
  },
  {
    topic: 'French Drain Gravel Depth and Trench Volume per Linear Foot',
    slug: 'french-drain-gravel-depth-and-trench-volume',
    tool: 'gravel',
    primaryKeyword: 'french drain gravel depth trench volume per foot',
    formatType: 'Step-by-Step Substrate & Installation Walkthrough',
    clickHook: 'Details #57 washed stone volume per 50-foot run, fabric wrapping, and 1% minimum slope grading.',
    calculatorLink: '/gravel-calculator/'
  },
  {
    topic: 'Roofing Underlayment Rolls per Square: Felt vs Synthetic Coverage',
    slug: 'roofing-underlayment-rolls-per-square-synthetic-vs-felt',
    tool: 'roofing',
    primaryKeyword: 'roofing underlayment rolls per square synthetic vs felt',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Compares 4-square felt rolls vs 10-square synthetic rolls, including head-lap and side-lap waste.',
    calculatorLink: '/roofing-calculator/'
  },
  {
    topic: 'Drywall Mud per Sheet: All-Purpose Joint Compound Pail Math',
    slug: 'drywall-mud-per-sheet-joint-compound-calculator',
    tool: 'drywall',
    primaryKeyword: 'drywall mud per sheet gallons joint compound',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Calculates 4.5-gallon buckets needed per 100 sheets across taping, fill, and skim finishing coats.',
    calculatorLink: '/drywall-calculator/'
  },
  {
    topic: 'Exterior Paint Gallons per 1,000 Sq Ft: Siding and Stucco Coverage',
    slug: 'exterior-paint-gallons-per-1000-sq-ft-siding-stucco',
    tool: 'paint',
    primaryKeyword: 'exterior paint gallons per 1000 sq ft siding stucco',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Contrasts smooth cedar lap siding (350 sq ft/gal) against porous masonry stucco (200 sq ft/gal).',
    calculatorLink: '/paint-calculator/'
  },
  {
    topic: 'Deck Stair Stringer Spacing: 12 vs 16 Inches for Wood vs Composite',
    slug: 'deck-stair-stringer-spacing-wood-vs-composite-rules',
    tool: 'stairs',
    primaryKeyword: 'deck stair stringer spacing wood vs composite',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Explains why composite treads sag at 16 inches on center, requiring 10-12 inch stringer spacing under IRC.',
    calculatorLink: '/stair-calculator/'
  },
  {
    topic: 'Mulch vs Wood Chips vs Bark: Cubic Yard Weight and Breakdown Rates',
    slug: 'mulch-vs-wood-chips-cubic-yard-weight-and-coverage',
    tool: 'mulch',
    primaryKeyword: 'mulch vs wood chips cubic yard weight coverage depth',
    formatType: 'Code & Thickness Decision Matrix',
    clickHook: 'Compares double-shredded hardwood, cedar nuggets, and wood chips by cubic yard weight and settling depth.',
    calculatorLink: '/mulch-calculator/'
  },
  {
    topic: 'Wallpaper for Accent Walls: Calculating Pattern Drops Without Waste',
    slug: 'wallpaper-accent-wall-pattern-drop-waste-guide',
    tool: 'wallpaper',
    primaryKeyword: 'wallpaper accent wall pattern drop repeat waste rolls',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Step-by-step strip count and vertical drop alignment math specifically for single feature accent walls.',
    calculatorLink: '/wallpaper-calculator/'
  },
  {
    topic: 'Split Rail Fence Post and Rail Counts per 100 Linear Feet',
    slug: 'split-rail-fence-post-and-rail-counts-per-100-feet',
    tool: 'fence',
    primaryKeyword: 'split rail fence materials list per 100 feet',
    formatType: 'Material Estimation & Bag Count Guide',
    clickHook: 'Calculates 2-rail vs 3-rail post counts, 10-foot rail overlaps, and corner post positioning.',
    calculatorLink: '/fence-calculator/'
  }
];
