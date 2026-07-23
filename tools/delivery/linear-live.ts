#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  assertLinearPlanningContractFingerprints,
  canonicalLinearFingerprint,
  fetchConsistentLinearCapture,
  fingerprintDiff,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import type { LinearIssueDescriptionCapture } from "./lib/ticket-integrity.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import {
  assertLinearProgramScope,
  type LinearProgramScope,
} from "./lib/linear-program-scope.js";

async function main(): Promise<void> {
  const argv = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    argv.set(name, value);
  }
  const outPath = argv.get("--out");
  const receiptOutPath = argv.get("--receipt-out");
  if (receiptOutPath && !outPath) {
    throw new Error("--receipt-out requires --out");
  }
  const projectScopePath = resolve(
    argv.get("--linear-project-scope") ??
      "delivery/linear-project-scope.json",
  );
  const projectScope = JSON.parse(
    readFileSync(projectScopePath, "utf8"),
  ) as LinearProjectScope;
  const programScopePath = resolve(
    argv.get("--linear-program-scope") ??
      join(dirname(projectScopePath), "linear-program-scope.json"),
  );
  const programScope = existsSync(programScopePath)
    ? JSON.parse(readFileSync(programScopePath, "utf8")) as LinearProgramScope
    : undefined;
  const fixturePath = argv.get("--fixture");
  const fixture = fixturePath
    ? JSON.parse(readFileSync(resolve(fixturePath), "utf8")) as
      | LinearFingerprint
      | {
          fingerprint: LinearFingerprint;
          issueDescriptions: LinearIssueDescriptionCapture[];
        }
    : null;
  const liveCapture = fixture
    ? null
    : await fetchConsistentLinearCapture(
        fetch,
        process.env.LINEAR_API_KEY ?? "",
        projectScope,
        programScope,
      );
  const captured = fixture
    ? ("fingerprint" in fixture ? fixture.fingerprint : fixture)
    : liveCapture!.fingerprint;
  const issueDescriptions = fixture && "fingerprint" in fixture
    ? fixture.issueDescriptions
    : liveCapture?.issueDescriptions ?? null;
  const actual = canonicalLinearFingerprint(captured);
  assertLinearProjectScope(projectScope, actual.projects);
  if (programScope) {
    if (!actual.program) throw new Error("Linear fingerprint lacks program topology");
    assertLinearPlanningContractFingerprints(programScope, actual);
  }

  const fingerprintJson = `${JSON.stringify(actual, null, 2)}\n`;
  if (outPath) {
    writeFileSync(resolve(outPath), fingerprintJson);
  }
  const descriptionsOutPath = argv.get("--descriptions-out");
  if (descriptionsOutPath) {
    if (!issueDescriptions) {
      throw new Error("Full Linear description capture is unavailable");
    }
    writeFileSync(
      resolve(descriptionsOutPath),
      `${JSON.stringify({ schemaVersion: 1, issues: issueDescriptions }, null, 2)}\n`,
    );
  }
  if (receiptOutPath) {
    const environmentValue = (name: string): string | null =>
      process.env[name]?.trim() || null;
    writeFileSync(
      resolve(receiptOutPath),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          capturedAt: new Date().toISOString(),
          fingerprintSha256: createHash("sha256")
            .update(fingerprintJson)
            .digest("hex"),
          source: {
            repository: environmentValue("GITHUB_REPOSITORY"),
            commit: environmentValue("GITHUB_SHA"),
            ref: environmentValue("GITHUB_REF"),
            runId: environmentValue("GITHUB_RUN_ID"),
            runAttempt: environmentValue("GITHUB_RUN_ATTEMPT"),
          },
        },
        null,
        2,
      )}\n`,
    );
  }

  const shouldCompare = !outPath || argv.has("--snapshot");
  if (!shouldCompare) return;
  const snapshotPath = resolve(
    argv.get("--snapshot") ?? "delivery/linear-snapshot.json",
  );
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as {
    projects?: Array<{ id: string }>;
    linearFingerprint: LinearFingerprint;
  };
  if (!snapshot.linearFingerprint) {
    throw new Error("Linear snapshot lacks linearFingerprint");
  }
  if (!Array.isArray(snapshot.projects) || !snapshot.projects.length) {
    throw new Error("Linear snapshot lacks tracked projects");
  }
  assertLinearProjectScope(projectScope, snapshot.projects);
  const differences = fingerprintDiff(snapshot.linearFingerprint, actual);
  if (differences.length) {
    for (const difference of differences) console.error(difference);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
