import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const fingerprint = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

function issue(description: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "PLA-1",
    title: "[F-005] Typed foundation",
    description,
    updatedAt: "2026-07-15T00:00:00.000Z",
    labels: ["codex-ready"],
    ...overrides,
  };
}

function snapshotFor(captured: ReturnType<typeof issue>) {
  return {
    issues: [
      {
        id: captured.id,
        parentId: null,
        sourceId: "F-005",
        title: captured.title,
        kind: "executable",
        labels: ["codex-ready"],
        release: "R0",
        milestone: "Deployable foundation ready",
        dependencies: [],
        owner: "Blake Rowley",
        reviewer: "Blake Rowley",
        estimate: 3,
        paths: ["package.json"],
        tests: {
          success: "build passes",
          failure: "invalid input fails",
          recovery: "prior build restores",
        },
        rollout: "preview canary",
        rollback: "redeploy prior build",
        telemetry: "foundation_result",
        proof: "preview receipt",
        sourceVersion: "v7.1.0a",
        sourceSection: "§1.5",
        outcome: "Create a typed foundation",
      },
    ],
    linearFingerprint: {
      issues: [
        {
          identifier: captured.id,
          title: captured.title,
          descriptionFingerprint: fingerprint(captured.description),
          updatedAt: captured.updatedAt,
          labels: captured.labels,
        },
      ],
    },
  };
}

function runScanner(
  snapshot: unknown,
  capture: unknown,
  checksumContract?: unknown,
) {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-ticket-integrity-"));
  const snapshotPath = join(dir, "snapshot.json");
  const capturePath = join(dir, "capture.json");
  const outPath = join(dir, "report.json");
  const checksumPath = join(dir, "checksums.json");
  writeFileSync(snapshotPath, JSON.stringify(snapshot));
  writeFileSync(capturePath, JSON.stringify(capture));
  if (checksumContract) {
    writeFileSync(checksumPath, JSON.stringify(checksumContract));
  }
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/ticket-integrity.ts",
      "--snapshot",
      snapshotPath,
      "--capture",
      capturePath,
      "--out",
      outPath,
      ...(checksumContract
        ? ["--checksum-contract", checksumPath]
        : []),
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  const report = (() => {
    try {
      return JSON.parse(readFileSync(outPath, "utf8"));
    } catch {
      return null;
    }
  })();
  rmSync(dir, { recursive: true, force: true });
  return { result, report };
}

test("fails readiness for repeated 240-character clauses ending mid-token", () => {
  const capped = `${"A".repeat(234)} trunc`;
  assert.equal([...capped].length, 240);
  const captured = issue(
    [
      "## Source",
      "* Requirement map: F-005",
      "## Implementation Notes",
      `* ${capped}`,
      "## Acceptance Tests",
      `- [ ] ${capped}`,
    ].join("\n"),
  );

  const { result, report } = runScanner(snapshotFor(captured), {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.ok(report);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    [
      "ticket_description_cap_mid_token",
      "ticket_description_repeated_cap",
    ],
  );
  assert.deepEqual(
    report.readinessFindings.map(
      (finding: { code: string }) => finding.code,
    ),
    ["ticket_integrity_failed"],
  );
  assert.equal(report.passed, false);
});

test("fails readiness for title/body source mismatch and wildcard body paths", () => {
  const captured = issue(
    [
      "## Source",
      "* Requirement map ID: F-999",
      "## Files/Paths",
      "* Target product path: `convex/**`",
      "* `tests/integration/foundation.spec.ts`",
    ].join("\n"),
    { title: "[F-998] Wrong feature" },
  );

  const { result, report } = runScanner(snapshotFor(captured), {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    [
      "ticket_body_source_mismatch",
      "ticket_ready_wildcard_path",
      "ticket_title_source_mismatch",
    ],
  );
  assert.equal(report.readinessFindings.length, 1);
  assert.equal(report.passed, false);
});

test("fails closed when a tracked ready issue is absent from the full capture", () => {
  const captured = issue(
    "## Source\n* Requirement map: F-005\n## Paths\n* `package.json`",
  );
  const { result, report } = runScanner(snapshotFor(captured), {
    schemaVersion: 1,
    issues: [],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_capture_issue_missing"],
  );
  assert.deepEqual(
    report.readinessFindings.map(
      (finding: { code: string }) => finding.code,
    ),
    ["ticket_integrity_failed"],
  );
});

test("fails closed when the full capture duplicates a tracked issue", () => {
  const captured = issue(
    "## Source\n* Requirement map: F-005\n## Paths\n* `package.json`",
  );
  const { result, report } = runScanner(snapshotFor(captured), {
    schemaVersion: 1,
    issues: [captured, captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_capture_issue_duplicate"],
  );
});

test("checks a declared canonical source checksum contract when supplied", () => {
  const expected = "a".repeat(64);
  const checksumContract = {
    schemaVersion: 1,
    sources: [{ sourceId: "F-005", sha256: expected }],
  };
  const description = (checksum?: string) =>
    [
      "## Source",
      "* Requirement map: F-005",
      ...(checksum ? [`* Canonical source checksum: sha256:${checksum}`] : []),
      "## Paths",
      "* `package.json`",
    ].join("\n");

  const missing = issue(description());
  const missingRun = runScanner(
    snapshotFor(missing),
    { schemaVersion: 1, issues: [missing] },
    checksumContract,
  );
  assert.equal(missingRun.result.status, 1, missingRun.result.stderr);
  assert.deepEqual(
    missingRun.report.findings.map(
      (finding: { code: string }) => finding.code,
    ),
    ["ticket_source_checksum_missing"],
  );

  const mismatch = issue(description("b".repeat(64)));
  const mismatchRun = runScanner(
    snapshotFor(mismatch),
    { schemaVersion: 1, issues: [mismatch] },
    checksumContract,
  );
  assert.equal(mismatchRun.result.status, 1, mismatchRun.result.stderr);
  assert.deepEqual(
    mismatchRun.report.findings.map(
      (finding: { code: string }) => finding.code,
    ),
    ["ticket_source_checksum_mismatch"],
  );

  const matching = issue(description(expected));
  const matchingRun = runScanner(
    snapshotFor(matching),
    { schemaVersion: 1, issues: [matching] },
    checksumContract,
  );
  assert.equal(matchingRun.result.status, 0, matchingRun.result.stderr);
  assert.deepEqual(matchingRun.report.findings, []);
});

test("detects an unquoted wildcard in a ready ticket path section", () => {
  const captured = issue(
    [
      "## Source",
      "* Requirement map: F-005",
      "## Paths",
      "* src/**",
    ].join("\n"),
  );
  const { result, report } = runScanner(snapshotFor(captured), {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_ready_wildcard_path"],
  );
});

test("fails closed on corrupt non-ready executable tickets", () => {
  const capped = `${"A".repeat(234)} trunc`;
  const captured = issue(
    [
      "## Source",
      "* Requirement map: F-005",
      "## Paths",
      "* `convex/**`",
      "## Implementation Notes",
      `* ${capped}`,
      "## Acceptance Tests",
      `- [ ] ${capped}`,
    ].join("\n"),
    { labels: [] },
  );
  const snapshot = snapshotFor(captured);
  snapshot.issues[0].labels = [];

  const { result, report } = runScanner(snapshot, {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    [
      "ticket_description_cap_mid_token",
      "ticket_description_repeated_cap",
      "ticket_executable_wildcard_path",
    ],
  );
  assert.deepEqual(report.readinessFindings, []);
  assert.equal(report.passed, false);
});
