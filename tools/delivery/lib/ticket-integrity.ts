import { createHash } from "node:crypto";
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
      relations?: string[];
    }>;
  };
}

export interface TicketIntegrityCapture {
  schemaVersion?: number;
  issues: LinearIssueDescriptionCapture[];
}

export interface TicketSourceChecksumContract {
  schemaVersion: 1 | 2 | 3;
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

export interface BoundTicketIntegrityReport extends TicketIntegrityReport {
  fingerprintSha256: string;
  descriptionCaptureSha256: string;
  checkedIssueCount: number;
}

const SHA256 = /^[a-f0-9]{64}$/;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function bindTicketIntegrityReport(
  report: TicketIntegrityReport,
  fingerprintJson: string,
  captureJson: string,
  checkedIssueCount: number,
): BoundTicketIntegrityReport {
  return {
    ...report,
    fingerprintSha256: sha256(fingerprintJson),
    descriptionCaptureSha256: sha256(captureJson),
    checkedIssueCount,
  };
}

export function assertBoundTicketIntegrityReport(
  value: unknown,
  fingerprintJson: string,
  expectedIssueCount?: number,
): BoundTicketIntegrityReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Linear ticket-integrity report is invalid");
  }
  const report = value as Partial<BoundTicketIntegrityReport>;
  if (
    report.schemaVersion !== 1 ||
    report.passed !== true ||
    !Array.isArray(report.findings) ||
    report.findings.length !== 0 ||
    !Array.isArray(report.readinessFindings) ||
    report.readinessFindings.length !== 0 ||
    report.fingerprintSha256 !== sha256(fingerprintJson) ||
    typeof report.descriptionCaptureSha256 !== "string" ||
    !SHA256.test(report.descriptionCaptureSha256) ||
    !Number.isInteger(report.checkedIssueCount) ||
    report.checkedIssueCount! < 1 ||
    (expectedIssueCount !== undefined &&
      report.checkedIssueCount !== expectedIssueCount)
  ) {
    throw new Error("Linear ticket-integrity report does not match its fingerprint");
  }
  return report as BoundTicketIntegrityReport;
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
  checksumSourceId: string | null,
  expectedSourceChecksum: string | null,
  nativeRelatedTitles: string[],
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
  const rawLines = description.split(/\r?\n/);
  const sourceProvenanceHeadings = rawLines.flatMap((line, index) =>
    /^\s*#{2,6}\s+Source provenance\s*#*\s*$/i.test(line) ? [index] : []
  );
  const allowedCanonicalRequirementLines = new Map<number, string>();
  const expectedCanonicalRequirement =
    (issue.sourceFamilyId ?? issue.sourceId)?.toUpperCase() ?? null;
  if (sourceProvenanceHeadings.length === 1 && expectedCanonicalRequirement) {
    const start = sourceProvenanceHeadings[0] + 1;
    const nextHeading = rawLines.findIndex(
      (line, index) => index >= start && /^\s*#{1,6}\s+/.test(line),
    );
    const end = nextHeading === -1 ? rawLines.length : nextHeading;
    const declared = rawLines.slice(start, end).flatMap((line, offset) => {
      const match =
        /^\s*[-*+]\s+Canonical requirement\s*:\s*`?(F-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*)`?\.?\s*$/i
          .exec(line);
      return match ? [{ lineIndex: start + offset, sourceId: match[1].toUpperCase() }] : [];
    });
    if (
      declared.length === 1 &&
      declared[0].sourceId === expectedCanonicalRequirement
    ) {
      allowedCanonicalRequirementLines.set(
        declared[0].lineIndex,
        declared[0].sourceId,
      );
    }
  }
  if (/^\s*\[[^\]]+\]\s*/.test(captured.title)) {
    findings.push({
      code: "ticket_title_manual_prefix",
      issueId,
      message: `${issueId} starts with a manual title prefix`,
    });
  }
  const manualReferences = rawLines.flatMap((line, index) => {
    const references = [
      ...line.matchAll(/\b(?:PLA|BUY|SEL|INT)-\d+\b/g),
      ...line.matchAll(/\bF-(?:AE-|BC-)?\d+(?:\.[A-Z0-9]+)*\b/g),
      ...line.matchAll(/\b(?:SG|SR)-[A-Z0-9-]+\b/g),
    ]
      .map((match) => match[0])
      .filter(
        (reference) =>
          reference.toUpperCase() !==
            allowedCanonicalRequirementLines.get(index),
      );
    if (/linear\.app\//i.test(line)) references.push("Linear URL");
    if (/<issue\b/i.test(line)) references.push("issue markup");
    return references.map((reference) => ({
      reference,
      lineNumber: index + 1,
    }));
  });
  if (manualReferences.length > 0) {
    findings.push({
      code: "ticket_manual_reference_duplicated",
      issueId,
      message:
        `${issueId} manually lists issue/source references in its description: ` +
        manualReferences
          .map(({ reference, lineNumber }) => `${reference} line ${lineNumber}`)
          .join(", "),
    });
  }
  const duplicatedRelatedTitles = nativeRelatedTitles.flatMap((title) => {
    const lineIndex = rawLines.findIndex((line) =>
      line.toLocaleLowerCase().includes(title.toLocaleLowerCase())
    );
    return lineIndex >= 0 ? [{ title, lineNumber: lineIndex + 1 }] : [];
  });
  if (duplicatedRelatedTitles.length > 0) {
    findings.push({
      code: "ticket_native_related_title_duplicated",
      issueId,
      message:
        `${issueId} hardcodes natively related issue titles: ` +
        duplicatedRelatedTitles
          .map(({ title, lineNumber }) => `${JSON.stringify(title)} line ${lineNumber}`)
          .join(", "),
    });
  }
  const duplicatedNativeFields = rawLines.flatMap((line, index) => {
    const match = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(Release(?: version)?|Linear release|Team|Project|Milestone|Parent|Owner|Assignee|Estimate|Priority|Labels|Status|State|Cycle|Due date|Source family)(?:\*\*)?\s*:/i.exec(
      line,
    );
    return match ? [{ field: match[1], lineNumber: index + 1 }] : [];
  });
  if (duplicatedNativeFields.length > 0) {
    findings.push({
      code: "ticket_native_fields_duplicated",
      issueId,
      message:
        `${issueId} duplicates native Linear fields in its description: ` +
        duplicatedNativeFields
          .map(({ field, lineNumber }) => `${field} line ${lineNumber}`)
          .join(", "),
    });
  }
  const duplicatedRelations = rawLines.flatMap((line, index) => {
    const heading = /^\s*#{1,6}\s+((?:Dependency|Blocking|Blocker|Relation)[^#]*)\s*#*\s*$/i.exec(
      line,
    );
    const field = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(Blocked by|Blocks|Related(?: to)?)(?:\*\*)?\s*:/i.exec(
      line,
    );
    const name = heading?.[1] ?? field?.[1];
    return name ? [{ name, lineNumber: index + 1 }] : [];
  });
  if (duplicatedRelations.length > 0) {
    findings.push({
      code: "ticket_native_relations_duplicated",
      issueId,
      message:
        `${issueId} duplicates native Linear relations in its description: ` +
        duplicatedRelations
          .map(({ name, lineNumber }) => `${name} line ${lineNumber}`)
          .join(", "),
    });
  }
  const duplicatedTitle = rawLines.findIndex((line) => {
    const heading = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)?.[1]?.trim();
    return heading === captured.title.trim();
  });
  if (duplicatedTitle >= 0) {
    findings.push({
      code: "ticket_native_title_duplicated",
      issueId,
      message:
        `${issueId} repeats its native Linear title as a description heading ` +
      `on line ${duplicatedTitle + 1}`,
    });
  }
  const unresolvedMarkers = rawLines.flatMap((line, index) => {
    const matches = [
      ...line.matchAll(/\b(?:TBD|TODO|FIXME|REPLACE_WITH_[A-Z0-9_]+)\b/g),
      ...line.matchAll(/[<\[]placeholder[>\]]/gi),
    ];
    return matches.map((match) => ({
      marker: match[0],
      lineNumber: index + 1,
    }));
  });
  if (unresolvedMarkers.length > 0) {
    findings.push({
      code: "ticket_description_unresolved_marker",
      issueId,
      message:
        `${issueId} contains unresolved description markers: ` +
        unresolvedMarkers
          .map(({ marker, lineNumber }) => `${marker} line ${lineNumber}`)
          .join(", "),
    });
  }
  const sourceDeferral = [
    /\bcited source\b/i,
    /\bpinned source\b/i,
    /\bmaster spec is authoritative\b/i,
    /\bux design\b[^.\n]{0,120}\bmaster spec is silent\b/i,
    /\bcomplete,? unabridged contract\b[^.\n]{0,120}\bsource anchors?\b/i,
    /\b(?:all )?(?:numbers|entitlements|limits?|thresholds?|values?)\b[^.\n]{0,120}\b(?:resolve|are sourced|are owned|remain owned)\b[^.\n]{0,120}\b(?:master spec|appendix|source|§)/i,
    /\b(?:ready|loading|empty|error|partial|permission-denied)\b[^.\n]{0,180}\bsource requires\b/i,
    /authority:\s*the cited[^.\n]{0,120}\boverrides? this issue text/i,
    /the pinned source owns[^.\n]{0,240}\.\s*this issue may summarize/i,
    /(?:values|rules|behavior|contract)[^.\n]{0,120}\bremain owned by (?:those|the) (?:local )?sources/i,
    /(?:source|spec(?:ification)?)\s+(?:owns|governs)\s+(?:the\s+)?(?:complete|full|all|every)\s+(?:implementation|behavior|rules?|values?|contract|requirements?)/i,
    /\b(?:implement|implementation|behavior|rules?|values?|contract|requirements?)\b[^.\n]{0,120}\b(?:as defined|specified|detailed|documented)\s+in\s+(?:the\s+)?(?:master spec|ux design|pinned source|source)/i,
    /\b(?:follow|use|apply|inherit)\b[^\n]{0,100}\b(?:master spec|ux design|pinned source|source)\b[^\n]{0,100}\b(?:minimum|maximum|threshold|cadence|timeout|duration|limit|enum|value|rule)/i,
    /\b(?:numeric|exact|binding|applicable)\b[^.\n]{0,80}\b(?:values?|rules?|thresholds?|limits?|cadence|timing)\b[^.\n]{0,80}\b(?:source[sd]? from|inherit(?:s|ed)? from|remain(?:s|ed)? (?:owned|governed) by)/i,
  ].find((pattern) => pattern.test(description));
  if (
    (issue.kind === "executable" || issue.kind === "proof_only") &&
    sourceDeferral
  ) {
    findings.push({
      code: "ticket_implementation_deferred_to_source",
      issueId,
      message:
        `${issueId} defers implementation behavior to a source document ` +
        "instead of carrying the complete contract in the issue",
    });
  }
  if (issue.kind === "executable" || issue.kind === "proof_only") {
    const sectionMarkers = rawLines.flatMap((rawLine, index) => {
      const line = rawLine.trim();
      const markdown = /^(#{2,6})\s+(.+)$/.exec(line);
      const supported =
        markdown ||
        /^(?:\*\*[^*]+\*\*:?|[A-Za-z][A-Za-z /&-]{1,60}:)$/.test(line);
      if (!supported) return [];
      return [{
        index,
        level: markdown ? markdown[1].length : 2,
        marker: (markdown?.[2] ?? line)
          .replace(/^\*\*|\*\*:?$/g, "")
          .replace(/:$/, "")
          .trim()
          .toLowerCase(),
      }];
    });
    const hasSection = (pattern: RegExp) =>
      sectionMarkers.some(({ marker }) => pattern.test(marker));
    const hasSubstantiveSection = (pattern: RegExp) =>
      sectionMarkers.some((section) => {
        if (!pattern.test(section.marker)) return false;
        const next = sectionMarkers.find(
          (candidate) =>
            candidate.index > section.index &&
            candidate.level <= section.level,
        );
        const nestedHeadingLines = new Set(
          sectionMarkers
            .filter(
              (candidate) =>
                candidate.index > section.index &&
                candidate.index < (next?.index ?? rawLines.length),
            )
            .map((candidate) => candidate.index),
        );
        const body = rawLines
          .slice(section.index + 1, next?.index ?? rawLines.length)
          .filter((_, offset) =>
            !nestedHeadingLines.has(section.index + 1 + offset)
          )
          .join("\n")
          .trim();
        return /[\p{L}\p{N}]/u.test(body);
      });
    const requiredSections = [
      ["outcome", /^outcome$/],
      ["complete behavior and rules", /(?:complete\s+)?behavior.*rules|rules.*behavior/],
      ["states and transitions", /states?.*transitions?|transitions?.*states?/],
      ["permissions, isolation, and privacy", /permissions?.*(?:isolation|privacy)|(?:isolation|privacy).*permissions?/],
      ["source provenance", /(?:source|provenance)/],
      ["paths", /(?:paths?|files)/],
      ["delivery or review/readiness", /(?:delivery|review.*readiness|readiness.*review)/],
      ["acceptance tests", /\bacceptance\b/],
      ["failure tests", /\bfailure\b/],
      ["recovery tests", /\brecovery\b/],
      ["rollout", /rollout/],
      ["rollback", /rollback/],
      ["telemetry and notifications", /telemetry.*notifications?|notifications?.*telemetry/],
      ["named proof", /proof/],
      ["assumptions and validation triggers", /assumptions?.*validation|validation.*assumptions?/],
      ["exclusions", /exclusions?/],
    ] as const;
    const missingSections = requiredSections
      .filter(([, pattern]) => !hasSection(pattern))
      .map(([name]) => name);
    if (missingSections.length > 0) {
      findings.push({
        code: "ticket_contract_sections_missing",
        issueId,
        message:
          `${issueId} executable body lacks required sections: ` +
          missingSections.join(", "),
      });
    }
    const emptySections = requiredSections
      .filter(([, pattern]) =>
        hasSection(pattern) && !hasSubstantiveSection(pattern)
      )
      .map(([name]) => name);
    if (emptySections.length > 0) {
      findings.push({
        code: "ticket_contract_sections_empty",
        issueId,
        message:
          `${issueId} executable body has empty required sections: ` +
          emptySections.join(", "),
      });
    }
  }
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
        message:
          `${issueId} canonical source checksum does not match ` +
          `${checksumSourceId ?? "its source"}`,
      });
    }
  }
  let inPathSection = false;
  let wildcardPath: string | null = null;
  for (const rawLine of description.split(/\r?\n/)) {
    const heading = /^#{2,3}\s+(.+?)\s*$/.exec(rawLine);
    if (heading) {
      inPathSection =
        /^(?:Exact\s+)?(?:Files\s*\/\s*)?Paths?(?:\s*\/\s*Delivery)?$/i
          .test(heading[1]);
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
  const snapshotById = new Map(snapshot.issues.map((issue) => [issue.id, issue]));
  const checksumBySource = new Map<string, string>();
  if (
    checksumContract &&
    checksumContract.schemaVersion !== 1 &&
    checksumContract.schemaVersion !== 2 &&
    checksumContract.schemaVersion !== 3
  ) {
    throw new Error("Source checksum contract schema is invalid");
  }
  for (const source of checksumContract?.sources ?? []) {
    if (!source.sourceId.trim() || !/^[a-f0-9]{64}$/.test(source.sha256)) {
      throw new Error(`Invalid source checksum contract row ${source.sourceId}`);
    }
    const sourceId = source.sourceId.toUpperCase();
    if (checksumBySource.has(sourceId)) {
      throw new Error(`Duplicate source checksum contract row ${source.sourceId}`);
    }
    checksumBySource.set(sourceId, source.sha256);
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
    const snapshotSourceId = issue.sourceId?.toUpperCase() ?? null;
    const snapshotFamilySourceId = issue.sourceFamilyId?.toUpperCase() ?? null;
    const parentSourceId = issue.parentId
      ? snapshotById.get(issue.parentId)?.sourceId?.toUpperCase() ?? null
      : null;
    const familySourceId =
      snapshotSourceId?.split(".")[0] ?? parentSourceId?.split(".")[0] ?? null;
    const checksumSourceId = [
      snapshotSourceId,
      snapshotFamilySourceId,
      parentSourceId,
      familySourceId,
    ].find(
      (sourceId, index, candidates) =>
        sourceId !== null &&
        candidates.indexOf(sourceId) === index &&
        checksumBySource.has(sourceId),
    ) ?? null;
    findings.push(
      ...descriptionFindings(
        issue,
        captured,
        ready,
        checksumSourceId,
        checksumSourceId
          ? checksumBySource.get(checksumSourceId) ?? null
          : null,
        (fingerprint.relations ?? [])
          .flatMap((relation) => {
            const [, left, right] = relation.split(":");
            if (left === issue.id) return [right];
            if (right === issue.id) return [left];
            return [];
          })
          .map((identifier) => fingerprintById.get(identifier)?.title ?? "")
          .filter((title) => title.trim().length >= 32),
      ),
    );
  }

  findings.sort(findingOrder);
  const descriptionReadiness = snapshot.issues
    .filter((issue) => {
      const liveLabels = capturesById.get(issue.id)?.[0]?.labels ?? [];
      return [...issue.labels, ...liveLabels].some(
        (label) => label.toLowerCase() === "codex-ready",
      );
    })
    .flatMap((issue) =>
      readinessFindings(issue, {
        ticketIntegrityFindings: findings,
        descriptionContractVerified: true,
      }).filter(
        (finding) => finding.code === "ticket_integrity_failed",
      ),
    )
    .sort(findingOrder);

  return {
    schemaVersion: 1,
    findings,
    readinessFindings: descriptionReadiness,
    passed: descriptionReadiness.length === 0 && findings.length === 0,
  };
}
