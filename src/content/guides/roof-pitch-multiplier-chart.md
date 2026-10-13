---
title: "Roof Pitch Multiplier Chart: Turn a Footprint into Roof Area"
description: "Pitch multipliers from 1/12 to 18/12 with roof angles and hip and valley factors. Multiply the footprint by the multiplier to get the real roof area."
published: 2026-10-23
tool: roofing
---

**To find the area of a sloped roof, multiply the area of its footprint (overhangs included) by the pitch multiplier: √(1 + (rise ÷ 12)²).** A 6/12 roof has a multiplier of 1.118, so a 1,176 sq ft footprint carries 1,315 sq ft of roof.

<figure class="my-6">
<svg viewBox="0 0 450 210" role="img" aria-labelledby="pitch-t" class="w-full max-w-md">
  <title id="pitch-t">A roof pitch triangle: 12 inches of run, 6 inches of rise, and the sloped length of 13.42 inches</title>
  <path d="M40 170 H340 V20 Z" fill="var(--brand-soft)" stroke="var(--foreground)" stroke-width="2"/>
  <text x="190" y="194" text-anchor="middle" font-size="14" fill="var(--foreground)">run: 12 in</text>
  <text x="350" y="100" font-size="14" fill="var(--foreground)">rise: 6 in</text>
  <text x="170" y="82" text-anchor="middle" font-size="14" font-weight="700" fill="var(--brand)" transform="rotate(-26.6 170 82)">slope: 13.42 in</text>
  <path d="M90 170 A50 50 0 0 0 85 148" fill="none" stroke="var(--muted-foreground)" stroke-width="1.5"/>
  <text x="98" y="160" font-size="12" fill="var(--muted-foreground)">26.6°</text>
</svg>
<figcaption class="text-sm text-muted-foreground mt-2">A 6/12 pitch rises 6 in for every 12 in of horizontal run. The sloped side is 13.42 in, which is where the 1.118 multiplier comes from.</figcaption>
</figure>

## Pitch multiplier chart

<div class="table-wrap">
<table>
<thead><tr><th>Pitch</th><th>Angle</th><th>Multiplier</th><th>Hip / valley factor</th><th>Rafter length per 10 ft of run</th></tr></thead>
<tbody>
<tr><td>1/12</td><td>4.8°</td><td>1.003</td><td>1.417</td><td>10.03 ft</td></tr>
<tr><td>2/12</td><td>9.5°</td><td>1.014</td><td>1.424</td><td>10.14 ft</td></tr>
<tr><td>3/12</td><td>14°</td><td>1.031</td><td>1.436</td><td>10.31 ft</td></tr>
<tr><td>4/12</td><td>18.4°</td><td>1.054</td><td>1.453</td><td>10.54 ft</td></tr>
<tr><td>5/12</td><td>22.6°</td><td>1.083</td><td>1.474</td><td>10.83 ft</td></tr>
<tr><td>6/12</td><td>26.6°</td><td>1.118</td><td>1.5</td><td>11.18 ft</td></tr>
<tr><td>7/12</td><td>30.3°</td><td>1.158</td><td>1.53</td><td>11.58 ft</td></tr>
<tr><td>8/12</td><td>33.7°</td><td>1.202</td><td>1.563</td><td>12.02 ft</td></tr>
<tr><td>9/12</td><td>36.9°</td><td>1.25</td><td>1.601</td><td>12.5 ft</td></tr>
<tr><td>10/12</td><td>39.8°</td><td>1.302</td><td>1.641</td><td>13.02 ft</td></tr>
<tr><td>11/12</td><td>42.5°</td><td>1.357</td><td>1.685</td><td>13.57 ft</td></tr>
<tr><td>12/12</td><td>45°</td><td>1.414</td><td>1.732</td><td>14.14 ft</td></tr>
<tr><td>14/12</td><td>49.4°</td><td>1.537</td><td>1.833</td><td>15.37 ft</td></tr>
<tr><td>16/12</td><td>53.1°</td><td>1.667</td><td>1.944</td><td>16.67 ft</td></tr>
<tr><td>18/12</td><td>56.3°</td><td>1.803</td><td>2.062</td><td>18.03 ft</td></tr>
</tbody>
<caption>Multiplier = √(1 + (rise ÷ 12)²). Hip and valley factor = √(2 + (rise ÷ 12)²), per foot of common rafter run, where both slopes have the same pitch.</caption>
</table>
</div>

## Why one multiplier works for the whole roof

It seems too simple, but it's exact: every plane of a roof with one pitch is tilted by the same angle, and tilting a surface stretches it in one direction by the same factor. So whether the roof is a gable, a hip or a complicated mix of both, if every slope has the same pitch, roof area = footprint × multiplier. Valleys and hips don't change the area; they only change where the cuts and the waste are.

When planes have different pitches, such as a 12/12 main roof with a 4/12 porch, split the footprint into the parts under each pitch and apply each multiplier separately.

## Worked example

A house measures 40 × 26 ft with 12 in overhangs on all sides, and the roof is a 7/12 hip.

1. Footprint with overhangs: 42 × 28 = **1,176 sq ft**.
2. Multiplier at 7/12: **1.158**.
3. Roof area: 1,176 × 1.158 = **1,361 sq ft**, or 13.6 squares.
4. Hips: the common rafter run is half the width, 14 ft. Each hip is 14 × 1.53 = **21.4 ft**, so four hips need 86 ft of hip cap.

The [roofing calculator](/roofing-calculator/) turns that area into shingle bundles, ridge cap, starter strip and drip edge.

## How to find your pitch without climbing

- **From the attic:** hold a level horizontally against the underside of a rafter, mark 12 in along the level, and measure straight up from that mark to the rafter. That's the rise.
- **From a ladder at the gable end:** the same measurement works on the rake board.
- **From a photo:** a photo taken square to the gable end lets you measure the angle; then match it to the angle column above.
- **From plans:** the pitch is usually printed on the elevations as a small triangle, like 6 over 12.

## Pitch and your choice of roofing

Low slopes shed water slowly. Asphalt shingle makers set a minimum slope, and below about 4/12 they typically require extra underlayment, while very low slopes need a different roofing system altogether. Steep roofs, from about 8/12 up, are dangerous to walk and usually need roof jacks or harness systems, which matters if you're comparing a DIY quote with a contractor's.

<div class="bg-note text-note-foreground my-6 rounded-lg px-4 py-3 text-sm" role="note">Measuring and working on roofs is dangerous. Take what measurements you can from the ground or the attic, and leave steep or high roofs to a professional.</div>
