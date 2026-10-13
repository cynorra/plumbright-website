import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/**
 * IRC limits for residential stairs (R311.7, 2018 and 2021 editions).
 * Local codes can differ; your building department has the final word.
 */
export const IRC = {
  maxRiserIn: 7.75, // R311.7.5.1
  minTreadIn: 10, // R311.7.5.2, measured nosing to nosing
  maxVariationIn: 0.375, // R311.7.5.1 and .2: largest minus smallest in a flight
  minHeadroomIn: 80, // R311.7.2: 6 ft 8 in
  minWidthIn: 36, // R311.7.1
  nosingMinIn: 0.75, // R311.7.5.3, required where tread is under 11 in
  nosingMaxIn: 1.25,
  handrailMinIn: 34, // R311.7.8.1
  handrailMaxIn: 38,
};

/** Standard dimensional lumber lengths for stringers, in feet. */
export const LUMBER_LENGTHS = [8, 10, 12, 14, 16, 18, 20];

/** 7.3125 -> "7 5/16". Rounds to the nearest 1/denominator inch. */
export function toFraction(inches, denominator = 16) {
  if (!Number.isFinite(inches)) return "–";
  const sign = inches < 0 ? "-" : "";
  let n = Math.round(Math.abs(inches) * denominator);
  const whole = Math.floor(n / denominator);
  let num = n - whole * denominator;
  let den = denominator;
  while (num > 0 && num % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  if (num === 0) return `${sign}${whole}`;
  return whole ? `${sign}${whole} ${num}/${den}` : `${sign}${num}/${den}`;
}

/**
 * Lay out a straight stair from the total rise (finished floor to finished
 * floor, in inches).
 * - targetRiserIn: the riser you would like (7 to 7.5 in feels good); the
 *   riser count is rounded up so no riser exceeds max(target, code max).
 * - treadIn: the run of each tread, nosing to nosing.
 * - risers: optional fixed riser count instead of the target.
 * Treads = risers - 1, because the upper floor is the last "tread".
 */
export function stairLayout({ totalRiseIn, targetRiserIn = 7.5, treadIn = 10.5, risers: fixedRisers, widthIn = 36, stringerSpacingIn = 16 }) {
  requirePositive(totalRiseIn, "total rise");
  requirePositive(treadIn, "tread depth");
  requirePositive(widthIn, "stair width");
  let risers;
  if (Number.isFinite(fixedRisers) && fixedRisers > 0) {
    risers = Math.round(fixedRisers);
  } else {
    requirePositive(targetRiserIn, "target riser height");
    risers = Math.max(1, ceilSafe(totalRiseIn / targetRiserIn));
  }
  const riserIn = totalRiseIn / risers;
  const treads = Math.max(0, risers - 1);
  const totalRunIn = treads * treadIn;
  // Stringer length along the board edge: one step's diagonal
  // (hypot of riser and tread) times the number of risers. That is one step
  // longer than the line through the nosings, which covers the plumb cut at
  // the top and the level cut at the bottom.
  const stringerIn = stringerLength({ riserIn, treadIn, risers });
  const angleDeg = (Math.atan2(riserIn, treadIn) * 180) / Math.PI;
  const comfort = 2 * riserIn + treadIn; // Blondel: 24 to 25 in feels natural
  const stringerFt = stringerIn / 12;
  const board = LUMBER_LENGTHS.find((l) => l >= stringerFt - 1e-9) ?? null;
  const stringers = Math.max(2, ceilSafe(widthIn / stringerSpacingIn) + 1);

  const checks = [
    { label: `Riser ≤ ${toFraction(IRC.maxRiserIn)} in`, ok: riserIn <= IRC.maxRiserIn + 1e-9, value: `${toFraction(riserIn)} in` },
    { label: `Tread ≥ ${IRC.minTreadIn} in`, ok: treadIn >= IRC.minTreadIn - 1e-9, value: `${toFraction(treadIn)} in` },
    { label: `Width ≥ ${IRC.minWidthIn} in`, ok: widthIn >= IRC.minWidthIn - 1e-9, value: `${toFraction(widthIn)} in` },
  ];

  return {
    risers,
    treads,
    riserIn: round(riserIn, 4),
    treadIn,
    totalRunIn: round(totalRunIn, 3),
    stringerIn: round(stringerIn, 2),
    angleDeg: round(angleDeg, 1),
    comfort: round(comfort, 2),
    comfortable: comfort >= 24 && comfort <= 25.5,
    boardFt: board,
    stringers,
    codeOk: checks.every((c) => c.ok),
    checks,
  };
}

/** Stringer length (in) from rise and run per step and the number of risers. */
export function stringerLength({ riserIn, treadIn, risers }) {
  requirePositive(riserIn, "riser height");
  requirePositive(treadIn, "tread depth");
  requirePositive(risers, "number of risers");
  return Math.hypot(riserIn * risers, treadIn * risers);
}
