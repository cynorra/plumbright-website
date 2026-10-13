import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

export const CUBIC_FEET_PER_YARD = 27;
export const LB_PER_TON = 2000;

/**
 * Typical loose weight per cubic yard, in pounds. Weight varies with rock
 * type, moisture and how much fine material is mixed in, so suppliers quote
 * ranges; these are planning values in the middle of the common ranges.
 * Crushed stone and crusher run follow a quarry supplier's published figures
 * (crushed stone about 2,700 to 2,800 lb, crusher run up to about 3,000 lb).
 */
export const MATERIALS = {
  crushed: { label: "Crushed stone (#57, clean)", lbPerYd: 2700, compactPct: 0 },
  crusherRun: { label: "Crusher run / road base", lbPerYd: 3000, compactPct: 15 },
  pea: { label: "Pea gravel", lbPerYd: 2600, compactPct: 0 },
  river: { label: "River rock", lbPerYd: 2600, compactPct: 0 },
  sand: { label: "Sand (dry)", lbPerYd: 2700, compactPct: 10 },
  topsoil: { label: "Topsoil", lbPerYd: 2200, compactPct: 10 },
};

/**
 * Volume of a rectangular or round area at a depth.
 * compactPct is extra material for a base that will be compacted (road base,
 * paver base): it settles, so you need more loose material than the finished
 * volume.
 */
export function gravelVolume({ shape = "rect", lengthFt, widthFt, diameterFt, depthIn }) {
  requirePositive(depthIn, "depth");
  let areaSqFt;
  if (shape === "circle") {
    requirePositive(diameterFt, "diameter");
    areaSqFt = Math.PI * (diameterFt / 2) ** 2;
  } else {
    requirePositive(lengthFt, "length");
    requirePositive(widthFt, "width");
    areaSqFt = lengthFt * widthFt;
  }
  return { areaSqFt, cuFt: areaSqFt * (depthIn / 12) };
}

/** Cubic yards, tons and bags to order for a finished volume. */
export function gravelOrder({ cuFt, lbPerYd, compactPct = 0, bagCuFt = 0.5 }) {
  requirePositive(cuFt, "volume");
  requirePositive(lbPerYd, "weight per cubic yard");
  requireNonNegative(compactPct, "compaction allowance");
  const looseCuFt = cuFt * (1 + compactPct / 100);
  const yards = looseCuFt / CUBIC_FEET_PER_YARD;
  const tons = (yards * lbPerYd) / LB_PER_TON;
  return {
    cuFt: round(looseCuFt, 2),
    cubicYards: round(yards, 2),
    tons: round(tons, 2),
    // Bulk is sold by the half yard or by the ton at most yards.
    orderYards: ceilSafe(yards * 2) / 2,
    bags: bagCuFt > 0 ? ceilSafe(looseCuFt / bagCuFt) : null,
  };
}

/** Square feet one cubic yard covers at a depth (in). */
export function coveragePerYard(depthIn) {
  requirePositive(depthIn, "depth");
  return CUBIC_FEET_PER_YARD / (depthIn / 12);
}
