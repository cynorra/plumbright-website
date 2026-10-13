import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/**
 * Typical waste allowances by layout. These are planning rules of thumb used
 * by installers, not fixed standards: small rooms, many corners and large
 * tiles push waste higher.
 */
export const LAYOUTS = {
  straight: { label: "Straight (grid)", wastePct: 10 },
  offset: { label: "Offset / brick", wastePct: 10 },
  diagonal: { label: "Diagonal (45°)", wastePct: 15 },
  herringbone: { label: "Herringbone", wastePct: 20 },
};

/** Floor or wall area from length and width in feet. */
export function rectArea(lengthFt, widthFt) {
  requirePositive(lengthFt, "length");
  requirePositive(widthFt, "width");
  return lengthFt * widthFt;
}

/**
 * Square feet one tile covers once the grout joint is included.
 * Each tile "owns" half a joint on every side, which adds one full joint
 * to each dimension.
 */
export function tileCoverageSqFt(tileWidthIn, tileLengthIn, groutIn = 0) {
  requirePositive(tileWidthIn, "tile width");
  requirePositive(tileLengthIn, "tile length");
  requireNonNegative(groutIn, "grout joint");
  return ((tileWidthIn + groutIn) * (tileLengthIn + groutIn)) / 144;
}

/**
 * Tiles and boxes for an area.
 * Supply either tilesPerBox or sqFtPerBox (whichever is printed on the box).
 */
export function tileEstimate({
  areaSqFt,
  tileWidthIn,
  tileLengthIn,
  groutIn = 0.125,
  wastePct = 10,
  tilesPerBox,
  sqFtPerBox,
}) {
  requirePositive(areaSqFt, "area");
  requireNonNegative(wastePct, "waste percentage");
  const perTile = tileCoverageSqFt(tileWidthIn, tileLengthIn, groutIn);
  const netTiles = areaSqFt / perTile;
  const tiles = ceilSafe(netTiles * (1 + wastePct / 100));

  let boxes = null;
  if (Number.isFinite(tilesPerBox) && tilesPerBox > 0) {
    boxes = ceilSafe(tiles / tilesPerBox);
  } else if (Number.isFinite(sqFtPerBox) && sqFtPerBox > 0) {
    boxes = ceilSafe((areaSqFt * (1 + wastePct / 100)) / sqFtPerBox);
  }

  return {
    areaSqFt: round(areaSqFt, 2),
    areaWithWasteSqFt: round(areaSqFt * (1 + wastePct / 100), 2),
    coveragePerTileSqFt: round(perTile, 4),
    netTiles: round(netTiles, 1),
    tiles,
    boxes,
  };
}

/**
 * Cubic inches of joint one pound of dry sanded cement grout fills once
 * mixed. Mixed cement grout weighs roughly 120 to 140 lb per cubic foot and
 * part of that is water, so a pound of powder fills about 12 to 15 cu in.
 * We use the low end so the estimate leans toward one bag too many.
 * Epoxy and premixed grouts differ: use the chart on the package.
 */
export const GROUT_CU_IN_PER_LB = 12;

/**
 * Grout for an area. Joint length per square foot is
 * 144 x (tile width + tile length) / (tile width x tile length), and the
 * joint is filled to the full tile thickness.
 */
export function groutEstimate({ areaSqFt, tileWidthIn, tileLengthIn, jointIn = 0.125, tileThicknessIn = 0.375, wastePct = 10, bagLb = 25 }) {
  requirePositive(areaSqFt, "area");
  requirePositive(tileWidthIn, "tile width");
  requirePositive(tileLengthIn, "tile length");
  requirePositive(jointIn, "joint width");
  requirePositive(tileThicknessIn, "tile thickness");
  requireNonNegative(wastePct, "waste percentage");
  requirePositive(bagLb, "bag size");
  const jointInPerSqFt = (144 * (tileWidthIn + tileLengthIn)) / (tileWidthIn * tileLengthIn);
  const cuInPerSqFt = jointInPerSqFt * jointIn * tileThicknessIn;
  const cuIn = areaSqFt * cuInPerSqFt * (1 + wastePct / 100);
  const lb = cuIn / GROUT_CU_IN_PER_LB;
  return {
    jointFtPerSqFt: round(jointInPerSqFt / 12, 2),
    cuIn: round(cuIn, 1),
    lb: round(lb, 1),
    bags: ceilSafe(lb / bagLb),
    sqFtPerBag: round((bagLb * GROUT_CU_IN_PER_LB) / cuInPerSqFt, 0),
  };
}
