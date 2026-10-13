import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/** Common sheet sizes, width x length in feet. */
export const SHEETS = {
  "4x8": { w: 4, l: 8 },
  "4x10": { w: 4, l: 10 },
  "4x12": { w: 4, l: 12 },
};

export const DOOR_SQFT = 21; // 3 x 7 ft
export const WINDOW_SQFT = 15; // 3 x 5 ft

/**
 * Finishing materials per 1,000 sq ft of board, as planning figures.
 * - Joint compound: USG says to expect about two 4.5-gallon pails of
 *   premixed all-purpose compound to finish 1,000 sq ft.
 * - Paper tape: about 370 ft per 1,000 sq ft is the common estimating figure.
 */
export const MUD_GAL_PER_1000 = 9;
export const PAIL_GAL = 4.5;
export const TAPE_FT_PER_1000 = 370;
export const TAPE_ROLL_FT = 500;

/**
 * Maximum screw spacing for single-layer, non-rated work (ASTM C840 / GA-216
 * as summarized by the Gypsum Association): 12 in on ceilings, 16 in on walls
 * framed 16 in on center (12 in on walls framed 24 in on center).
 */
export function screwSpacingIn(surface, framingIn) {
  if (surface === "ceiling") return 12;
  return framingIn >= 24 ? 12 : 16;
}

/**
 * Screws for one sheet hung perpendicular to the framing (the usual way):
 * the sheet crosses floor(length / framing) + 1 framing members, and each
 * member gets a row of screws across the sheet's 4 ft width.
 */
export function screwsPerSheet(sheet, surface = "wall", framingIn = 16) {
  const s = SHEETS[sheet];
  if (!s) throw new RangeError("Choose a sheet size.");
  const members = Math.floor((s.l * 12) / framingIn + 1e-9) + 1;
  const perMember = Math.floor((s.w * 12) / screwSpacingIn(surface, framingIn) + 1e-9) + 1;
  return members * perMember;
}

/** Wall and ceiling area of a rectangular room, minus openings. */
export function drywallArea({ lengthFt, widthFt, heightFt, doors = 0, windows = 0, includeCeiling = true }) {
  requirePositive(lengthFt, "room length");
  requirePositive(widthFt, "room width");
  requirePositive(heightFt, "wall height");
  requireNonNegative(doors, "number of doors");
  requireNonNegative(windows, "number of windows");
  const gross = 2 * (lengthFt + widthFt) * heightFt;
  const openings = doors * DOOR_SQFT + windows * WINDOW_SQFT;
  if (openings >= gross) throw new RangeError("Doors and windows cover more than the walls. Check the counts.");
  const walls = gross - openings;
  const ceiling = includeCeiling ? lengthFt * widthFt : 0;
  return { walls, ceiling, total: walls + ceiling };
}

/**
 * Sheets, screws, mud and tape. Wall and ceiling sheets are counted
 * separately because they take different screw spacing, and because a
 * ceiling usually gets its own sheets.
 */
export function drywallEstimate({ wallSqFt, ceilingSqFt = 0, sheet = "4x8", wastePct = 10, framingIn = 16 }) {
  requireNonNegative(wallSqFt, "wall area");
  requireNonNegative(ceilingSqFt, "ceiling area");
  requireNonNegative(wastePct, "waste percentage");
  if (wallSqFt + ceilingSqFt <= 0) throw new RangeError("Enter an area greater than zero.");
  const s = SHEETS[sheet];
  if (!s) throw new RangeError("Choose a sheet size.");
  const sheetSqFt = s.w * s.l;
  const k = 1 + wastePct / 100;
  const wallSheets = wallSqFt > 0 ? ceilSafe((wallSqFt * k) / sheetSqFt) : 0;
  const ceilingSheets = ceilingSqFt > 0 ? ceilSafe((ceilingSqFt * k) / sheetSqFt) : 0;
  const sheets = wallSheets + ceilingSheets;
  const boardSqFt = sheets * sheetSqFt;
  const screws = wallSheets * screwsPerSheet(sheet, "wall", framingIn) + ceilingSheets * screwsPerSheet(sheet, "ceiling", framingIn);
  const mudGal = (boardSqFt / 1000) * MUD_GAL_PER_1000;
  const tapeFt = (boardSqFt / 1000) * TAPE_FT_PER_1000;
  return {
    areaSqFt: round(wallSqFt + ceilingSqFt, 2),
    sheetSqFt,
    wallSheets,
    ceilingSheets,
    sheets,
    boardSqFt,
    screws,
    mudGal: round(mudGal, 1),
    mudPails: ceilSafe(mudGal / PAIL_GAL),
    tapeFt: Math.round(tapeFt),
    tapeRolls: ceilSafe(tapeFt / TAPE_ROLL_FT),
  };
}
