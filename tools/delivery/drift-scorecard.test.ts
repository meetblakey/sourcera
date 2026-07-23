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

const hasDependencyDrift = (
  findings: ReturnType<typeof driftFindings>,
): boolean => findings.some((finding) => finding.code === "dependency_drift");

test("attributes a unique-family coordination parent to its source family", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "PLA-CONTAINER",
        parentId: null,
        sourceId: null,
        title: "Prerequisite container",
        outcome: "Prerequisite container",
      },
      {
        id: "PLA-CHILD",
        parentId: "PLA-CONTAINER",
        sourceId: "F-0",
        title: "Prerequisite child",
        outcome: "Prerequisite child",
        release: "R0",
      },
      {
        id: "PLA-DEPENDENT",
        parentId: null,
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
        release: "R0",
      },
    ],
    {
      issues: [
        {
          identifier: "PLA-CONTAINER",
          relations: ["blocks:PLA-CONTAINER:PLA-DEPENDENT"],
        },
        { identifier: "PLA-CHILD", relations: [] },
        {
          identifier: "PLA-DEPENDENT",
          relations: ["blocks:PLA-CONTAINER:PLA-DEPENDENT"],
        },
      ],
    },
  );
  assert.equal(hasDependencyDrift(findings), false);
});

test("does not attribute a multi-family coordination parent", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "PLA-CONTAINER",
        parentId: null,
        sourceId: null,
        title: "Mixed container",
        outcome: "Mixed container",
      },
      {
        id: "PLA-FIRST",
        parentId: "PLA-CONTAINER",
        sourceId: "F-0",
        title: "First family",
        outcome: "First family",
      },
      {
        id: "PLA-SECOND",
        parentId: "PLA-CONTAINER",
        sourceId: "F-2",
        title: "Second family",
        outcome: "Second family",
      },
      {
        id: "PLA-DEPENDENT",
        parentId: null,
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
      },
    ],
    {
      issues: [
        {
          identifier: "PLA-CONTAINER",
          relations: ["blocks:PLA-CONTAINER:PLA-DEPENDENT"],
        },
        { identifier: "PLA-FIRST", relations: [] },
        { identifier: "PLA-SECOND", relations: [] },
        {
          identifier: "PLA-DEPENDENT",
          relations: ["blocks:PLA-CONTAINER:PLA-DEPENDENT"],
        },
      ],
    },
  );
  assert.equal(hasDependencyDrift(findings), true);
});

test("accepts a transitive native dependency path", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "PLA-ROOT",
        sourceId: "F-0",
        title: "Prerequisite",
        outcome: "Prerequisite",
      },
      {
        id: "PLA-MIDDLE",
        sourceId: null,
        title: "Intermediate",
        outcome: "Intermediate",
      },
      {
        id: "PLA-DEPENDENT",
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
      },
    ],
    {
      issues: [
        {
          identifier: "PLA-ROOT",
          relations: ["blocks:PLA-ROOT:PLA-MIDDLE"],
        },
        {
          identifier: "PLA-MIDDLE",
          relations: [
            "blocks:PLA-ROOT:PLA-MIDDLE",
            "blocks:PLA-MIDDLE:PLA-DEPENDENT",
          ],
        },
        {
          identifier: "PLA-DEPENDENT",
          relations: [
            "blocks:PLA-MIDDLE:PLA-DEPENDENT",
          ],
        },
      ],
    },
  );
  assert.equal(hasDependencyDrift(findings), false);
});

test("allows an extra native execution dependency", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "PLA-REQUIRED",
        sourceId: "F-0",
        title: "Required prerequisite",
        outcome: "Required prerequisite",
      },
      {
        id: "PLA-EXTRA",
        sourceId: "F-9",
        title: "Extra prerequisite",
        outcome: "Extra prerequisite",
      },
      {
        id: "PLA-DEPENDENT",
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
      },
    ],
    {
      issues: [
        {
          identifier: "PLA-REQUIRED",
          relations: ["blocks:PLA-REQUIRED:PLA-DEPENDENT"],
        },
        {
          identifier: "PLA-EXTRA",
          relations: ["blocks:PLA-EXTRA:PLA-DEPENDENT"],
        },
        {
          identifier: "PLA-DEPENDENT",
          relations: [
            "blocks:PLA-REQUIRED:PLA-DEPENDENT",
            "blocks:PLA-EXTRA:PLA-DEPENDENT",
          ],
        },
      ],
    },
  );
  assert.equal(hasDependencyDrift(findings), false);
});

test("accepts a dependency after disposition replacement normalization", () => {
  const findings = driftFindings(
    [
      {
        ...manifestRow,
        // The caller has resolved retired F-OLD to its canonical replacement.
        dependencies: ["F-REPLACEMENT"],
      },
    ],
    [
      {
        id: "PLA-OLD",
        sourceId: "F-OLD",
        title: "Retired prerequisite",
        outcome: "Retired prerequisite",
      },
      {
        id: "PLA-REPLACEMENT",
        sourceId: "F-REPLACEMENT",
        title: "Replacement prerequisite",
        outcome: "Replacement prerequisite",
      },
      {
        id: "PLA-DEPENDENT",
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
      },
    ],
    {
      issues: [
        { identifier: "PLA-OLD", relations: [] },
        {
          identifier: "PLA-REPLACEMENT",
          relations: ["blocks:PLA-REPLACEMENT:PLA-DEPENDENT"],
        },
        {
          identifier: "PLA-DEPENDENT",
          relations: ["blocks:PLA-REPLACEMENT:PLA-DEPENDENT"],
        },
      ],
    },
  );
  assert.equal(hasDependencyDrift(findings), false);
});

test("rejects a missing required native dependency path", () => {
  const findings = driftFindings(
    [{ ...manifestRow, dependencies: ["F-0"] }],
    [
      {
        id: "PLA-ROOT",
        sourceId: "F-0",
        title: "Prerequisite",
        outcome: "Prerequisite",
      },
      {
        id: "PLA-DEPENDENT",
        sourceId: "F-1",
        title: "Dependent",
        outcome: "Dependent",
      },
    ],
    {
      issues: [
        { identifier: "PLA-ROOT", relations: [] },
        { identifier: "PLA-DEPENDENT", relations: [] },
      ],
    },
  );
  const drift = findings.find((finding) => finding.code === "dependency_drift");
  assert.ok(drift);
  assert.match(drift.message, /F-0/);
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
