import { ceilSafe, round, requirePositive, requireNonNegative } from "./util.js";

/** Standard lumber and composite board lengths, in feet. */
export const BOARD_LENGTHS = [8, 10, 12, 16, 20];

/**
 * Maximum joist spacing for deck boards, inches on center, from IRC 2021
 * Table R507.7 (multiple-span values: boards running over three or more
 * joists). Composite and PVC boards: follow the maker's span rating, which is
 * often 16 in straight and 12 in diagonal.
 */
export const DECKING_SPANS = [
  { decking: "5/4 wood (1 1/4 in)", perpendicular: 16, diagonal: 12 },
  { decking: "2x wood (2 in)", perpendicular: 24, diagonal: 24 },
];

/**
 * Joist spans for southern pine, 40 psf live load (IRC 2021 Table R507.6),
 * as printed in a county deck guide based on it. Feet-inches strings.
 */
export const SOUTHERN_PINE_JOIST_SPANS = [
  { size: "2x6", at12: "9'-11\"", at16: "9'-0\"", at24: "7'-7\"" },
  { size: "2x8", at12: "13'-1\"", at16: "11'-10\"", at24: "9'-8\"" },
  { size: "2x10", at12: "16'-2\"", at16: "14'-0\"", at24: "11'-5\"" },
  { size: "2x12", at12: "18'-0\"", at16: "16'-6\"", at24: "13'-6\"" },
];

/**
 * Deck boards, joists and screws for a rectangular deck.
 * - lengthFt: the direction the boards run.
 * - widthFt: across the boards (the joists run this way).
 * - boardWidthIn: actual face width (a "6 in" board is 5.5 in).
 * - gapIn: space between boards.
 * Boards are planned row by row: each row is the deck length, made from
 * as few boards of boardLengthFt as possible. Offcuts at least 2 ft long are
 * reused in later rows (joints must land on a joist, so short scraps are waste).
 */
export function deckEstimate({
  lengthFt,
  widthFt,
  boardWidthIn = 5.5,
  gapIn = 0.1875,
  boardLengthFt = 16,
  joistSpacingIn = 16,
  wastePct = 5,
  screwsPerCrossing = 2,
}) {
  requirePositive(lengthFt, "deck length");
  requirePositive(widthFt, "deck width");
  requirePositive(boardWidthIn, "board width");
  requireNonNegative(gapIn, "gap");
  requirePositive(boardLengthFt, "board length");
  requirePositive(joistSpacingIn, "joist spacing");
  requireNonNegative(wastePct, "waste percentage");

  const rows = ceilSafe((widthFt * 12 + gapIn) / (boardWidthIn + gapIn));
  const linearFt = rows * lengthFt;

  // Rows of boards from whole boards, reusing long offcuts.
  let boards = 0;
  const offcuts = [];
  for (let r = 0; r < rows; r++) {
    let need = lengthFt;
    while (need > 1e-9) {
      const i = offcuts.findIndex((o) => o >= Math.min(need, boardLengthFt) - 1e-9);
      if (i >= 0 && need <= boardLengthFt) {
        const left = offcuts[i] - need;
        offcuts.splice(i, 1);
        if (left >= 2) offcuts.push(left);
        need = 0;
      } else {
        boards += 1;
        const use = Math.min(need, boardLengthFt);
        need -= use;
        const left = boardLengthFt - use;
        if (left >= 2) offcuts.push(left);
      }
    }
  }
  const boardsWithWaste = ceilSafe(boards * (1 + wastePct / 100));

  const joists = Math.floor((lengthFt * 12) / joistSpacingIn + 1e-9) + 1;
  const crossings = rows * joists;
  return {
    areaSqFt: round(lengthFt * widthFt, 2),
    rows,
    linearFt: round(linearFt, 1),
    boardsBeforeWaste: boards,
    boards: boardsWithWaste,
    joists,
    screws: crossings * screwsPerCrossing,
  };
}
