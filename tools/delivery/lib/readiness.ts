import type { Finding, LinearIssueSnapshot } from "./model.js";

export interface ReadinessContext {
  ticketIntegrityFindings?: Finding[];
}

export function readinessFindings(
  issue: LinearIssueSnapshot,
  context: ReadinessContext = {},
): Finding[] {
  const findings: Finding[] = [];
  const add = (condition: boolean, code: string, message: string) => {
    if (condition) findings.push({ code, issueId: issue.id, message });
  };

  add(
    issue.kind !== "executable",
    "parent_not_executable",
    `${issue.id} is not executable work`,
  );
  add(
    !issue.outcome?.trim(),
    "outcome_missing",
    `${issue.id} lacks one outcome`,
  );
  add(
    !issue.sourceVersion || !issue.sourceSection,
    "source_not_pinned",
    `${issue.id} source is not pinned`,
  );
  add(
    !issue.release || !issue.milestone,
    "release_or_milestone_missing",
    `${issue.id} lacks release or milestone`,
  );
  add(
    !issue.owner || !issue.reviewer,
    "owner_or_reviewer_missing",
    `${issue.id} lacks owner or reviewer`,
  );
  add(
    issue.estimate === null || issue.estimate < 1 || issue.estimate > 5,
    "estimate_invalid",
    `${issue.id} estimate must be 1–5`,
  );
  add(
    !issue.paths.length ||
      issue.paths.some((path) => path.includes("*") || path.endsWith("/")),
    "path_not_concrete",
    `${issue.id} paths are not concrete`,
  );
  add(
    !issue.tests.success,
    "success_test_missing",
    `${issue.id} lacks success test`,
  );
  add(
    !issue.tests.failure,
    "failure_test_missing",
    `${issue.id} lacks failure test`,
  );
  add(
    !issue.tests.recovery,
    "recovery_test_missing",
    `${issue.id} lacks recovery test`,
  );
  add(!issue.rollout, "rollout_missing", `${issue.id} lacks rollout`);
  add(!issue.rollback, "rollback_missing", `${issue.id} lacks rollback`);
  add(
    !issue.telemetry,
    "telemetry_missing",
    `${issue.id} lacks telemetry or rationale`,
  );
  add(!issue.proof, "proof_missing", `${issue.id} lacks named proof`);
  const serialized = JSON.stringify(issue);
  add(
    serialized.includes("…") || /\b(?:TBD|TODO|placeholder)\b/i.test(serialized),
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
