import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

export const SQFT_PER_SQUARE = 100;
/** Most 3-tab and architectural shingles: 3 bundles per square (GAF). Some heavy lines use 4 or 5. */
export const BUNDLES_PER_SQUARE = 3;
/** Waste: gable roofs have straight cuts; hips add angled cuts on every hip. */
export const ROOF_STYLES = {
  gable: { label: "Gable", wastePct: 10 },
  hip: { label: "Hip", wastePct: 15 },
};
/** Synthetic underlayment rolls commonly cover 10 squares; check the label. */
export const UNDERLAYMENT_ROLL_SQFT = 1000;
export const DRIP_EDGE_PIECE_FT = 10;

/** Pitch multiplier: sloped length per foot of horizontal run, for a rise of `rise` in 12. */
export function pitchMultiplier(rise) {
  requireNonNegative(rise, "pitch");
  return Math.sqrt(1 + (rise / 12) ** 2);
}

/** Roof angle in degrees for a rise in 12. */
export function pitchAngle(rise) {
  return (Math.atan(rise / 12) * 180) / Math.PI;
}

/**
 * Hip and valley multiplier: length of a hip rafter per foot of the common
 * rafter's horizontal run, where both roof planes have the same pitch.
 */
export function hipMultiplier(rise) {
  requireNonNegative(rise, "pitch");
  return Math.sqrt(2 + (rise / 12) ** 2);
}

/**
 * Shingles and accessories for a simple rectangular gable or hip roof.
 * lengthFt and widthFt are the footprint INCLUDING overhangs; lengthFt is
 * the ridge direction. All planes share one pitch.
 */
export function roofEstimate({ lengthFt, widthFt, rise = 6, style = "gable", wastePct, bundlesPerSquare = BUNDLES_PER_SQUARE }) {
  requirePositive(lengthFt, "length");
  requirePositive(widthFt, "width");
  requirePositive(bundlesPerSquare, "bundles per square");
  if (!ROOF_STYLES[style]) throw new RangeError("Choose a roof style.");
  const waste = Number.isFinite(wastePct) ? wastePct : ROOF_STYLES[style].wastePct;
  requireNonNegative(waste, "waste percentage");
  const L = Math.max(lengthFt, widthFt);
  const W = Math.min(lengthFt, widthFt);
  const mult = pitchMultiplier(rise);
  const roofSqFt = L * W * mult;
  const squares = roofSqFt / SQFT_PER_SQUARE;
  const squaresWithWaste = squares * (1 + waste / 100);
  const bundles = ceilSafe(squaresWithWaste * bundlesPerSquare);
  const run = W / 2;
  const rafter = run * mult;

  let eavesFt, rakesFt, ridgeFt, hipsFt;
  if (style === "gable") {
    eavesFt = 2 * L;
    rakesFt = 4 * rafter;
    ridgeFt = L;
    hipsFt = 0;
  } else {
    eavesFt = 2 * (L + W);
    rakesFt = 0;
    ridgeFt = L - W;
    hipsFt = 4 * run * hipMultiplier(rise);
  }
  return {
    multiplier: round(mult, 3),
    roofSqFt: round(roofSqFt, 1),
    squares: round(squares, 2),
    squaresWithWaste: round(squaresWithWaste, 2),
    bundles,
    underlaymentRolls: ceilSafe(roofSqFt / UNDERLAYMENT_ROLL_SQFT),
    eavesFt: round(eavesFt, 1),
    rakesFt: round(rakesFt, 1),
    ridgeFt: round(ridgeFt, 1),
    hipsFt: round(hipsFt, 1),
    ridgeCapFt: round(ridgeFt + hipsFt, 1),
    dripEdgePieces: ceilSafe((eavesFt + rakesFt) / DRIP_EDGE_PIECE_FT),
    starterFt: round(eavesFt + rakesFt, 1),
  };
}
