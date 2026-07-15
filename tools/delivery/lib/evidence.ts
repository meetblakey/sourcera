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
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

interface EvidenceReceipt {
  schemaVersion?: unknown;
  issue?: unknown;
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

function commitPrecedes(
  root: string,
  first: unknown,
  closeout: unknown,
): boolean {
  if (typeof first !== "string" || typeof closeout !== "string") return false;
  return (
    spawnSync(
      "git",
      ["-C", root, "merge-base", "--is-ancestor", first, closeout],
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
        commitIsReachable(root, observation.closeoutCommit) &&
        commitPrecedes(
          root,
          observation.firstImplementationCommit,
          observation.closeoutCommit,
        ),
    )
  );
}

function isAcceptedReviewReceipt(
  value: unknown,
  observation: Record<string, unknown>,
): boolean {
  if (
    !isObject(value) ||
    value.schemaVersion !== 1 ||
    value.status !== "passed" ||
    value.issue !== observation.issue
  ) {
    return false;
  }
  const directReview =
    typeof value.reviewedAt === "string" &&
    !Number.isNaN(Date.parse(value.reviewedAt)) &&
    typeof value.reviewer === "string" &&
    value.reviewer.trim().length > 0 &&
    typeof value.reviewType === "string" &&
    value.reviewType.trim().length > 0 &&
    Array.isArray(value.findings) &&
    value.findings.length === 0 &&
    value.verdict === "accepted" &&
    isObject(value.scope) &&
    value.scope.firstImplementationCommit ===
      observation.firstImplementationCommit &&
    value.scope.closeoutCommit === observation.closeoutCommit &&
    value.scope.evidence === observation.runtimeEvidence;
  const embeddedReview =
    isObject(value.review) &&
    value.review.criticalFindings === 0 &&
    value.review.importantFindingsRemaining === 0 &&
    value.review.verdict === "ready-to-push";
  return directReview || embeddedReview;
}

function forecastReferenceFinding(
  root: string,
  receipt: EvidenceReceipt,
): Finding | null {
  if (!Array.isArray(receipt.observations)) return null;
  const evidenceRoot = resolve(root, "reports/evidence");
  const realEvidenceRoot = realpathSync(evidenceRoot);
  for (const observation of receipt.observations) {
    if (!isObject(observation)) continue;
    for (const key of ["reviewEvidence", "runtimeEvidence"] as const) {
      const value = observation[key];
      if (typeof value !== "string") continue;
      const referencePath = resolve(root, value);
      if (!referencePath.startsWith(`${evidenceRoot}${sep}`)) {
        return {
          code: "evidence_reference_invalid",
          message: `${value} is outside reports/evidence`,
        };
      }
      if (!existsSync(referencePath)) {
        return {
          code: "evidence_reference_missing",
          message: `${value} does not exist`,
        };
      }
      if (!realpathSync(referencePath).startsWith(`${realEvidenceRoot}${sep}`)) {
        return {
          code: "evidence_reference_invalid",
          message: `${value} resolves outside reports/evidence`,
        };
      }
      if (key === "runtimeEvidence") {
        try {
          const linkedReceipt = JSON.parse(
            readFileSync(referencePath, "utf8"),
          ) as EvidenceReceipt;
          if (
            !isValidReceipt(linkedReceipt, "runtime") ||
            !receiptCommitsAreReachable(root, linkedReceipt, "runtime") ||
            linkedReceipt.issue !== observation.issue
          ) {
            return {
              code: "evidence_reference_invalid",
              message: `${value} is not runtime proof for ${String(observation.issue)}`,
            };
          }
        } catch {
          return {
            code: "evidence_reference_invalid",
            message: `${value} is not valid runtime proof JSON`,
          };
        }
      } else {
        try {
          const linkedReview = JSON.parse(
            readFileSync(referencePath, "utf8"),
          ) as unknown;
          if (!isAcceptedReviewReceipt(linkedReview, observation)) {
            return {
              code: "evidence_reference_invalid",
              message: `${value} is not accepted review proof for ${String(observation.issue)}`,
            };
          }
        } catch {
          return {
            code: "evidence_reference_invalid",
            message: `${value} is not valid review proof JSON`,
          };
        }
      }
    }
  }
  return null;
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
    Date.parse(value.completedAt) > Date.parse(value.startedAt) &&
    typeof value.activeSeconds === "number" &&
    value.activeSeconds > 0 &&
    value.activeSeconds <=
      (Date.parse(value.completedAt) - Date.parse(value.startedAt)) / 1000 &&
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

function forecastObservedAfterCompletion(receipt: EvidenceReceipt): boolean {
  if (
    typeof receipt.observedAt !== "string" ||
    !Array.isArray(receipt.observations)
  ) {
    return false;
  }
  const observedAt = Date.parse(receipt.observedAt);
  return receipt.observations.every(
    (observation) =>
      isObject(observation) &&
      typeof observation.completedAt === "string" &&
      Date.parse(observation.completedAt) <= observedAt,
  );
}

function isValidReceipt(receipt: EvidenceReceipt, kind: EvidenceKind): boolean {
  const commonValid =
    receipt.schemaVersion === 1 &&
    receipt.status === "passed" &&
    Array.isArray(receipt.proofTypes) &&
    receipt.proofTypes.includes(kind) &&
    typeof receipt.observedAt === "string" &&
    !Number.isNaN(Date.parse(receipt.observedAt)) &&
    Date.parse(receipt.observedAt) <= Date.now() + MAX_CLOCK_SKEW_MS;
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
    forecastObservedAfterCompletion(receipt) &&
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
    if (group.kind === "forecast") {
      const referenceFinding = forecastReferenceFinding(root, receipt);
      if (referenceFinding) return [referenceFinding];
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
