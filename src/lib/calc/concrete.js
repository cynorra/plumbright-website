import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

export const CUBIC_FEET_PER_YARD = 27;
export const CUBIC_INCHES_PER_FOOT = 1728;

/**
 * Approximate yield of one bag of standard concrete mix, in cubic feet.
 * These match the yields printed on common US 40/50/60/80 lb bags of
 * standard (not high-strength or fast-setting) concrete mix. Always check the
 * bag you buy: lightweight, fast-setting and specialty mixes differ.
 */
export const BAG_YIELDS = [
  { weight: 40, yieldCuFt: 0.3 },
  { weight: 50, yieldCuFt: 0.375 },
  { weight: 60, yieldCuFt: 0.45 },
  { weight: 80, yieldCuFt: 0.6 },
];

/** Slab, patio, pad or footing strip: length and width in feet, thickness in inches. */
export function slabVolume({ lengthFt, widthFt, thicknessIn }) {
  requirePositive(lengthFt, "length");
  requirePositive(widthFt, "width");
  requirePositive(thicknessIn, "thickness");
  return lengthFt * widthFt * (thicknessIn / 12);
}

/** Round column or tube form: diameter in inches, height in feet. */
export function columnVolume({ diameterIn, heightFt }) {
  requirePositive(diameterIn, "diameter");
  requirePositive(heightFt, "height");
  const radiusFt = diameterIn / 2 / 12;
  return Math.PI * radiusFt ** 2 * heightFt;
}

/**
 * Concrete for fence or deck post holes.
 * The post itself displaces concrete, and many builders put a gravel base
 * in the bottom of the hole, so both are subtracted.
 * holeDiameterIn, holeDepthIn, gravelBaseIn and postWidthIn are in inches;
 * the post is treated as square (a 4x4 is about 3.5 in wide).
 */
export function postHoleVolume({ holes, holeDiameterIn, holeDepthIn, gravelBaseIn = 0, postWidthIn = 0 }) {
  requirePositive(holes, "number of holes");
  requirePositive(holeDiameterIn, "hole diameter");
  requirePositive(holeDepthIn, "hole depth");
  requireNonNegative(gravelBaseIn, "gravel base");
  requireNonNegative(postWidthIn, "post width");
  if (gravelBaseIn >= holeDepthIn) {
    throw new RangeError("The gravel base must be shallower than the hole.");
  }
  const holeArea = Math.PI * (holeDiameterIn / 2) ** 2;
  const postArea = postWidthIn ** 2;
  if (postArea >= holeArea) {
    throw new RangeError("The post is wider than the hole. Use a larger hole diameter.");
  }
  const concreteDepthIn = holeDepthIn - gravelBaseIn;
  const perHoleCuIn = (holeArea - postArea) * concreteDepthIn;
  return (perHoleCuIn * holes) / CUBIC_INCHES_PER_FOOT;
}

/**
 * Turn a net volume into what to order: cubic yards and bag counts by size.
 * wastePct covers spillage, uneven subgrade and over-excavation.
 */
export function concreteOrder(netCuFt, wastePct = 10) {
  requirePositive(netCuFt, "volume");
  requireNonNegative(wastePct, "waste percentage");
  const totalCuFt = netCuFt * (1 + wastePct / 100);
  return {
    netCuFt: round(netCuFt, 2),
    totalCuFt: round(totalCuFt, 2),
    cubicYards: round(totalCuFt / CUBIC_FEET_PER_YARD, 2),
    bags: BAG_YIELDS.map((b) => ({
      weight: b.weight,
      yieldCuFt: b.yieldCuFt,
      count: ceilSafe(totalCuFt / b.yieldCuFt),
    })),
  };
}
