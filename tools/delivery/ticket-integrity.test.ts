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

function completeContract(description: string) {
  return [
    "## Outcome",
    "Ship one bounded result.",
    "## Complete behavior and rules",
    "Persist the validated result atomically and fail closed.",
    "## States and transitions",
    "Move from pending to active only after validation; a failed transition changes nothing.",
    "## Permissions, isolation, and privacy",
    "Authorize server-side, isolate every tenant, and emit no sensitive payload.",
    description,
    "## Review and readiness",
    "Independent review must accept the immutable proof before closure.",
    "## Exact paths",
    "* `package.json`",
    "## Acceptance Tests",
    "### Success",
    "The outcome passes.",
    "### Failure",
    "Invalid input fails closed.",
    "### Recovery",
    "The prior verified state restores.",
    "## Rollout",
    "Canary in a protected environment before wider use.",
    "## Rollback",
    "Restore the prior verified build and rerun the proof.",
    "## Telemetry and notifications",
    "Emit a bounded result event; notify only on named failure paths.",
    "## Named proof",
    "Retain `reports/evidence/test.json`.",
    "## Assumptions and validation triggers",
    "A contract change invalidates the receipt and requires a rerun.",
    "## Exclusions",
    "Unrelated product outcomes.",
  ].join("\n");
}

function issue(description: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "PLA-1",
    title: "Typed foundation",
    description: completeContract(description),
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
      "* Canonical authority: current source bundle.",
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

test("fails readiness for manual title/body references and wildcard body paths", () => {
  const captured = issue(
    [
      "## Source",
      "* Source family: PLA-2 / F-998",
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
      "ticket_manual_reference_duplicated",
      "ticket_native_fields_duplicated",
      "ticket_ready_wildcard_path",
      "ticket_title_manual_prefix",
    ],
  );
  assert.equal(report.readinessFindings.length, 1);
  assert.equal(report.passed, false);
});

test("allows only the matching canonical requirement in source provenance", () => {
  const matching = issue(
    [
      "## Source provenance",
      "- Canonical requirement: `F-005`.",
      "- Canonical authority: current source bundle.",
    ].join("\n"),
  );
  const accepted = runScanner(snapshotFor(matching), {
    schemaVersion: 1,
    issues: [matching],
  });
  assert.equal(accepted.result.status, 0, accepted.result.stderr);
  assert.deepEqual(accepted.report.findings, []);

  const mismatch = issue(
    [
      "## Source provenance",
      "- Canonical requirement: `F-006`.",
      "- Canonical authority: current source bundle.",
    ].join("\n"),
  );
  const rejectedMismatch = runScanner(snapshotFor(mismatch), {
    schemaVersion: 1,
    issues: [mismatch],
  });
  assert.deepEqual(
    rejectedMismatch.report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_manual_reference_duplicated"],
  );

  const outside = issue(
    [
      "## Source provenance",
      "- Canonical requirement: `F-005`.",
      "- Canonical authority: current source bundle.",
      "## Implementation note",
      "Do not copy F-005 into planning prose.",
    ].join("\n"),
  );
  const rejectedOutside = runScanner(snapshotFor(outside), {
    schemaVersion: 1,
    issues: [outside],
  });
  assert.deepEqual(
    rejectedOutside.report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_manual_reference_duplicated"],
  );
});

test("fails closed when a tracked ready issue is absent from the full capture", () => {
  const captured = issue(
    "## Source\n* Canonical authority: current source bundle.\n## Paths\n* `package.json`",
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
    "## Source\n* Canonical authority: current source bundle.\n## Paths\n* `package.json`",
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
      "* Canonical authority: current source bundle.",
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

test("falls back to a canonical family checksum for an executable child", () => {
  const expected = "c".repeat(64);
  const captured = issue(
    [
      "## Source provenance",
      "* Canonical authority: current source bundle.",
      "* The complete implementation contract is below.",
      `* Canonical source checksum: sha256:${expected}`,
    ].join("\n"),
    { title: "Auth session slice", labels: [] },
  );
  const baseSnapshot = snapshotFor(captured);
  const snapshot = {
    ...baseSnapshot,
    issues: baseSnapshot.issues.map((snapshotIssue) => ({
      ...snapshotIssue,
      sourceId: "F-006.A",
      labels: [],
    })),
  };
  const checksumContract = {
    schemaVersion: 1,
    sources: [{ sourceId: "F-006", sha256: expected }],
  };

  const { result, report } = runScanner(
    snapshot,
    { schemaVersion: 1, issues: [captured] },
    checksumContract,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(report.findings, []);
});

test("an exact child checksum overrides its family checksum", () => {
  const family = "c".repeat(64);
  const child = "d".repeat(64);
  const captured = issue(
    [
      "## Source provenance",
      "* Canonical authority: current source bundle.",
      `* Canonical source checksum: sha256:${child}`,
    ].join("\n"),
    { title: "Auth session slice", labels: [] },
  );
  const snapshot = snapshotFor(captured);
  snapshot.issues[0].sourceId = "F-006.A";
  snapshot.issues[0].labels = [];
  const checksumContract = {
    schemaVersion: 2,
    sources: [
      { sourceId: "F-006", sha256: family },
      { sourceId: "F-006.A", sha256: child },
    ],
  };

  const matching = runScanner(
    snapshot,
    { schemaVersion: 1, issues: [captured] },
    checksumContract,
  );
  assert.equal(matching.result.status, 0, matching.result.stderr);
  assert.deepEqual(matching.report.findings, []);

  const wrongCapture = {
    ...captured,
    description: captured.description?.replace(child, family) ?? null,
  };
  const wrongSnapshot = snapshotFor(wrongCapture);
  wrongSnapshot.issues[0].sourceId = "F-006.A";
  wrongSnapshot.issues[0].labels = [];
  const mismatch = runScanner(
    wrongSnapshot,
    { schemaVersion: 1, issues: [wrongCapture] },
    checksumContract,
  );
  assert.equal(mismatch.result.status, 1, mismatch.result.stderr);
  assert.deepEqual(
    mismatch.report.findings.map(
      (finding: { code: string }) => finding.code,
    ),
    ["ticket_source_checksum_mismatch"],
  );
});

test("detects an unquoted wildcard in a ready ticket path section", () => {
  const captured = issue(
    [
      "## Source",
      "* Canonical authority: current source bundle.",
      "## Exact Paths",
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
      "* Canonical authority: current source bundle.",
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

test("fails when an executable issue delegates implementation to its source", () => {
  const captured = issue(
    [
      "## Source",
      "* Canonical authority: current source bundle.",
      "* Authority: the cited source overrides this issue text.",
      "## Paths",
      "* `package.json`",
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
    ["ticket_implementation_deferred_to_source"],
  );
  assert.deepEqual(report.readinessFindings, []);
  assert.equal(report.passed, false);
});

test("detects Master-specific and summarize-only source deferrals", () => {
  for (const clause of [
    "* Authority: the cited Master Spec sections override this issue text.",
    "* The pinned source owns every field, rule, and failure mode. This issue may summarize but never narrow them.",
    "* Interactive icons follow the Master Spec §38.6.2 per-tier touch-target minimum.",
    "* The complete behavior is as defined in the UX Design source.",
    "* Exact threshold values remain sourced from the local source.",
    "* Implement every behavior where the cited source applies.",
    "* Master Spec is authoritative. UX Design applies only where the Master Spec is silent.",
    "* Implement the complete, unabridged contract at the cited primary and related source anchors.",
    "* All numbers and entitlements resolve from Master Spec section 34.",
    "* The ready, loading, empty, error, partial, and permission-denied states behave as the source requires.",
  ]) {
    const captured = issue(
      [
        "## Source",
        "* Canonical authority: current source bundle.",
        clause,
        "## Paths",
        "* `package.json`",
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
      ["ticket_implementation_deferred_to_source"],
    );
    assert.equal(report.passed, false);
  }
});

test("fails every executable body missing its complete issue contract", () => {
  const captured = issue(
    "## Source provenance\n* Canonical authority: current source bundle.\n## Exact paths\n* `package.json`",
    { labels: [] },
  );
  captured.description = [
    "## Outcome",
    "Ship one bounded result.",
    "## Source provenance",
    "* Canonical authority: current source bundle.",
    "## Exact paths",
    "* `package.json`",
  ].join("\n");
  const snapshot = snapshotFor(captured);
  snapshot.issues[0].labels = [];

  const { result, report } = runScanner(snapshot, {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(
    report.findings.map((finding: { code: string }) => finding.code),
    ["ticket_contract_sections_missing"],
  );
  assert.match(
    report.findings[0].message,
    /complete behavior and rules, states and transitions, permissions, isolation, and privacy.*telemetry and notifications, named proof, assumptions and validation triggers, exclusions/,
  );
  assert.deepEqual(report.readinessFindings, []);
  assert.equal(report.passed, false);
});

test("fails when descriptions duplicate native Linear fields or relations", () => {
  const captured = issue("## Source provenance\n* Canonical authority: current source bundle.", {
    labels: [],
  });
  captured.description = [
    "# Typed foundation",
    completeContract("## Source provenance\n* Canonical authority: current source bundle."),
    "* Release: R0",
    "* Owner: Blake Rowley",
    "* Estimate: 3",
    "## Dependencies",
    "* Blocked by: earlier contract",
  ].join("\n");
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
      "ticket_native_fields_duplicated",
      "ticket_native_relations_duplicated",
      "ticket_native_title_duplicated",
    ],
  );
  assert.equal(report.passed, false);
});

test("accepts review and readiness instead of duplicated delivery metadata", () => {
  const captured = issue("## Source provenance\n* Canonical authority: current source bundle.", {
    labels: [],
  });
  const snapshot = snapshotFor(captured);
  snapshot.issues[0].labels = [];

  const { result, report } = runScanner(snapshot, {
    schemaVersion: 1,
    issues: [captured],
  });

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(report.findings, []);
  assert.equal(report.passed, true);
});
