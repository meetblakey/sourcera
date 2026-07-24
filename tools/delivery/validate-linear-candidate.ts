#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  linearCandidateFindings,
  type LinearSnapshotCandidate,
} from "./lib/linear-candidate.js";
import type { ReleaseDefinition } from "./lib/model.js";

function argumentsByName(): Map<string, string> {
  const allowed = new Set(["--candidate", "--releases"]);
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
  const candidate = JSON.parse(
    readFileSync(required(values, "--candidate"), "utf8"),
  ) as LinearSnapshotCandidate;
  const releaseDocument = JSON.parse(
    readFileSync(required(values, "--releases"), "utf8"),
  ) as { releases?: ReleaseDefinition[] };
  const findings = linearCandidateFindings(
    candidate,
    releaseDocument.releases ?? [],
  );
  if (findings.length) {
    throw new Error(
      findings
        .map((finding) => `${finding.code}: ${finding.message}`)
        .join("\n"),
    );
  }
  process.stdout.write(
    `${JSON.stringify({ status: "pass", mappedIssues: candidate.issues.filter((issue) => issue.sourceId !== null).length })}\n`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
