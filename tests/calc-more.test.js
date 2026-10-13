import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeArea, totalArea, convertArea, boardFeet, linearFeetForArea } from "../src/lib/calc/area.js";
import { flooringEstimate, flooringWaste, plankLayoutWaste } from "../src/lib/calc/flooring.js";
import { screwsPerSheet, drywallArea, drywallEstimate } from "../src/lib/calc/drywall.js";
import { gravelVolume, gravelOrder, coveragePerYard } from "../src/lib/calc/gravel.js";
import { deckEstimate } from "../src/lib/calc/deck.js";
import { stairLayout, stringerLength, toFraction } from "../src/lib/calc/stairs.js";
import { pitchMultiplier, hipMultiplier, roofEstimate } from "../src/lib/calc/roofing.js";
import { groutEstimate } from "../src/lib/calc/tile.js";

const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("area: shapes by hand", () => {
  assert.equal(shapeArea("rectangle", 12, 10), 120);
  assert.equal(shapeArea("triangle", 10, 6), 30);
  close(shapeArea("circle", 10), Math.PI * 25);
  assert.equal(shapeArea("trapezoid", 10, 14, 5), 60);
  assert.throws(() => shapeArea("rectangle", 10, 0), RangeError);
});

test("area: L-shaped room as two rectangles, cut-out subtracted", () => {
  const r = totalArea([
    { shape: "rectangle", a: 12, b: 10 },
    { shape: "rectangle", a: 8, b: 6 },
    { shape: "rectangle", a: 3, b: 2, subtract: true },
  ]);
  assert.equal(r.sqft, 120 + 48 - 6);
  assert.throws(() => totalArea([{ shape: "rectangle", a: 2, b: 2 }, { shape: "rectangle", a: 3, b: 3, subtract: true }]), RangeError);
});

test("area: unit conversions and board feet", () => {
  const c = convertArea(900);
  assert.equal(c.sqyd, 100);
  assert.equal(c.sqm, 83.61);
  assert.equal(convertArea(43560).acres, 1);
  assert.equal(boardFeet(2, 6, 8), 8); // a 2x6x8 is 8 board feet
  assert.equal(boardFeet(1, 12, 1), 1);
  assert.equal(linearFeetForArea(100, 6), 200);
});

test("flooring: boxes round up after waste, cost on whole boxes", () => {
  const r = flooringEstimate({ areaSqFt: 120, sqFtPerBox: 22, wastePct: 10, pricePerSqFt: 3, underlaymentRollSqFt: 100 });
  assert.equal(r.withWasteSqFt, 132);
  assert.equal(r.boxes, 6); // 132 / 22 = 6 exactly
  assert.equal(r.cost, 396);
  assert.equal(r.underlaymentRolls, 2);
  assert.equal(flooringEstimate({ areaSqFt: 120, sqFtPerBox: 22, wastePct: 11 }).boxes, 7);
  assert.equal(flooringWaste("diagonal", true), 20);
});

test("flooring: plank layout model stays plausible", () => {
  const r = plankLayoutWaste({ roomLengthFt: 12, roomWidthFt: 12, plankLengthIn: 48, plankWidthIn: 7 });
  assert.equal(r.rows, 21); // 144 / 7 = 20.6
  assert.ok(r.wastePct >= 0 && r.wastePct < 10);
  // Exact fit with no stagger rule: 2 whole planks per row, no waste
  const exact = plankLayoutWaste({ roomLengthFt: 8, roomWidthFt: 8, plankLengthIn: 48, plankWidthIn: 8, staggerIn: 0 });
  assert.equal(exact.planks, 24);
  assert.equal(exact.wastePct, 0);
  // Staggering joints costs a little in the same room
  const stag = plankLayoutWaste({ roomLengthFt: 8, roomWidthFt: 8, plankLengthIn: 48, plankWidthIn: 8 });
  assert.ok(stag.planks > 24 && stag.wastePct < 10);
});

test("drywall: screws per sheet follow spacing rules", () => {
  assert.equal(screwsPerSheet("4x8", "wall", 16), 28); // 7 studs x 4
  assert.equal(screwsPerSheet("4x8", "ceiling", 16), 35); // 7 joists x 5
  assert.equal(screwsPerSheet("4x12", "wall", 16), 40); // 10 x 4
  assert.equal(screwsPerSheet("4x8", "wall", 24), 25); // 5 studs x 5 (12 in spacing)
});

test("drywall: 12 x 12 room, 8 ft walls, one door and one window", () => {
  const a = drywallArea({ lengthFt: 12, widthFt: 12, heightFt: 8, doors: 1, windows: 1 });
  assert.equal(a.walls, 384 - 36);
  assert.equal(a.ceiling, 144);
  const e = drywallEstimate({ wallSqFt: a.walls, ceilingSqFt: a.ceiling, sheet: "4x8", wastePct: 10 });
  assert.equal(e.wallSheets, 12); // 348 x 1.1 / 32 = 11.96
  assert.equal(e.ceilingSheets, 5); // 158.4 / 32 = 4.95
  assert.equal(e.sheets, 17);
  assert.equal(e.screws, 12 * 28 + 5 * 35);
  assert.equal(e.mudPails, 2);
});

test("gravel: 50 x 10 ft at 4 in", () => {
  const v = gravelVolume({ lengthFt: 50, widthFt: 10, depthIn: 4 });
  close(v.cuFt, 166.6666667, 1e-4);
  const o = gravelOrder({ cuFt: v.cuFt, lbPerYd: 2700 });
  assert.equal(o.cubicYards, 6.17);
  assert.equal(o.tons, 8.33);
  assert.equal(o.orderYards, 6.5);
  assert.equal(coveragePerYard(4), 81);
  const c = gravelOrder({ cuFt: 27, lbPerYd: 3000, compactPct: 15 });
  assert.equal(c.cubicYards, 1.15);
});

test("deck: 16 x 12 ft, 5.5 in boards, 16 ft boards", () => {
  const r = deckEstimate({ lengthFt: 16, widthFt: 12, boardWidthIn: 5.5, gapIn: 0.1875, boardLengthFt: 16, wastePct: 0 });
  assert.equal(r.rows, 26); // 144.19 / 5.6875 = 25.4
  assert.equal(r.boards, 26);
  assert.equal(r.joists, 13); // 192 / 16 + 1
  assert.equal(r.screws, 26 * 13 * 2);
  // 20 ft deck with 16 ft boards reuses 12 ft offcuts for the 4 ft pieces
  const long = deckEstimate({ lengthFt: 20, widthFt: 12, boardLengthFt: 16, wastePct: 0 });
  assert.ok(long.boards < 26 * 2);
  assert.ok(long.boards * 16 >= 26 * 20);
});

test("stairs: 108 in rise lays out to code", () => {
  const r = stairLayout({ totalRiseIn: 108, targetRiserIn: 7.5, treadIn: 10.5 });
  assert.equal(r.risers, 15);
  assert.equal(r.treads, 14);
  assert.equal(r.riserIn, 7.2);
  assert.equal(r.totalRunIn, 147);
  assert.ok(r.codeOk);
  close(r.stringerIn, 15 * Math.hypot(7.2, 10.5), 0.01);
  const steep = stairLayout({ totalRiseIn: 108, risers: 13, treadIn: 9.5 });
  assert.equal(steep.codeOk, false);
});

test("stairs: fractions", () => {
  assert.equal(toFraction(7.75), "7 3/4");
  assert.equal(toFraction(7.5), "7 1/2");
  assert.equal(toFraction(0.0625), "1/16");
  assert.equal(toFraction(10), "10");
  close(stringerLength({ riserIn: 7, treadIn: 11, risers: 4 }), 4 * Math.hypot(7, 11));
});

test("roofing: multipliers and a 40 x 30 ft gable roof", () => {
  close(pitchMultiplier(12), Math.SQRT2);
  close(pitchMultiplier(6), Math.sqrt(1.25));
  close(hipMultiplier(0), Math.SQRT2);
  const r = roofEstimate({ lengthFt: 40, widthFt: 30, rise: 6, style: "gable" });
  assert.equal(r.roofSqFt, 1341.6);
  assert.equal(r.bundles, 45); // 13.42 sq x 1.10 x 3 = 44.3
  assert.equal(r.ridgeFt, 40);
  const hip = roofEstimate({ lengthFt: 40, widthFt: 30, rise: 6, style: "hip" });
  assert.equal(hip.ridgeFt, 10);
  assert.equal(hip.hipsFt, 90); // 4 x 15 x 1.5
});

test("grout: 12 x 12 tile, 1/8 joint, 3/8 thick", () => {
  const g = groutEstimate({ areaSqFt: 100, tileWidthIn: 12, tileLengthIn: 12, jointIn: 0.125, tileThicknessIn: 0.375, wastePct: 0 });
  assert.equal(g.jointFtPerSqFt, 2);
  assert.equal(g.cuIn, 112.5); // 100 x 24 x 0.125 x 0.375
  assert.equal(g.bags, 1);
});
