import type { Finding, LinearIssueSnapshot } from "./model.js";

export interface ReadinessContext {
  ticketIntegrityFindings?: Finding[];
  descriptionContractVerified?: boolean;
}

export function readinessFindings(
  issue: LinearIssueSnapshot,
  context: ReadinessContext = {},
): Finding[] {
  const findings: Finding[] = [];
  const descriptionContractVerified =
    context.descriptionContractVerified === true;
  const add = (condition: boolean, code: string, message: string) => {
    if (condition) findings.push({ code, issueId: issue.id, message });
  };

  add(
    issue.kind !== "executable",
    "parent_not_executable",
    `${issue.id} is not executable work`,
  );
  add(
    !descriptionContractVerified && !issue.outcome?.trim(),
    "outcome_missing",
    `${issue.id} lacks one outcome`,
  );
  add(
    !descriptionContractVerified &&
      (!issue.sourceVersion || !issue.sourceSection),
    "source_not_pinned",
    `${issue.id} source is not pinned`,
  );
  add(
    !issue.release || !issue.milestone,
    "release_or_milestone_missing",
    `${issue.id} lacks release or milestone`,
  );
  add(
    !issue.owner || (!descriptionContractVerified && !issue.reviewer),
    "owner_or_reviewer_missing",
    `${issue.id} lacks owner or reviewer`,
  );
  add(
    issue.estimate === null || issue.estimate < 1 || issue.estimate > 5,
    "estimate_invalid",
    `${issue.id} estimate must be 1–5`,
  );
  add(
    !descriptionContractVerified &&
      (!issue.paths.length ||
        issue.paths.some((path) => path.includes("*") || path.endsWith("/"))),
    "path_not_concrete",
    `${issue.id} paths are not concrete`,
  );
  add(
    !descriptionContractVerified && !issue.tests.success,
    "success_test_missing",
    `${issue.id} lacks success test`,
  );
  add(
    !descriptionContractVerified && !issue.tests.failure,
    "failure_test_missing",
    `${issue.id} lacks failure test`,
  );
  add(
    !descriptionContractVerified && !issue.tests.recovery,
    "recovery_test_missing",
    `${issue.id} lacks recovery test`,
  );
  add(
    !descriptionContractVerified && !issue.rollout,
    "rollout_missing",
    `${issue.id} lacks rollout`,
  );
  add(
    !descriptionContractVerified && !issue.rollback,
    "rollback_missing",
    `${issue.id} lacks rollback`,
  );
  add(
    !descriptionContractVerified && !issue.telemetry,
    "telemetry_missing",
    `${issue.id} lacks telemetry or rationale`,
  );
  add(
    !descriptionContractVerified && !issue.proof,
    "proof_missing",
    `${issue.id} lacks named proof`,
  );
  const serialized = JSON.stringify(issue);
  add(
    !descriptionContractVerified &&
      (serialized.includes("…") || /\b(?:TBD|TODO|placeholder)\b/i.test(serialized)),
    "ambiguous_or_truncated",
    `${issue.id} contains truncated or placeholder text`,
  );
  const ticketIntegrityCodes = [
    ...new Set(
      (context.ticketIntegrityFindings ?? [])
        .filter((finding) => finding.issueId === issue.id)
        .map((finding) => finding.code),
    ),
  ].sort();
  add(
    ticketIntegrityCodes.length > 0,
    "ticket_integrity_failed",
    `${issue.id} fails ticket integrity: ${ticketIntegrityCodes.join(", ")}`,
  );
  return findings;
}

export function isCodexReady(issue: LinearIssueSnapshot): boolean {
  return readinessFindings(issue).length === 0;
}
