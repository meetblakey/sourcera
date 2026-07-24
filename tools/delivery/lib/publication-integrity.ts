import type { Finding } from "./model.js";

export interface PublicationIntegrityInput {
  planningFindings: Finding[];
  graphFindings: Finding[];
  codexReadyFindings: Finding[];
  validationFindings: Finding[];
  operatingFindings: Finding[];
  journeyFindings: Finding[];
}

export interface PublicationIntegritySummary {
  schemaVersion: 1;
  passed: boolean;
  blockingFindingCount: number;
}

const NONBLOCKING_OPERATING_CODES = new Set([
  "ready_queue_under_minimum",
  "ready_queue_over_maximum",
  "wip_limit_exceeded",
  "started_issue_not_ready",
]);

const NONBLOCKING_JOURNEY_CODES = new Set([
  "checkpoint_evidence_context_invalid",
  "checkpoint_evidence_commit_missing",
  "checkpoint_evidence_commit_unreachable",
  "checkpoint_commit_mismatch",
  "checkpoint_commit_unreachable",
  "checkpoint_evidence_invalid",
  "checkpoint_evidence_mismatch",
  "checkpoint_evidence_missing",
]);

function approvalIsPending(finding: Finding): boolean {
  return (
    finding.code === "validation_plan_invalid" &&
    /\bapproval is pending\b/i.test(finding.message)
  );
}

export function publicationIntegrityFindings(
  input: PublicationIntegrityInput,
): Finding[] {
  return [
    ...input.planningFindings,
    ...input.graphFindings,
    ...input.codexReadyFindings,
    ...input.validationFindings.filter((finding) => !approvalIsPending(finding)),
    ...input.operatingFindings.filter(
      (finding) => !NONBLOCKING_OPERATING_CODES.has(finding.code),
    ),
    ...input.journeyFindings.filter(
      (finding) => !NONBLOCKING_JOURNEY_CODES.has(finding.code),
    ),
  ];
}

export function publicationIntegritySummary(
  findings: Finding[],
): PublicationIntegritySummary {
  return {
    schemaVersion: 1,
    passed: findings.length === 0,
    blockingFindingCount: findings.length,
  };
}

export function assertPublicationIntegrityReport(
  value: unknown,
): PublicationIntegritySummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Publication integrity report is missing");
  }
  const summary = (value as { publicationIntegrity?: unknown })
    .publicationIntegrity;
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    throw new Error("Publication integrity report is missing");
  }
  const candidate = summary as Partial<PublicationIntegritySummary>;
  if (
    candidate.schemaVersion !== 1 ||
    typeof candidate.passed !== "boolean" ||
    !Number.isSafeInteger(candidate.blockingFindingCount) ||
    Number(candidate.blockingFindingCount) < 0 ||
    candidate.passed !== (candidate.blockingFindingCount === 0)
  ) {
    throw new Error("Publication integrity report is invalid");
  }
  if (!candidate.passed) {
    throw new Error(
      `Publication integrity has ${candidate.blockingFindingCount} blocking findings`,
    );
  }
  return candidate as PublicationIntegritySummary;
}
