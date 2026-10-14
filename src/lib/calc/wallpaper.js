import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/**
 * Common roll sizes. US rolls are priced as single rolls but sold in double
 * rolls; sizes vary by maker, so check the label.
 */
export const ROLLS = {
  usDouble: { label: "US double roll (20.5 in × 33 ft)", widthIn: 20.5, lengthFt: 33 },
  wideDouble: { label: "Wide double roll (27 in × 27 ft)", widthIn: 27, lengthFt: 27 },
  euro: { label: "European roll (20.9 in × 32.8 ft)", widthIn: 20.9, lengthFt: 32.8 },
};
export const DOOR_WIDTH_FT = 3;
export const TRIM_IN = 4; // 2 in at the ceiling and 2 in at the baseboard

/**
 * Length of one strip (a "drop"). Patterned paper must be cut so the pattern
 * lines up, so each strip is a whole number of repeats. A half-drop match
 * shifts every other strip by half a repeat, which wastes about half a repeat
 * per strip on average.
 */
export function dropLengthIn({ heightFt, repeatIn = 0, match = "straight", trimIn = TRIM_IN }) {
  requirePositive(heightFt, "wall height");
  requireNonNegative(repeatIn, "pattern repeat");
  const raw = heightFt * 12 + trimIn;
  if (!repeatIn) return raw;
  const base = Math.ceil(raw / repeatIn - 1e-9) * repeatIn;
  return match === "half" ? base + repeatIn / 2 : base;
}

/**
 * Rolls for the walls of a room (or one wall), counted strip by strip.
 * Doors are subtracted by width; windows are not, because the strips above
 * and below a window rarely come from offcuts that match.
 */
export function wallpaperEstimate({ wallWidthFt, heightFt, rollWidthIn, rollLengthFt, repeatIn = 0, match = "straight", doors = 0 }) {
  requirePositive(wallWidthFt, "wall width");
  requirePositive(rollWidthIn, "roll width");
  requirePositive(rollLengthFt, "roll length");
  requireNonNegative(doors, "number of doors");
  const coverWidthFt = wallWidthFt - doors * DOOR_WIDTH_FT;
  if (coverWidthFt <= 0) throw new RangeError("The doors are wider than the walls. Check the measurements.");
  const drop = dropLengthIn({ heightFt, repeatIn, match });
  const stripsPerRoll = Math.floor((rollLengthFt * 12) / drop + 1e-9);
  if (stripsPerRoll < 1) throw new RangeError("One strip is longer than a roll. Check the wall height and roll length.");
  const strips = ceilSafe((coverWidthFt * 12) / rollWidthIn);
  const rolls = ceilSafe(strips / stripsPerRoll);
  const rollSqFt = (rollWidthIn / 12) * rollLengthFt;
  const wallSqFt = coverWidthFt * heightFt;
  return {
    wallSqFt: round(wallSqFt, 1),
    dropIn: round(drop, 2),
    stripsPerRoll,
    strips,
    rolls,
    rollSqFt: round(rollSqFt, 1),
    // Share of the paper bought that ends up on the wall.
    usedPct: round((wallSqFt / (rolls * rollSqFt)) * 100, 0),
  };
}
