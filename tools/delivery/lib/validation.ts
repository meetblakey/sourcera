import type { EvidenceGroup } from "./evidence.js";
import type { Finding, ReleaseDefinition } from "./model.js";

const RELEASE_METRICS = [
  "activation",
  "completion",
  "timeToValue",
  "abandonment",
  "trust",
  "reliability",
  "support",
] as const;

export interface ValidationPlan {
  schemaVersion?: unknown;
  releaseValidation?: unknown;
  customerProof?: unknown;
  operationalProof?: unknown;
  forecastProof?: unknown;
  executionEvidence?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function proofPaths(value: unknown): string[] {
  return isStringArray(value) ? value : [];
}

function isConcreteMetric(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !/\b(?:tbd|todo|fixme|placeholder)\b/i.test(value)
  );
}

export function validationEvidenceGroups(
  plan: ValidationPlan,
): EvidenceGroup[] {
  const execution = isObject(plan.executionEvidence)
    ? plan.executionEvidence
    : {};
  return [
    { kind: "customer", paths: proofPaths(plan.customerProof) },
    { kind: "operational", paths: proofPaths(plan.operationalProof) },
    { kind: "forecast", paths: proofPaths(plan.forecastProof) },
    { kind: "tests", paths: proofPaths(execution.tests) },
    { kind: "deploy", paths: proofPaths(execution.deploy) },
    { kind: "rollback", paths: proofPaths(execution.rollback) },
    { kind: "runtime", paths: proofPaths(execution.runtime) },
  ];
}

export function validationPlanFindings(
  plan: ValidationPlan,
  releases: ReleaseDefinition[],
): Finding[] {
  const findings: Finding[] = [];
  const add = (message: string) =>
    findings.push({ code: "validation_plan_invalid", message });

  if (plan.schemaVersion !== 1) add("validation plan schemaVersion must be 1");

  const rows = Array.isArray(plan.releaseValidation)
    ? plan.releaseValidation
    : [];
  if (!Array.isArray(plan.releaseValidation)) {
    add("releaseValidation must be an array");
  }
  const releaseIds = releases.map((release) => release.id);
  const seen = new Set<string>();
  for (const value of rows) {
    if (!isObject(value) || typeof value.release !== "string") {
      add("every releaseValidation row needs a release id");
      continue;
    }
    if (!releaseIds.includes(value.release as ReleaseDefinition["id"])) {
      add(`${value.release} is not a defined release`);
    }
    if (seen.has(value.release)) add(`${value.release} is duplicated`);
    seen.add(value.release);
    for (const metric of RELEASE_METRICS) {
      if (!isConcreteMetric(value[metric])) {
        add(`${value.release} is missing ${metric}`);
      }
    }
  }
  for (const releaseId of releaseIds) {
    if (!seen.has(releaseId)) add(`${releaseId} has no validation row`);
  }

  for (const [name, value] of [
    ["customerProof", plan.customerProof],
    ["operationalProof", plan.operationalProof],
    ["forecastProof", plan.forecastProof],
  ] as const) {
    if (!isStringArray(value)) add(`${name} must be an array of proof paths`);
  }
  if (!isObject(plan.executionEvidence)) {
    add("executionEvidence must be an object");
  } else {
    for (const kind of ["tests", "deploy", "rollback", "runtime"] as const) {
      if (!isStringArray(plan.executionEvidence[kind])) {
        add(`executionEvidence.${kind} must be an array of proof paths`);
      }
    }
  }
  return findings;
}
