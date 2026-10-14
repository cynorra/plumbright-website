import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/**
 * Units per square foot of wall and mortar per 1,000 units with 3/8 in
 * joints, from the Brick Industry Association's Technical Note 10.
 * Concrete block: an 8 x 8 x 16 in (nominal) unit has a 128 sq in face,
 * so 144 / 128 = 1.125 blocks per sq ft.
 * perBag: QUIKRETE's data sheet says one 80 lb bag of Mason Mix lays up to
 * 37 standard bricks or 13 standard 8 x 8 x 16 blocks.
 */
export const UNITS = {
  modular: { label: "Modular brick (7 5/8 × 2 1/4 in)", perSqFt: 6.75, mortarPer1000: 8.1 },
  queen: { label: "Queen brick", perSqFt: 5.5, mortarPer1000: 12.2 },
  king: { label: "King brick", perSqFt: 4.55, mortarPer1000: 14.2 },
  utility: { label: "Utility brick", perSqFt: 3.0, mortarPer1000: 12.3 },
  block: { label: "Concrete block (8 × 8 × 16 in)", perSqFt: 1.125, mortarPer1000: null },
};
export const BRICK_WASTE_PCT = 5; // BIA: add at least 5%
export const MORTAR_WASTE_PCT = 20; // BIA: add 15 to 25%
export const BRICKS_PER_80LB_BAG = 37;
export const BLOCKS_PER_80LB_BAG = 13;
/** Net mortar one 80 lb bag represents, implied by 37 modular brick at BIA's 8.1 cu ft per 1,000. */
export const BAG_MORTAR_CUFT = (BRICKS_PER_80LB_BAG * UNITS.modular.mortarPer1000) / 1000;

export const DOOR_SQFT = 21;
export const WINDOW_SQFT = 15;

/** Wall area: length x height minus openings. */
export function wallArea({ lengthFt, heightFt, doors = 0, windows = 0 }) {
  requirePositive(lengthFt, "wall length");
  requirePositive(heightFt, "wall height");
  requireNonNegative(doors, "number of doors");
  requireNonNegative(windows, "number of windows");
  const gross = lengthFt * heightFt;
  const net = gross - doors * DOOR_SQFT - windows * WINDOW_SQFT;
  if (net <= 0) throw new RangeError("The openings are larger than the wall. Check the counts.");
  return net;
}

/** Bricks or blocks and 80 lb bags of mortar for a single-wythe wall. */
export function masonryEstimate({ areaSqFt, unit = "modular", wastePct = BRICK_WASTE_PCT }) {
  requirePositive(areaSqFt, "wall area");
  requireNonNegative(wastePct, "waste percentage");
  const u = UNITS[unit];
  if (!u) throw new RangeError("Choose a brick or block type.");
  const net = areaSqFt * u.perSqFt;
  const units = ceilSafe(net * (1 + wastePct / 100));
  let bags;
  let mortarCuFt = null;
  if (unit === "block") {
    bags = ceilSafe((net * (1 + MORTAR_WASTE_PCT / 100)) / BLOCKS_PER_80LB_BAG);
  } else {
    mortarCuFt = (net / 1000) * u.mortarPer1000 * (1 + MORTAR_WASTE_PCT / 100);
    bags = ceilSafe(mortarCuFt / BAG_MORTAR_CUFT);
  }
  return {
    areaSqFt: round(areaSqFt, 2),
    netUnits: round(net, 1),
    units,
    mortarCuFt: mortarCuFt === null ? null : round(mortarCuFt, 2),
    bags,
  };
}

/** Pavers laid tight (sand-swept joints): count for an area. Sizes in inches. */
export function paverCount({ areaSqFt, paverWidthIn, paverLengthIn, wastePct = 5 }) {
  requirePositive(areaSqFt, "area");
  requirePositive(paverWidthIn, "paver width");
  requirePositive(paverLengthIn, "paver length");
  requireNonNegative(wastePct, "waste percentage");
  const perSqFt = 144 / (paverWidthIn * paverLengthIn);
  return { perSqFt: round(perSqFt, 3), pavers: ceilSafe(areaSqFt * perSqFt * (1 + wastePct / 100)) };
}
