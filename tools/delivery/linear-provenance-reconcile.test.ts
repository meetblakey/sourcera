import assert from "node:assert/strict";
import test from "node:test";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import {
  linearSourceProvenance,
  type LinearCapture,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import {
  assertLinearProvenanceCandidate,
  assertLinearProvenanceCandidateFresh,
  assertLinearProvenanceReceipt,
  buildLinearProvenanceCandidate,
  buildLinearProvenanceReceipt,
  canonicalJson,
  classifyLinearProvenanceUpdateError,
  replaceSourceProvenanceChecksum,
  sameProvenanceChanges,
  sha256Text,
  type LinearProvenanceCandidate,
} from "./lib/linear-provenance-reconcile.js";
import type { LinearProjectScope } from "./lib/linear-project-scope.js";
import type { LinearSourcePolicy } from "./lib/linear-source-policy.js";
import type { ResolvedSourceChecksum } from "./lib/source-checksums.js";

const OLD_SHA = "a".repeat(64);
const SLICE_SHA = "b".repeat(64);
const CREATED_AT = "2026-07-23T00:00:00.000Z";
const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const CHECKSUM_CONTRACT_JSON = '{"schemaVersion":3,"sources":[]}\n';

const canonicalDocuments = {
  masterSpecSha256: "c".repeat(64),
  uxDesignSha256: "d".repeat(64),
};

const expected: ResolvedSourceChecksum = {
  sourceId: "F-001",
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceDocuments: ["Sourcera_Master_Spec.md"],
  section: "§1.1",
  sectionBundleCount: 1,
  sourceBindingSha256: "e".repeat(64),
  sha256: SLICE_SHA,
  selector: "feature_inventory_section",
  slices: [{
    sourceDoc: "Sourcera_Master_Spec.md",
    startHeading: "## 1.1 Sourcera Architecture",
    endHeading: "## 1.2 Core Value Proposition",
  }],
};

const scope: LinearProjectScope = {
  schemaVersion: 1,
  projects: [{ id: PROJECT_ID, name: "Core" }],
};

const policy: LinearSourcePolicy = {
  schemaVersion: 1,
  coordinationIssueIds: ["PLA-2"],
  sourceAmbiguities: [],
  sourceDispositions: [],
  splits: [],
};

function description(checksum = OLD_SHA): string {
  return [
    "# Delivery contract",
    "Preserve this exact body.",
    "",
    "## Source provenance",
    "- Canonical requirement: `F-001`",
    "- Source document: `Sourcera_Master_Spec.md`",
    "- Source section: §1.1",
    `- Canonical source checksum: sha256:${checksum}`,
    "",
    "## Acceptance criteria",
    "- [ ] Keep this exact criterion.",
  ].join("\n");
}

function fingerprintIssue(
  identifier: string,
  value: string,
  overrides: Partial<LinearFingerprint["issues"][number]> = {},
): LinearFingerprint["issues"][number] {
  return {
    linearId: `linear-${identifier}`,
    identifier,
    title: identifier,
    descriptionFingerprint: descriptionFingerprint(value),
    sourceProvenance: linearSourceProvenance(value),
    updatedAt: CREATED_AT,
    estimate: 1,
    priority: 2,
    archivedAt: null,
    state: "Todo",
    stateType: "unstarted",
    labels: ["Core"],
    assignee: null,
    assigneeId: null,
    team: "PLA",
    teamId: "team-1",
    projectId: PROJECT_ID,
    project: "Core",
    milestoneId: "milestone-1",
    milestone: "M1",
    parent: null,
    releases: ["R0"],
    relations: [],
    ...overrides,
  };
}

function capture(
  rows: Array<{
    identifier: string;
    description: string;
    overrides?: Partial<LinearFingerprint["issues"][number]>;
  }>,
): LinearCapture {
  const issues = rows.map((row) =>
    fingerprintIssue(row.identifier, row.description, row.overrides)
  );
  return {
    fingerprint: {
      issues,
      releasePipelines: [],
      releases: [],
      projects: [{
        id: PROJECT_ID,
        name: "Core",
        descriptionFingerprint: "0".repeat(64),
        updatedAt: CREATED_AT,
        archivedAt: null,
      }],
      projectMilestones: [],
    },
    issueDescriptions: rows.map((row, index) => ({
      id: row.identifier,
      title: row.identifier,
      description: row.description,
      updatedAt: issues[index].updatedAt,
      labels: issues[index].labels,
    })),
  };
}

function candidate(source: LinearCapture): LinearProvenanceCandidate {
  return buildLinearProvenanceCandidate(
    source,
    scope,
    policy,
    new Map([[expected.sourceId, expected]]),
    sha256Text(CHECKSUM_CONTRACT_JSON),
    canonicalDocuments,
    CREATED_AT,
  );
}

test("replaces only the issue source-slice checksum", () => {
  const before = description();
  const result = replaceSourceProvenanceChecksum("PLA-1", before, expected);
  assert.equal(result.beforeChecksum, OLD_SHA);
  assert.equal(result.afterChecksum, SLICE_SHA);
  assert.equal(result.description, before.replace(OLD_SHA, SLICE_SHA));
  assert.equal(result.description.replace(SLICE_SHA, OLD_SHA), before);
});

test("replaces a registered bundle checksum without confusing its binding digest", () => {
  const bundled: ResolvedSourceChecksum = {
    ...expected,
    sourceId: "F-139",
    sourceDocuments: [
      "Sourcera_Master_Spec.md",
      "UX_Design_of_Sourcera.md",
    ],
    section: "2 registered slices",
    sectionBundleCount: 2,
    sourceBindingSha256: "f".repeat(64),
    slices: [
      expected.slices[0],
      {
        sourceDoc: "UX_Design_of_Sourcera.md",
        startHeading: "## UX",
        endHeading: "## End",
      },
    ],
  };
  const value = [
    "# Delivery contract",
    "",
    "## Source provenance",
    "- Canonical requirement: `F-139`",
    "- Source documents: `Sourcera_Master_Spec.md`, `UX_Design_of_Sourcera.md`",
    "- Source section bundle: 2 registered slices",
    `- Canonical source binding: sha256:${bundled.sourceBindingSha256}`,
    `- Canonical source checksum: sha256:${OLD_SHA}`,
  ].join("\n");
  const result = replaceSourceProvenanceChecksum("PLA-1", value, bundled);
  assert.equal(result.afterChecksum, SLICE_SHA);
  assert.match(result.description, new RegExp(bundled.sourceBindingSha256));
  assert.equal(linearSourceProvenance(result.description).sourceChecksum, SLICE_SHA);
});

test("derives stale active scoped issues without a hardcoded issue list", () => {
  const result = candidate(capture([
    { identifier: "PLA-1", description: description() },
    { identifier: "PLA-2", description: description() },
    {
      identifier: "PLA-3",
      description: description(),
      overrides: { archivedAt: CREATED_AT },
    },
    {
      identifier: "PLA-4",
      description: description(),
      overrides: { stateType: "canceled", state: "Canceled" },
    },
    {
      identifier: "PLA-5",
      description: description(),
      overrides: { projectId: "outside-project", project: "Outside" },
    },
    { identifier: "PLA-6", description: description(SLICE_SHA) },
  ]));
  assert.deepEqual(result.changes.map((change) => change.issueId), ["PLA-1"]);
  assert.equal(result.changes[0].sourceId, "F-001");
  assert.equal(result.changes[0].beforeChecksum, OLD_SHA);
  assert.equal(result.changes[0].afterChecksum, SLICE_SHA);
  assert.deepEqual(result.changes[0].sourceSlices, expected.slices);
  assertLinearProvenanceCandidate(result);
});

test("fails closed on missing, ambiguous, or malformed provenance", () => {
  assert.throws(
    () =>
      buildLinearProvenanceCandidate(
        capture([{ identifier: "PLA-1", description: description() }]),
        scope,
        policy,
        new Map(),
        sha256Text(CHECKSUM_CONTRACT_JSON),
        canonicalDocuments,
        CREATED_AT,
      ),
    /lacks a deterministic slice/,
  );
  const twoChecksums = description().replace(
    "## Acceptance criteria",
    `- Previous checksum: ${"e".repeat(64)}\n\n## Acceptance criteria`,
  );
  assert.throws(
    () => candidate(capture([{ identifier: "PLA-1", description: twoChecksums }])),
    /one canonical Source provenance checksum/,
  );
  const unquoted = description().replace(
    "`Sourcera_Master_Spec.md`",
    "Sourcera_Master_Spec.md",
  );
  assert.throws(
    () => candidate(capture([{ identifier: "PLA-1", description: unquoted }])),
    /lacks exact source provenance/,
  );
});

test("binds candidate, scopes, policy, checksum registry, and full docs", () => {
  const value = candidate(
    capture([{ identifier: "PLA-1", description: description() }]),
  );
  const candidateJson = canonicalJson(value);
  const inputs = {
    candidateJson,
    projectScopeJson: canonicalJson(scope),
    programScopeJson: canonicalJson({ schemaVersion: 1 }),
    sourcePolicyJson: canonicalJson(policy),
    sourceChecksumContractJson: CHECKSUM_CONTRACT_JSON,
    candidate: value,
  };
  const receipt = buildLinearProvenanceReceipt(inputs);
  assertLinearProvenanceReceipt(receipt, inputs);
  assert.throws(
    () =>
      assertLinearProvenanceReceipt(
        { ...receipt, candidateSha256: "0".repeat(64) },
        inputs,
      ),
    /does not match/,
  );
});

test("enforces expiry while allowing unrelated capture fingerprint drift", () => {
  const value = candidate(
    capture([{ identifier: "PLA-1", description: description() }]),
  );
  assert.doesNotThrow(() =>
    assertLinearProvenanceCandidateFresh(
      value,
      Date.parse(CREATED_AT) + 60_000,
    )
  );
  assert.throws(
    () =>
      assertLinearProvenanceCandidateFresh(
        value,
        Date.parse(value.expiresAt) + 1,
      ),
    /stale/,
  );
  const otherCapture = {
    ...value,
    captureFingerprintSha256: "f".repeat(64),
  } satisfies LinearProvenanceCandidate;
  assert.equal(sameProvenanceChanges(value, otherCapture), true);
});

test("classifies commit-then-transport-fail before rollback", () => {
  const before = description();
  const replacement = replaceSourceProvenanceChecksum(
    "PLA-1",
    before,
    expected,
  ).description;
  const change = candidate(
    capture([{ identifier: "PLA-1", description: before }]),
  ).changes[0];
  const readback = (description: string) => ({
    id: change.linearId,
    identifier: change.issueId,
    description,
    archivedAt: null,
    state: { type: "backlog" },
    project: { id: change.projectId },
  });
  assert.equal(
    classifyLinearProvenanceUpdateError(
      change,
      readback(replacement),
      before,
      replacement,
    ),
    "committed",
  );
  assert.equal(
    classifyLinearProvenanceUpdateError(
      change,
      readback(before),
      before,
      replacement,
    ),
    "not_committed",
  );
  assert.equal(
    classifyLinearProvenanceUpdateError(
      change,
      readback(`${replacement}\nconcurrent edit`),
      before,
      replacement,
    ),
    "ambiguous",
  );
});
