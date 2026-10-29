// Generates beautiful, responsive 16:9 SVG cover illustrations for each category and guide.
// Saves directly to public/images/guides/[tool].svg

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "images", "guides");

const CATEGORY_GRAPHICS = {
  concrete: {
    title: "CONCRETE & SLABS",
    subtitle: "Mix Yields, Rebar Grids & Curing Standards",
    accent: "#ea580c", // rich orange
    badge: "3,000 - 4,000 PSI",
    svgIllustration: `
      <!-- Concrete Slab & Grid Vector -->
      <rect x="220" y="240" width="360" height="110" rx="8" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="220" y="210" width="360" height="30" rx="4" fill="#64748b" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Dimension Lines -->
      <line x1="200" y1="210" x2="200" y2="350" stroke="#ea580c" stroke-width="2" stroke-dasharray="4 4"/>
      <polyline points="195,215 200,210 205,215" fill="none" stroke="#ea580c" stroke-width="2"/>
      <polyline points="195,345 200,350 205,345" fill="none" stroke="#ea580c" stroke-width="2"/>
      <text x="180" y="285" fill="#ea580c" font-size="14" font-weight="700" text-anchor="middle" transform="rotate(-90 180 285)">4" - 6" SLAB</text>
      <!-- Rebar Grid Inside Slab -->
      <line x1="240" y1="270" x2="560" y2="270" stroke="#f97316" stroke-width="4"/>
      <line x1="240" y1="310" x2="560" y2="310" stroke="#f97316" stroke-width="4"/>
      <line x1="290" y1="250" x2="290" y2="340" stroke="#f97316" stroke-width="4"/>
      <line x1="370" y1="250" x2="370" y2="340" stroke="#f97316" stroke-width="4"/>
      <line x1="450" y1="250" x2="450" y2="340" stroke="#f97316" stroke-width="4"/>
      <line x1="520" y1="250" x2="520" y2="340" stroke="#f97316" stroke-width="4"/>
      <!-- Gravel Base Below -->
      <rect x="220" y="350" width="360" height="40" fill="#1e293b" opacity="0.8"/>
      <circle cx="250" cy="370" r="6" fill="#94a3b8"/>
      <circle cx="280" cy="375" r="7" fill="#64748b"/>
      <circle cx="320" cy="368" r="8" fill="#94a3b8"/>
      <circle cx="360" cy="374" r="7" fill="#64748b"/>
      <circle cx="410" cy="370" r="8" fill="#94a3b8"/>
      <circle cx="460" cy="372" r="6" fill="#64748b"/>
      <circle cx="510" cy="368" r="9" fill="#94a3b8"/>
      <text x="400" y="415" fill="#94a3b8" font-size="13" font-weight="600" text-anchor="middle">SUB-BASE GRAVEL CUSHION (4" - 6")</text>
    `
  },
  gravel: {
    title: "GRAVEL & AGGREGATE",
    subtitle: "Stone Sizing, Multi-Layer Base & Compaction Tonnage",
    accent: "#d97706",
    badge: "1.4 Tons / Cu Yd",
    svgIllustration: `
      <!-- 3 Layer Cross Section -->
      <rect x="200" y="190" width="400" height="50" fill="#475569" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="220" y="220" fill="#f8fafc" font-size="14" font-weight="700">TOP: CRUSHER RUN (2" Compacted Fines)</text>
      
      <rect x="200" y="240" width="400" height="70" fill="#334155" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="220" y="280" fill="#f8fafc" font-size="14" font-weight="700">MIDDLE: #57 STONE (4" Choking Layer)</text>
      
      <rect x="200" y="310" width="400" height="85" fill="#1e293b" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="220" y="355" fill="#f8fafc" font-size="14" font-weight="700">BASE: #3 HEAVY STONE (6" Ballast)</text>
      
      <!-- Geotextile Line -->
      <line x1="180" y1="395" x2="620" y2="395" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 3"/>
      <text x="400" y="420" fill="#f59e0b" font-size="13" font-weight="600" text-anchor="middle">HEAVY-DUTY NON-WOVEN GEOTEXTILE FABRIC</text>
    `
  },
  deck: {
    title: "DECKING & FRAMING",
    subtitle: "IRC Joist Spacing, Beam Cantilevers & Board Math",
    accent: "#b45309",
    badge: "IRC Table R507",
    svgIllustration: `
      <!-- Joists Isometric / Elevation -->
      <rect x="180" y="300" width="440" height="30" fill="#78350f" rx="3"/>
      <text x="400" y="320" fill="#fef3c7" font-size="13" font-weight="700" text-anchor="middle">DOUBLE 2x10 BEAM (SOLID BEARING)</text>
      <!-- Posts -->
      <rect x="240" y="330" width="40" height="90" fill="#92400e"/>
      <rect x="520" y="330" width="40" height="90" fill="#92400e"/>
      <!-- Joists on Top -->
      <rect x="210" y="210" width="22" height="90" fill="#b45309"/>
      <rect x="290" y="210" width="22" height="90" fill="#b45309"/>
      <rect x="370" y="210" width="22" height="90" fill="#b45309"/>
      <rect x="450" y="210" width="22" height="90" fill="#b45309"/>
      <rect x="530" y="210" width="22" height="90" fill="#b45309"/>
      <rect x="610" y="210" width="22" height="90" fill="#b45309"/>
      <!-- Spacing dimension -->
      <line x1="290" y1="190" x2="370" y2="190" stroke="#f59e0b" stroke-width="2"/>
      <polyline points="295,185 290,190 295,195" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <polyline points="365,185 370,190 365,195" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <text x="330" y="180" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">16" O.C.</text>
    `
  },
  roofing: {
    title: "ROOFING & SHINGLES",
    subtitle: "Pitch Multipliers, Square Calculations & Underlayment",
    accent: "#dc2626",
    badge: "100 Sq Ft / Square",
    svgIllustration: `
      <!-- Gable Roof Outline with Slope -->
      <polygon points="400,160 180,310 620,310" fill="#1e293b" stroke="#f87171" stroke-width="3"/>
      <!-- Slope Triangle -->
      <polygon points="460,200 520,200 520,245" fill="#334155" stroke="#ef4444" stroke-width="2"/>
      <text x="490" y="192" fill="#f87171" font-size="13" font-weight="700" text-anchor="middle">12</text>
      <text x="535" y="228" fill="#f87171" font-size="13" font-weight="700">6</text>
      <!-- Shingle courses -->
      <line x1="230" y1="290" x2="570" y2="290" stroke="#94a3b8" stroke-width="3" stroke-dasharray="30 10"/>
      <line x1="270" y1="260" x2="530" y2="260" stroke="#94a3b8" stroke-width="3" stroke-dasharray="30 10"/>
      <line x1="320" y1="225" x2="480" y2="225" stroke="#94a3b8" stroke-width="3" stroke-dasharray="30 10"/>
      <text x="400" y="350" fill="#f8fafc" font-size="15" font-weight="700" text-anchor="middle">3 BUNDLES = 1 SQUARE (100 SQ FT)</text>
      <text x="400" y="380" fill="#94a3b8" font-size="13" text-anchor="middle">ASTM D3462 Class A Fire Rated Shingles</text>
    `
  },
  fence: {
    title: "FENCE & PRIVACY",
    subtitle: "Post Hole Depth, 8-Foot Spacing & Picket Layout",
    accent: "#16a34a",
    badge: "1/3 Depth Code",
    svgIllustration: `
      <!-- Two Posts with Rails and Pickets -->
      <!-- Left Post -->
      <rect x="220" y="180" width="30" height="230" fill="#15803d" rx="2"/>
      <!-- Right Post -->
      <rect x="550" y="180" width="30" height="230" fill="#15803d" rx="2"/>
      <!-- Rails -->
      <rect x="220" y="210" width="360" height="18" fill="#166534"/>
      <rect x="220" y="270" width="360" height="18" fill="#166534"/>
      <rect x="220" y="330" width="360" height="18" fill="#166534"/>
      <!-- Pickets -->
      <rect x="270" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <rect x="315" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <rect x="360" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <rect x="405" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <rect x="450" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <rect x="495" y="170" width="35" height="185" fill="#4ade80" stroke="#14532d" stroke-width="1.5" rx="2"/>
      <!-- Post Span text -->
      <text x="400" y="395" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">8' ON-CENTER POST SPACING</text>
    `
  },
  brick: {
    title: "MASONRY & BRICK",
    subtitle: "CMU Blocks, Modular Brick & ASTM Mortar Ratios",
    accent: "#b91c1c",
    badge: "6.75 Bricks / Sq Ft",
    svgIllustration: `
      <!-- Staggered Brick Bond Pattern -->
      <g stroke="#fca5a5" stroke-width="2">
        <rect x="180" y="180" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="315" y="180" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="450" y="180" width="130" height="42" fill="#991b1b" rx="2"/>
        
        <rect x="150" y="226" width="95" height="42" fill="#7f1d1d" rx="2"/>
        <rect x="250" y="226" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="385" y="226" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="520" y="226" width="95" height="42" fill="#7f1d1d" rx="2"/>
        
        <rect x="180" y="272" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="315" y="272" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="450" y="272" width="130" height="42" fill="#991b1b" rx="2"/>
        
        <rect x="150" y="318" width="95" height="42" fill="#7f1d1d" rx="2"/>
        <rect x="250" y="318" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="385" y="318" width="130" height="42" fill="#991b1b" rx="2"/>
        <rect x="520" y="318" width="95" height="42" fill="#7f1d1d" rx="2"/>
      </g>
      <text x="400" y="395" fill="#fecaca" font-size="14" font-weight="700" text-anchor="middle">3/8" UNIFORM MORTAR JOINTS (TYPE N / S)</text>
    `
  },
  mulch: {
    title: "LANDSCAPING & MULCH",
    subtitle: "Cubic Yards, 3-Inch Bed Depth & Organic Soil Blends",
    accent: "#65a30d",
    badge: "13.5 Bags / Yard",
    svgIllustration: `
      <!-- Garden Bed Cross Section -->
      <path d="M 180,330 Q 300,310 400,325 T 620,320 L 620,400 L 180,400 Z" fill="#3f2e18"/>
      <path d="M 180,260 Q 300,240 400,255 T 620,250 L 620,330 Q 520,320 400,325 Q 300,310 180,330 Z" fill="#78350f"/>
      <!-- Tree Trunk -->
      <rect x="375" y="150" width="50" height="130" fill="#451a03" rx="4"/>
      <!-- Mulch Flare (No Volcano) -->
      <path d="M 350,260 Q 400,270 450,260 L 470,290 L 330,290 Z" fill="#9a3412"/>
      <text x="400" y="380" fill="#fef08a" font-size="14" font-weight="700" text-anchor="middle">3" OPTIMAL MULCH DEPTH (PULL 6" FROM TRUNK)</text>
    `
  },
  stairs: {
    title: "STAIRS & STRINGERS",
    subtitle: "Rise & Run Geometry, IRC Code & Stringer Layout",
    accent: "#0284c7",
    badge: "Rise + Run = 17-18\"",
    svgIllustration: `
      <!-- Stair Stepped Profile -->
      <polygon points="200,380 200,310 280,310 280,240 360,240 360,170 440,170 440,380" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <!-- Dimension Callouts -->
      <line x1="280" y1="310" x2="280" y2="350" stroke="#f59e0b" stroke-width="2"/>
      <line x1="200" y1="350" x2="280" y2="350" stroke="#f59e0b" stroke-width="2"/>
      <text x="240" y="340" fill="#f59e0b" font-size="13" font-weight="700" text-anchor="middle">RUN: 10"</text>
      
      <line x1="360" y1="240" x2="400" y2="240" stroke="#38bdf8" stroke-width="2"/>
      <line x1="360" y1="170" x2="400" y2="170" stroke="#38bdf8" stroke-width="2"/>
      <line x1="390" y1="170" x2="390" y2="240" stroke="#38bdf8" stroke-width="2"/>
      <text x="430" y="210" fill="#38bdf8" font-size="13" font-weight="700">RISE: 7-3/4" MAX</text>
      <text x="400" y="415" fill="#94a3b8" font-size="14" font-weight="600" text-anchor="middle">IRC CODE R311.7 COMPLIANT STAIR GEOMETRY</text>
    `
  },
  tile: {
    title: "TILE & GROUT",
    subtitle: "Square Footage, Waste by Pattern & Thinset Yields",
    accent: "#0d9488",
    badge: "10% - 20% Waste",
    svgIllustration: `
      <!-- Tile Grid & Herringbone -->
      <g stroke="#99f6e4" stroke-width="3" fill="#134e4a">
        <rect x="220" y="190" width="80" height="80" rx="4"/>
        <rect x="310" y="190" width="80" height="80" rx="4"/>
        <rect x="400" y="190" width="80" height="80" rx="4"/>
        <rect x="490" y="190" width="80" height="80" rx="4"/>
        
        <rect x="220" y="280" width="80" height="80" rx="4"/>
        <rect x="310" y="280" width="80" height="80" rx="4"/>
        <rect x="400" y="280" width="80" height="80" rx="4"/>
        <rect x="490" y="280" width="80" height="80" rx="4"/>
      </g>
      <!-- Spacer Spacers -->
      <line x1="305" y1="230" x2="305" y2="330" stroke="#2dd4bf" stroke-width="4"/>
      <line x1="395" y1="230" x2="395" y2="330" stroke="#2dd4bf" stroke-width="4"/>
      <text x="400" y="395" fill="#ccfbf1" font-size="14" font-weight="700" text-anchor="middle">1/8" GROUT JOINT & LEVELING SPACERS</text>
    `
  },
  flooring: {
    title: "FLOORING & VINYL",
    subtitle: "Box Estimation, Plank Layout & Underlayment Seams",
    accent: "#ca8a04",
    badge: "Staggered 8\"+",
    svgIllustration: `
      <!-- Staggered Planks -->
      <g stroke="#fef08a" stroke-width="2">
        <rect x="180" y="190" width="260" height="36" fill="#854d0e" rx="2"/>
        <rect x="445" y="190" width="175" height="36" fill="#713f12" rx="2"/>
        
        <rect x="180" y="230" width="140" height="36" fill="#713f12" rx="2"/>
        <rect x="325" y="230" width="250" height="36" fill="#854d0e" rx="2"/>
        <rect x="580" y="230" width="40" height="36" fill="#713f12" rx="2"/>
        
        <rect x="180" y="270" width="220" height="36" fill="#854d0e" rx="2"/>
        <rect x="405" y="270" width="215" height="36" fill="#713f12" rx="2"/>
        
        <rect x="180" y="310" width="180" height="36" fill="#713f12" rx="2"/>
        <rect x="365" y="310" width="255" height="36" fill="#854d0e" rx="2"/>
      </g>
      <text x="400" y="380" fill="#fef9c3" font-size="14" font-weight="700" text-anchor="middle">CLICK-LOCK VINYL PLANK (LVP) / HARDWOOD</text>
    `
  },
  drywall: {
    title: "DRYWALL & TAPING",
    subtitle: "4x8 vs 4x12 Sheets, Fastener Density & Joint Mud",
    accent: "#64748b",
    badge: "12\" / 16\" Screws",
    svgIllustration: `
      <!-- 4x8 Panel with Screw Marks -->
      <rect x="200" y="180" width="400" height="180" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" rx="4"/>
      <!-- Taped seam in middle -->
      <line x1="400" y1="180" x2="400" y2="360" stroke="#cbd5e1" stroke-width="14"/>
      <line x1="400" y1="180" x2="400" y2="360" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 4"/>
      <!-- Screw dots -->
      <circle cx="240" cy="220" r="4" fill="#334155"/>
      <circle cx="240" cy="270" r="4" fill="#334155"/>
      <circle cx="240" cy="320" r="4" fill="#334155"/>
      <circle cx="340" cy="220" r="4" fill="#334155"/>
      <circle cx="340" cy="270" r="4" fill="#334155"/>
      <circle cx="340" cy="320" r="4" fill="#334155"/>
      <circle cx="460" cy="220" r="4" fill="#334155"/>
      <circle cx="460" cy="270" r="4" fill="#334155"/>
      <circle cx="460" cy="320" r="4" fill="#334155"/>
      <circle cx="560" cy="220" r="4" fill="#334155"/>
      <circle cx="560" cy="270" r="4" fill="#334155"/>
      <circle cx="560" cy="320" r="4" fill="#334155"/>
      <text x="400" y="395" fill="#475569" font-size="14" font-weight="700" text-anchor="middle">TAPED SEAMS & RECESSED SCREW MATRIX</text>
    `
  },
  carpet: {
    title: "CARPET & PADDING",
    subtitle: "12-Foot Broadloom Rolls, Seam Placement & 8 lb Cushion",
    accent: "#6366f1",
    badge: "7/16\" Rebond Cushion",
    svgIllustration: `
      <!-- Carpet Roll Cross Section & Seam -->
      <ellipse cx="250" cy="270" rx="35" ry="70" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
      <path d="M 250,200 L 550,200 A 35,70 0 0,1 550,340 L 250,340 Z" fill="#312e81" stroke="#818cf8" stroke-width="2"/>
      <ellipse cx="550" cy="270" rx="35" ry="70" fill="#4f46e5" stroke="#a5b4fc" stroke-width="2"/>
      <!-- Inner Core -->
      <ellipse cx="550" cy="270" rx="12" ry="25" fill="#1e1b4b"/>
      <text x="400" y="385" fill="#c7d2fe" font-size="14" font-weight="700" text-anchor="middle">12' BROADLOOM ROLL WITH LATEX BACKING</text>
    `
  },
  wallpaper: {
    title: "WALLPAPER & PATTERNS",
    subtitle: "Straight vs Half-Drop Matches & Waste Allowance",
    accent: "#ec4899",
    badge: "Pattern Repeat Rules",
    svgIllustration: `
      <!-- Geometric Diamond Pattern Repeat -->
      <g stroke="#f472b6" stroke-width="2" fill="#831843">
        <polygon points="300,200 340,240 300,280 260,240"/>
        <polygon points="400,200 440,240 400,280 360,240"/>
        <polygon points="500,200 540,240 500,280 460,240"/>
        
        <polygon points="350,250 390,290 350,330 310,290"/>
        <polygon points="450,250 490,290 450,330 410,290"/>
      </g>
      <!-- Drop Line Indicator -->
      <line x1="300" y1="200" x2="350" y2="250" stroke="#fb7185" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="400" y="380" fill="#fbcfe8" font-size="14" font-weight="700" text-anchor="middle">VERTICAL REPEAT & HALF-DROP OFFSET</text>
    `
  },
  paint: {
    title: "PAINT & COATINGS",
    subtitle: "Wall & Ceiling Gallons, Primer Math & Surface Coverage",
    accent: "#2563eb",
    badge: "350 Sq Ft / Gallon",
    svgIllustration: `
      <!-- Paint Roller and Swatch -->
      <rect x="240" y="180" width="320" height="80" fill="#1e3a8a" rx="4"/>
      <!-- Roller Handle -->
      <rect x="385" y="270" width="30" height="70" fill="#94a3b8" rx="2"/>
      <rect x="390" y="340" width="20" height="60" fill="#1e293b" rx="4"/>
      <!-- Wet Paint Stroke -->
      <path d="M 240,200 C 320,185 450,215 560,195 L 560,240 C 450,260 320,230 240,245 Z" fill="#3b82f6"/>
      <text x="400" y="415" fill="#93c5fd" font-size="14" font-weight="700" text-anchor="middle">350 SQ FT/GAL (TWO COATS MANDATORY)</text>
    `
  },
  area: {
    title: "MEASUREMENT & AREA",
    subtitle: "L-Shaped Room Math, Board Feet & Unit Conversions",
    accent: "#059669",
    badge: "Length x Width Math",
    svgIllustration: `
      <!-- L-Shaped Room Floor Plan Diagram -->
      <polygon points="240,180 440,180 440,260 560,260 560,360 240,360" fill="#064e3b" stroke="#34d399" stroke-width="3"/>
      <!-- Split line -->
      <line x1="440" y1="260" x2="240" y2="260" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="340" y="225" fill="#a7f3d0" font-size="18" font-weight="700" text-anchor="middle">AREA A</text>
      <text x="400" y="320" fill="#a7f3d0" font-size="18" font-weight="700" text-anchor="middle">AREA B</text>
      <text x="400" y="405" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">SPLIT RECTANGLES: TOTAL = A + B</text>
    `
  }
};

function generateSVG(tool, data) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450" style="background:#0f172a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <!-- Blueprint Background Grid -->
  <defs>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  
  <!-- Outer Technical Blueprint Border -->
  <rect x="20" y="20" width="760" height="410" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="25" y="25" width="750" height="400" fill="none" stroke="#1e293b" stroke-width="1"/>
  
  <!-- Corner Crop Marks -->
  <path d="M 15 20 L 30 20 M 20 15 L 20 30" stroke="${data.accent}" stroke-width="2"/>
  <path d="M 785 20 L 770 20 M 780 15 L 780 30" stroke="${data.accent}" stroke-width="2"/>
  <path d="M 15 430 L 30 430 M 20 435 L 20 420" stroke="${data.accent}" stroke-width="2"/>
  <path d="M 785 430 L 770 430 M 780 435 L 780 420" stroke="${data.accent}" stroke-width="2"/>

  <!-- Header Category & Brand Badge -->
  <g transform="translate(45, 55)">
    <rect x="0" y="0" width="180" height="28" rx="6" fill="${data.accent}" opacity="0.15"/>
    <text x="12" y="19" fill="${data.accent}" font-size="12" font-weight="800" letter-spacing="1.5">PLUMBRIGHT // FIELD GUIDE</text>
    
    <text x="0" y="58" fill="#f8fafc" font-size="28" font-weight="900" letter-spacing="-0.5">${data.title}</text>
    <text x="0" y="82" fill="#94a3b8" font-size="14" font-weight="500">${data.subtitle}</text>
  </g>

  <!-- Spec Badge Top Right -->
  <g transform="translate(580, 55)">
    <rect x="0" y="0" width="175" height="34" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
    <circle cx="20" cy="17" r="5" fill="${data.accent}"/>
    <text x="35" y="22" fill="#f8fafc" font-size="12" font-weight="700">${data.badge}</text>
  </g>

  <!-- Central Technical Graphic -->
  ${data.svgIllustration}

  <!-- Bottom Technical Stamp & Code Rule -->
  <g transform="translate(45, 415)">
    <text x="0" y="0" fill="#475569" font-size="10" font-weight="600" letter-spacing="1">VERIFIED CALCULATION // OPEN-FORMULA ARCHITECTURE // ASTM &amp; IRC COMPLIANT</text>
  </g>
</svg>`;
}

for (const [tool, data] of Object.entries(CATEGORY_GRAPHICS)) {
  const filePath = join(OUT_DIR, `${tool}.svg`);
  writeFileSync(filePath, generateSVG(tool, data), "utf8");
  console.log(`Generated: public/images/guides/${tool}.svg`);
}

console.log("\nAll 15 category blueprint thumbnails generated successfully!");
