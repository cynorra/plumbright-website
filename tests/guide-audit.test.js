import { test } from "node:test";
import assert from "node:assert/strict";
import { draftingProblems, truncationProblems, descriptionLength, linkProblems, arithmeticProblems } from "../scripts/lib/guide-audit-extra.mjs";

test("drafting notes are caught", () => {
  assert.equal(draftingProblems("The width is 5.\n*Self-correction:* it was wrong.").length, 1);
  assert.equal(draftingProblems("Let's simplify for ordering.").length, 1);
  assert.deepEqual(draftingProblems("A clean sentence about concrete."), []);
});

test("half sentences and cut-off descriptions are caught", () => {
  assert.equal(truncationProblems({ description: "A full sentence." }, "Text and.\n\nEnd.").length, 1);
  assert.equal(truncationProblems({ description: "Cut off and," }, "Done.").length, 1);
  assert.equal(truncationProblems({ description: "Fine." }, "Ends here without a full stop").length, 1);
  assert.deepEqual(truncationProblems({ description: "Fine." }, "A whole paragraph."), []);
});

test("description length 120 to 155", () => {
  assert.equal(descriptionLength({ description: "x".repeat(119) }).length, 1);
  assert.equal(descriptionLength({ description: "x".repeat(156) }).length, 1);
  assert.equal(descriptionLength({ description: "x".repeat(140) }).length, 0);
});

test("a guide needs a calculator link and sources", () => {
  assert.equal(linkProblems("No links.").length, 2);
  assert.equal(linkProblems("[calc](/paint-calculator/)\n\n## Sources\n\n- [m](/methodology/), Material Guides. Formulas.").length, 0);
});

test("arithmetic statements are checked, chains and conversions are not", () => {
  assert.equal(arithmeticProblems("N = 72 / 5 = 14.4").length, 0);
  assert.equal(arithmeticProblems("N = 72 / 5 = 15.4").length, 1);
  assert.equal(arithmeticProblems("12 ft × 15.5 ft = 20.67 sq yd").length, 0);
  assert.equal(arithmeticProblems("7/12 = 1.1577").length, 0);
  assert.equal(arithmeticProblems("40 ÷ 6 = 6 11/16 in").length, 0);
  assert.equal(arithmeticProblems("10 × 10 × 4 = 400").length, 0);
});
