import { createHash } from "node:crypto";

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

export interface ResolvedJourneyTarget {
  sha256: string;
  target: Record<string, unknown>;
}

export type ResolvedJourneyTargets = Record<
  string,
  Record<string, ResolvedJourneyTarget>
>;

const JOURNEY_TARGET_KEYS = [
  "journeyId",
  "targetSetId",
  "targetSetVersion",
  "sourceVersion",
  "sourceChecksum",
  "windows",
  "sampleRules",
  "safetyCohort",
  "approval",
  "proofGates",
  "metrics",
] as const;

const APPROVAL_KEYS = [
  "state",
  "reference",
  "approvedAt",
  "accountableOwnerKeyRef",
  "independentReviewerKeyRef",
  "authorMayApprove",
  "pilotOperatorMayApprove",
  "maximumAgeDays",
  "maximumReleaseCandidates",
] as const;

const WINDOW_KEYS = ["key", "duration", "unit", "startsAt"] as const;
const SAMPLE_RULE_KEYS = [
  "key",
  "basis",
  "minimumRuns",
  "minimumDistinctOrganizations",
] as const;
const SAFETY_COHORT_KEYS = [
  "runs",
  "participants",
  "distinctOrganizations",
  "satisfiesReleaseGate",
] as const;
const PROOF_GATE_KEYS = ["requireAll", "customer", "operational"] as const;
const METRIC_KEYS = [
  "metric",
  "key",
  "proof",
  "sampleRule",
  "windows",
  "thresholds",
] as const;
const THRESHOLD_KEYS = ["statistic", "operator", "value", "unit"] as const;

const TARGET_HASH_DOMAIN = "sourcera-journey-target-v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const expected = [...keys].sort();
  return (
    Object.keys(value).sort().length === expected.length &&
    Object.keys(value)
      .sort()
      .every((key, index) => key === expected[index])
  );
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isIsoUtc(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function journeyTargetStructuralMessages(target: unknown): string[] {
  if (!isObject(target)) return ["journey target is malformed"];
  const journeyId =
    typeof target.journeyId === "string" && target.journeyId.trim()
      ? target.journeyId
      : "journey target";
  const messages: string[] = [];
  if (
    !hasExactKeys(target, JOURNEY_TARGET_KEYS) ||
    !/^F-\d+$/.test(String(target.journeyId ?? "")) ||
    !isConcreteMetric(target.targetSetId) ||
    !isPositiveInteger(target.targetSetVersion) ||
    !isConcreteMetric(target.sourceVersion) ||
    typeof target.sourceChecksum !== "string" ||
    !/^[a-f0-9]{64}$/.test(target.sourceChecksum)
  ) {
    messages.push(`${journeyId} journey target is incomplete`);
  }

  const windowIds = new Set<string>();
  if (!Array.isArray(target.windows) || target.windows.length === 0) {
    messages.push(`${journeyId} windows are incomplete`);
  } else {
    target.windows.forEach((window, index) => {
      if (
        !isObject(window) ||
        !hasExactKeys(window, WINDOW_KEYS) ||
        !isConcreteMetric(window.key) ||
        !isPositiveInteger(window.duration) ||
        !["calendar_days", "active_seconds"].includes(String(window.unit)) ||
        !isConcreteMetric(window.startsAt)
      ) {
        messages.push(`${journeyId} window ${index + 1} is invalid`);
        return;
      }
      if (windowIds.has(window.key)) {
        messages.push(`${journeyId} window ${window.key} is duplicated`);
      }
      windowIds.add(window.key);
    });
  }

  const sampleRuleIds = new Set<string>();
  if (!Array.isArray(target.sampleRules) || target.sampleRules.length === 0) {
    messages.push(`${journeyId} sample rules are incomplete`);
  } else {
    target.sampleRules.forEach((rule, index) => {
      if (
        !isObject(rule) ||
        !hasExactKeys(rule, SAMPLE_RULE_KEYS) ||
        !isConcreteMetric(rule.key) ||
        !["valid_started_runs", "valid_completed_runs"].includes(
          String(rule.basis),
        ) ||
        !isPositiveInteger(rule.minimumRuns) ||
        !isPositiveInteger(rule.minimumDistinctOrganizations)
      ) {
        messages.push(`${journeyId} sample rule ${index + 1} is invalid`);
        return;
      }
      if (sampleRuleIds.has(rule.key)) {
        messages.push(`${journeyId} sample rule ${rule.key} is duplicated`);
      }
      sampleRuleIds.add(rule.key);
    });
  }

  if (
    !isObject(target.safetyCohort) ||
    !hasExactKeys(target.safetyCohort, SAFETY_COHORT_KEYS) ||
    !isPositiveInteger(target.safetyCohort.runs) ||
    !isPositiveInteger(target.safetyCohort.participants) ||
    !isPositiveInteger(target.safetyCohort.distinctOrganizations) ||
    target.safetyCohort.satisfiesReleaseGate !== false
  ) {
    messages.push(`${journeyId} safety cohort is invalid`);
  }

  if (
    !isObject(target.approval) ||
    !hasExactKeys(target.approval, APPROVAL_KEYS) ||
    !["pending", "approved"].includes(String(target.approval.state)) ||
    !isConcreteMetric(target.approval.reference) ||
    !isConcreteMetric(target.approval.accountableOwnerKeyRef) ||
    !isConcreteMetric(target.approval.independentReviewerKeyRef) ||
    target.approval.accountableOwnerKeyRef ===
      target.approval.independentReviewerKeyRef ||
    target.approval.authorMayApprove !== false ||
    target.approval.pilotOperatorMayApprove !== false ||
    !isPositiveInteger(target.approval.maximumAgeDays) ||
    Number(target.approval.maximumAgeDays) > 90 ||
    target.approval.maximumReleaseCandidates !== 1 ||
    (target.approval.state === "pending" &&
      target.approval.approvedAt !== null) ||
    (target.approval.state === "approved" &&
      !isIsoUtc(target.approval.approvedAt))
  ) {
    messages.push(`${journeyId} approval is incomplete or invalid`);
  }

  const metricNames = new Set<string>();
  const metricIds = new Set<string>();
  const proofByMetric = new Map<string, string>();
  if (!Array.isArray(target.metrics) || target.metrics.length !== 7) {
    messages.push(`${journeyId} must define exactly seven metrics`);
  }
  if (Array.isArray(target.metrics)) {
    target.metrics.forEach((metric, metricIndex) => {
      if (
        !isObject(metric) ||
        !hasExactKeys(metric, METRIC_KEYS) ||
        !RELEASE_METRICS.includes(
          metric.metric as (typeof RELEASE_METRICS)[number],
        ) ||
        !isConcreteMetric(metric.key) ||
        !["customer", "operational"].includes(String(metric.proof)) ||
        !isConcreteMetric(metric.sampleRule) ||
        !isStringArray(metric.windows) ||
        !Array.isArray(metric.thresholds) ||
        metric.thresholds.length === 0
      ) {
        messages.push(`${journeyId} metric ${metricIndex + 1} is incomplete`);
        return;
      }
      const metricName = metric.metric as string;
      const metricKey = metric.key as string;
      const metricProof = metric.proof as string;
      const sampleRule = metric.sampleRule as string;
      const metricWindows = metric.windows as string[];
      if (metricNames.has(metricName)) {
        messages.push(`${journeyId} metric ${metricName} is duplicated`);
      }
      if (metricIds.has(metricKey)) {
        messages.push(`${journeyId} metric key ${metricKey} is duplicated`);
      }
      metricNames.add(metricName);
      metricIds.add(metricKey);
      proofByMetric.set(metricKey, metricProof);
      if (!sampleRuleIds.has(sampleRule)) {
        messages.push(
          `${journeyId} metric ${metricKey} references unknown sample rule`,
        );
      }
      for (const window of metricWindows) {
        if (!windowIds.has(window)) {
          messages.push(
            `${journeyId} metric ${metricKey} references unknown window`,
          );
        }
      }
      if (new Set(metric.windows).size !== metric.windows.length) {
        messages.push(`${journeyId} metric ${metric.key} duplicates a window`);
      }
      const statistics = new Set<string>();
      metric.thresholds.forEach((threshold, thresholdIndex) => {
        const validObject =
          isObject(threshold) && hasExactKeys(threshold, THRESHOLD_KEYS);
        const unit = validObject ? String(threshold.unit) : "";
        const value = validObject ? threshold.value : Number.NaN;
        const validValue =
          typeof value === "number" &&
          Number.isFinite(value) &&
          ((unit === "ratio" && value >= 0 && value <= 1) ||
            (unit === "seconds" && value >= 0) ||
            (unit === "count" && isNonNegativeInteger(value)));
        if (
          !validObject ||
          !isConcreteMetric(threshold.statistic) ||
          ![">=", "<=", "="].includes(String(threshold.operator)) ||
          !validValue
        ) {
          messages.push(
            `${journeyId} metric ${metric.key} threshold ${thresholdIndex + 1} is invalid`,
          );
          return;
        }
        if (statistics.has(threshold.statistic)) {
          messages.push(
            `${journeyId} metric ${metric.key} threshold ${threshold.statistic} is duplicated`,
          );
        }
        statistics.add(threshold.statistic);
      });
    });
  }
  for (const metric of RELEASE_METRICS) {
    if (!metricNames.has(metric)) {
      messages.push(`${journeyId} is missing ${metric} target metric`);
    }
  }

  if (
    !isObject(target.proofGates) ||
    !hasExactKeys(target.proofGates, PROOF_GATE_KEYS) ||
    target.proofGates.requireAll !== true ||
    !isStringArray(target.proofGates.customer) ||
    !isStringArray(target.proofGates.operational)
  ) {
    messages.push(`${journeyId} proof gates are incomplete`);
  } else {
    const gated = [
      ...target.proofGates.customer,
      ...target.proofGates.operational,
    ];
    if (
      new Set(gated).size !== gated.length ||
      gated.length !== metricIds.size ||
      gated.some((metric) => !metricIds.has(metric)) ||
      target.proofGates.customer.some(
        (metric) => proofByMetric.get(metric) !== "customer",
      ) ||
      target.proofGates.operational.some(
        (metric) => proofByMetric.get(metric) !== "operational",
      )
    ) {
      messages.push(`${journeyId} proof gates do not match its metrics`);
    }
  }
  return [...new Set(messages)];
}

export function resolvedJourneyTargets(
  plan: ValidationPlan,
): ResolvedJourneyTargets {
  const candidates: Array<{
    journeyId: string;
    release: string;
    target: Record<string, unknown>;
  }> = [];
  const rows = Array.isArray(plan.releaseValidation)
    ? plan.releaseValidation
    : [];
  for (const row of rows) {
    if (
      !isObject(row) ||
      typeof row.release !== "string" ||
      !Array.isArray(row.journeyTargets)
    ) {
      continue;
    }
    for (const target of row.journeyTargets) {
      if (
        isObject(target) &&
        typeof target.journeyId === "string" &&
        journeyTargetStructuralMessages(target).length === 0
      ) {
        candidates.push({
          journeyId: target.journeyId,
          release: row.release,
          target,
        });
      }
    }
  }
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    counts.set(candidate.journeyId, (counts.get(candidate.journeyId) ?? 0) + 1);
  }
  const resolved: ResolvedJourneyTargets = {};
  for (const candidate of candidates.sort((left, right) =>
    `${left.release}:${left.journeyId}`.localeCompare(
      `${right.release}:${right.journeyId}`,
    ),
  )) {
    if (counts.get(candidate.journeyId) !== 1) continue;
    const target = canonicalize(candidate.target) as Record<string, unknown>;
    const sha256 = createHash("sha256")
      .update(JSON.stringify([TARGET_HASH_DOMAIN, target]), "utf8")
      .digest("hex");
    resolved[candidate.release] ??= {};
    resolved[candidate.release][candidate.journeyId] = { sha256, target };
  }
  return resolved;
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

  if (plan.schemaVersion !== 2) add("validation plan schemaVersion must be 2");

  const rows = Array.isArray(plan.releaseValidation)
    ? plan.releaseValidation
    : [];
  if (!Array.isArray(plan.releaseValidation)) {
    add("releaseValidation must be an array");
  }
  const releaseIds = releases.map((release) => release.id);
  const seen = new Set<string>();
  const targetReleaseById = new Map<string, string>();
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
    if (!Array.isArray(value.journeyTargets)) {
      add(`${value.release} journeyTargets must be an array`);
      continue;
    }
    const targetIds = new Set<string>();
    for (const target of value.journeyTargets) {
      const journeyId =
        isObject(target) && typeof target.journeyId === "string"
          ? target.journeyId
          : "unknown";
      if (targetIds.has(journeyId)) {
        add(`${value.release} journey target ${journeyId} is duplicated`);
      }
      targetIds.add(journeyId);
      const priorRelease = targetReleaseById.get(journeyId);
      if (priorRelease && priorRelease !== value.release) {
        add(
          `journey target ${journeyId} is duplicated across ${priorRelease} and ${value.release}`,
        );
      } else if (!priorRelease) {
        targetReleaseById.set(journeyId, value.release);
      }
      const structuralMessages = journeyTargetStructuralMessages(target);
      for (const message of structuralMessages) {
        add(message);
      }
      if (
        isObject(target) &&
        isObject(target.approval) &&
        target.approval.state === "pending" &&
        !structuralMessages.some((message) => message.includes("approval"))
      ) {
        add(`${journeyId} approval is pending`);
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
