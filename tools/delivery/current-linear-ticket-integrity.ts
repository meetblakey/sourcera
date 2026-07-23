#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyLinearDispositions,
  parseLinearDispositions,
} from "./lib/linear-dispositions.js";
import type { LinearFingerprint } from "./lib/linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import {
  deriveLinearPlanningIssues,
  parseLinearRuntimeInventory,
  type SourceDerivedSnapshotIssue,
  type LinearSourcePolicy,
} from "./lib/linear-source-policy.js";
import type { LinearIssueSnapshot } from "./lib/model.js";
import type { SourceChecksumContract } from "./lib/source-checksums.js";
import { parseFeatureInventory } from "./lib/sources.js";
import {
  scanTicketIntegrity,
  bindTicketIntegrityReport,
  type TicketIntegrityCapture,
  type TicketIntegrityReport,
} from "./lib/ticket-integrity.js";

interface BaselineSnapshot {
  issues: SourceDerivedSnapshotIssue[];
}

interface CurrentTicketIntegrityInput {
  snapshot: BaselineSnapshot;
  fingerprint: LinearFingerprint;
  capture: TicketIntegrityCapture;
  projectScope: LinearProjectScope;
  sourcePolicy: LinearSourcePolicy;
  sourceRequirements: ReturnType<typeof parseFeatureInventory>;
  repositoryRoot: string;
  checksumContract: SourceChecksumContract;
}

interface CurrentTicketIntegrityScan {
  report: TicketIntegrityReport;
  checkedIssueCount: number;
}

export function scanCurrentLinearTicketIntegrity(
  input: CurrentTicketIntegrityInput,
): CurrentTicketIntegrityScan {
  const scopedProjectIds = new Set(
    assertLinearProjectScope(input.projectScope, input.fingerprint.projects),
  );
  const issues = deriveLinearPlanningIssues(
    input.snapshot.issues,
    input.fingerprint.issues,
    scopedProjectIds,
    input.sourcePolicy,
    input.sourceRequirements,
    input.repositoryRoot,
    input.checksumContract,
  ) as unknown as LinearIssueSnapshot[];
  return {
    report: scanTicketIntegrity(
      {
        issues,
        linearFingerprint: { issues: input.fingerprint.issues },
      },
      input.capture,
      input.checksumContract,
    ),
    checkedIssueCount: issues.length,
  };
}

function argumentsByName(): Map<string, string> {
  const allowed = new Set([
    "--snapshot",
    "--fingerprint",
    "--capture",
    "--linear-project-scope",
    "--source-policy",
    "--inventory",
    "--source-checksums",
    "--dispositions",
    "--stamp",
    "--runtime-dependencies",
    "--out",
  ]);
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name || !allowed.has(name) || !value || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`${name} is required`);
  return resolve(value);
}

function main(): void {
  const values = argumentsByName();
  const repositoryRoot = realpathSync(
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim(),
  );
  const snapshot = JSON.parse(
    readFileSync(required(values, "--snapshot"), "utf8"),
  ) as BaselineSnapshot;
  const fingerprintJson = readFileSync(
    required(values, "--fingerprint"),
    "utf8",
  );
  const fingerprint = JSON.parse(fingerprintJson) as LinearFingerprint;
  const captureJson = readFileSync(required(values, "--capture"), "utf8");
  const capture = JSON.parse(captureJson) as TicketIntegrityCapture;
  const projectScope = JSON.parse(
    readFileSync(required(values, "--linear-project-scope"), "utf8"),
  ) as LinearProjectScope;
  const sourcePolicy = JSON.parse(
    readFileSync(required(values, "--source-policy"), "utf8"),
  ) as LinearSourcePolicy;
  const checksumContract = JSON.parse(
    readFileSync(required(values, "--source-checksums"), "utf8"),
  ) as SourceChecksumContract;
  const featureRequirements = parseFeatureInventory(
    readFileSync(required(values, "--inventory"), "utf8"),
  );
  const runtimeRequirements = parseLinearRuntimeInventory(
    readFileSync(required(values, "--stamp"), "utf8"),
    readFileSync(required(values, "--runtime-dependencies"), "utf8"),
  );
  const undisposedRequirements = [
    ...featureRequirements,
    ...runtimeRequirements,
  ];
  const sourceRequirements = applyLinearDispositions(
    undisposedRequirements,
    parseLinearDispositions(
      JSON.parse(readFileSync(required(values, "--dispositions"), "utf8")),
      undisposedRequirements,
    ),
  );
  const { report, checkedIssueCount } = scanCurrentLinearTicketIntegrity({
    snapshot,
    fingerprint,
    capture,
    projectScope,
    sourcePolicy,
    sourceRequirements,
    repositoryRoot,
    checksumContract,
  });
  const boundReport = bindTicketIntegrityReport(
    report,
    fingerprintJson,
    captureJson,
    checkedIssueCount,
  );
  const json = `${JSON.stringify(boundReport, null, 2)}\n`;
  writeFileSync(required(values, "--out"), json);
  if (!report.passed) process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
