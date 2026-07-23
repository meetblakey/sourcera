#!/usr/bin/env node
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const pairs: Array<[string, string]> = [];
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index];
  const value = process.argv[index + 1];
  if (!name?.startsWith("--") || !value) {
    throw new Error(`Invalid argument near ${name ?? "end of command"}`);
  }
  pairs.push([name, value]);
}
const argv = new Map(pairs);
const root = resolve(argv.get("--root") ?? ".");
const expected = resolve(
  root,
  argv.get("--reports") ?? "reports/delivery",
);
const committedReleasePlan = resolve(
  root,
  argv.get("--release-plan") ?? "delivery/release-plan.json",
);
const temporary = mkdtempSync(join(tmpdir(), "sourcera-delivery-verify-"));
const regeneratedReleasePlan = join(temporary, "release-plan.json");
const names = [
  "delivery-manifest.json",
  "traceability-map.json",
  "dependency-graph.json",
  "readiness-report.json",
  "drift-report.json",
  "release-scorecard.json",
  "journey-readiness.json",
];

try {
  const plannerFlagNames = new Set([
    "--root",
    "--linear",
    "--linear-project-scope",
    "--linear-program-scope",
    "--inventory",
    "--dispositions",
    "--feature-dependencies",
    "--stamp",
    "--runtime-dependencies",
    "--releases",
    "--policy",
  ]);
  const plannerArguments = pairs
    .filter(([name]) => plannerFlagNames.has(name))
    .flat();
  if (!argv.has("--root")) plannerArguments.push("--root", root);
  const planner = spawnSync(
    process.execPath,
    [
      "--import",
      resolve(root, "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
      resolve(root, "tools/delivery/build-release-plan.ts"),
      ...plannerArguments,
      "--out",
      regeneratedReleasePlan,
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (planner.status !== 0) {
    console.error(planner.stderr || "Release plan regeneration failed");
    process.exitCode = 1;
  } else if (
    !existsSync(committedReleasePlan) ||
    readFileSync(regeneratedReleasePlan, "utf8") !==
      readFileSync(committedReleasePlan, "utf8")
  ) {
    console.error("release plan differs from the native Linear readback");
    process.exitCode = 1;
  }
  if (!process.exitCode) {
    const forwarded = pairs
      .filter(([name]) => name !== "--reports" && name !== "--out")
      .flat();
    if (!argv.has("--root")) forwarded.push("--root", root);
    if (!argv.has("--roadmap")) {
      forwarded.push(
        "--roadmap",
        resolve(root, "delivery/roadmap-contract.json"),
      );
    }
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        resolve(root, "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        resolve(root, "tools/delivery/generate.ts"),
        ...forwarded,
        "--out",
        temporary,
      ],
      { cwd: root, encoding: "utf8" },
    );
    let different = false;
    for (const name of names) {
      const actualPath = join(temporary, name);
      const expectedPath = join(expected, name);
      if (!existsSync(actualPath) || !existsSync(expectedPath)) {
        console.error(`Generated report missing: ${name}`);
        different = true;
        break;
      }
      const actual = readFileSync(actualPath, "utf8");
      const committed = readFileSync(expectedPath, "utf8");
      if (actual !== committed) {
        console.error(`Generated report differs: ${name}`);
        different = true;
        break;
      }
    }
    if (result.status !== 0) {
      console.error(result.stderr || "Delivery findings remain");
    }
    process.exitCode = result.status === 0 && !different ? 0 : 1;
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
