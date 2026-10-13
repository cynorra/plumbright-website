import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/**
 * Waste allowances for plank and tile-look flooring (laminate, vinyl plank,
 * engineered wood). Planning rules of thumb, not standards. Rooms with many
 * corners, closets or doorways need the "complex room" bump.
 */
export const FLOORING_LAYOUTS = {
  straight: { label: "Straight", wastePct: 10 },
  diagonal: { label: "Diagonal", wastePct: 15 },
  herringbone: { label: "Herringbone", wastePct: 20 },
};
export const COMPLEX_ROOM_EXTRA = 5;

export function flooringWaste(layout = "straight", complexRoom = false) {
  const base = FLOORING_LAYOUTS[layout]?.wastePct;
  if (base === undefined) throw new RangeError("Choose a layout.");
  return base + (complexRoom ? COMPLEX_ROOM_EXTRA : 0);
}

/**
 * Boxes of flooring for an area. Boxes are sold whole, and the sq ft per box
 * is printed on the label (laminate and vinyl plank are usually 15 to 30).
 * pricePerSqFt is optional and applies to what you actually buy (whole boxes).
 */
export function flooringEstimate({ areaSqFt, sqFtPerBox, wastePct = 10, pricePerSqFt, underlaymentRollSqFt }) {
  requirePositive(areaSqFt, "area");
  requirePositive(sqFtPerBox, "sq ft per box");
  requireNonNegative(wastePct, "waste percentage");
  const withWaste = areaSqFt * (1 + wastePct / 100);
  const boxes = ceilSafe(withWaste / sqFtPerBox);
  const boughtSqFt = boxes * sqFtPerBox;
  const cost = Number.isFinite(pricePerSqFt) && pricePerSqFt > 0 ? boughtSqFt * pricePerSqFt : null;
  // Underlayment covers the floor once; seams butt rather than overlap on
  // most foam and felt rolls, so no waste allowance beyond rounding up.
  const rolls =
    Number.isFinite(underlaymentRollSqFt) && underlaymentRollSqFt > 0 ? ceilSafe(areaSqFt / underlaymentRollSqFt) : null;
  return {
    areaSqFt: round(areaSqFt, 2),
    withWasteSqFt: round(withWaste, 2),
    boxes,
    boughtSqFt: round(boughtSqFt, 2),
    spareSqFt: round(boughtSqFt - areaSqFt, 2),
    cost: cost === null ? null : round(cost, 2),
    underlaymentRolls: rolls,
  };
}

/**
 * Row-by-row model of a straight plank layout in a plain rectangular room,
 * to show where waste comes from. Rules most makers print on the box:
 * - end joints in neighboring rows are at least staggerIn apart;
 * - no piece shorter than minPieceIn.
 * Each row starts with a usable offcut when one keeps the stagger, otherwise
 * with a new plank cut a third shorter than the last row's start. Offcuts at
 * least minPieceIn long go back on the pile; shorter ones are scrap. The last
 * row is ripped to width, and its offcut is scrap. Real rooms (doorways,
 * closets, out-of-square walls, bad boards) waste more than this.
 * Plank sizes in inches, room in feet.
 */
export function plankLayoutWaste({ roomLengthFt, roomWidthFt, plankLengthIn, plankWidthIn, minPieceIn = 8, staggerIn = 8 }) {
  requirePositive(roomLengthFt, "room length");
  requirePositive(roomWidthFt, "room width");
  requirePositive(plankLengthIn, "plank length");
  requirePositive(plankWidthIn, "plank width");
  requireNonNegative(minPieceIn, "minimum piece length");
  requireNonNegative(staggerIn, "joint stagger");
  const L = roomLengthFt * 12;
  const W = roomWidthFt * 12;
  const P = plankLengthIn;
  const rows = ceilSafe(W / plankWidthIn);
  const pile = []; // usable offcuts
  let planks = 0;
  let prevStart = null;
  const staggered = (start) => {
    if (prevStart === null) return true;
    const d = Math.abs(start - prevStart) % P;
    return Math.min(d, P - d) >= staggerIn - 1e-9;
  };
  for (let r = 0; r < rows; r++) {
    // Choose the first piece of the row.
    let start;
    const i = pile.findIndex((o) => staggered(o));
    if (i >= 0) {
      start = pile[i];
      pile.splice(i, 1);
    } else {
      planks += 1;
      start = P;
      for (let tries = 0; tries < 3 && !staggered(start); tries++) {
        start = (prevStart ?? P) - P / 3;
        if (start < minPieceIn) start += P;
        if (start > P) start -= P;
      }
      const rest = P - start;
      if (rest >= minPieceIn) pile.push(rest);
    }
    prevStart = start;
    // Fill the rest of the row.
    let filled = Math.min(start, L);
    if (start > L && start - L >= minPieceIn) pile.push(start - L);
    while (filled < L - 1e-9) {
      planks += 1;
      const need = L - filled;
      if (need >= P) {
        filled += P;
      } else {
        filled = L;
        if (P - need >= minPieceIn) pile.push(P - need);
      }
    }
  }
  const boughtSqIn = planks * P * plankWidthIn;
  const roomSqIn = L * W;
  return {
    rows,
    planks,
    wastePct: round(((boughtSqIn - roomSqIn) / roomSqIn) * 100, 1),
  };
}
