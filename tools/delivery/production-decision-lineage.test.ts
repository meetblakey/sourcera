import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createProductionDecisionAuthorityHandoff,
  readProductionDecisionAuthorityHandoff,
  type ProductionDecisionAuthorityPublicationEvidence,
} from "../../scripts/lib/production-decision-authority.js";
import { createLinearAuthorityPublisherReceipt } from "./lib/linear-authority-publisher.js";
import { verifyProductionDecisionLineage } from "./production-decision-lineage.js";

const workflowPath = ".github/workflows/production-release.yml";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function write(root: string, relativePath: string, value: string) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, value);
}

async function fixture() {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-production-lineage-"),
  );
  const workflow = "name: Production release\n# Native Linear authority required.\n";
  const decisions = [
    JSON.stringify({ id: "DEC-PROD-001", status: "active" }),
    JSON.stringify({ id: "DEC-PROD-002", status: "superseded" }),
    "",
  ].join("\n");
  const masterSpec = "# Master Spec\n\nProduction remains fail-closed.\n";
  await write(
    root,
    "delivery/decisions.jsonl",
    decisions,
  );
  await write(root, "Sourcera_Master_Spec.md", masterSpec);
  await write(root, workflowPath, workflow);
  await write(
    root,
    "config/production-release.json",
    `${JSON.stringify(
      {
        github: {
          authorityWorkflowLineage: [
            {
              authorityKind: "normal",
              path: workflowPath,
              workflowSha256: sha256(workflow),
            },
          ],
          workflow: workflowPath,
        },
        productionControl: {
          mode: "blocked",
          sourceProvenance: {
            decisionId: "DEC-PROD-001",
            decisionLedgerSha256: sha256(decisions),
            masterSpecSha256: sha256(masterSpec),
          },
        },
        schemaVersion: 2,
      },
      null,
      2,
    )}\n`,
  );
  await write(
    root,
    "package.json",
    `${JSON.stringify({ scripts: { "release:production:no-authority": "safe" } })}\n`,
  );
  return root;
}

test("the checked-in production control references only its active decision", () => {
  const report = verifyProductionDecisionLineage(process.cwd());
  assert.equal(report.activeDecision, "DEC-PROD-001");
  assert.deepEqual(report.nativeDecisionAuthority, {
    status: "pending_guarded_handoff",
  });
  assert.deepEqual(report.workflowLineage.map(({ path: value }) => value), [
    workflowPath,
  ]);
  assert.ok(report.scannedFiles > 0);
});

test("historical decisions remain in the ledger but not operational surfaces", async () => {
  const root = await fixture();
  try {
    const report = verifyProductionDecisionLineage(root);
    assert.equal(report.activeDecision, "DEC-PROD-001");

    await write(
      root,
      "scripts/future-production.ts",
      'export const decision = "DEC-PROD-002";\n',
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /copies production Decision source provenance/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("workflow lineage is byte-exact", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      workflowPath,
      "name: Production release\n# DEC-PROD-001 drift\n",
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /workflow digest mismatch/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("production control cannot advertise a repo-authored handoff path", async () => {
  const root = await fixture();
  try {
    const configPath = path.join(root, "config/production-release.json");
    const config = JSON.parse(await readFile(configPath, "utf8"));
    config.productionControl.linearAuthorityHandoff = {
      path: "delivery/production-decision-authority.json",
      sha256: null,
    };
    await write(root, "config/production-release.json", `${JSON.stringify(config)}\n`);
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /fail-closed contract/i,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("retired baseline and bootstrap dispatches stay absent", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      ".github/workflows/production-bootstrap-recovery.yml",
      "name: retired\n",
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /retired production dispatch exists/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("package scripts cannot restore a retired production dispatch", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      "package.json",
      `${JSON.stringify({ scripts: { "vercel:baseline:stage": "unsafe" } })}\n`,
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /retired production package script/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("direct local provider mutation entrypoints remain retired", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      "scripts/deploy-convex-production.ts",
      "process.stdout.write('unsafe');\n",
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /retired production mutation entrypoint/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("direct local provider mutation package commands remain retired", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      "package.json",
      `${JSON.stringify({ scripts: { "convex:deploy:production": "unsafe" } })}\n`,
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /retired production mutation package script/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("top-level scripts cannot make dormant provider mutation libraries reachable", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      "scripts/renamed-production.ts",
      'import "./lib/convex-production-deployment";\n',
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /provider mutation library is reachable/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("volatile runbooks cannot copy a production Decision source identity", async () => {
  const root = await fixture();
  try {
    await write(
      root,
      "docs/runbooks/production.md",
      "Follow DEC-PROD-001.\n",
    );
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /copies production Decision source provenance/,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

const authorityIds = {
  assignee: "55555555-5555-4555-8555-555555555555",
  decision: "88888888-8888-4888-8888-888888888888",
  decisionLabel: "77777777-7777-4777-8777-777777777777",
  labelGroup: "66666666-6666-4666-8666-666666666666",
  project: "44444444-4444-4444-8444-444444444444",
  relation: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  risk: "99999999-9999-4999-8999-999999999999",
  state: "33333333-3333-4333-8333-333333333333",
  team: "22222222-2222-4222-8222-222222222222",
  workspace: "11111111-1111-4111-8111-111111111111",
} as const;

const decisionPlanKey = "decision:DEC-PROD-001";
const relationPlanKey =
  "relation:related:decision:DEC-PROD-001:risk:RISK-010";
const decisionTitle = "Production staging and promotion remain fail-closed";
const decisionRow = {
  id: "DEC-PROD-001",
  status: "active",
  decision: "Keep production promotion closed until every prerequisite is proved.",
  assumption: "The current provider state lacks a proved rollback anchor.",
  validationTrigger: "Re-evaluate after stable provider and rollback evidence exists.",
};
const decisionBody = [
  "## Decision",
  "",
  decisionRow.decision,
  "",
  "## Assumption",
  "",
  decisionRow.assumption,
  "",
  "## Re-evaluate",
  "",
  decisionRow.validationTrigger,
].join("\n");

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(",")}}`;
}

function productionAuthorityEvidence(options: {
  captureAssigneeId?: string | null;
  captureBody?: string;
  captureIssueUuid?: string;
  captureProjectId?: string | null;
  captureRelationKey?: string;
  captureStateId?: string;
  captureTeamId?: string;
  captureTitle?: string;
  finalPlanRoot?: string;
  publisherDecisionUuid?: string;
  publisherReceiptAllocationRowsRoot?: string;
  publisherReceiptCaptureReceiptSha256?: string;
  publisherReceiptCompilerInputRoot?: string;
  publisherEvent?: string;
  publisherReceiptProgramRoot?: string;
} = {}): ProductionDecisionAuthorityPublicationEvidence {
  const sourceCommit = "abcdef0123456789abcdef0123456789abcdef01";
  const masterSpecRaw = "# Master Spec\n\nProduction remains fail-closed.\n";
  const decisionLedgerRaw = `${JSON.stringify(decisionRow)}\n`;
  const captureBody = options.captureBody ?? decisionBody;
  const captureIssueUuid = options.captureIssueUuid ?? authorityIds.decision;
  const captureTitle = options.captureTitle ?? decisionTitle;
  const captureTeamId = options.captureTeamId ?? authorityIds.team;
  const captureProjectId = options.captureProjectId === undefined
    ? authorityIds.project
    : options.captureProjectId;
  const captureStateId = options.captureStateId ?? authorityIds.state;
  const captureAssigneeId = options.captureAssigneeId === undefined
    ? authorityIds.assignee
    : options.captureAssigneeId;
  const canonicalRelationKey = options.captureRelationKey ?? "related:REQ-900:REQ-901";
  const fingerprintRaw = JSON.stringify({
    issues: [],
    projects: [],
    projectMilestones: [],
    cycles: [],
    releasePipelines: [],
    releases: [],
    program: { schemaVersion: 3, authorityRoot: "program-authority" },
  });
  const descriptionsRaw = JSON.stringify({
    schemaVersion: 1,
    issues: [
      {
        id: "REQ-901",
        title: captureTitle,
        description: captureBody,
        updatedAt: "2026-07-29T11:00:00.000Z",
        labels: ["decision"],
      },
    ],
  });
  const documentsRaw = JSON.stringify({ schemaVersion: 1, documents: [] });
  const nativeRaw = JSON.stringify({
    schemaVersion: 1,
    workspace: {
      id: authorityIds.workspace,
      name: "Sourcera",
      urlKey: "sourcera",
      archivedAt: null,
    },
    issues: [
      {
        issueUuid: captureIssueUuid,
        identifier: "REQ-901",
        title: captureTitle,
        archivedAt: null,
        descriptionSha256: sha256(captureBody),
        teamId: captureTeamId,
        stateId: captureStateId,
        projectId: captureProjectId,
        estimate: null,
        priority: 1,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: null,
        assigneeId: captureAssigneeId,
        labelIds: [authorityIds.decisionLabel],
        relationIds: [authorityIds.relation],
      },
      {
        issueUuid: authorityIds.risk,
        identifier: "REQ-900",
        title: "Risk: unproved production rollback path",
        archivedAt: null,
        descriptionSha256: sha256("risk"),
        teamId: authorityIds.team,
        stateId: authorityIds.state,
        projectId: authorityIds.project,
        estimate: null,
        priority: 1,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: null,
        assigneeId: authorityIds.assignee,
        labelIds: [],
        relationIds: [authorityIds.relation],
      },
    ],
    labels: [
      {
        id: authorityIds.decisionLabel,
        name: "decision",
        color: "#0044aa",
        description: null,
        archivedAt: null,
        retiredAt: null,
        inheritedFromId: null,
        isGroup: false,
        parentId: authorityIds.labelGroup,
        parentName: "Type",
        teamId: null,
        teamKey: null,
      },
      {
        id: authorityIds.labelGroup,
        name: "Type",
        color: "#000000",
        description: null,
        archivedAt: null,
        retiredAt: null,
        inheritedFromId: null,
        isGroup: true,
        parentId: null,
        parentName: null,
        teamId: null,
        teamKey: null,
      },
    ],
    relations: [
      {
        relationId: authorityIds.relation,
        canonicalKey: canonicalRelationKey,
        type: "related",
        archivedAt: null,
        issueId: authorityIds.risk,
        issueIdentifier: "REQ-900",
        relatedIssueId: captureIssueUuid,
        relatedIssueIdentifier: "REQ-901",
      },
    ],
    teams: [
      {
        id: authorityIds.team,
        key: "REQ",
        name: "Requirements",
        archivedAt: null,
      },
    ],
    workflowStates: [
      {
        id: authorityIds.state,
        name: "Approved",
        type: "completed",
        color: "#00aa00",
        position: 1,
        archivedAt: null,
        teamId: authorityIds.team,
        teamKey: "REQ",
      },
    ],
    users: [
      {
        id: authorityIds.assignee,
        name: "Blake Rowley",
        displayName: "Blake Rowley",
        active: true,
        app: false,
        guest: false,
        archivedAt: null,
      },
    ],
    initiatives: [],
    projects: [
      {
        id: authorityIds.project,
        name: "QA, Release, Deployment & Launch",
        contentSha256: sha256("project"),
        updatedAt: "2026-07-29T11:00:00.000Z",
        archivedAt: null,
        statusId: authorityIds.state,
        status: "Approved",
        statusType: "completed",
        priority: 1,
        leadId: authorityIds.assignee,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
        teamIds: [authorityIds.team],
        initiativeIds: [],
      },
    ],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [],
  });
  const capturedIssue = (JSON.parse(nativeRaw) as { issues: Array<Record<string, unknown>> }).issues[0]!;
  const capturedNativeSha256 = sha256(JSON.stringify({
    teamId: capturedIssue.teamId,
    stateId: capturedIssue.stateId,
    projectId: capturedIssue.projectId,
    estimate: capturedIssue.estimate,
    priority: capturedIssue.priority,
    dueDate: capturedIssue.dueDate,
    cycleId: capturedIssue.cycleId,
    milestoneId: capturedIssue.milestoneId,
    releaseIds: capturedIssue.releaseIds,
    parentIssueUuid: capturedIssue.parentIssueUuid,
    assigneeId: capturedIssue.assigneeId,
    labelIds: capturedIssue.labelIds,
  }));
  const captureReceipt = {
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: "2026-07-29T11:00:00.000Z",
    fingerprintSha256: sha256(fingerprintRaw),
    acceptedFingerprintSha256: sha256(fingerprintRaw),
    artifactSha256s: {
      fingerprint: sha256(fingerprintRaw),
      nativeIdentity: sha256(nativeRaw),
      documents: sha256(documentsRaw),
      issueDescriptions: sha256(descriptionsRaw),
    },
    source: {
      repository: "meetblakey/sourcera",
      commit: sourceCommit,
      ref: "refs/heads/main",
      runId: "12345",
      runAttempt: "1",
    },
  };
  const captureReceiptRaw = JSON.stringify(captureReceipt);
  const finalPlanRoot = "1".repeat(64);
  const allocation = {
    schemaVersion: 1,
    planRoot: finalPlanRoot,
    sourceSetRoot: "2".repeat(64),
    liveCaptureRoot: "3".repeat(64),
    allocations: [
      {
        planKey: decisionPlanKey,
        kind: "decision",
        title: decisionTitle,
        identifier: "REQ-901",
        uuid: authorityIds.decision,
        source: "adopted",
      },
      {
        planKey: "risk:RISK-010",
        kind: "risk",
        title: "Risk: unproved production rollback path",
        identifier: "REQ-900",
        uuid: authorityIds.risk,
        source: "adopted",
      },
      {
        planKey: relationPlanKey,
        kind: "relation",
        title: null,
        identifier: null,
        uuid: authorityIds.relation,
        source: "adopted",
      },
    ],
  };
  const allocationRaw = JSON.stringify(allocation);
  const manifest = {
    schemaVersion: 2,
    sourceCommit,
    workspace: { id: authorityIds.workspace, name: "Sourcera", urlKey: "sourcera" },
    planRoot: finalPlanRoot,
    sourceSetRoot: allocation.sourceSetRoot,
    compilerInputRoot: "4".repeat(64),
    liveCaptureRoot: allocation.liveCaptureRoot,
    semanticRoot: "5".repeat(64),
    sources: [
      { path: "Sourcera_Master_Spec.md", rawSha256: sha256(masterSpecRaw) },
      { path: "delivery/decisions.jsonl", rawSha256: sha256(decisionLedgerRaw) },
    ],
    inputs: [
      { name: "linear-fingerprint", byteLength: fingerprintRaw.length, sha256: sha256(fingerprintRaw) },
      { name: "native-identity", byteLength: nativeRaw.length, sha256: sha256(nativeRaw) },
      { name: "issue-descriptions", byteLength: descriptionsRaw.length, sha256: sha256(descriptionsRaw) },
      { name: "raw-documents", byteLength: documentsRaw.length, sha256: sha256(documentsRaw) },
      { name: "capture-receipt", byteLength: captureReceiptRaw.length, sha256: sha256(captureReceiptRaw) },
    ],
    decisions: [
      {
        kind: "decision",
        planKey: decisionPlanKey,
        title: decisionTitle,
        description: decisionBody,
        descriptionSha256: sha256(decisionBody),
        expectedCurrentIssueUuid: authorityIds.decision,
        expectedCurrentDescriptionSha256: sha256(decisionBody),
        expectedCurrentNativeSha256: capturedNativeSha256,
        expectedIdentifier: "REQ-901",
        teamPlanKey: "team:requirements",
        projectPlanKey: `project:${authorityIds.project}`,
        statePlanKey: `state:${authorityIds.state}`,
        labelPlanKeys: ["label:decision"],
        priority: 1,
        assigneePlanKey: `user:${authorityIds.assignee}`,
      },
    ],
    nativeRelations: [
      {
        planKey: relationPlanKey,
        type: "related",
        sourcePlanKey: "risk:RISK-010",
        targetPlanKey: decisionPlanKey,
      },
    ],
    nativeCatalog: {
      teams: [{ planKey: "team:requirements", id: authorityIds.team, key: "REQ", name: "Requirements" }],
      users: [{ planKey: `user:${authorityIds.assignee}`, id: authorityIds.assignee, name: "Blake Rowley", active: true }],
      projects: [{ planKey: `project:${authorityIds.project}`, id: authorityIds.project, name: "QA, Release, Deployment & Launch" }],
      states: [{ planKey: `state:${authorityIds.state}`, id: authorityIds.state, name: "Approved", type: "completed", teamPlanKey: "team:requirements" }],
      labels: [{ planKey: "label:decision", id: authorityIds.decisionLabel, semanticRole: "decision", name: "decision", teamPlanKey: null, parentId: authorityIds.labelGroup, parentName: "Type" }],
    },
  };
  const manifestRaw = JSON.stringify(manifest);
  const publisherPlanRoot = "f".repeat(64);
  const publisherAllocation = {
    ...allocation,
    planRoot: publisherPlanRoot,
    liveCaptureRoot: "7".repeat(64),
    allocations: allocation.allocations.map((row) =>
      row.planKey === decisionPlanKey
        ? {
            ...row,
            uuid: options.publisherDecisionUuid ?? row.uuid,
          }
        : row),
  };
  const publisherAllocationRaw = JSON.stringify(publisherAllocation);
  const publisherManifest = {
    ...manifest,
    planRoot: publisherPlanRoot,
    compilerInputRoot: "6".repeat(64),
    liveCaptureRoot: publisherAllocation.liveCaptureRoot,
  };
  const publisherManifestRaw = JSON.stringify(publisherManifest);
  const publisherOperationsRaw = JSON.stringify({
    schemaVersion: 1,
    operations: [
      { operationKey: "publish-decision" },
      { operationKey: "publish-risk" },
      { operationKey: "publish-relation" },
    ],
  });
  const publisherReceipt = {
    schemaVersion: 1,
    event: options.publisherEvent ?? "linear_authority_publisher_receipt",
    mode: "apply",
    status: "applied",
    sourceCommit,
    workspaceId: authorityIds.workspace,
    manifestSha256: sha256(publisherManifestRaw),
    allocationSha256: sha256(publisherAllocationRaw),
    allocationRowsRoot: options.publisherReceiptAllocationRowsRoot ??
      sha256(canonical([...publisherAllocation.allocations].sort((left, right) =>
        left.planKey.localeCompare(right.planKey)))),
    operationsSha256: sha256(publisherOperationsRaw),
    captureReceiptSha256: options.publisherReceiptCaptureReceiptSha256 ??
      sha256(captureReceiptRaw),
    planRoot: publisherPlanRoot,
    semanticRoot: manifest.semanticRoot,
    sourceSetRoot: manifest.sourceSetRoot,
    compilerInputRoot: options.publisherReceiptCompilerInputRoot ??
      "6".repeat(64),
    liveCaptureRoot: publisherManifest.liveCaptureRoot,
    programRoot: options.publisherReceiptProgramRoot ??
      sha256(canonical(JSON.parse(fingerprintRaw).program)),
    masterSpecRoot: sha256(masterSpecRaw),
    operationCount: 3,
    applied: 3,
    alreadyApplied: 0,
    httpAttempts: 7,
    journalSha256: "9".repeat(64),
  };
  const finalReadbackReceipt = {
    ...publisherReceipt,
    mode: "dry-run",
    status: "validated_dry_run",
    manifestSha256: sha256(manifestRaw),
    allocationSha256: sha256(allocationRaw),
    allocationRowsRoot: sha256(canonical([...allocation.allocations].sort((left, right) =>
      left.planKey.localeCompare(right.planKey)))),
    operationsSha256: "0".repeat(64),
    captureReceiptSha256: sha256(captureReceiptRaw),
    planRoot: options.finalPlanRoot ?? manifest.planRoot,
    compilerInputRoot: manifest.compilerInputRoot,
    liveCaptureRoot: manifest.liveCaptureRoot,
    programRoot: sha256(canonical(JSON.parse(fingerprintRaw).program)),
    operationCount: 0,
    applied: 0,
    httpAttempts: 0,
    journalSha256: sha256(""),
  };
  return {
    allocationRaw,
    decisionLedgerRaw,
    finalCaptureReceiptRaw: captureReceiptRaw,
    finalDocumentsRaw: documentsRaw,
    finalFingerprintRaw: fingerprintRaw,
    finalIssueDescriptionsRaw: descriptionsRaw,
    finalManifestRaw: manifestRaw,
    finalNativeIdentityRaw: nativeRaw,
    finalReadbackReceiptRaw: JSON.stringify(finalReadbackReceipt),
    masterSpecRaw,
    publisherAllocationRaw,
    publisherCaptureReceiptRaw: captureReceiptRaw,
    publisherDocumentsRaw: documentsRaw,
    publisherFingerprintRaw: fingerprintRaw,
    publisherIssueDescriptionsRaw: descriptionsRaw,
    publisherManifestRaw,
    publisherNativeIdentityRaw: nativeRaw,
    publisherOperationsRaw,
    publisherReceiptRaw: JSON.stringify(publisherReceipt),
  };
}

test("only final publisher readback can produce the production Decision handoff", () => {
  const evidence = productionAuthorityEvidence();
  const handoff = createProductionDecisionAuthorityHandoff(evidence);
  assert.equal(handoff.planKey, decisionPlanKey);
  assert.equal(handoff.sourceDecisionId, "DEC-PROD-001");
  assert.equal(handoff.decision.identifier, "REQ-901");
  assert.equal(handoff.decision.title, decisionTitle);
  assert.equal(handoff.decision.body, decisionBody);
  assert.equal(handoff.decision.team.name, "Requirements");
  assert.deepEqual(handoff.decision.state, {
    id: authorityIds.state,
    name: "Approved",
    type: "completed",
  });
  assert.equal(handoff.decision.project.name, "QA, Release, Deployment & Launch");
  assert.equal(handoff.decision.assignee.name, "Blake Rowley");
  assert.equal(handoff.decision.priority, 1);
  assert.match(handoff.roots.publicationProgram, /^[a-f0-9]{64}$/);
  assert.match(handoff.roots.finalProgram, /^[a-f0-9]{64}$/);
  assert.deepEqual(handoff.decision.relations.map((row) => row.planKey), [relationPlanKey]);
  assert.deepEqual(
    readProductionDecisionAuthorityHandoff(JSON.stringify(handoff), evidence),
    handoff,
  );
});

test("the unified publisher emits the receipt consumed by final-readback handoff", () => {
  const evidence = productionAuthorityEvidence();
  const manifest = JSON.parse(evidence.finalManifestRaw);
  const expected = JSON.parse(evidence.finalReadbackReceiptRaw);
  const receipt = createLinearAuthorityPublisherReceipt({
    allocationRaw: evidence.allocationRaw,
    fingerprintRaw: evidence.finalFingerprintRaw,
    journalSha256: sha256(""),
    manifestRaw: evidence.finalManifestRaw,
    pins: {
      manifestSha256: sha256(evidence.finalManifestRaw),
      semanticPlanSha256: "f".repeat(64),
      liveCaptureSha256: manifest.inputs.find((row: { name: string }) => row.name === "native-identity").sha256,
      captureReceiptSha256: sha256(evidence.finalCaptureReceiptRaw),
      allocationSha256: sha256(evidence.allocationRaw),
      operationsSha256: "0".repeat(64),
    },
    result: {
      mode: "dry-run",
      status: "validated_dry_run",
      planRoot: manifest.planRoot,
      semanticRoot: manifest.semanticRoot,
      liveCaptureRoot: manifest.liveCaptureRoot,
      operationCount: 0,
      applied: 0,
      alreadyApplied: 0,
      httpAttempts: 0,
      results: [],
      appendedJournalRaw: "",
    },
  });
  assert.deepEqual(receipt, expected);
});

test("production Decision handoff rejects drift in every native and receipt binding", () => {
  const cases: Array<{
    name: string;
    evidence: ProductionDecisionAuthorityPublicationEvidence;
    error: RegExp;
  }> = [
    {
      name: "wrong issue",
      evidence: productionAuthorityEvidence({
        captureIssueUuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
      error: /final issue|issue UUID|allocation/i,
    },
    {
      name: "wrong state",
      evidence: productionAuthorityEvidence({
        captureStateId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
      error: /state/i,
    },
    {
      name: "wrong team",
      evidence: productionAuthorityEvidence({
        captureTeamId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
      error: /team/i,
    },
    {
      name: "wrong project",
      evidence: productionAuthorityEvidence({ captureProjectId: null }),
      error: /project/i,
    },
    {
      name: "wrong title",
      evidence: productionAuthorityEvidence({ captureTitle: "Production is open" }),
      error: /title/i,
    },
    {
      name: "wrong body",
      evidence: productionAuthorityEvidence({ captureBody: "unsafe" }),
      error: /body|description/i,
    },
    {
      name: "wrong relation",
      evidence: productionAuthorityEvidence({ captureRelationKey: "related:REQ-899:REQ-901" }),
      error: /relation/i,
    },
    {
      name: "wrong root",
      evidence: productionAuthorityEvidence({ finalPlanRoot: "b".repeat(64) }),
      error: /root/i,
    },
    {
      name: "wrong publisher receipt",
      evidence: productionAuthorityEvidence({ publisherEvent: "repo_authored_handoff" }),
      error: /publisher receipt/i,
    },
    {
      name: "wrong publisher allocation issue",
      evidence: productionAuthorityEvidence({
        publisherDecisionUuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
      error: /publisher.*allocation/i,
    },
    {
      name: "wrong publisher allocation receipt root",
      evidence: productionAuthorityEvidence({
        publisherReceiptAllocationRowsRoot: "b".repeat(64),
      }),
      error: /publisher receipt roots/i,
    },
    {
      name: "wrong publisher capture receipt",
      evidence: productionAuthorityEvidence({
        publisherReceiptCaptureReceiptSha256: "b".repeat(64),
      }),
      error: /publisher receipt roots/i,
    },
    {
      name: "wrong publisher compiler root",
      evidence: productionAuthorityEvidence({
        publisherReceiptCompilerInputRoot: "b".repeat(64),
      }),
      error: /publisher receipt roots/i,
    },
    {
      name: "wrong publisher program root",
      evidence: productionAuthorityEvidence({
        publisherReceiptProgramRoot: "b".repeat(64),
      }),
      error: /program root/i,
    },
  ];
  for (const item of cases) {
    assert.throws(
      () => createProductionDecisionAuthorityHandoff(item.evidence),
      item.error,
      item.name,
    );
  }
});

test("a repo-authored handoff cannot become verified authority", async () => {
  const root = await fixture();
  try {
    const evidence = productionAuthorityEvidence();
    const handoffRaw = `${JSON.stringify(createProductionDecisionAuthorityHandoff(evidence))}\n`;
    await write(root, "delivery/production-decision-authority.json", handoffRaw);
    assert.throws(
      () => verifyProductionDecisionLineage(root),
      /repo-authored|unreviewed/i,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
