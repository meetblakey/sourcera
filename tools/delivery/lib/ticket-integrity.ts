import { descriptionFingerprint } from "./fingerprint.js";
import type { Finding, LinearIssueSnapshot } from "./model.js";
import { readinessFindings } from "./readiness.js";

const IMPORT_CAP = 240;

export interface LinearIssueDescriptionCapture {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  labels: string[];
}

export interface TicketIntegritySnapshot {
  issues: LinearIssueSnapshot[];
  linearFingerprint: {
    issues: Array<{
      identifier: string;
      title: string;
      descriptionFingerprint: string;
      updatedAt: string;
      labels: string[];
    }>;
  };
}

export interface TicketIntegrityCapture {
  schemaVersion?: number;
  issues: LinearIssueDescriptionCapture[];
}

export interface TicketSourceChecksumContract {
  schemaVersion: 1;
  sources: Array<{
    sourceId: string;
    sha256: string;
  }>;
}

export interface TicketIntegrityReport {
  schemaVersion: 1;
  findings: Finding[];
  readinessFindings: Finding[];
  passed: boolean;
}

function normalizedClause(line: string): string {
  return line
    .replace(/^\s*(?:[-*+]\s+\[[ xX]\]\s+|[-*+]\s+)/, "")
    .trim();
}

function findingOrder(left: Finding, right: Finding): number {
  return (
    (left.issueId ?? "").localeCompare(right.issueId ?? "") ||
    left.code.localeCompare(right.code) ||
    left.message.localeCompare(right.message)
  );
}

function descriptionFindings(
  issue: LinearIssueSnapshot,
  captured: LinearIssueDescriptionCapture,
  ready: boolean,
  expectedSourceChecksum: string | null,
): Finding[] {
  const issueId = issue.id;
  const description = captured.description ?? "";
  const lines = description.split(/\r?\n/).map((line, index) => ({
    line: normalizedClause(line),
    lineNumber: index + 1,
  }));
  const capped = lines.filter(
    ({ line }) => line && [...line].length === IMPORT_CAP,
  );
  const repeated = new Map<string, number[]>();
  for (const { line, lineNumber } of capped) {
    const lineNumbers = repeated.get(line) ?? [];
    lineNumbers.push(lineNumber);
    repeated.set(line, lineNumbers);
  }
  const findings: Finding[] = [];
  const repeatedLine = [...repeated.entries()].find(
    ([, lineNumbers]) => lineNumbers.length > 1,
  );
  if (repeatedLine) {
    findings.push({
      code: "ticket_description_repeated_cap",
      issueId,
      message:
        `${issueId} repeats a ${IMPORT_CAP}-character clause on lines ` +
        repeatedLine[1].join(", "),
    });
  }
  const midToken = capped.find(({ line }) => /[\p{L}\p{N}_]$/u.test(line));
  if (midToken) {
    findings.push({
      code: "ticket_description_cap_mid_token",
      issueId,
      message:
        `${issueId} has a ${IMPORT_CAP}-character clause ending mid-token ` +
      `on line ${midToken.lineNumber}`,
    });
  }
  if (/^F-\d+$/.test(issue.sourceId ?? "")) {
    const expected = issue.sourceId as string;
    const titleId = /^\[(F-\d+)\]/.exec(captured.title)?.[1] ?? null;
    if (titleId !== expected) {
      findings.push({
        code: "ticket_title_source_mismatch",
        issueId,
        message:
          `${issueId} title source ${titleId ?? "missing"} does not match ${expected}`,
      });
    }
    const bodyIds = [
      ...description.matchAll(
        /(?:Requirement\s+map(?:\s+ID)?|Requirement\s+ID)\s*:\s*`?(F-\d+)`?/gi,
      ),
    ].map((match) => match[1]);
    if (bodyIds.some((bodyId) => bodyId !== expected)) {
      findings.push({
        code: "ticket_body_source_mismatch",
        issueId,
        message:
          `${issueId} body source ${[...new Set(bodyIds)].sort().join(", ")} ` +
          `does not match ${expected}`,
      });
    }
    if (expectedSourceChecksum) {
      const declaredChecksum =
        /Canonical\s+source\s+checksum\s*:\s*(?:sha256:)?([a-f0-9]{64})/i
          .exec(description)?.[1]?.toLowerCase() ?? null;
      if (!declaredChecksum) {
        findings.push({
          code: "ticket_source_checksum_missing",
          issueId,
          message: `${issueId} lacks its canonical source checksum`,
        });
      } else if (declaredChecksum !== expectedSourceChecksum) {
        findings.push({
          code: "ticket_source_checksum_mismatch",
          issueId,
          message: `${issueId} canonical source checksum does not match ${expected}`,
        });
      }
    }
  }
  let inPathSection = false;
  let wildcardPath: string | null = null;
  for (const rawLine of description.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(rawLine);
    if (heading) {
      inPathSection = /^(?:Files\s*\/\s*)?Paths$/i.test(heading[1]);
      continue;
    }
    if (!inPathSection || !/^\s*[-*+]\s+/.test(rawLine)) continue;
    const codePaths = [...rawLine.matchAll(/`([^`]+)`/g)].map(
      (match) => match[1].trim(),
    );
    const plainPaths = normalizedClause(rawLine)
      .split(/\s+/)
      .map((candidate) => candidate.replace(/^[`'"(]+|[`'"),.;:]+$/g, ""));
    wildcardPath = [...codePaths, ...plainPaths].find(
      (candidate) => candidate.includes("*") || candidate.endsWith("/"),
    ) ?? null;
    if (wildcardPath) break;
  }
  wildcardPath ??= issue.paths.find(
    (candidate) => candidate.includes("*") || candidate.endsWith("/"),
  ) ?? null;
  if ((ready || issue.kind === "executable") && wildcardPath) {
    findings.push({
      code: ready
        ? "ticket_ready_wildcard_path"
        : "ticket_executable_wildcard_path",
      issueId,
      message: ready
        ? `${issueId} is codex-ready with generic path ${wildcardPath}`
        : `${issueId} is executable with generic path ${wildcardPath}`,
    });
  }
  return findings.sort(findingOrder);
}

export function scanTicketIntegrity(
  snapshot: TicketIntegritySnapshot,
  capture: TicketIntegrityCapture,
  checksumContract?: TicketSourceChecksumContract,
): TicketIntegrityReport {
  const findings: Finding[] = [];
  const capturesById = new Map<string, LinearIssueDescriptionCapture[]>();
  for (const issue of capture.issues) {
    const matches = capturesById.get(issue.id) ?? [];
    matches.push(issue);
    capturesById.set(issue.id, matches);
  }
  const fingerprintById = new Map(
    snapshot.linearFingerprint.issues.map((issue) => [issue.identifier, issue]),
  );
  const checksumBySource = new Map<string, string>();
  for (const source of checksumContract?.sources ?? []) {
    if (!source.sourceId.trim() || !/^[a-f0-9]{64}$/.test(source.sha256)) {
      throw new Error(`Invalid source checksum contract row ${source.sourceId}`);
    }
    if (checksumBySource.has(source.sourceId)) {
      throw new Error(`Duplicate source checksum contract row ${source.sourceId}`);
    }
    checksumBySource.set(source.sourceId, source.sha256);
  }

  for (const issue of snapshot.issues) {
    const capturedMatches = capturesById.get(issue.id) ?? [];
    if (capturedMatches.length === 0) {
      findings.push({
        code: "ticket_capture_issue_missing",
        issueId: issue.id,
        message: `${issue.id} is missing from the full ticket capture`,
      });
      continue;
    }
    if (capturedMatches.length > 1) {
      findings.push({
        code: "ticket_capture_issue_duplicate",
        issueId: issue.id,
        message: `${issue.id} is duplicated in the full ticket capture`,
      });
      continue;
    }
    const captured = capturedMatches[0];
    const fingerprint = fingerprintById.get(issue.id);
    if (!fingerprint) {
      findings.push({
        code: "ticket_capture_fingerprint_missing",
        issueId: issue.id,
        message: `${issue.id} is missing from the canonical fingerprint`,
      });
      continue;
    }
    if (
      descriptionFingerprint(captured.description) !==
      fingerprint.descriptionFingerprint
    ) {
      findings.push({
        code: "ticket_capture_fingerprint_mismatch",
        issueId: issue.id,
        message: `${issue.id} description does not match the canonical fingerprint`,
      });
      continue;
    }
    const ready = [...issue.labels, ...captured.labels].some(
      (label) => label.toLowerCase() === "codex-ready",
    );
    findings.push(
      ...descriptionFindings(
        issue,
        captured,
        ready,
        issue.sourceId ? checksumBySource.get(issue.sourceId) ?? null : null,
      ),
    );
  }

  findings.sort(findingOrder);
  const readiness = snapshot.issues
    .filter((issue) => {
      const liveLabels = capturesById.get(issue.id)?.[0]?.labels ?? [];
      return [...issue.labels, ...liveLabels].some(
        (label) => label.toLowerCase() === "codex-ready",
      );
    })
    .flatMap((issue) =>
      readinessFindings(issue, { ticketIntegrityFindings: findings }).filter(
        (finding) => finding.code === "ticket_integrity_failed",
      ),
    )
    .sort(findingOrder);

  return {
    schemaVersion: 1,
    findings,
    readinessFindings: readiness,
    passed: readiness.length === 0 && findings.length === 0,
  };
}
