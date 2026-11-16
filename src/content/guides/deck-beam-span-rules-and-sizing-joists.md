---
title: "Deck Beam Span Rules and Sizing: How to Find the Right Beam"
description: "How deck beam loads work, how to find tributary width, post load and footing size, and where to read the allowed beam span for your lumber."
published: 2026-11-03
updated: 2026-11-17
tool: deck
---
**The allowed span of a deck beam depends on the beam size, the lumber species and grade, and how long the joists are that it carries, and it must be read from a code table, not guessed.** In the International Residential Code that table is R507.5; the American Wood Council's deck guide DCA 6 publishes the same prescriptive values. This guide shows the part you can calculate yourself: how much deck area each beam carries, the load on each post and the footing it needs.

## Why this guide does not list beam spans

Beam spans change with species (Southern Pine and Douglas Fir-Larch differ), grade, the number of plies, joist length, cantilever and the design loads your jurisdiction uses. A short table copied out of context is easy to misread and can be wrong for your deck, so the span lookup is left to the code tables linked in the sources below. Take the numbers from your building department's adopted code and the permit drawings.

## Step 1: Find the joist span

The joist span is the distance the joists run from the ledger to the beam, or from one beam to the next. A deck that is 12 ft deep with joists from the ledger to a single beam has a 12 ft joist span, less any overhang you leave as a cantilever.

## Step 2: Find the tributary width

The tributary width is the strip of deck the beam carries. A beam carries half of the joist span on each side of it.

- **Beam at the end of joists that run from a ledger:** half of the joist span, plus the cantilever if the joists overhang the beam.
- **Mid-span beam with joists on both sides:** half of each joist span, added together.

## Step 3: Turn the width into a load

Residential decks are designed for a 40 psf live load and a 10 psf dead load, 50 psf in total, as a baseline (check your local requirements, because snow load can be higher).

1. **Line load on the beam** = tributary width (ft) × 50 psf, in pounds per linear foot.
2. **Load on one post** = line load × post spacing (ft).

### Post loads at 50 psf

<div class="table-wrap">
<table>
<thead>
<tr><th>Tributary width</th><th>Line load (lb per ft)</th><th>Post load, posts 6 ft apart (lb)</th><th>Posts 8 ft apart (lb)</th><th>Posts 10 ft apart (lb)</th></tr>
</thead>
<tbody>
<tr><td>4 ft</td><td>200</td><td>1,200</td><td>1,600</td><td>2,000</td></tr>
<tr><td>5 ft</td><td>250</td><td>1,500</td><td>2,000</td><td>2,500</td></tr>
<tr><td>6 ft</td><td>300</td><td>1,800</td><td>2,400</td><td>3,000</td></tr>
<tr><td>7 ft</td><td>350</td><td>2,100</td><td>2,800</td><td>3,500</td></tr>
<tr><td>8 ft</td><td>400</td><td>2,400</td><td>3,200</td><td>4,000</td></tr>
</tbody>
</table>
</div>

Line load = tributary width × 50 psf; post load = line load × post spacing. Interior posts carry these values; end posts carry about half. Use them to size footings, and read the allowed beam span from the code table.

### Worked example

A deck 16 ft wide and 12 ft deep. Joists run 10 ft from the ledger to a beam, then overhang the beam by 2 ft.

1. Tributary width = 10 ft ÷ 2 + 2 ft cantilever = **7 ft**.
2. Line load = 7 ft × 50 psf = **350 lb per linear foot**.
3. With posts 8 ft apart, the load on one interior post = 350 × 8 = **2,800 lb**.
4. A footing on 2,000 psf soil needs 2,800 ÷ 2,000 = 1.4 sq ft, which is a square about 14 in on a side (1.4 sq ft = 202 sq in; the square root is about 14.2 in, so 16 in square in practice). See [concrete footing depth and width](/guides/concrete-footing-depth-and-width/) for the table and the frost-depth rule.

Next, look up in IRC Table R507.5 or DCA 6 the beam size and species that can span 8 ft while carrying 10 ft joists. If the table does not allow 8 ft with the beam you picked, use closer posts or a larger beam. The same table also gives the maximum cantilever, so check the 2 ft overhang there too.

## Cantilevers

Joists may overhang a beam, and a beam may overhang its end post, but both are limited by the code table. As a rule of thumb the IRC limits the overhang to a fraction of the span, so confirm the limit for your members rather than assuming a number. Long cantilevers also make the deck bounce, which the table does not measure.

## Building the beam

Multi-ply beams are fastened so the plies work as one member. Nailing patterns and any structural screws are specified in the code or by the screw manufacturer; follow them rather than a general rule. Rim and beam hardware must be rated for exterior use with pressure-treated lumber.

## Waste and planning

Add a margin for cuts and defects when you buy lumber; 10% is a common planning figure. Your joist spacing sets how many joists the beam carries, and the [deck joist spacing guide](/guides/deck-joist-spacing/) and the [deck calculator](/deck-calculator/) show how many pieces the deck frame and boards need. The [board count guide](/guides/how-many-deck-boards-do-i-need/) covers the decking itself.

## Sources

- [American Wood Council, DCA 6: Prescriptive Residential Wood Deck Construction Guide](https://awc.org/publications/dca/dca6/), American Wood Council. Prescriptive beam, joist and post tables for residential decks.
- [International Code Council, 2021 International Residential Code, section R507 (exterior decks)](https://codes.iccsafe.org/content/IRC2021P1/chapter-5-floors), International Code Council. Table R507.5 gives the maximum deck beam spans; local adoption varies.
