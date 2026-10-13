import { test } from "node:test";
import assert from "node:assert/strict";
import { slabVolume, columnVolume, postHoleVolume, concreteOrder } from "../src/lib/calc/concrete.js";
import { tileCoverageSqFt, tileEstimate } from "../src/lib/calc/tile.js";
import { roomArea, paintEstimate, purchasePlan } from "../src/lib/calc/paint.js";
import { ceilSafe } from "../src/lib/calc/util.js";

const close = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test("ceilSafe ignores float noise", () => {
  assert.equal(ceilSafe(10.0000000001), 10);
  assert.equal(ceilSafe(10.01), 11);
});

test("10x10 slab, 4 in thick = 33.33 cu ft = 1.23 yd", () => {
  const v = slabVolume({ lengthFt: 10, widthFt: 10, thicknessIn: 4 });
  close(v, 33.3333333, 1e-4);
  const o = concreteOrder(v, 0);
  assert.equal(o.cubicYards, 1.23);
  assert.equal(o.bags.find((b) => b.weight === 80).count, 56); // 33.33 / 0.6 = 55.6
});

test("waste is applied before bag rounding", () => {
  const o = concreteOrder(6, 10); // 6.6 cu ft
  assert.equal(o.totalCuFt, 6.6);
  assert.equal(o.bags.find((b) => b.weight === 80).count, 11);
  assert.equal(o.bags.find((b) => b.weight === 60).count, 15); // 6.6/0.45 = 14.67
});

test("12 in tube, 4 ft tall", () => {
  close(columnVolume({ diameterIn: 12, heightFt: 4 }), Math.PI * 0.5 ** 2 * 4);
});

test("post hole subtracts post and gravel", () => {
  // 10 in hole, 36 in deep, 6 in gravel, 3.5 in post -> concrete 30 in deep
  const v = postHoleVolume({ holes: 1, holeDiameterIn: 10, holeDepthIn: 36, gravelBaseIn: 6, postWidthIn: 3.5 });
  const expected = ((Math.PI * 25 - 12.25) * 30) / 1728;
  close(v, expected);
  assert.ok(v > 1 && v < 1.3);
});

test("post hole rejects gravel deeper than hole", () => {
  assert.throws(() => postHoleVolume({ holes: 1, holeDiameterIn: 10, holeDepthIn: 6, gravelBaseIn: 6 }), RangeError);
});

test("12x12 tile with 1/8 grout covers slightly more than 1 sq ft", () => {
  close(tileCoverageSqFt(12, 12, 0.125), (12.125 * 12.125) / 144);
});

test("100 sq ft, 12x12 tile, 10% waste", () => {
  const r = tileEstimate({ areaSqFt: 100, tileWidthIn: 12, tileLengthIn: 12, groutIn: 0.125, wastePct: 10, tilesPerBox: 10 });
  // 100 / 1.0209 = 97.95 -> *1.1 = 107.75 -> 108 tiles -> 11 boxes
  assert.equal(r.tiles, 108);
  assert.equal(r.boxes, 11);
});

test("boxes from sq ft per box", () => {
  const r = tileEstimate({ areaSqFt: 100, tileWidthIn: 12, tileLengthIn: 24, wastePct: 10, sqFtPerBox: 15.5 });
  assert.equal(r.boxes, 8); // 110 / 15.5 = 7.1
});

test("12x12x8 room, 1 door, 2 windows", () => {
  const a = roomArea({ lengthFt: 12, widthFt: 12, heightFt: 8, doors: 1, windows: 2 });
  assert.equal(a.grossWalls, 384);
  assert.equal(a.walls, 384 - 21 - 30);
  const p = paintEstimate({ areaSqFt: a.walls, coats: 2, coverageSqFtPerGal: 350 });
  assert.equal(p.paintGallons, 1.9); // 333 * 2 / 350
  assert.deepEqual(p.paintToBuy, { gallons: 2, quarts: 0 });
});

test("purchase plan rounds sensibly", () => {
  assert.deepEqual(purchasePlan(1.2), { gallons: 1, quarts: 1 });
  assert.deepEqual(purchasePlan(1.45), { gallons: 1, quarts: 2 });
  assert.deepEqual(purchasePlan(1.6), { gallons: 2, quarts: 0 });
  assert.deepEqual(purchasePlan(2), { gallons: 2, quarts: 0 });
});
