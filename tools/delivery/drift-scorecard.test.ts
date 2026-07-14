import { strict as assert } from "node:assert";
import test from "node:test";
import { driftFindings } from "./lib/drift.js";
import { calculateScorecard } from "./lib/scorecard.js";
import type { ManifestRow } from "./lib/model.js";

const manifestRow: ManifestRow = {
  requirementId: "F-1",
  outcome: "A",
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "1",
  section: "§1",
  dependencies: [],
  disposition: "executable",
  release: "R0",
  issueId: null,
};

test("finds orphan requirements, orphan issues, and duplicate outcomes", () => {
  const findings = driftFindings(
    [manifestRow],
    [
      {
        id: "I-1",
        sourceId: "F-2",
        title: "Same",
        outcome: "Same",
      },
      {
        id: "I-2",
        sourceId: "F-3",
        title: "Same",
        outcome: "same",
      },
    ],
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set(["orphan_requirement", "orphan_issue", "duplicate_outcome"]),
  );
});

test("finds dependency and release drift", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "I-1",
        sourceId: "F-1",
        title: "A",
        outcome: "A",
        dependencies: [],
        release: "R1",
      },
    ],
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set(["dependency_drift", "release_drift"]),
  );
});

test("missing evidence scores zero for its criterion", () => {
  const score = calculateScorecard({
    planning: [true, true, false, false],
    releases: [true, false, false, false],
    ownership: [false, false, false, false],
    validation: [false, false, false, false],
    execution: [false, false, false, false],
  });
  assert.equal(score.total, 15);
  assert.equal(score.categories.planning, 10);
  assert.equal(score.tenOfTen, false);
});

test("rejects a scorecard with missing criteria", () => {
  assert.throws(
    () =>
      calculateScorecard({
        planning: [true],
        releases: [true, true, true, true],
        ownership: [true, true, true, true],
        validation: [true, true, true, true],
        execution: [true, true, true, true],
      }),
    /exactly four criteria/,
  );
});
