#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import { validateGraph } from "./lib/graph.js";
import { buildReleaseAssignments } from "./lib/release-policy.js";
import type {
  Disposition,
  ManifestRow,
  ReleaseDefinition,
  ReleasePolicy,
} from "./lib/model.js";
import {
  parseFeatureInventory,
  parseRuntimeGate,
} from "./lib/sources.js";

interface DispositionOverride {
  requirementId: string;
  disposition: Disposition;
}

interface RuntimeGateDependency {
  requirementId: string;
  dependencies: string[];
}

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    values.set(name, value);
  }
  return values;
}

const argv = argumentsByName();
if (argv.has("--inventory") && !argv.has("--feature-dependencies")) {
  throw new Error(
    "--feature-dependencies is required when --inventory is supplied",
  );
}
if (argv.has("--inventory") && !argv.has("--policy")) {
  throw new Error("--policy is required when --inventory is supplied");
}

const root = resolve(argv.get("--root") ?? ".");
const inventoryPath = resolve(
  root,
  argv.get("--inventory") ?? "_audit/FEATURE_INVENTORY.md",
);
const stampPath = resolve(
  root,
  argv.get("--stamp") ?? "/tmp/sourcera-stamp.json",
);
const dispositionsPath = resolve(
  root,
  argv.get("--dispositions") ?? "delivery/dispositions.json",
);
const runtimeDependenciesPath = resolve(
  root,
  argv.get("--runtime-dependencies") ??
    "delivery/runtime-gate-dependencies.json",
);
const featureDependenciesPath = resolve(
  root,
  argv.get("--feature-dependencies") ??
    "delivery/feature-dependencies.json",
);
const policyPath = resolve(
  root,
  argv.get("--policy") ?? "delivery/release-policy.json",
);
const releasesPath = resolve(
  root,
  argv.get("--releases") ?? "delivery/releases.json",
);
const outPath = resolve(
  root,
  argv.get("--out") ?? "delivery/release-plan.json",
);

const overrides = JSON.parse(readFileSync(dispositionsPath, "utf8")) as {
  overrides: DispositionOverride[];
};
const dispositionById = new Map(
  overrides.overrides.map((row) => [row.requirementId, row.disposition]),
);
const featureDependencies = JSON.parse(
  readFileSync(featureDependenciesPath, "utf8"),
) as { repairs: FeatureDependencyRepair[] };
const runtimeOwners = (
  JSON.parse(readFileSync(runtimeDependenciesPath, "utf8")) as {
    dependencies: RuntimeGateDependency[];
  }
).dependencies;
const policy = JSON.parse(
  readFileSync(policyPath, "utf8"),
) as ReleasePolicy;
const releases = (
  JSON.parse(readFileSync(releasesPath, "utf8")) as {
    releases: ReleaseDefinition[];
  }
).releases;

const sourceFeatures = applyFeatureDependencies(
  parseFeatureInventory(readFileSync(inventoryPath, "utf8")).map((row) => ({
    ...row,
    disposition: dispositionById.get(row.requirementId) ?? row.disposition,
  })),
  featureDependencies.repairs,
);
const sourceGraphFindings = validateGraph(
  sourceFeatures.map<ManifestRow>((row) => ({
    ...row,
    release: null,
    issueId: null,
  })),
  releases,
);
if (sourceGraphFindings.length) {
  throw new Error(
    `Source feature graph invalid:\n${sourceGraphFindings
      .map((finding) => `${finding.code}: ${finding.message}`)
      .join("\n")}`,
  );
}
const executableIds = new Set(
  sourceFeatures
    .filter((row) => row.disposition === "executable")
    .map((row) => row.requirementId),
);
// Scheduling uses executable feature identities only. Proof-only source rows stay
// intact in the validated graph and are scheduled through their live RG owner.
const executablePolicyGraph = sourceFeatures
  .filter((row) => row.disposition === "executable")
  .map((row) => ({
    ...row,
    dependencies: row.dependencies.filter((dependencyId) =>
      executableIds.has(dependencyId),
    ),
  }));
const runtimeGates = parseRuntimeGate(readFileSync(stampPath, "utf8"));
const assignments = buildReleaseAssignments(
  executablePolicyGraph,
  runtimeGates,
  policy,
  runtimeOwners,
  releases,
).sort((left, right) =>
  left.requirementId.localeCompare(right.requirementId, undefined, {
    numeric: true,
  }),
);

writeFileSync(outPath, `${JSON.stringify({ assignments }, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ assignments: assignments.length })}\n`,
);
