import { test } from "node:test";
import assert from "node:assert/strict";
import { mulchEstimate, bedArea, coverage, bagsPerYard, raisedBedVolume } from "../src/lib/calc/mulch.js";
import { fenceEstimate, railsPerSection } from "../src/lib/calc/fence.js";
import { masonryEstimate, wallArea, paverCount, BAG_MORTAR_CUFT } from "../src/lib/calc/masonry.js";
import { dropLengthIn, wallpaperEstimate } from "../src/lib/calc/wallpaper.js";
import { carpetEstimate } from "../src/lib/calc/carpet.js";

const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("mulch: 200 sq ft at 3 in", () => {
  const r = mulchEstimate({ areaSqFt: 200, depthIn: 3 });
  assert.equal(r.cuFt, 50);
  assert.equal(r.cubicYards, 1.85);
  assert.equal(r.orderYards, 2);
  assert.deepEqual(r.bags.map((b) => b.count), [34, 25, 17]);
});

test("mulch: top-up buys only the difference; helpers", () => {
  assert.equal(mulchEstimate({ areaSqFt: 120, depthIn: 3, existingIn: 1 }).cuFt, 20);
  assert.throws(() => mulchEstimate({ areaSqFt: 120, depthIn: 2, existingIn: 2 }), RangeError);
  close(bedArea({ shape: "circle", diameterFt: 6 }), Math.PI * 9);
  assert.equal(coverage(27, 3), 108);
  assert.equal(bagsPerYard(2), 13.5);
  assert.equal(raisedBedVolume({ lengthFt: 8, widthFt: 4, depthIn: 12 }), 32);
});

test("fence: 100 ft, one 4 ft gate, 8 ft spacing", () => {
  const r = fenceEstimate({ lengthFt: 100, gates: 1 });
  assert.equal(r.fenceLineFt, 96);
  assert.equal(r.sections, 12);
  assert.equal(r.posts, 14); // 12 + 1 + 1 for the gate
  assert.equal(r.rails, 36);
  assert.equal(r.pickets, Math.ceil(((96 * 12) / 5.5) * 1.05));
  assert.equal(r.postLengthFt, 8); // 6 ft above + 2 ft buried
  assert.equal(railsPerSection(4), 2);
  assert.throws(() => fenceEstimate({ lengthFt: 4, gates: 1, gateWidthFt: 4 }), RangeError);
});

test("masonry: BIA modular brick and block", () => {
  close(BAG_MORTAR_CUFT, 0.2997);
  const b = masonryEstimate({ areaSqFt: 100, wastePct: 0 });
  assert.equal(b.units, 675);
  close(b.mortarCuFt, 0.675 * 8.1 * 1.2, 0.01);
  const k = masonryEstimate({ areaSqFt: 100, unit: "block", wastePct: 0 });
  assert.equal(k.units, 113); // 112.5 rounded up
  assert.equal(k.bags, Math.ceil((112.5 * 1.2) / 13));
  assert.equal(wallArea({ lengthFt: 20, heightFt: 8, doors: 1 }), 139);
  assert.equal(paverCount({ areaSqFt: 100, paverWidthIn: 4, paverLengthIn: 8, wastePct: 0 }).pavers, 450);
});

test("wallpaper: drops follow the pattern repeat", () => {
  assert.equal(dropLengthIn({ heightFt: 8 }), 100);
  assert.equal(dropLengthIn({ heightFt: 8, repeatIn: 21 }), 105);
  assert.equal(dropLengthIn({ heightFt: 8, repeatIn: 21, match: "half" }), 115.5);
  const r = wallpaperEstimate({ wallWidthFt: 48, heightFt: 8, rollWidthIn: 20.5, rollLengthFt: 33, repeatIn: 21, doors: 1 });
  assert.equal(r.stripsPerRoll, 3); // 396 / 105
  assert.equal(r.strips, 27); // 540 / 20.5
  assert.equal(r.rolls, 9);
  assert.throws(() => wallpaperEstimate({ wallWidthFt: 10, heightFt: 40, rollWidthIn: 20.5, rollLengthFt: 33 }), RangeError);
});

test("carpet: picks the direction that buys less", () => {
  const small = carpetEstimate({ lengthFt: 14, widthFt: 12 });
  assert.equal(small.drops, 1);
  assert.equal(small.seams, 0);
  assert.equal(small.buySqFt, 12 * 14.5);
  const big = carpetEstimate({ lengthFt: 18, widthFt: 15 });
  assert.equal(big.runsAlongFt, 15); // two 15.5 ft drops beat two 18.5 ft drops
  assert.equal(big.buySqFt, 2 * 12 * 15.5);
  assert.equal(carpetEstimate({ lengthFt: 18, widthFt: 15, rollWidthFt: 15 }).seams, 0);
});

// ---- AdSense-readiness fixes (2026-11) ----
import { deckEstimate as deckEst } from "../src/lib/calc/deck.js";
import { screwsPerSheet as screwsFor } from "../src/lib/calc/drywall.js";
import { slabVolume as slabVol, concreteOrder as concOrder } from "../src/lib/calc/concrete.js";

test("deck: joists round the spaces up, then add the far-end joist", () => {
  const joists = (lengthFt, spacing) => deckEst({ lengthFt, widthFt: 8, boardWidthIn: 5.5, gapIn: 0.1875, boardLengthFt: 16, wastePct: 0, joistSpacingIn: spacing }).joists;
  assert.equal(joists(10, 16), 9); // 120 / 16 = 7.5 -> 8 spaces + 1
  assert.equal(joists(16, 16), 13); // 192 / 16 = 12 exactly -> 12 spaces + 1
  assert.equal(joists(12, 12), 13);
  assert.equal(joists(12, 24), 7); // 144 / 24 = 6 -> 7
});

test("drywall: 24 in framing needs fewer screws per sheet than 16 in framing", () => {
  for (const sheet of ["4x8", "4x10", "4x12"]) {
    assert.ok(screwsFor(sheet, "wall", 24) < screwsFor(sheet, "wall", 16), sheet);
  }
  assert.equal(screwsFor("4x8", "wall", 16), 28);
  assert.equal(screwsFor("4x8", "wall", 24), 25);
});

test("concrete: a 6 in slab needs half as much again as a 4 in slab", () => {
  const a = concOrder(slabVol({ lengthFt: 20, widthFt: 20, thicknessIn: 4 }), 10).cubicYards;
  const b = concOrder(slabVol({ lengthFt: 20, widthFt: 20, thicknessIn: 6 }), 10).cubicYards;
  assert.ok(Math.abs(b / a - 1.5) < 0.02);
});
