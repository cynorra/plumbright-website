import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/** Broadloom carpet is mostly made 12 ft wide; some lines come 13.5 or 15 ft. */
export const ROLL_WIDTHS = [12, 13.5, 15];
export const TRIM_IN = 3; // extra on each cut end for trimming at the walls

/**
 * Carpet for a rectangular room, cut from a roll of a fixed width.
 * The room is covered with "drops": full-width pieces laid side by side,
 * each as long as the room plus trim. Both directions are tried and the one
 * that buys less carpet wins (fewer seams breaks a tie). Leftover width on
 * the last drop is counted as waste; an installer can sometimes use it to
 * fill a closet, which this does not model.
 */
export function carpetEstimate({ lengthFt, widthFt, rollWidthFt = 12, trimIn = TRIM_IN, doorwaysFt = 3 }) {
  requirePositive(lengthFt, "room length");
  requirePositive(widthFt, "room width");
  requirePositive(rollWidthFt, "roll width");
  requireNonNegative(trimIn, "trim allowance");
  const plan = (runFt, acrossFt) => {
    const drops = ceilSafe(acrossFt / rollWidthFt);
    const cutFt = runFt + (2 * trimIn) / 12;
    return { drops, cutFt, buySqFt: drops * rollWidthFt * cutFt, seams: drops - 1, runFt };
  };
  const a = plan(lengthFt, widthFt);
  const b = plan(widthFt, lengthFt);
  const best = a.buySqFt < b.buySqFt - 1e-9 || (Math.abs(a.buySqFt - b.buySqFt) < 1e-9 && a.seams <= b.seams) ? a : b;
  const roomSqFt = lengthFt * widthFt;
  return {
    roomSqFt: round(roomSqFt, 2),
    roomSqYd: round(roomSqFt / 9, 2),
    drops: best.drops,
    seams: best.seams,
    cutLengthFt: round(best.cutFt, 2),
    runsAlongFt: best.runFt,
    buySqFt: round(best.buySqFt, 2),
    buySqYd: round(best.buySqFt / 9, 2),
    wastePct: round(((best.buySqFt - roomSqFt) / best.buySqFt) * 100, 1),
    // Pad has no pattern or nap direction, so it's bought close to room size.
    padSqYd: ceilSafe((roomSqFt / 9) * 1.05),
    tackStripFt: round(2 * (lengthFt + widthFt) - doorwaysFt, 1),
  };
}
