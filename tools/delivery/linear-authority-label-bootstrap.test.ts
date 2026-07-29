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

function fixture(): { native: LinearNativeIdentityCapture; program: LinearProgramScopeV3 } {
  const teamId = "ee9dd198-4816-4836-9226-42765878d793";
  const typeId = "b11e20d5-df7e-4e8b-a710-294827ff9b40";
  const agentId = "121eeb45-5276-441e-82b0-f85567f816db";
  const domainId = "2da596c3-1be9-494b-bf81-5ce1dd4d753b";
  const riskId = "44444444-4444-4444-8444-444444444444";
  const group = (id: string, name: string) => ({
    id, name, color: "#888888", description: null, archivedAt: null,
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
    id, name, color, description, archivedAt: null, inheritedFromId: null,
    isGroup: false, parentId, parentName,
    teamId: scoped ? teamId : null, teamKey: scoped ? "REQ" : null,
  });
  const native = {
    schemaVersion: 1,
    workspace: { id: "55555555-5555-4555-8555-555555555555", name: "Sourcera", urlKey: "sourcera-production", archivedAt: null },
    labels: [
      group(typeId, "Type"), group(agentId, "Agent"), group(domainId, "Domain"), group(riskId, "Risk"),
      label("5b058b32-9655-442e-bcdb-a5ca0479c311", "Requirement", null, null, "#5E6AD2", "Canonical binding product or engineering requirement.", true),
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
    coverage: { complete: true },
  } as unknown as LinearNativeIdentityCapture;
  return {
    native,
    program: JSON.parse(readFileSync("delivery/linear-program-scope.json", "utf8")) as LinearProgramScopeV3,
  };
}

function build(native: LinearNativeIdentityCapture, program: LinearProgramScopeV3) {
  return buildLinearAuthorityLabelBootstrapCandidate({
    native,
    programScope: program,
    sourceCommit: "a".repeat(40),
    nativeIdentitySha256: "b".repeat(64),
    captureReceiptSha256: "c".repeat(64),
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
    const outputPath = join(directory, "candidate.json");
    writeFileSync(nativePath, nativeRaw);
    writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
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
