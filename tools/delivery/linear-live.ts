#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  fetchLinearFingerprint,
  fingerprintDiff,
  type LinearFingerprint,
} from "./lib/linear-live.js";

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
  const projectIds = snapshot.projects.map((project) => project.id);
  const fixturePath = argv.get("--fixture");
  const actual = fixturePath
    ? (JSON.parse(
        readFileSync(resolve(fixturePath), "utf8"),
      ) as LinearFingerprint)
    : await fetchLinearFingerprint(fetch, process.env.LINEAR_API_KEY ?? "", {
        projectIds,
      });
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
