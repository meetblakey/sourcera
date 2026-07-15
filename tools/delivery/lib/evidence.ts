import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve, sep } from "node:path";

import type { Finding } from "./model.js";

export type EvidenceKind =
  | "customer"
  | "operational"
  | "forecast"
  | "tests"
  | "deploy"
  | "rollback"
  | "runtime";

export interface EvidenceGroup {
  kind: EvidenceKind;
  paths: string[];
}

const RELEASE_GATE_METRICS = [
  "activation",
  "completion",
  "timeToValue",
  "abandonment",
  "trust",
  "reliability",
  "support",
] as const;

interface EvidenceReceipt {
  schemaVersion?: unknown;
  status?: unknown;
  proofTypes?: unknown;
  observedAt?: unknown;
  sourceCommit?: unknown;
  release?: unknown;
  metrics?: unknown;
  gate?: unknown;
  local?: unknown;
  staging?: unknown;
  previews?: unknown;
  rollback?: unknown;
  policy?: unknown;
  observations?: unknown;
  baseline?: unknown;
  next?: unknown;
  recalibrationTrigger?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPassed(value: unknown): boolean {
  return typeof value === "string" && value.startsWith("passed");
}

function commitIsReachable(root: string, value: unknown): boolean {
  if (typeof value !== "string" || !/^[a-f0-9]{40}$/.test(value)) {
    return false;
  }
  return (
    spawnSync(
      "git",
      ["-C", root, "merge-base", "--is-ancestor", value, "HEAD"],
      { stdio: "ignore" },
    ).status === 0
  );
}

function receiptCommitsAreReachable(
  root: string,
  receipt: EvidenceReceipt,
  kind: EvidenceKind,
): boolean {
  if (kind !== "forecast") {
    return commitIsReachable(root, receipt.sourceCommit);
  }
  return (
    Array.isArray(receipt.observations) &&
    receipt.observations.every(
      (observation) =>
        isObject(observation) &&
        commitIsReachable(root, observation.firstImplementationCommit) &&
        commitIsReachable(root, observation.closeoutCommit),
    )
  );
}

function hasCompleteReleaseMetrics(value: unknown): boolean {
  if (!isObject(value)) return false;
  return RELEASE_GATE_METRICS.every((name) => {
    const metric = value[name];
    return (
      isObject(metric) &&
      Object.hasOwn(metric, "target") &&
      Object.hasOwn(metric, "observed") &&
      metric.target !== null &&
      metric.target !== undefined &&
      metric.observed !== null &&
      metric.observed !== undefined &&
      metric.result === "passed"
    );
  });
}

function hasPassingCommands(receipt: EvidenceReceipt): boolean {
  if (!isObject(receipt.local) || !isObject(receipt.local.commands)) {
    return false;
  }
  const results = Object.values(receipt.local.commands);
  return results.length > 0 && results.every(isPassed);
}

function hasPassingDeployment(receipt: EvidenceReceipt): boolean {
  if (isObject(receipt.staging) && isPassed(receipt.staging.healthResult)) {
    return true;
  }
  return (
    Array.isArray(receipt.previews) &&
    receipt.previews.length > 0 &&
    receipt.previews.every(
      (preview) => isObject(preview) && isPassed(preview.healthResult),
    )
  );
}

function hasPassingRollback(receipt: EvidenceReceipt): boolean {
  return (
    isObject(receipt.rollback) &&
    (isPassed(receipt.rollback.healthResult) ||
      isPassed(receipt.rollback.result))
  );
}

function isMeasuredObservation(value: unknown): boolean {
  if (!isObject(value)) return false;
  return (
    typeof value.issue === "string" &&
    value.issue.trim().length > 0 &&
    typeof value.estimate === "number" &&
    value.estimate > 0 &&
    value.estimate <= 5 &&
    typeof value.firstImplementationCommit === "string" &&
    /^[a-f0-9]{40}$/.test(value.firstImplementationCommit) &&
    typeof value.closeoutCommit === "string" &&
    /^[a-f0-9]{40}$/.test(value.closeoutCommit) &&
    typeof value.startedAt === "string" &&
    !Number.isNaN(Date.parse(value.startedAt)) &&
    typeof value.completedAt === "string" &&
    !Number.isNaN(Date.parse(value.completedAt)) &&
    typeof value.activeSeconds === "number" &&
    value.activeSeconds > 0 &&
    typeof value.reviewEvidence === "string" &&
    value.reviewEvidence.startsWith("reports/evidence/") &&
    typeof value.runtimeEvidence === "string" &&
    value.runtimeEvidence.startsWith("reports/evidence/")
  );
}

function hasReconciledForecast(receipt: EvidenceReceipt): boolean {
  if (
    !Array.isArray(receipt.observations) ||
    !isObject(receipt.policy) ||
    !isObject(receipt.baseline) ||
    !isObject(receipt.next)
  ) {
    return false;
  }
  const observations = receipt.observations as Array<Record<string, unknown>>;
  const completedEstimate = observations.reduce(
    (sum, observation) => sum + Number(observation.estimate),
    0,
  );
  const activeSeconds = observations.reduce(
    (sum, observation) => sum + Number(observation.activeSeconds),
    0,
  );
  const pointsPerActiveHour = Number(
    (completedEstimate / (activeSeconds / 3600)).toFixed(2),
  );
  const activeRange = receipt.next.activeWorkMinutesAfterExternalUnblock;
  return (
    Number.isInteger(receipt.policy.laneCount) &&
    Number(receipt.policy.laneCount) > 0 &&
    Number.isInteger(receipt.policy.wipLimit) &&
    Number(receipt.policy.wipLimit) > 0 &&
    Number(receipt.policy.wipLimit) <= Number(receipt.policy.laneCount) &&
    typeof receipt.policy.calendarDates === "string" &&
    receipt.policy.calendarDates.trim().length > 0 &&
    typeof receipt.policy.measurement === "string" &&
    receipt.policy.measurement.trim().length > 0 &&
    receipt.baseline.completedEstimate === completedEstimate &&
    receipt.baseline.activeSeconds === activeSeconds &&
    receipt.baseline.pointsPerActiveHour === pointsPerActiveHour &&
    ["low", "medium", "high"].includes(String(receipt.baseline.confidence)) &&
    typeof receipt.next.issue === "string" &&
    receipt.next.issue.trim().length > 0 &&
    typeof receipt.next.estimate === "number" &&
    receipt.next.estimate > 0 &&
    receipt.next.estimate <= 5 &&
    isObject(activeRange) &&
    typeof activeRange.lower === "number" &&
    activeRange.lower > 0 &&
    typeof activeRange.upper === "number" &&
    activeRange.upper >= activeRange.lower &&
    (receipt.next.calendarDate === null ||
      (typeof receipt.next.calendarDate === "string" &&
        !Number.isNaN(Date.parse(receipt.next.calendarDate)))) &&
    typeof receipt.next.externalWait === "string" &&
    receipt.next.externalWait.trim().length > 0 &&
    typeof receipt.next.rule === "string" &&
    receipt.next.rule.trim().length > 0
  );
}

function isValidReceipt(receipt: EvidenceReceipt, kind: EvidenceKind): boolean {
  const commonValid =
    receipt.schemaVersion === 1 &&
    receipt.status === "passed" &&
    Array.isArray(receipt.proofTypes) &&
    receipt.proofTypes.includes(kind) &&
    typeof receipt.observedAt === "string" &&
    !Number.isNaN(Date.parse(receipt.observedAt));
  if (!commonValid) return false;
  if (kind !== "forecast") {
    const commitBound =
      typeof receipt.sourceCommit === "string" &&
      /^[a-f0-9]{40}$/.test(receipt.sourceCommit);
    if (!commitBound) return false;
    if (kind === "customer" || kind === "operational") {
      return (
        typeof receipt.release === "string" &&
        /^R[0-5]$/.test(receipt.release) &&
        hasCompleteReleaseMetrics(receipt.metrics) &&
        receipt.gate === "passed"
      );
    }
    if (kind === "tests") return hasPassingCommands(receipt);
    if (kind === "deploy" || kind === "runtime") {
      return hasPassingDeployment(receipt);
    }
    if (kind === "rollback") return hasPassingRollback(receipt);
    return false;
  }
  return (
    Array.isArray(receipt.observations) &&
    receipt.observations.length >= 2 &&
    receipt.observations.every(isMeasuredObservation) &&
    hasReconciledForecast(receipt) &&
    typeof receipt.recalibrationTrigger === "string" &&
    receipt.recalibrationTrigger.trim().length > 0
  );
}

export function evidenceGroupFindings(
  root: string,
  group: EvidenceGroup,
): Finding[] {
  return group.paths.flatMap((path) => {
    const evidenceRoot = resolve(root, "reports/evidence");
    const receiptPath = resolve(root, path);
    if (!receiptPath.startsWith(`${evidenceRoot}${sep}`)) {
      return [
        {
          code: "evidence_path_invalid",
          message: `${path} is outside reports/evidence`,
        },
      ];
    }
    if (!existsSync(receiptPath)) {
      return [
        {
          code: "evidence_missing",
          message: `${path} does not exist`,
        },
      ];
    }
    const realEvidenceRoot = realpathSync(evidenceRoot);
    const realReceiptPath = realpathSync(receiptPath);
    if (!realReceiptPath.startsWith(`${realEvidenceRoot}${sep}`)) {
      return [
        {
          code: "evidence_path_invalid",
          message: `${path} resolves outside reports/evidence`,
        },
      ];
    }
    let receipt: EvidenceReceipt;
    try {
      receipt = JSON.parse(
        readFileSync(receiptPath, "utf8"),
      ) as EvidenceReceipt;
    } catch {
      return [
        {
          code: "evidence_json_invalid",
          message: `${path} is not valid JSON`,
        },
      ];
    }
    if (!isValidReceipt(receipt, group.kind)) {
      return [
        {
          code: "evidence_receipt_invalid",
          message: `${path} is not a passed ${group.kind} proof receipt`,
        },
      ];
    }
    if (!receiptCommitsAreReachable(root, receipt, group.kind)) {
      return [
        {
          code: "evidence_commit_invalid",
          message: `${path} does not reference a reachable source commit`,
        },
      ];
    }
    return [];
  });
}

export function evidenceGroupPasses(
  root: string,
  group: EvidenceGroup,
): boolean {
  return (
    group.paths.length > 0 && evidenceGroupFindings(root, group).length === 0
  );
}
