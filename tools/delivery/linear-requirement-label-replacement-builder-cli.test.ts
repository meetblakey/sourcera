import { strict as assert } from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const OLD_LABEL_ID = "5b058b32-9655-442e-bcdb-a5ca0479c311";
const NEW_LABEL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TEAM_ID = "ee9dd198-4816-4836-9226-42765878d793";

const sha256 = (value: Buffer | string): string =>
  createHash("sha256").update(value).digest("hex");

function git(root: string, args: readonly string[]): string {
  return execFileSync("git", ["--no-optional-locks", "-C", root, ...args], {
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  }).trim();
}

function issueId(index: number): string {
  return `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function nativeCapture(): Record<string, unknown> {
  const issues = Array.from({ length: 186 }, (_, offset) => {
    const number = offset + 1;
    return {
      issueUuid: issueId(number),
      identifier: `REQ-${number}`,
      title: `Requirement ${number}`,
      archivedAt: null,
      descriptionSha256: sha256(`description-${number}`),
      teamId: TEAM_ID,
      stateId: "20000000-0000-4000-8000-000000000001",
      projectId: null,
      estimate: null,
      priority: 0,
      dueDate: null,
      cycleId: null,
      milestoneId: null,
      releaseIds: [],
      parentIssueUuid: null,
      assigneeId: null,
      labelIds: [OLD_LABEL_ID],
      relationIds: [],
    };
  });
  return {
    schemaVersion: 1,
    workspace: {
      id: "30000000-0000-4000-8000-000000000001",
      name: "Sourcera",
      urlKey: "sourcera-production",
      archivedAt: null,
    },
    issues,
    labels: [{
      id: OLD_LABEL_ID,
      name: "Requirement",
      color: "#5E6AD2",
      description: "Canonical binding product or engineering requirement.",
      archivedAt: null,
      retiredAt: null,
      inheritedFromId: null,
      isGroup: false,
      parentId: null,
      parentName: null,
      teamId: null,
      teamKey: null,
    }],
    relations: [],
    teams: [{ id: TEAM_ID, key: "REQ", name: "Requirements", archivedAt: null }],
    workflowStates: [],
    users: [],
    initiatives: [],
    projects: [],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [],
    rawDocumentIds: [],
    coverage: {
      complete: true,
      totals: {
        issues: issues.length,
        labels: 1,
        labelAssignments: issues.length,
        relations: 0,
        teams: 1,
        workflowStates: 0,
        users: 0,
        initiatives: 0,
        projects: 0,
        releasePipelines: 0,
        releaseStages: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 0,
      },
    },
  };
}

interface Fixture {
  root: string;
  commit: string;
  paths: {
    fingerprint: string;
    descriptions: string;
    native: string;
    receipt: string;
    program: string;
    execution: string;
    output: string;
  };
  args: string[];
  environment: NodeJS.ProcessEnv;
  cleanup(): void;
}

function fixture(): Fixture {
  const root = mkdtempSync(join(tmpdir(), "sourcera-requirement-label-builder-"));
  mkdirSync(join(root, "delivery"), { recursive: true });
  mkdirSync(join(root, "capture"));
  const program = join(root, "delivery/linear-program-scope.json");
  writeFileSync(program, readFileSync("delivery/linear-program-scope.json"));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.name", "Sourcera test"]);
  git(root, ["config", "user.email", "sourcera-test@example.invalid"]);
  git(root, ["add", "delivery/linear-program-scope.json"]);
  git(root, ["commit", "--quiet", "-m", "fixture"]);
  const commit = git(root, ["rev-parse", "HEAD"]);

  const fingerprint = join(root, "capture/fingerprint.json");
  const descriptions = join(root, "capture/issue-descriptions.json");
  const native = join(root, "capture/native-identity.json");
  const receipt = join(root, "capture/capture-receipt.json");
  const execution = join(root, "capture/github-execution.json");
  const output = join(root, "candidate.json");
  const fingerprintRaw = Buffer.from(`${JSON.stringify({ issues: [], releasePipelines: [], releases: [], projects: [], projectMilestones: [], cycles: [] })}\n`);
  const descriptionsRaw = Buffer.from(`${JSON.stringify({ schemaVersion: 1, issues: [] })}\n`);
  const nativeRaw = Buffer.from(`${JSON.stringify(nativeCapture())}\n`);
  const source = {
    repository: "meetblakey/sourcera",
    commit,
    ref: "refs/heads/main",
    runId: "123",
    runAttempt: "1",
  };
  const receiptRaw = Buffer.from(`${JSON.stringify({
    schemaVersion: 2,
    captureMode: "live",
    capturedAt: "2026-07-29T08:00:00.000Z",
    fingerprintSha256: sha256(fingerprintRaw),
    acceptedFingerprintSha256: sha256(fingerprintRaw),
    artifactSha256s: {
      fingerprint: sha256(fingerprintRaw),
      nativeIdentity: sha256(nativeRaw),
      documents: "d".repeat(64),
      issueDescriptions: sha256(descriptionsRaw),
    },
    source,
  })}\n`);
  const executionRaw = Buffer.from(`${JSON.stringify({
    schemaVersion: 1,
    kind: "github-execution",
    ...source,
  })}\n`);
  writeFileSync(fingerprint, fingerprintRaw);
  writeFileSync(descriptions, descriptionsRaw);
  writeFileSync(native, nativeRaw);
  writeFileSync(receipt, receiptRaw);
  writeFileSync(execution, executionRaw);

  const loader = resolve("tools/spec-lint/node_modules/tsx/dist/loader.mjs");
  const script = resolve("tools/delivery/build-linear-requirement-label-replacement.ts");
  const args = [
    "--import", loader,
    script,
    "--fingerprint", fingerprint,
    "--issue-descriptions", descriptions,
    "--native-identity", native,
    "--capture-receipt", receipt,
    "--program-scope", program,
    "--github-execution", execution,
    "--new-label-id", NEW_LABEL_ID,
    "--repository-root", root,
    "--out", output,
  ];
  return {
    root,
    commit,
    paths: { fingerprint, descriptions, native, receipt, program, execution, output },
    args,
    environment: {
      ...process.env,
      GITHUB_REPOSITORY: source.repository,
      GITHUB_SHA: source.commit,
      GITHUB_REF: source.ref,
      GITHUB_RUN_ID: source.runId,
      GITHUB_RUN_ATTEMPT: source.runAttempt,
      LINEAR_API_KEY: "must-not-be-read-or-used",
      GIT_OPTIONAL_LOCKS: "0",
    },
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function run(input: Fixture, args = input.args, environment = input.environment) {
  return spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: environment,
  });
}

test("builder emits the canonical mutation-disabled 189-write candidate without Linear access", () => {
  const input = fixture();
  try {
    const result = run(input);
    assert.equal(result.status, 0, result.stderr);
    const summary = JSON.parse(result.stdout) as Record<string, unknown>;
    const candidateRaw = readFileSync(input.paths.output, "utf8");
    const candidate = JSON.parse(candidateRaw) as {
      root: string;
      mutationAuthorized: boolean;
      operations: unknown[];
      issues: unknown[];
    };
    assert.equal(candidateRaw.endsWith("\n"), true);
    assert.equal(candidate.mutationAuthorized, false);
    assert.equal(candidate.operations.length, 189);
    assert.equal(candidate.issues.length, 186);
    assert.deepEqual(summary, {
      ok: true,
      mutationAuthorized: false,
      root: candidate.root,
      expectedCurrentRoot: (candidate as Record<string, unknown>).expectedCurrentRoot,
      protectedNativeStateRoot: (candidate as Record<string, unknown>).protectedNativeStateRoot,
      operationsRoot: (candidate as Record<string, unknown>).operationsRoot,
      operations: 189,
      requirements: 186,
      sourceCommit: input.commit,
    });
  } finally {
    input.cleanup();
  }
});

test("builder rejects receipt, GitHub execution, committed-scope, path, and overwrite drift", () => {
  const cases: Array<{
    name: string;
    mutate(input: Fixture): void;
    pattern: RegExp;
  }> = [
    {
      name: "artifact digest",
      mutate(input) { writeFileSync(input.paths.fingerprint, "{}\n"); },
      pattern: /receipt|hash|digest|capture bytes/i,
    },
    {
      name: "execution identity",
      mutate(input) { input.environment.GITHUB_RUN_ID = "124"; },
      pattern: /GitHub|execution|run identity|canonical main/i,
    },
    {
      name: "dirty committed scope",
      mutate(input) { writeFileSync(input.paths.program, "{}\n"); },
      pattern: /program scope|repository HEAD|committed/i,
    },
    {
      name: "duplicate input",
      mutate(input) {
        const index = input.args.indexOf(input.paths.descriptions);
        input.args[index] = input.paths.fingerprint;
      },
      pattern: /distinct|duplicate/i,
    },
    {
      name: "symlink input",
      mutate(input) {
        const link = join(input.root, "capture/native-link.json");
        symlinkSync(input.paths.native, link);
        const index = input.args.indexOf(input.paths.native);
        input.args[index] = link;
      },
      pattern: /symlink|regular/i,
    },
    {
      name: "output overwrite",
      mutate(input) { writeFileSync(input.paths.output, "existing\n"); },
      pattern: /output|exist|overwrite/i,
    },
  ];

  for (const row of cases) {
    const input = fixture();
    try {
      row.mutate(input);
      const result = run(input);
      assert.notEqual(result.status, 0, `${row.name} unexpectedly succeeded`);
      assert.match(result.stderr, row.pattern, row.name);
    } finally {
      input.cleanup();
    }
  }
});
