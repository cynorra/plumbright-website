import fs from 'fs';
import path from 'path';

const dir = 'src/content/guides';

const replacements = [
  {
    file: 'how-many-rolls-of-wallpaper-do-i-need.md',
    from: /For related coverage, see our guide on \[Wallpaper Pattern Repeat: Straight, Half-Drop and the Paper It Wastes\]\(\/guides\/wallpaper-pattern-repeat\/\)\./g,
    to: 'For related coverage, see our guide on [Wallpaper Accent Wall Pattern Drop & Waste Guide](/guides/wallpaper-accent-wall-pattern-drop-waste-guide/).'
  },
  {
    file: 'wallpaper-accent-wall-pattern-drop-waste-guide.md',
    from: /For related coverage, see our guide on \[Wallpaper Pattern Repeat: Straight, Half-Drop and the Paper It Wastes\]\(\/guides\/wallpaper-pattern-repeat\/\)\./g,
    to: 'For related coverage, see our guide on [How Many Rolls of Wallpaper Do I Need?](/guides/how-many-rolls-of-wallpaper-do-i-need/).'
  },
  {
    file: 'gravel-driveway-depth-and-layers.md',
    from: /For related coverage, see our guide on \[Crushed Stone vs Pea Gravel: Which Stays in Place for Walkways\?\]\(\/guides\/gravel-driveway-base-layers-depth-and-sizes\/\)\./g,
    to: 'For related coverage, see our guide on [Paver Base Depth: Sand and Crushed Stone Layers](/guides/paver-base-depth-sand-and-crushed-stone-layers/).'
  },
  {
    file: 'how-much-does-a-cubic-yard-of-gravel-weigh.md',
    from: /For related coverage, see our guide on \[Crushed Stone vs Pea Gravel: Which Stays in Place for Walkways\?\]\(\/guides\/gravel-driveway-base-layers-depth-and-sizes\/\)\./g,
    to: 'For related coverage, see our guide on [French Drain Gravel Depth and Trench Volume](/guides/french-drain-gravel-depth-and-trench-volume/).'
  },
  {
    file: 'how-deep-should-mulch-be.md',
    from: /For related coverage, see our guide on \[How Many Bags of Mulch Are in a Yard\?\]\(\/guides\/how-many-bags-of-mulch-in-a-yard\/\)\./g,
    to: 'For related coverage, see our guide on [How Much Mulch Do I Need?](/guides/how-much-mulch-do-i-need/).'
  },
  {
    file: 'how-deep-should-mulch-be.md',
    from: /For related coverage, see our guide on \[How Much Soil Do I Need for a Raised Bed\?\]\(\/guides\/how-much-soil-for-a-raised-bed\/\)\./g,
    to: 'For related coverage, see our guide on [Mulch vs Wood Chips: Cubic Yard Weight and Coverage](/guides/mulch-vs-wood-chips-cubic-yard-weight-and-coverage/).'
  },
  {
    file: 'how-many-fence-pickets-do-i-need.md',
    from: /For related coverage, see our guide on \[Privacy Fence Materials List for 100 Feet\]\(\/guides\/privacy-fence-materials-list\/\)\./g,
    to: 'For related coverage, see our guide on [Fence Post Spacing: 6 vs 8 Feet](/guides/fence-post-spacing/).'
  },
  {
    file: 'fence-post-spacing.md',
    from: /For related coverage, see our guide on \[Privacy Fence Materials List for 100 Feet\]\(\/guides\/privacy-fence-materials-list\/\)\./g,
    to: 'For related coverage, see our guide on [Fence Post Depth: Frost Line Rules](/guides/fence-post-depth-frost-line-rules-how-deep-to-dig/).'
  },
  {
    file: 'deck-joist-spacing.md',
    from: /For related coverage, see our guide on \[Deck Post Sizing: When 4x4 Is Allowed vs When Code Requires 6x6\]\(\/guides\/deck-joist-spacing-12-vs-16-vs-24-inches\/\)\./g,
    to: 'For related coverage, see our guide on [Deck Beam Span Rules and Sizing Joists](/guides/deck-beam-span-rules-and-sizing-joists/).'
  },
  {
    file: 'deck-beam-span-rules-and-sizing-joists.md',
    from: /For related coverage, see our guide on \[Deck Post Sizing: When 4x4 Is Allowed vs When Code Requires 6x6\]\(\/guides\/deck-joist-spacing-12-vs-16-vs-24-inches\/\)\./g,
    to: 'For related coverage, see our guide on [Deck Joist Spacing: 12 vs 16 vs 24 Inches](/guides/deck-joist-spacing/).'
  },
  {
    file: 'concrete-bag-sizes-40-60-80-lb.md',
    from: /For related coverage, see our guide on \[How Many Bags of Concrete for a 10x10 Slab at 4 Inches\?\]\(\/guides\/how-many-bags-of-concrete-for-10x10-slab\/\)\./g,
    to: 'For related coverage, see our guide on [Concrete Slab Thickness: 4 vs 6 Inches](/guides/concrete-slab-thickness/).'
  },
  {
    file: 'concrete-footing-depth-and-width.md',
    from: /For related coverage, see our guide on \[How Many Bags of Concrete for a 10x10 Slab at 4 Inches\?\]\(\/guides\/how-many-bags-of-concrete-for-10x10-slab\/\)\./g,
    to: 'For related coverage, see our guide on [Concrete for Fence Posts: How Many Bags Per Hole](/guides/concrete-for-fence-posts/).'
  },
  {
    file: 'how-much-carpet-do-i-need.md',
    from: /For related coverage, see our guide on \[Carpet Roll Widths: 12, 13\.5 and 15 ft, and Where Seams Go\]\(\/guides\/carpet-roll-width-and-seams\/\)\./g,
    to: 'For related coverage, see our guide on [Carpet Padding Thickness and Density Rebond Guide](/guides/carpet-padding-thickness-and-density-rebond-guide/).'
  },
  {
    file: 'how-to-calculate-square-feet-and-yardage-for-carpet.md',
    from: /For related coverage, see our guide on \[Carpet Roll Widths: 12, 13\.5 and 15 ft, and Where Seams Go\]\(\/guides\/carpet-roll-width-and-seams\/\)\./g,
    to: 'For related coverage, see our guide on [How Much Carpet Do I Need?](/guides/how-much-carpet-do-i-need/).'
  }
];

let replaced = 0;
for (const r of replacements) {
  const p = path.join(dir, r.file);
  let content = fs.readFileSync(p, 'utf8');
  if (r.from.test(content)) {
    content = content.replace(r.from, r.to);
    fs.writeFileSync(p, content, 'utf8');
    replaced++;
    console.log(`Replaced draft link in ${r.file}`);
  } else {
    console.warn(`Pattern not matched in ${r.file}`);
  }
}
console.log(`Total replaced: ${replaced}`);
