import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

export const CUBIC_FEET_PER_YARD = 27;
/** Bagged mulch, compost and soil are sold mostly in 1.5, 2 and 3 cu ft bags. */
export const BAG_SIZES = [1.5, 2, 3];

/**
 * Depth guidance for wood chips and shredded bark, from Iowa State University
 * Extension: 3 to 4 in on well-drained sites, 2 to 3 in on heavy soils, and
 * at least 6 in clear of tree trunks.
 */
export const DEPTHS = [
  { use: "Top-up on an existing bed", depth: "1 to 2 in" },
  { use: "Beds on heavy (clay) soil", depth: "2 to 3 in" },
  { use: "Beds and tree rings, well-drained soil", depth: "3 to 4 in" },
  { use: "Paths and play areas (wood chips)", depth: "3 to 4 in, more for play areas per the surfacing maker" },
];

/** Area of a rectangle (length, width) or a circle (diameter), in sq ft. */
export function bedArea({ shape = "rect", lengthFt, widthFt, diameterFt }) {
  if (shape === "circle") {
    requirePositive(diameterFt, "diameter");
    return Math.PI * (diameterFt / 2) ** 2;
  }
  requirePositive(lengthFt, "length");
  requirePositive(widthFt, "width");
  return lengthFt * widthFt;
}

/**
 * Mulch (or compost, or soil) for an area at a depth. existingIn is mulch
 * already on the bed, so a top-up only buys the difference.
 */
export function mulchEstimate({ areaSqFt, depthIn, existingIn = 0, wastePct = 0 }) {
  requirePositive(areaSqFt, "area");
  requirePositive(depthIn, "depth");
  requireNonNegative(existingIn, "existing depth");
  requireNonNegative(wastePct, "extra percentage");
  if (existingIn >= depthIn) throw new RangeError("The bed already has that much mulch. Enter a target depth greater than the existing depth.");
  const cuFt = areaSqFt * ((depthIn - existingIn) / 12) * (1 + wastePct / 100);
  const yards = cuFt / CUBIC_FEET_PER_YARD;
  return {
    areaSqFt: round(areaSqFt, 2),
    cuFt: round(cuFt, 2),
    cubicYards: round(yards, 2),
    orderYards: ceilSafe(yards * 2) / 2,
    bags: BAG_SIZES.map((size) => ({ size, count: ceilSafe(cuFt / size) })),
  };
}

/** Square feet one bag (or one cubic yard) covers at a depth. */
export function coverage(cuFt, depthIn) {
  requirePositive(cuFt, "volume");
  requirePositive(depthIn, "depth");
  return cuFt / (depthIn / 12);
}

/** Bags of a size that make one cubic yard. */
export function bagsPerYard(bagCuFt) {
  requirePositive(bagCuFt, "bag size");
  return CUBIC_FEET_PER_YARD / bagCuFt;
}

/** Volume of a rectangular raised bed (all in feet and inches). */
export function raisedBedVolume({ lengthFt, widthFt, depthIn }) {
  requirePositive(lengthFt, "length");
  requirePositive(widthFt, "width");
  requirePositive(depthIn, "depth");
  return lengthFt * widthFt * (depthIn / 12);
}
