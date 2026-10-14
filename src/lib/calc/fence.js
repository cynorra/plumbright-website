import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";
import { postHoleVolume, concreteOrder } from "./concrete.js";

/** Standard post lengths in feet. */
export const POST_LENGTHS = [6, 8, 10, 12];

/** Rails per section: 2 for fences up to 4 ft tall, 3 above that (common practice). */
export function railsPerSection(heightFt) {
  return heightFt > 4 ? 3 : 2;
}

/**
 * Materials for a straight wood picket or privacy fence.
 * - lengthFt: total fence length including gates.
 * - Each gate is an opening of gateWidthFt with its own post on each side; in
 *   a straight run, a gate adds one post compared with a solid fence.
 * - Pickets cover the fence line (gates excluded) at picket width + gap.
 * - Concrete: one hole per post, with a gravel base, using the concrete
 *   calculator's post-hole formula.
 */
export function fenceEstimate({
  lengthFt,
  heightFt = 6,
  spacingFt = 8,
  gates = 0,
  gateWidthFt = 4,
  picketWidthIn = 5.5,
  gapIn = 0,
  holeDiameterIn = 10,
  holeDepthIn = 30,
  gravelBaseIn = 6,
  postWidthIn = 3.5,
  wastePct = 5,
}) {
  requirePositive(lengthFt, "fence length");
  requirePositive(heightFt, "fence height");
  requirePositive(spacingFt, "post spacing");
  requireNonNegative(gates, "number of gates");
  requireNonNegative(gapIn, "gap");
  requirePositive(picketWidthIn, "picket width");
  const gateTotal = gates * gateWidthFt;
  const fenceLine = lengthFt - gateTotal;
  if (fenceLine <= 0) throw new RangeError("The gates are wider than the fence. Check the length and gate count.");
  const sections = ceilSafe(fenceLine / spacingFt - 1e-9);
  const posts = sections + 1 + Math.round(gates);
  const railsEach = railsPerSection(heightFt);
  const rails = sections * railsEach;
  const pickets = ceilSafe(((fenceLine * 12) / (picketWidthIn + gapIn)) * (1 + wastePct / 100));
  const buriedIn = holeDepthIn - gravelBaseIn;
  const postLengthFt = POST_LENGTHS.find((l) => l >= heightFt + buriedIn / 12 - 1e-9) ?? null;
  const concrete = concreteOrder(
    postHoleVolume({ holes: posts, holeDiameterIn, holeDepthIn, gravelBaseIn, postWidthIn }),
    10,
  );
  return {
    fenceLineFt: round(fenceLine, 2),
    sections,
    posts,
    postLengthFt,
    railsEach,
    rails,
    pickets,
    // Two fasteners where each picket crosses each rail.
    fasteners: pickets * railsEach * 2,
    concreteCuFt: concrete.totalCuFt,
    bags80: concrete.bags.find((b) => b.weight === 80).count,
    bags50: concrete.bags.find((b) => b.weight === 50).count,
  };
}
