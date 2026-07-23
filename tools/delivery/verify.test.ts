import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assertPublicationIntegrityReport } from "./lib/publication-integrity.js";

test("verification accepts only a passing publication-integrity summary", () => {
  assert.deepEqual(
    assertPublicationIntegrityReport({
      publicationIntegrity: {
        schemaVersion: 1,
        passed: true,
        blockingFindingCount: 0,
      },
    }),
    {
      schemaVersion: 1,
      passed: true,
      blockingFindingCount: 0,
    },
  );
  assert.throws(
    () =>
      assertPublicationIntegrityReport({
        publicationIntegrity: {
          schemaVersion: 1,
          passed: false,
          blockingFindingCount: 2,
        },
      }),
    /2 blocking findings/,
  );
  assert.throws(
    () =>
      assertPublicationIntegrityReport({
        publicationIntegrity: {
          schemaVersion: 1,
          passed: true,
          blockingFindingCount: 1,
        },
      }),
    /invalid/,
  );
});

test("verification fails closed before reports when the promoted Linear capture is incomplete", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-verify-"));
  try {
    const runtimeDependencies = JSON.parse(
      readFileSync("delivery/runtime-gate-dependencies.json", "utf8"),
    ) as { dependencies: Array<{ requirementId: string }> };
    const stamp = join(dir, "stamp.json");
    writeFileSync(
      stamp,
      JSON.stringify({
        findings: runtimeDependencies.dependencies.map((entry) => ({
          id: entry.requirementId.slice(3),
          file: "Sourcera_Master_Spec.md",
          line: 1,
          severity: "blocker",
        })),
      }),
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/verify.ts",
        "--root",
        process.cwd(),
        "--stamp",
        stamp,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /complete projects fingerprint inventory/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("verification still byte-compares every generated delivery report", () => {
  const source = readFileSync("tools/delivery/verify.ts", "utf8");
  for (const report of [
    "delivery-manifest.json",
    "traceability-map.json",
    "dependency-graph.json",
    "readiness-report.json",
    "drift-report.json",
    "release-scorecard.json",
    "journey-readiness.json",
  ]) {
    assert.match(source, new RegExp(report.replace(".", "\\.")));
  }
  assert.match(source, /Generated report differs/);
  assert.match(source, /assertPublicationIntegrityReport/);
});
