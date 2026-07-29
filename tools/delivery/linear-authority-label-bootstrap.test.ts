import { strict as assert } from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  buildLinearAuthorityLabelBootstrapCandidate,
  canonicalLinearAuthorityLabelBootstrapCandidateJson,
} from "./lib/linear-authority-label-bootstrap.js";
import type { LinearNativeIdentityCapture } from "./lib/linear-live.js";
import {
  buildLinearAuthorityIssueLabelContract,
  type LinearProgramScopeV3,
} from "./lib/linear-program-scope.js";
import {
  EXPECTED_REQUIREMENT_ISSUE_COUNT,
  OLD_REQUIREMENT_LABEL_ID,
  REQUIREMENTS_TEAM_ID,
  RETIRED_REQUIREMENT_LABEL_NAME,
  buildLinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementCandidate,
} from "./lib/linear-requirement-label-replacement.js";

const NEW_REQUIREMENT_LABEL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(",")}}`;
}

function digest(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function issueId(index: number): string {
  return `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function fixture(): { native: LinearNativeIdentityCapture; program: LinearProgramScopeV3 } {
  const teamId = "ee9dd198-4816-4836-9226-42765878d793";
  const typeId = "b11e20d5-df7e-4e8b-a710-294827ff9b40";
  const agentId = "121eeb45-5276-441e-82b0-f85567f816db";
  const domainId = "2da596c3-1be9-494b-bf81-5ce1dd4d753b";
  const riskId = "44444444-4444-4444-8444-444444444444";
  const group = (id: string, name: string) => ({
    id, name, color: "#888888", description: null, archivedAt: null, retiredAt: null,
    inheritedFromId: null, isGroup: true, parentId: null, parentName: null,
    teamId: null, teamKey: null,
  });
  const label = (
    id: string,
    name: string,
    parentId: string | null,
    parentName: string | null,
    color: string,
    description: string | null,
    scoped = false,
  ) => ({
    id, name, color, description, archivedAt: null, retiredAt: null, inheritedFromId: null,
    isGroup: false, parentId, parentName,
    teamId: scoped ? teamId : null, teamKey: scoped ? "REQ" : null,
  });
  const issues = Array.from({ length: EXPECTED_REQUIREMENT_ISSUE_COUNT }, (_, offset) => {
    const number = offset + 1;
    return {
      issueUuid: issueId(number), identifier: `REQ-${number}`, title: `Requirement ${number}`,
      archivedAt: null, descriptionSha256: digest(`description-${number}`), teamId,
      stateId: "20000000-0000-4000-8000-000000000001", projectId: null, estimate: null,
      priority: 0, dueDate: null, cycleId: null, milestoneId: null, releaseIds: [],
      parentIssueUuid: null, assigneeId: null, labelIds: [NEW_REQUIREMENT_LABEL_ID], relationIds: [],
    };
  });
  const native = {
    schemaVersion: 1,
    workspace: { id: "55555555-5555-4555-8555-555555555555", name: "Sourcera", urlKey: "sourcera-production", archivedAt: null },
    issues,
    labels: [
      group(typeId, "Type"), group(agentId, "Agent"), group(domainId, "Domain"), group(riskId, "Risk"),
      { ...label(OLD_REQUIREMENT_LABEL_ID, RETIRED_REQUIREMENT_LABEL_NAME, null, null, "#5E6AD2", "Canonical binding product or engineering requirement."), retiredAt: "2026-07-29T00:00:00.000Z" },
      label(NEW_REQUIREMENT_LABEL_ID, "Requirement", null, null, "#5E6AD2", "Canonical binding product or engineering requirement.", true),
      label("df2bcb0f-2fca-41cb-a45c-37770a01aac2", "decision", typeId, "Type", "#7C3AED", "A product or delivery choice that must be resolved before dependent work can proceed."),
      label("b29617b2-d787-4feb-b351-386df3286e87", "human-only", agentId, "Agent", "#155E75", null),
      label("70aedffb-e40d-4688-b723-99a3d4002565", "platform", domainId, "Domain", "#1E3A8A", null),
      label("4dafcf74-e922-48aa-9dab-19f80516e2ee", "marketplace", domainId, "Domain", "#1E40AF", null),
      label("11111111-1111-4111-8111-111111111111", "risk", typeId, "Type", "#E5484D", "Canonical delivery risk."),
      label("22222222-2222-4222-8222-222222222222", "delivery-risk", riskId, "Risk", "#D97706", "Delivery, governance, readiness, or operational execution risk."),
      label("33333333-3333-4333-8333-333333333333", "financial-risk", riskId, "Risk", "#A16207", "Billing, metering, pricing, or financial integrity risk."),
      label("d90fa0c4-4743-47fd-b3a5-61a5d1627747", "security-risk", riskId, "Risk", "#B91C1C", "Security-sensitive implementation or proof work."),
      label("dc0cd580-50d1-4b03-bcbb-3cf23d43e331", "compliance-risk", riskId, "Risk", "#991B1B", "Compliance-sensitive implementation or proof work."),
    ],
    teams: [{ id: teamId, key: "REQ", name: "Requirements", archivedAt: null }],
    relations: [], workflowStates: [], users: [], initiatives: [], projects: [], releasePipelines: [],
    releases: [], projectMilestones: [], cycles: [], documents: [], rawDocumentIds: [],
    coverage: { complete: true },
  } as unknown as LinearNativeIdentityCapture;
  return {
    native,
    program: JSON.parse(readFileSync("delivery/linear-program-scope.json", "utf8")) as LinearProgramScopeV3,
  };
}

function migrationCandidate(native: LinearNativeIdentityCapture): LinearRequirementLabelReplacementCandidate {
  const before = structuredClone(native);
  before.labels = before.labels
    .filter((row) => row.id !== NEW_REQUIREMENT_LABEL_ID)
    .map((row) => row.id === OLD_REQUIREMENT_LABEL_ID ? {
      ...row,
      name: "Requirement",
      retiredAt: null,
      teamId: null,
      teamKey: null,
    } : row);
  before.issues = before.issues.map((issue) => ({ ...issue, labelIds: [OLD_REQUIREMENT_LABEL_ID] }));
  return buildLinearRequirementLabelReplacementCandidate({
    native: before,
    sourceCommit: "a".repeat(40),
    nativeIdentitySha256: "b".repeat(64),
    captureReceiptSha256: "c".repeat(64),
    newLabelId: NEW_REQUIREMENT_LABEL_ID,
  });
}

function migrationFinalizeReceipt(candidate: LinearRequirementLabelReplacementCandidate) {
  const phases = [
    ["rename", 1],
    ["create", 1],
    ["replace", EXPECTED_REQUIREMENT_ISSUE_COUNT],
    ["retire", 1],
  ] as const;
  let previousReceiptRoot: string | null = null;
  const coreReceipts = phases.map(([phase, count], index) => {
    const body = {
      schemaVersion: 1,
      kind: "linear-requirement-label-replacement-phase-receipt",
      candidateRoot: candidate.root,
      operationsRoot: candidate.operationsRoot,
      phase,
      direction: "forward",
      chunk: 1,
      completedOperations: count,
      phaseOperationCount: count,
      phaseComplete: true,
      journalRecordCount: (index + 1) * 2,
      journalSha256: String(index + 1).repeat(64),
      terminalRecordSha256: String(index + 5).repeat(64),
      protectedNativeStateRoot: candidate.protectedNativeStateRoot,
      previousReceiptRoot,
    };
    const receipt = { ...body, root: digest(canonical(body)) };
    previousReceiptRoot = receipt.root;
    return receipt;
  });
  const finalBody = {
    schemaVersion: 1,
    kind: "linear-requirement-label-replacement-final-receipt",
    candidateRoot: candidate.root,
    firstCaptureSha256: "d".repeat(64),
    secondCaptureSha256: "e".repeat(64),
    firstCaptureRoot: "f".repeat(64),
    secondCaptureRoot: "f".repeat(64),
    protectedNativeStateRoot: candidate.protectedNativeStateRoot,
    requirementUses: EXPECTED_REQUIREMENT_ISSUE_COUNT,
    oldLabelUses: 0,
    outsideRequirementUses: 0,
    stable: true,
  };
  const verification = { ...finalBody, root: digest(canonical(finalBody)) };
  const body = {
    schemaVersion: 1,
    kind: "linear-requirement-label-replacement-runner-receipt",
    candidateRoot: candidate.root,
    operationsRoot: candidate.operationsRoot,
    phase: "finalize",
    direction: "forward",
    runId: "123.1.finalize",
    nativeIdentitySha256: verification.firstCaptureSha256,
    captureReceiptSha256: "a".repeat(64),
    secondNativeIdentitySha256: verification.secondCaptureSha256,
    secondCaptureReceiptSha256: "b".repeat(64),
    journalSha256: coreReceipts.at(-1)!.journalSha256,
    coreReceipts,
    applied: 0,
    alreadyApplied: 0,
    compensated: 0,
    alreadyCompensated: 0,
    verification,
    previousReceiptRoot: "c".repeat(64),
    complete: true,
  };
  return { ...body, root: digest(canonical(body)) };
}

function proof(native: LinearNativeIdentityCapture) {
  const candidate = migrationCandidate(native);
  const finalizeReceipt = migrationFinalizeReceipt(candidate);
  return {
    migrationCandidate: candidate,
    migrationFinalizeReceipt: finalizeReceipt,
    expectedMigrationCandidateRoot: candidate.root,
    expectedMigrationFinalizeReceiptRoot: finalizeReceipt.root,
  };
}

function build(native: LinearNativeIdentityCapture, program: LinearProgramScopeV3, migration = proof(native)) {
  return buildLinearAuthorityLabelBootstrapCandidate({
    native,
    programScope: program,
    sourceCommit: "a".repeat(40),
    nativeIdentitySha256: "b".repeat(64),
    captureReceiptSha256: "c".repeat(64),
    ...migration,
  });
}

test("emits only the exact three missing native risk labels", () => {
  const { native, program } = fixture();
  native.labels = native.labels.filter((row) => !["risk", "delivery-risk", "financial-risk"].includes(row.name));
  const candidate = build(native, program);
  assert.deepEqual(candidate.createLabels.map((row) => row.name), ["risk", "delivery-risk", "financial-risk"]);
  assert.equal(candidate.mutationAuthorized, false);
  assert.equal(candidate.groups.length, 4);
  assert.equal(candidate.labels.length, 10);
  assert.match(candidate.root, /^[a-f0-9]{64}$/);
  assert.equal(
    createHash("sha256").update(canonicalLinearAuthorityLabelBootstrapCandidateJson(candidate)).digest("hex"),
    createHash("sha256").update(canonicalLinearAuthorityLabelBootstrapCandidateJson(build(native, program))).digest("hex"),
  );
});

test("becomes baseline-ready after exact native creation", () => {
  const { native, program } = fixture();
  assert.deepEqual(build(native, program).createLabels, []);
});

test("pins the exact finalized migration Requirement UUID and proof roots", () => {
  const { native, program } = fixture();
  const candidate = build(native, program);
  const migration = proof(native);
  assert.equal(candidate.labels.find((row) => row.name === "Requirement")?.id, NEW_REQUIREMENT_LABEL_ID);
  assert.equal(candidate.labels.find((row) => row.name === "Requirement")?.teamKey, "REQ");
  assert.deepEqual(candidate.requirementLabelMigration, {
    candidateRoot: migration.expectedMigrationCandidateRoot,
    finalRunnerReceiptRoot: migration.expectedMigrationFinalizeReceiptRoot,
    requirementLabelId: NEW_REQUIREMENT_LABEL_ID,
    finalCandidateRoot: migration.expectedMigrationCandidateRoot,
    finalVerificationRoot: migration.migrationFinalizeReceipt.verification.root,
  });
});

test("rejects substituted Requirement UUID, candidate root, and finalize root", () => {
  const cases: Array<(native: LinearNativeIdentityCapture, migration: ReturnType<typeof proof>) => void> = [
    (native) => {
      native.labels.find((row) => row.name === "Requirement")!.id = "99999999-9999-4999-8999-999999999999";
    },
    (_native, migration) => {
      migration.expectedMigrationCandidateRoot = "9".repeat(64);
    },
    (_native, migration) => {
      migration.expectedMigrationFinalizeReceiptRoot = "8".repeat(64);
    },
  ];
  for (const mutate of cases) {
    const { native, program } = fixture();
    const migration = proof(native);
    mutate(native, migration);
    assert.throws(() => build(native, program, migration), /migration|Requirement|root|UUID|proof/i);
  }
});

test("rejects missing finalized migration proof and missing retiredAt evidence", () => {
  const { native, program } = fixture();
  assert.throws(
    () => buildLinearAuthorityLabelBootstrapCandidate({
      native,
      programScope: program,
      sourceCommit: "a".repeat(40),
      nativeIdentitySha256: "b".repeat(64),
      captureReceiptSha256: "c".repeat(64),
    } as never),
    /migration|proof/i,
  );
  delete (native.labels.find((row) => row.name === "Requirement")! as unknown as { retiredAt?: string | null }).retiredAt;
  assert.throws(() => build(native, program), /retiredAt|retirement/i);
});

test("revalidates the finalized old and new Requirement identities and exact pinned usage", () => {
  const cases: Array<(native: LinearNativeIdentityCapture) => void> = [
    (native) => { native.labels.find((row) => row.id === OLD_REQUIREMENT_LABEL_ID)!.retiredAt = null; },
    (native) => { native.labels.find((row) => row.id === OLD_REQUIREMENT_LABEL_ID)!.name = "restored workspace Requirement"; },
    (native) => { native.labels = native.labels.filter((row) => row.id !== OLD_REQUIREMENT_LABEL_ID); },
    (native) => { native.issues[0]!.labelIds.push(OLD_REQUIREMENT_LABEL_ID); },
    (native) => { native.issues[0]!.labelIds = []; },
    (native) => {
      native.issues.push({
        ...structuredClone(native.issues[0]!),
        issueUuid: "99999999-9999-4999-8999-999999999999",
        identifier: "PLA-999",
      });
    },
  ];
  for (const mutate of cases) {
    const { native, program } = fixture();
    const migration = proof(native);
    mutate(native);
    assert.throws(() => build(native, program, migration), /migration|Requirement|retired|usage|pinned|assignment/i);
  }
});

test("accepts unrelated approved risk-label additions after migration finalization", () => {
  const { native, program } = fixture();
  const preRiskCapture = structuredClone(native);
  preRiskCapture.labels = preRiskCapture.labels.filter((row) =>
    !["risk", "delivery-risk", "financial-risk"].includes(row.name));
  const candidate = build(native, program, proof(preRiskCapture));
  assert.deepEqual(candidate.createLabels, []);
  assert.equal(candidate.labels.find((row) => row.name === "Requirement")?.id, NEW_REQUIREMENT_LABEL_ID);
});

test("initialized contract forbids replacement creation and requires exact live IDs", () => {
  const { native, program } = fixture();
  program.authorityIssueLabelContract = buildLinearAuthorityIssueLabelContract(native.labels);
  assert.deepEqual(build(native, program).createLabels, []);
  native.labels = native.labels.filter((row) => row.name !== "delivery-risk");
  assert.throws(
    () => build(native, program),
    /authority label delivery-risk must resolve exactly once|initialized authority label contract/i,
  );
});

test("rejects semantic, hierarchy, identity, scope, and duplicate drift", () => {
  const cases: Array<(native: LinearNativeIdentityCapture) => void> = [
    (native) => { native.labels.find((row) => row.name === "Requirement")!.description = "drift"; },
    (native) => { native.labels.find((row) => row.name === "decision")!.parentName = "Risk"; },
    (native) => { native.labels.find((row) => row.name === "security-risk")!.id = "11111111-1111-4111-8111-111111111111"; },
    (native) => { native.labels.find((row) => row.name === "platform")!.teamId = native.teams[0]!.id; },
    (native) => { native.labels.push(structuredClone(native.labels.find((row) => row.name === "marketplace")!)); },
  ];
  for (const mutate of cases) {
    const { native, program } = fixture();
    mutate(native);
    assert.throws(() => build(native, program), /label|scope|identity|drift|duplicate/i);
  }
});

test("CLI binds the full live receipt, exact HEAD scope, and current GitHub run", () => {
  const directory = mkdtempSync(join(tmpdir(), "sourcera-label-bootstrap-"));
  try {
    mkdirSync(join(directory, "delivery"), { recursive: true });
    const programRaw = readFileSync("delivery/linear-program-scope.json");
    writeFileSync(join(directory, "delivery/linear-program-scope.json"), programRaw);
    execFileSync("git", ["init", "-q"], { cwd: directory });
    execFileSync("git", ["config", "user.email", "test@example.invalid"], { cwd: directory });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: directory });
    execFileSync("git", ["add", "delivery/linear-program-scope.json"], { cwd: directory });
    execFileSync("git", ["commit", "-qm", "fixture"], { cwd: directory });
    const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" }).trim();
    const { native } = fixture();
    native.labels = native.labels.filter((row) => !["risk", "delivery-risk", "financial-risk"].includes(row.name));
    const nativeRaw = Buffer.from(`${JSON.stringify(native)}\n`);
    const digest = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");
    const fingerprint = "d".repeat(64);
    const receipt = {
      schemaVersion: 2,
      captureMode: "live",
      capturedAt: "2026-07-27T12:00:00.000Z",
      fingerprintSha256: fingerprint,
      acceptedFingerprintSha256: fingerprint,
      artifactSha256s: {
        fingerprint,
        nativeIdentity: digest(nativeRaw),
        documents: "e".repeat(64),
        issueDescriptions: "f".repeat(64),
      },
      source: {
        repository: "meetblakey/sourcera",
        commit,
        ref: "refs/heads/main",
        runId: "123",
        runAttempt: "1",
      },
    };
    const nativePath = join(directory, "native.json");
    const receiptPath = join(directory, "receipt.json");
    const migration = proof(native);
    const migrationCandidatePath = join(directory, "migration-candidate.json");
    const migrationFinalizeReceiptPath = join(directory, "migration-finalize-receipt.json");
    const outputPath = join(directory, "candidate.json");
    writeFileSync(nativePath, nativeRaw);
    writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
    writeFileSync(migrationCandidatePath, `${JSON.stringify(migration.migrationCandidate)}\n`);
    writeFileSync(migrationFinalizeReceiptPath, `${JSON.stringify(migration.migrationFinalizeReceipt)}\n`);
    const command = process.execPath;
    const loader = resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs");
    const script = resolve("tools/delivery/build-linear-authority-label-bootstrap.ts");
    const args = [
      "--import", loader,
      script,
      "--repository-root", directory,
      "--native-identity", nativePath,
      "--capture-receipt", receiptPath,
      "--program-scope", join(directory, "delivery/linear-program-scope.json"),
      "--migration-candidate", migrationCandidatePath,
      "--migration-finalize-receipt", migrationFinalizeReceiptPath,
      "--expected-migration-candidate-root", migration.expectedMigrationCandidateRoot,
      "--expected-migration-finalize-receipt-root", migration.expectedMigrationFinalizeReceiptRoot,
      "--out", outputPath,
    ];
    const environment = {
      ...process.env,
      GITHUB_REPOSITORY: "meetblakey/sourcera",
      GITHUB_SHA: commit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_RUN_ID: "123",
      GITHUB_RUN_ATTEMPT: "1",
    };
    const success = spawnSync(command, args, { cwd: process.cwd(), encoding: "utf8", env: environment });
    assert.equal(success.status, 0, success.stderr);
    assert.deepEqual(JSON.parse(success.stdout).createLabels, ["risk", "delivery-risk", "financial-risk"]);
    const mismatch = spawnSync(command, [...args.slice(0, -1), join(directory, "mismatch.json")], {
      cwd: process.cwd(), encoding: "utf8", env: { ...environment, GITHUB_RUN_ID: "124" },
    });
    assert.notEqual(mismatch.status, 0);
    assert.match(mismatch.stderr, /capture receipt does not bind/i);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("baseline workflow downloads and forwards the exact finalized migration artifact", () => {
  const workflow = readFileSync(".github/workflows/linear-authority-publication.yml", "utf8");
  assert.match(workflow, /permissions:\n  actions: read\n  contents: read/);
  for (const input of [
    "migration_finalize_run_id", "migration_finalize_run_attempt", "expected_migration_artifact_digest",
    "expected_migration_candidate_root", "expected_migration_finalize_receipt_root",
  ]) assert.match(workflow, new RegExp(`${input}:`));
  assert.match(workflow, /actions\/runs\/\$\{MIGRATION_FINALIZE_RUN_ID\}\/artifacts/);
  assert.match(workflow, /migration finalize artifact identity is not unique/);
  assert.match(workflow, /migration finalize artifact digest mismatch/);
  assert.match(workflow, /actions\/download-artifact@/);
  assert.match(workflow, /--migration-candidate \/tmp\/linear-authority\/migration\/linear-requirement-label-replacement-candidate\.json/);
  assert.match(workflow, /--migration-finalize-receipt \/tmp\/linear-authority\/migration\/phase-receipt\.json/);
  assert.match(workflow, /--expected-migration-candidate-root "\$EXPECTED_MIGRATION_CANDIDATE_ROOT"/);
  assert.match(workflow, /--expected-migration-finalize-receipt-root "\$EXPECTED_MIGRATION_FINALIZE_RECEIPT_ROOT"/);
  assert.match(workflow, /migration_requirement_id=.*requirementLabelMigration\.requirementLabelId/);
  assert.match(workflow, /test "\$baseline_requirement_id" = "\$migration_requirement_id"/);
  assert.match(workflow, /rm -rf \/tmp\/linear-authority\/migration/);
});
