import { round, requirePositive } from "./util.js";

export const SQFT_PER_SQYD = 9;
export const SQM_PER_SQFT = 0.09290304; // exact: 0.3048 m squared
export const SQFT_PER_ACRE = 43560;

/**
 * Shapes the square footage calculator supports. All sizes in feet.
 * - rectangle: a = length, b = width
 * - triangle: a = base, b = height (measured square to the base)
 * - circle: a = diameter
 * - trapezoid: a and b = the two parallel sides, c = the distance between them
 */
export const SHAPES = {
  rectangle: { label: "Rectangle", a: "Length", b: "Width", c: null },
  triangle: { label: "Triangle", a: "Base", b: "Height", c: null },
  circle: { label: "Circle", a: "Diameter", b: null, c: null },
  trapezoid: { label: "Trapezoid", a: "Side 1", b: "Side 2", c: "Height" },
};

/** Area in square feet of one shape. */
export function shapeArea(shape, a, b, c) {
  if (!SHAPES[shape]) throw new RangeError("Choose a shape.");
  requirePositive(a, SHAPES[shape].a.toLowerCase());
  switch (shape) {
    case "rectangle":
      requirePositive(b, "width");
      return a * b;
    case "triangle":
      requirePositive(b, "height");
      return (a * b) / 2;
    case "circle":
      return Math.PI * (a / 2) ** 2;
    case "trapezoid":
      requirePositive(b, "second side");
      requirePositive(c, "height");
      return ((a + b) / 2) * c;
  }
}

/** Feet and inches to decimal feet: 12 ft 6 in -> 12.5. */
export function feetInches(feet = 0, inches = 0) {
  return (Number.isFinite(feet) ? feet : 0) + (Number.isFinite(inches) ? inches : 0) / 12;
}

/**
 * Add and subtract shapes. parts: [{ shape, a, b, c, subtract }].
 * A subtracted part is a cut-out (a kitchen island, a fireplace hearth).
 */
export function totalArea(parts) {
  if (!parts.length) throw new RangeError("Add at least one area.");
  let total = 0;
  const rows = parts.map((p) => {
    const sqft = shapeArea(p.shape, p.a, p.b, p.c);
    total += p.subtract ? -sqft : sqft;
    return { ...p, sqft: round(sqft, 2) };
  });
  if (total <= 0) throw new RangeError("The cut-outs are larger than the area. Check the subtracted parts.");
  return { rows, sqft: total };
}

/** Square feet in the other units people ask for. */
export function convertArea(sqft) {
  return {
    sqft: round(sqft, 2),
    sqyd: round(sqft / SQFT_PER_SQYD, 2),
    sqm: round(sqft * SQM_PER_SQFT, 2),
    acres: round(sqft / SQFT_PER_ACRE, 4),
  };
}

/** Board feet: thickness (in) x width (in) x length (ft) / 12, nominal sizes. */
export function boardFeet(thicknessIn, widthIn, lengthFt, pieces = 1) {
  requirePositive(thicknessIn, "thickness");
  requirePositive(widthIn, "width");
  requirePositive(lengthFt, "length");
  requirePositive(pieces, "number of pieces");
  return (thicknessIn * widthIn * lengthFt * pieces) / 12;
}

/**
 * Linear feet of boards (or planks) needed to cover an area, when each board
 * covers exposureIn inches of width (actual width plus any gap).
 */
export function linearFeetForArea(areaSqFt, exposureIn) {
  requirePositive(areaSqFt, "area");
  requirePositive(exposureIn, "board width");
  return areaSqFt / (exposureIn / 12);
}
