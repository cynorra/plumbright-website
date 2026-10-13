import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/** Standard US interior door and an average window, in square feet. */
export const DOOR_SQFT = 21; // 3 ft x 7 ft
export const WINDOW_SQFT = 15; // 3 ft x 5 ft

/**
 * Typical spread rate for one coat of interior latex on smooth, primed
 * drywall. Labels usually quote 250 to 400 sq ft per gallon; textured,
 * porous or unprimed surfaces land at the low end.
 */
export const DEFAULT_COVERAGE = 350;

/** Paintable wall and ceiling area for a rectangular room. */
export function roomArea({
  lengthFt,
  widthFt,
  heightFt,
  doors = 0,
  windows = 0,
  doorSqFt = DOOR_SQFT,
  windowSqFt = WINDOW_SQFT,
  includeCeiling = false,
}) {
  requirePositive(lengthFt, "room length");
  requirePositive(widthFt, "room width");
  requirePositive(heightFt, "wall height");
  requireNonNegative(doors, "number of doors");
  requireNonNegative(windows, "number of windows");

  const grossWalls = 2 * (lengthFt + widthFt) * heightFt;
  const openings = doors * doorSqFt + windows * windowSqFt;
  if (openings >= grossWalls) {
    throw new RangeError("Doors and windows cover more than the walls. Check the counts.");
  }
  const walls = grossWalls - openings;
  const ceiling = includeCeiling ? lengthFt * widthFt : 0;
  return { grossWalls, openings, walls, ceiling, total: walls + ceiling };
}

/**
 * Split a gallon amount into what a store sells: whole gallons plus quarts.
 * Three or more quarts left over cost about as much as a gallon, so they
 * round up to another gallon.
 */
export function purchasePlan(gallons) {
  if (gallons <= 0) return { gallons: 0, quarts: 0 };
  let whole = Math.floor(gallons + 1e-9);
  let quarts = Math.max(0, ceilSafe((gallons - whole) * 4));
  if (quarts >= 4 || quarts === 3) {
    whole += 1;
    quarts = 0;
  }
  return { gallons: whole, quarts };
}

/** Paint needed for an area, a number of coats and a spread rate. */
export function paintEstimate({ areaSqFt, coats = 2, coverageSqFtPerGal = DEFAULT_COVERAGE, primer = false, primerCoverage = 300 }) {
  requirePositive(areaSqFt, "area");
  requirePositive(coats, "number of coats");
  requirePositive(coverageSqFtPerGal, "coverage");
  const paintGallons = (areaSqFt * coats) / coverageSqFtPerGal;
  const primerGallons = primer ? areaSqFt / primerCoverage : 0;
  return {
    areaSqFt: round(areaSqFt, 1),
    paintGallons: round(paintGallons, 2),
    paintToBuy: purchasePlan(paintGallons),
    primerGallons: round(primerGallons, 2),
    primerToBuy: purchasePlan(primerGallons),
  };
}
