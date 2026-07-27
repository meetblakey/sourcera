import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { LinearFingerprint } from "./lib/linear-live.js";
import type { LinearProgramScope } from "./lib/linear-program-scope.js";
import {
  assertLinearSourcePolicy,
  assertLinearSourcePolicyContracts,
  deriveLinearPlanningIssues,
  parseLinearRuntimeInventory,
  type LinearSourcePolicy,
  type SourceDerivedSnapshotIssue,
} from "./lib/linear-source-policy.js";
import {
  applyLinearDispositions,
  parseLinearDispositions,
} from "./lib/linear-dispositions.js";
import {
  resolveSourceRequirementChecksum,
  type SourceChecksumContract,
} from "./lib/source-checksums.js";
import type { SourceRequirement } from "./lib/model.js";

const policy: LinearSourcePolicy = {
  schemaVersion: 1,
  coordinationIssueIds: [],
  sourceAmbiguities: [],
  sourceDispositions: [],
  splits: [],
};

test("rejects a coordination issue in an executable source split", () => {
  assert.throws(
    () =>
      assertLinearSourcePolicy({
        ...policy,
        coordinationIssueIds: ["PLA-1"],
        splits: [{
          sourceId: "F-001",
          primaryIssueId: "PLA-1",
          executableIssueIds: ["PLA-2"],
          rationale:
            "The executable source is intentionally split across two delivery slices.",
        }],
      }),
    /coordination issue PLA-1 cannot own executable source split F-001/,
  );
});

test("rejects source ambiguity exceptions", () => {
  assert.throws(
    () =>
      assertLinearSourcePolicy({
        ...policy,
        sourceAmbiguities: [{
          issueId: "PLA-1",
          sourceId: "F-001",
          sourceDocument: "source.md",
          section: "§1.1",
          rationale:
            "Every live executable issue must now carry its exact canonical requirement identity.",
        }],
      }),
    /ambiguity exceptions are not permitted/,
  );
});

test("requires policy dispositions and splits to match canonical sources", () => {
  const executable: SourceRequirement = {
    requirementId: "F-001",
    outcome: "First",
    sourceDoc: "source.md",
    sourceVersion: "test",
    section: "§1.1",
    dependencies: [],
    disposition: "executable",
  };
  const superseded: SourceRequirement = {
    ...executable,
    requirementId: "F-002",
    disposition: "superseded",
    replacementId: "F-001",
  };
  const reviewed: LinearSourcePolicy = {
    ...policy,
    sourceDispositions: [{
      sourceId: "F-002",
      disposition: "superseded",
      replacementSourceId: "F-001",
      supersededIssueIds: ["PLA-2"],
      rationale: "The first canonical source fully replaces this retired source contract.",
    }],
    splits: [{
      sourceId: "F-001",
      primaryIssueId: "PLA-1",
      executableIssueIds: ["PLA-3"],
      rationale: "The executable source is intentionally split across two delivery slices.",
    }],
  };
  assert.doesNotThrow(() =>
    assertLinearSourcePolicyContracts(reviewed, [executable, superseded])
  );
  assert.throws(
    () => assertLinearSourcePolicyContracts(reviewed, [superseded]),
    /differs from the canonical disposition|invalid replacement chain/,
  );
  assert.throws(
    () =>
      assertLinearSourcePolicyContracts(
        { ...reviewed, splits: [{ ...reviewed.splits[0], sourceId: "F-002" }] },
        [executable, superseded],
      ),
    /not a canonical executable source/,
  );
  assert.throws(
    () =>
      assertLinearSourcePolicyContracts(
        {
          ...reviewed,
          sourceDispositions: [{
            ...reviewed.sourceDispositions[0],
            replacementSourceId: "F-002",
          }],
        },
        [executable, superseded],
      ),
    /replacement differs from the canonical disposition|invalid replacement chain/,
  );
  const alternate = { ...executable, requirementId: "F-003" };
  assert.throws(
    () =>
      assertLinearSourcePolicyContracts(
        {
          ...reviewed,
          sourceDispositions: [{
            ...reviewed.sourceDispositions[0],
            replacementSourceId: "F-003",
          }],
        },
        [executable, superseded, alternate],
      ),
    /replacement differs from the canonical disposition/,
  );
});

test("rejects one retired issue assigned to multiple source dispositions", () => {
  assert.throws(
    () =>
      assertLinearSourcePolicy({
        ...policy,
        sourceDispositions: [
          {
            sourceId: "F-001",
            disposition: "cleared",
            replacementSourceId: null,
            supersededIssueIds: ["PLA-9"],
            rationale: "This source is planning context with no active execution owner.",
          },
          {
            sourceId: "F-002",
            disposition: "cleared",
            replacementSourceId: null,
            supersededIssueIds: ["PLA-9"],
            rationale: "This second source cannot reuse the same retired Linear issue.",
          },
        ],
      }),
    /retired issue PLA-9 is assigned to F-001 and F-002/,
  );
});

function liveIssue(
  source: SourceRequirement,
  checksum: string,
  overrides: Partial<LinearFingerprint["issues"][number]> = {},
): LinearFingerprint["issues"][number] {
  return {
    linearId: "10000000-0000-4000-8000-000000000001",
    identifier: "PLA-1",
    title: source.outcome,
    descriptionFingerprint: "0".repeat(64),
    sourceProvenance: {
      sourceId: source.requirementId,
      sourceDocument: source.sourceDoc,
      sourceDocuments: [source.sourceDoc],
      section: source.section,
      sectionBundleCount: null,
      sourceBinding: null,
      sourceChecksum: checksum,
    },
    updatedAt: "2026-07-23T00:00:00.000Z",
    estimate: 1,
    priority: 2,
    dueDate: null,
    archivedAt: null,
    stateId: "state-backlog",
    state: "Backlog",
    stateType: "backlog",
    labels: [],
    assignee: null,
    assigneeId: null,
    team: "PLA",
    teamId: "20000000-0000-4000-8000-000000000001",
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: "30000000-0000-4000-8000-000000000001",
    project: "Project",
    milestoneId: "40000000-0000-4000-8000-000000000001",
    milestone: "Milestone",
    parentLinearId: null,
    parent: null,
    releases: ["R0"],
    relations: [],
    ...overrides,
  };
}

function planned(id = "PLA-1"): SourceDerivedSnapshotIssue {
  return {
    id,
    sourceId: null,
    sourceFamilyId: null,
    dependencies: ["F-999"],
  };
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "linear-source-policy-"));
  writeFileSync(
    join(root, "source.md"),
    "## 1.1 First\nrequired\n## 2.1 Second\nother\n## 3.1 End\n",
  );
  const source: SourceRequirement = {
    requirementId: "F-001",
    outcome: "First",
    sourceDoc: "source.md",
    sourceVersion: "test",
    section: "§1.1",
    dependencies: [],
    disposition: "executable",
  };
  const contract: SourceChecksumContract = { schemaVersion: 3, sources: [] };
  const checksum = resolveSourceRequirementChecksum(
    source,
    contract,
    root,
  ).sha256;
  return { root, source, contract, checksum };
}

test("explicit sourceId validates the exact document and section binding", () => {
  const value = fixture();
  try {
    const registered: SourceChecksumContract = {
      schemaVersion: 3,
      sources: [{
        sourceId: "F-001",
        sourceDoc: "source.md",
        startHeading: "## 1.1 First",
        endHeading: "## 2.1 Second",
        sha256: value.checksum,
      }],
    };
    const live = liveIssue(value.source, value.checksum);
    const derived = deriveLinearPlanningIssues(
        [planned()],
        [live],
        new Set([live.projectId!]),
        policy,
        [value.source],
        value.root,
        registered,
    );
    assert.equal(derived[0].sourceId, "F-001");
    assert.equal(derived[0].sourceFamilyId, "F-001");
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [{
            ...live,
            sourceProvenance: {
              ...live.sourceProvenance!,
              sourceId: null,
            },
          }],
          new Set([live.projectId!]),
          policy,
          [value.source],
          value.root,
          registered,
        ),
      /lacks exact source provenance/,
    );
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [{
            ...live,
            sourceProvenance: {
              ...live.sourceProvenance!,
              section: "§2.1",
            },
          }],
          new Set([live.projectId!]),
          policy,
          [value.source],
          value.root,
          registered,
        ),
      /registered exact source slice/,
    );
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [{
            ...live,
            sourceProvenance: {
              ...live.sourceProvenance!,
              sourceDocument: "other.md",
              sourceDocuments: ["other.md"],
            },
          }],
          new Set([live.projectId!]),
          policy,
          [value.source],
          value.root,
          registered,
        ),
      /outside|ENOENT|source/i,
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("preserves proof-only ownership and requires every non-disposed owner", () => {
  const value = fixture();
  try {
    const proof = {
      ...value.source,
      requirementId: "RG:test_gate",
      disposition: "proof_only" as const,
    };
    const live = liveIssue(proof, value.checksum);
    assert.equal(
      deriveLinearPlanningIssues(
        [planned()],
        [live],
        new Set([live.projectId!]),
        policy,
        [proof],
        value.root,
        value.contract,
      )[0].kind,
      "proof_only",
    );
    const missing = {
      ...value.source,
      requirementId: "F-002",
      section: "§2.1",
    };
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [liveIssue(value.source, value.checksum)],
          new Set([live.projectId!]),
          policy,
          [value.source, missing],
          value.root,
          value.contract,
        ),
      /F-002 has no active Linear owner/,
    );
    assert.doesNotThrow(() =>
      deriveLinearPlanningIssues(
        [planned()],
        [liveIssue(value.source, value.checksum)],
        new Set([live.projectId!]),
        policy,
        [value.source, { ...missing, disposition: "narrative_context" }],
        value.root,
        value.contract,
      )
    );
    assert.doesNotThrow(() =>
      deriveLinearPlanningIssues(
        [planned()],
        [liveIssue(value.source, value.checksum)],
        new Set([live.projectId!]),
        policy,
        [value.source, { ...missing, disposition: "proof_only" }],
        value.root,
        value.contract,
      )
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("runtime gate ownership comes from the stamp contract and fails when its owner is inactive", () => {
  const value = fixture();
  try {
    const proof: SourceRequirement = {
      ...value.source,
      requirementId: "RG:test_gate",
      disposition: "proof_only",
    };
    const activeOwner = liveIssue(proof, value.checksum);
    for (const [name, live] of [
      ["missing", []],
      [
        "canceled",
        [liveIssue(proof, value.checksum, {
          state: "Canceled",
          stateType: "canceled",
        })],
      ],
      [
        "archived",
        [liveIssue(proof, value.checksum, {
          archivedAt: "2026-07-23T01:00:00.000Z",
        })],
      ],
    ] as const) {
      assert.throws(
        () =>
          deriveLinearPlanningIssues(
            [planned()],
            live,
            new Set([activeOwner.projectId!]),
            policy,
            [proof],
            value.root,
            value.contract,
          ),
        /RG:test_gate has no active Linear owner/,
        name,
      );
    }
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [activeOwner],
          new Set([activeOwner.projectId!]),
          policy,
          [],
          value.root,
          value.contract,
        ),
      /source provenance resolves 0 requirements/,
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("requires an exact stamp and runtime dependency inventory", () => {
  const stampJson = JSON.stringify({
    findings: [{
      id: "test_gate",
      file: "source.md",
      line: 1,
      severity: "blocker",
    }],
  });
  const contract = {
    dependencies: [{
      requirementId: "RG:test_gate",
      dependencies: ["F-001"],
      rationale: "The source feature owns this exact runtime proof gate.",
    }],
  };
  assert.deepEqual(
    parseLinearRuntimeInventory(stampJson, JSON.stringify(contract)),
    [{
      requirementId: "RG:test_gate",
      outcome: "Prove runtime gate test_gate",
      sourceDoc: "source.md",
      sourceVersion: "live",
      section: "line:1",
      dependencies: ["F-001"],
      disposition: "proof_only",
    }],
  );
  assert.throws(
    () =>
      parseLinearRuntimeInventory(
        stampJson,
        JSON.stringify({
          dependencies: [{
            ...contract.dependencies[0],
            requirementId: "RG:other_gate",
          }],
        }),
      ),
    /inventory differs from stamp.*missing RG:test_gate.*unexpected RG:other_gate/,
  );
});

test("clears stale dependencies for source-less coordination issues", () => {
  const value = fixture();
  try {
    const coordination = liveIssue(value.source, value.checksum, {
      sourceProvenance: undefined,
    });
    const child = liveIssue(value.source, value.checksum, {
      linearId: "10000000-0000-4000-8000-000000000002",
      identifier: "PLA-2",
      parent: coordination.identifier,
    });
    assert.deepEqual(
      deriveLinearPlanningIssues(
        [planned(), planned("PLA-2")],
        [coordination, child],
        new Set([coordination.projectId!]),
        { ...policy, coordinationIssueIds: [coordination.identifier] },
        [value.source],
        value.root,
        value.contract,
      )[0].dependencies,
      [],
    );
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned()],
          [coordination],
          new Set([coordination.projectId!]),
          { ...policy, coordinationIssueIds: [coordination.identifier] },
          [],
          value.root,
          value.contract,
        ),
      /has no active native child/,
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("removes inactive baseline issues from the active planning candidate", () => {
  const value = fixture();
  try {
    const live = liveIssue(value.source, value.checksum);
    const canceled = liveIssue(value.source, value.checksum, {
      linearId: "10000000-0000-4000-8000-000000000002",
      identifier: "PLA-2",
      state: "Canceled",
      stateType: "canceled",
      sourceProvenance: undefined,
    });
    const archived = liveIssue(value.source, value.checksum, {
      linearId: "10000000-0000-4000-8000-000000000003",
      identifier: "PLA-3",
      archivedAt: "2026-07-23T01:00:00.000Z",
      sourceProvenance: undefined,
    });
    const derived = deriveLinearPlanningIssues(
      [planned(), planned("PLA-2"), planned("PLA-3")],
      [live, canceled, archived],
      new Set([live.projectId!]),
      policy,
      [value.source],
      value.root,
      value.contract,
    );
    assert.deepEqual(derived.map((issue) => issue.id), ["PLA-1"]);
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("exempts only schema-pinned planning Decision issues from source provenance", () => {
  const value = fixture();
  try {
    const owner = liveIssue(value.source, value.checksum);
    const decision = liveIssue(value.source, value.checksum, {
      linearId: "10000000-0000-4000-8000-000000000002",
      identifier: "PLA-2",
      title: "Approve target",
      labels: ["decision"],
      releases: [],
      sourceProvenance: undefined,
    });
    const programScope = {
      schemaVersion: 3,
      projectDocumentDecisionContract: {
        trackedDecisions: [{
          decisionIdentifier: "PLA-2",
          decisionTitle: "Approve target",
          decisionProjectId: decision.projectId,
          resolution: "open",
        }],
      },
    } as unknown as LinearProgramScope;
    const derived = deriveLinearPlanningIssues(
      [planned(), planned("PLA-2")],
      [owner, decision],
      new Set([owner.projectId!]),
      policy,
      [value.source],
      value.root,
      value.contract,
      programScope,
    );
    assert.deepEqual(
      derived.map(({ id, kind, sourceId, sourceFamilyId }) => ({
        id,
        kind,
        sourceId,
        sourceFamilyId,
      })),
      [
        {
          id: "PLA-1",
          kind: "executable",
          sourceId: "F-001",
          sourceFamilyId: "F-001",
        },
        {
          id: "PLA-2",
          kind: "decision",
          sourceId: null,
          sourceFamilyId: null,
        },
      ],
    );
    assert.throws(
      () =>
        deriveLinearPlanningIssues(
          [planned(), planned("PLA-2")],
          [owner, decision],
          new Set([owner.projectId!]),
          policy,
          [value.source],
          value.root,
          value.contract,
          {
            ...programScope,
            projectDocumentDecisionContract: {
              trackedDecisions: [{
                decisionIdentifier: "PLA-3",
                decisionTitle: "Other Decision",
                decisionProjectId: decision.projectId,
                resolution: "open",
              }],
            },
          } as unknown as LinearProgramScope,
        ),
      /PLA-2 lacks exact source provenance/,
    );
    for (const trackedDecision of [
      {
        decisionIdentifier: "PLA-2",
        decisionTitle: "Renamed Decision",
        decisionProjectId: decision.projectId,
        resolution: "open",
      },
      {
        decisionIdentifier: "PLA-2",
        decisionTitle: "Approve target",
        decisionProjectId: "99999999-9999-4999-8999-999999999999",
        resolution: "open",
      },
      {
        decisionIdentifier: "PLA-2",
        decisionTitle: "Approve target",
        decisionProjectId: decision.projectId,
        resolution: "completed",
      },
    ]) {
      assert.throws(
        () =>
          deriveLinearPlanningIssues(
            [planned(), planned("PLA-2")],
            [owner, decision],
            new Set([owner.projectId!]),
            policy,
            [value.source],
            value.root,
            value.contract,
            {
              ...programScope,
              projectDocumentDecisionContract: {
                trackedDecisions: [trackedDecision],
              },
            } as unknown as LinearProgramScope,
          ),
        /differs from its tracked identity or lifecycle/,
      );
    }
    const completedDecision = {
      ...decision,
      state: "Completed",
      stateType: "completed",
    };
    assert.doesNotThrow(() =>
      deriveLinearPlanningIssues(
        [planned(), planned("PLA-2")],
        [owner, completedDecision],
        new Set([owner.projectId!]),
        policy,
        [value.source],
        value.root,
        value.contract,
        {
          ...programScope,
          projectDocumentDecisionContract: {
            trackedDecisions: [{
              decisionIdentifier: "PLA-2",
              decisionTitle: "Approve target",
              decisionProjectId: decision.projectId,
              resolution: "completed",
            }],
          },
        } as unknown as LinearProgramScope,
      )
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("assigns one explicit source family to every reviewed split issue", () => {
  const value = fixture();
  try {
    const primary = liveIssue(value.source, value.checksum);
    const secondary = liveIssue(value.source, value.checksum, {
      linearId: "10000000-0000-4000-8000-000000000002",
      identifier: "PLA-2",
    });
    const derived = deriveLinearPlanningIssues(
      [planned(), planned("PLA-2")],
      [primary, secondary],
      new Set([primary.projectId!]),
      {
        ...policy,
        splits: [{
          sourceId: "F-001",
          primaryIssueId: "PLA-1",
          executableIssueIds: ["PLA-2"],
          rationale:
            "The canonical source is intentionally split into two executable delivery slices.",
        }],
      },
      [value.source],
      value.root,
      value.contract,
    );
    assert.deepEqual(
      derived.map(({ id, sourceId, sourceFamilyId }) => ({
        id,
        sourceId,
        sourceFamilyId,
      })),
      [
        { id: "PLA-1", sourceId: "F-001", sourceFamilyId: "F-001" },
        { id: "PLA-2", sourceId: null, sourceFamilyId: "F-001" },
      ],
    );
  } finally {
    rmSync(value.root, { recursive: true, force: true });
  }
});

test("applies the receipt-bound canonical dispositions before ownership", () => {
  const requirements: SourceRequirement[] = [{
    requirementId: "F-001",
    outcome: "First",
    sourceDoc: "source.md",
    sourceVersion: "test",
    section: "§1.1",
    dependencies: [],
    disposition: "executable",
  }];
  const document = parseLinearDispositions(
    {
      overrides: [{
        requirementId: "F-001",
        disposition: "retired_source",
        replacementId: "F-002",
        rationale: "The canonical successor owns this retired behavior.",
      }],
    },
    requirements,
  );
  assert.equal(
    applyLinearDispositions(requirements, document)[0].disposition,
    "retired_source",
  );
});
