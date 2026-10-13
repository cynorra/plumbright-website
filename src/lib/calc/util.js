// Shared helpers for all calculators. Pure functions only: no DOM access here,
// so the same code runs in the browser, at build time (tables) and in tests.

const EPS = 1e-9;

/** Round up, ignoring floating-point noise (10.0000000001 -> 10, not 11). */
export function ceilSafe(x) {
  return Math.ceil(x - EPS);
}

/** Round to a fixed number of decimals and return a number. */
export function round(x, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round((x + Number.EPSILON) * f) / f;
}

/** Parse a user-typed value; returns NaN for empty or invalid input. */
export function num(value) {
  if (value === null || value === undefined) return NaN;
  const s = String(value).trim().replace(/,/g, "");
  if (s === "") return NaN;
  return Number(s);
}

/** Format a number for display with US separators. */
export function fmt(x, decimals = 2) {
  if (!Number.isFinite(x)) return "–";
  return x.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Throw a readable error when an input is missing or out of range. */
export function requirePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`Enter a ${label} greater than zero.`);
  }
}

export function requireNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`Enter a ${label} of zero or more.`);
  }
}
