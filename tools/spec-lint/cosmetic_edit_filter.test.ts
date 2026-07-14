import assert from "node:assert/strict";
import test from "node:test";
import { filterCosmeticEdits } from "./cosmetic_edit_filter.js";

test("drops prose-only changes and keeps structural table changes", () => {
  const pre = "# A {#a}\nText.\n| Field | Type |\n| :---- | :---- |\n| id | UUID |\n";
  const prose = "# A {#a}\nRewritten text.\n| Field | Type |\n| :---- | :---- |\n| id | UUID |\n";
  assert.deepEqual(filterCosmeticEdits(pre, prose, []), []);
  const structural = prose.replace("| id | UUID |", "| id | UUID |\n| state | String |");
  assert.equal(filterCosmeticEdits(pre, structural, []).length, 1);
});
