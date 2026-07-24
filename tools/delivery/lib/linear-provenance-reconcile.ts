import { createHash } from "node:crypto";
import { descriptionFingerprint } from "./fingerprint.js";
import {
  canonicalLinearFingerprint,
  linearSourceProvenance,
  type LinearCapture,
} from "./linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./linear-project-scope.js";
import {
  assertLinearSourcePolicy,
  type LinearSourcePolicy,
} from "./linear-source-policy.js";
import type { ResolvedSourceChecksum } from "./source-checksums.js";

export const PROVENANCE_CANDIDATE_TTL_MS = 15 * 60 * 1000;

export interface CanonicalPlanningDocumentFingerprints {
  masterSpecSha256: string;
  uxDesignSha256: string;
}

export interface LinearProvenanceChange {
  issueId: string;
  linearId: string;
  projectId: string;
  updatedAt: string;
  sourceId: string;
  sourceDocument: string;
  sourceSection: string;
  sourceSlices: ResolvedSourceChecksum["slices"];
  beforeDescriptionFingerprint: string;
  afterDescriptionFingerprint: string;
  beforeChecksum: string;
  afterChecksum: string;
}

export interface LinearProvenanceCandidate {
  schemaVersion: 2;
  createdAt: string;
  expiresAt: string;
  sourceChecksumContractSha256: string;
  canonicalDocuments: CanonicalPlanningDocumentFingerprints;
  captureFingerprintSha256: string;
  changeSetFingerprintSha256: string;
  changes: LinearProvenanceChange[];
}

export interface LinearProvenanceReceipt {
  schemaVersion: 2;
  createdAt: string;
  expiresAt: string;
  candidateSha256: string;
  projectScopeSha256: string;
  programScopeSha256: string;
  sourcePolicySha256: string;
  sourceChecksumContractSha256: string;
  masterSpecSha256: string;
  uxDesignSha256: string;
  captureFingerprintSha256: string;
  changeSetFingerprintSha256: string;
}

export interface LinearProvenanceReceiptInputs {
  candidateJson: string;
  projectScopeJson: string;
  programScopeJson: string;
  sourcePolicyJson: string;
  sourceChecksumContractJson: string;
  candidate: LinearProvenanceCandidate;
}

export interface LinearProvenanceIssueReadback {
  id: string;
  identifier: string;
  description: string | null;
  archivedAt: string | null;
  state: { type: string };
  project: { id: string } | null;
}

export type LinearProvenanceUpdateErrorState =
  | "committed"
  | "not_committed"
  | "ambiguous";

interface ProvenanceSection {
  contentStart: number;
  contentEnd: number;
  content: string;
}

const SHA256 = /^[a-f0-9]{64}$/;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ISSUE_ID = /^[A-Z][A-Z0-9]*-\d+$/;

export function sha256Text(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function exactKeys(
  value: unknown,
  keys: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is invalid`);
  }
  if (
    JSON.stringify(Object.keys(value).sort()) !==
    JSON.stringify([...keys].sort())
  ) {
    throw new Error(`${label} shape is invalid`);
  }
}

function assertIsoUtc(value: unknown, label: string): asserts value is string {
  if (
    typeof value !== "string" ||
    !ISO_UTC.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new Error(`${label} is invalid`);
  }
}

function provenanceSections(description: string): ProvenanceSection[] {
  const heading = /(^|\r?\n)## Source provenance[ \t]*(?:\r?\n|$)/gim;
  return [...description.matchAll(heading)].map((match) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const nextHeading = /\r?\n## /.exec(description.slice(contentStart));
    const contentEnd = nextHeading
      ? contentStart + (nextHeading.index ?? 0)
      : description.length;
    return {
      contentStart,
      contentEnd,
      content: description.slice(contentStart, contentEnd),
    };
  });
}

function checksumMatches(section: string): Array<{
  checksum: string;
  start: number;
  end: number;
}> {
  const checksum = /(?:^|\r?\n)[-*]?\s*(?:canonical\s+)?source checksum\s*:\s*(?:`?sha256:)?([a-f0-9]{64})/gim;
  return [...section.matchAll(checksum)].map((match) => {
    const value = match[1];
    const start = (match.index ?? 0) + match[0].lastIndexOf(value);
    return { checksum: value.toLowerCase(), start, end: start + value.length };
  });
}

export function replaceSourceProvenanceChecksum(
  issueId: string,
  description: string,
  expected: Pick<
    ResolvedSourceChecksum,
    | "sourceId"
    | "sourceDoc"
    | "sourceDocuments"
    | "section"
    | "sectionBundleCount"
    | "sourceBindingSha256"
    | "sha256"
  >,
): { description: string; beforeChecksum: string; afterChecksum: string } {
  if (!SHA256.test(expected.sha256)) {
    throw new Error(`${expected.sourceId} source checksum is invalid`);
  }
  const sections = provenanceSections(description);
  if (sections.length !== 1) {
    throw new Error(
      `Linear issue ${issueId} must have one Source provenance section`,
    );
  }
  const parsed = linearSourceProvenance(description);
  const bundled = expected.sectionBundleCount > 1;
  const canonical =
    parsed.sourceId === expected.sourceId &&
    JSON.stringify(parsed.sourceDocuments) ===
      JSON.stringify(expected.sourceDocuments) &&
    (bundled
      ? parsed.sourceDocument === null &&
        parsed.section === null &&
        parsed.sectionBundleCount === expected.sectionBundleCount &&
        parsed.sourceBinding === expected.sourceBindingSha256
      : parsed.sourceDocument === expected.sourceDoc &&
        parsed.section === expected.section &&
        parsed.sectionBundleCount === null &&
        (parsed.sourceBinding === null ||
          parsed.sourceBinding === expected.sourceBindingSha256));
  if (!canonical) {
    throw new Error(`Linear issue ${issueId} Source provenance is not canonical`);
  }
  const section = sections[0];
  const matches = checksumMatches(section.content);
  const allDigests = [...section.content.matchAll(/[a-f0-9]{64}/gi)];
  const expectedDigestCount = parsed.sourceBinding === null ? 1 : 2;
  if (
    matches.length !== 1 ||
    parsed.sourceChecksum !== matches[0]?.checksum ||
    allDigests.length !== expectedDigestCount
  ) {
    throw new Error(
      `Linear issue ${issueId} must have one canonical Source provenance checksum`,
    );
  }
  const match = matches[0];
  const updatedSection =
    section.content.slice(0, match.start) +
    expected.sha256 +
    section.content.slice(match.end);
  return {
    description:
      description.slice(0, section.contentStart) +
      updatedSection +
      description.slice(section.contentEnd),
    beforeChecksum: match.checksum,
    afterChecksum: expected.sha256,
  };
}

export function classifyLinearProvenanceUpdateError(
  change: LinearProvenanceChange,
  issue: LinearProvenanceIssueReadback,
  beforeDescription: string,
  expectedDescription: string,
): LinearProvenanceUpdateErrorState {
  if (
    issue.id !== change.linearId ||
    issue.identifier !== change.issueId ||
    issue.archivedAt !== null ||
    issue.state.type === "canceled" ||
    issue.project?.id !== change.projectId
  ) {
    return "ambiguous";
  }
  if (
    issue.description === expectedDescription &&
    descriptionFingerprint(issue.description) ===
      change.afterDescriptionFingerprint &&
    linearSourceProvenance(issue.description).sourceChecksum ===
      change.afterChecksum
  ) {
    return "committed";
  }
  if (
    issue.description === beforeDescription &&
    descriptionFingerprint(issue.description) ===
      change.beforeDescriptionFingerprint
  ) {
    return "not_committed";
  }
  return "ambiguous";
}

function changeSetFingerprint(changes: LinearProvenanceChange[]): string {
  return sha256Text(canonicalJson(changes));
}

export function buildLinearProvenanceCandidate(
  capture: LinearCapture,
  projectScope: LinearProjectScope,
  sourcePolicy: LinearSourcePolicy,
  resolvedChecksums: ReadonlyMap<string, ResolvedSourceChecksum>,
  sourceChecksumContractSha256: string,
  canonicalDocuments: CanonicalPlanningDocumentFingerprints,
  createdAt: string,
): LinearProvenanceCandidate {
  if (
    !SHA256.test(sourceChecksumContractSha256) ||
    !SHA256.test(canonicalDocuments.masterSpecSha256) ||
    !SHA256.test(canonicalDocuments.uxDesignSha256)
  ) {
    throw new Error("Canonical source fingerprint input is invalid");
  }
  assertIsoUtc(createdAt, "Linear provenance candidate creation time");
  assertLinearSourcePolicy(sourcePolicy);
  const scopedProjects = new Set(
    assertLinearProjectScope(projectScope, capture.fingerprint.projects),
  );
  const coordination = new Set(sourcePolicy.coordinationIssueIds);
  const descriptions = new Map(
    capture.issueDescriptions.map((issue) => [issue.id, issue]),
  );
  if (descriptions.size !== capture.issueDescriptions.length) {
    throw new Error("Linear description capture contains duplicate issues");
  }
  if (
    new Set(capture.fingerprint.issues.map((issue) => issue.identifier)).size !==
      capture.fingerprint.issues.length
  ) {
    throw new Error("Linear fingerprint contains duplicate issues");
  }

  const changes: LinearProvenanceChange[] = [];
  for (const issue of capture.fingerprint.issues) {
    if (
      issue.archivedAt !== null ||
      issue.stateType === "canceled" ||
      !issue.projectId ||
      !scopedProjects.has(issue.projectId) ||
      coordination.has(issue.identifier)
    ) {
      continue;
    }
    const captured = descriptions.get(issue.identifier);
    if (!captured) {
      throw new Error(`Linear issue ${issue.identifier} lacks description readback`);
    }
    if (
      captured.updatedAt !== issue.updatedAt ||
      descriptionFingerprint(captured.description) !== issue.descriptionFingerprint
    ) {
      throw new Error(`Linear issue ${issue.identifier} capture is inconsistent`);
    }
    const provenance = issue.sourceProvenance;
    if (
      !provenance?.sourceId ||
      !provenance.sourceDocuments.length ||
      (!provenance.section && provenance.sectionBundleCount === null) ||
      !provenance.sourceChecksum
    ) {
      throw new Error(`Active Linear issue ${issue.identifier} lacks exact source provenance`);
    }
    const expected = resolvedChecksums.get(provenance.sourceId);
    if (!expected) {
      throw new Error(
        `Active Linear issue ${issue.identifier} source ${provenance.sourceId} lacks a deterministic slice`,
      );
    }
    const description = captured.description ?? "";
    const replacement = replaceSourceProvenanceChecksum(
      issue.identifier,
      description,
      expected,
    );
    if (replacement.beforeChecksum === expected.sha256) continue;
    if (!issue.linearId?.trim()) {
      throw new Error(`Linear issue ${issue.identifier} lacks a stable Linear ID`);
    }
    changes.push({
      issueId: issue.identifier,
      linearId: issue.linearId,
      projectId: issue.projectId,
      updatedAt: issue.updatedAt,
      sourceId: expected.sourceId,
      sourceDocument: expected.sourceDoc,
      sourceSection: expected.section,
      sourceSlices: expected.slices.map((slice) => ({ ...slice })),
      beforeDescriptionFingerprint: issue.descriptionFingerprint,
      afterDescriptionFingerprint: descriptionFingerprint(replacement.description),
      beforeChecksum: replacement.beforeChecksum,
      afterChecksum: replacement.afterChecksum,
    });
  }
  changes.sort((left, right) =>
    left.issueId.localeCompare(right.issueId, undefined, { numeric: true })
  );
  const expiresAt = new Date(
    Date.parse(createdAt) + PROVENANCE_CANDIDATE_TTL_MS,
  ).toISOString();
  return {
    schemaVersion: 2,
    createdAt,
    expiresAt,
    sourceChecksumContractSha256,
    canonicalDocuments: { ...canonicalDocuments },
    captureFingerprintSha256: sha256Text(
      canonicalJson(canonicalLinearFingerprint(capture.fingerprint)),
    ),
    changeSetFingerprintSha256: changeSetFingerprint(changes),
    changes,
  };
}

export function assertLinearProvenanceCandidate(
  value: unknown,
): LinearProvenanceCandidate {
  exactKeys(
    value,
    [
      "schemaVersion",
      "createdAt",
      "expiresAt",
      "sourceChecksumContractSha256",
      "canonicalDocuments",
      "captureFingerprintSha256",
      "changeSetFingerprintSha256",
      "changes",
    ],
    "Linear provenance candidate",
  );
  const candidate = value as unknown as LinearProvenanceCandidate;
  assertIsoUtc(candidate.createdAt, "Linear provenance candidate creation time");
  assertIsoUtc(candidate.expiresAt, "Linear provenance candidate expiry time");
  exactKeys(
    candidate.canonicalDocuments,
    ["masterSpecSha256", "uxDesignSha256"],
    "Linear provenance canonical documents",
  );
  if (
    candidate.schemaVersion !== 2 ||
    !SHA256.test(candidate.sourceChecksumContractSha256) ||
    !SHA256.test(candidate.canonicalDocuments.masterSpecSha256) ||
    !SHA256.test(candidate.canonicalDocuments.uxDesignSha256) ||
    !SHA256.test(candidate.captureFingerprintSha256) ||
    !SHA256.test(candidate.changeSetFingerprintSha256) ||
    Date.parse(candidate.expiresAt) - Date.parse(candidate.createdAt) !==
      PROVENANCE_CANDIDATE_TTL_MS ||
    !Array.isArray(candidate.changes)
  ) {
    throw new Error("Linear provenance candidate is invalid");
  }
  const issueIds = new Set<string>();
  for (const change of candidate.changes) {
    exactKeys(
      change,
      [
        "issueId",
        "linearId",
        "projectId",
        "updatedAt",
        "sourceId",
        "sourceDocument",
        "sourceSection",
        "sourceSlices",
        "beforeDescriptionFingerprint",
        "afterDescriptionFingerprint",
        "beforeChecksum",
        "afterChecksum",
      ],
      "Linear provenance candidate change",
    );
    if (
      !ISSUE_ID.test(change.issueId) ||
      !change.linearId?.trim() ||
      !change.projectId?.trim() ||
      !change.updatedAt?.trim() ||
      !change.sourceId?.trim() ||
      !change.sourceDocument?.trim() ||
      !change.sourceSection?.trim() ||
      !Array.isArray(change.sourceSlices) ||
      !change.sourceSlices.length ||
      change.sourceSlices.some(
        (slice) =>
          !slice.sourceDoc?.trim() ||
          !slice.startHeading?.trim() ||
          (slice.endHeading !== null && !slice.endHeading.trim()),
      ) ||
      !SHA256.test(change.beforeDescriptionFingerprint) ||
      !SHA256.test(change.afterDescriptionFingerprint) ||
      !SHA256.test(change.beforeChecksum) ||
      !SHA256.test(change.afterChecksum) ||
      change.beforeChecksum === change.afterChecksum ||
      issueIds.has(change.issueId)
    ) {
      throw new Error(`Linear provenance candidate change ${change.issueId} is invalid`);
    }
    issueIds.add(change.issueId);
  }
  const sorted = [...candidate.changes].sort((left, right) =>
    left.issueId.localeCompare(right.issueId, undefined, { numeric: true })
  );
  if (
    JSON.stringify(sorted) !== JSON.stringify(candidate.changes) ||
    changeSetFingerprint(candidate.changes) !==
      candidate.changeSetFingerprintSha256
  ) {
    throw new Error("Linear provenance candidate change fingerprint is invalid");
  }
  return candidate;
}

export function buildLinearProvenanceReceipt(
  inputs: LinearProvenanceReceiptInputs,
): LinearProvenanceReceipt {
  const candidate = assertLinearProvenanceCandidate(inputs.candidate);
  if (
    sha256Text(inputs.sourceChecksumContractJson) !==
      candidate.sourceChecksumContractSha256
  ) {
    throw new Error("Linear provenance candidate checksum contract changed");
  }
  return {
    schemaVersion: 2,
    createdAt: candidate.createdAt,
    expiresAt: candidate.expiresAt,
    candidateSha256: sha256Text(inputs.candidateJson),
    projectScopeSha256: sha256Text(inputs.projectScopeJson),
    programScopeSha256: sha256Text(inputs.programScopeJson),
    sourcePolicySha256: sha256Text(inputs.sourcePolicyJson),
    sourceChecksumContractSha256: candidate.sourceChecksumContractSha256,
    masterSpecSha256: candidate.canonicalDocuments.masterSpecSha256,
    uxDesignSha256: candidate.canonicalDocuments.uxDesignSha256,
    captureFingerprintSha256: candidate.captureFingerprintSha256,
    changeSetFingerprintSha256: candidate.changeSetFingerprintSha256,
  };
}

export function assertLinearProvenanceReceipt(
  value: unknown,
  inputs: LinearProvenanceReceiptInputs,
): LinearProvenanceReceipt {
  const expected = buildLinearProvenanceReceipt(inputs);
  exactKeys(value, Object.keys(expected), "Linear provenance receipt");
  if (JSON.stringify(value) !== JSON.stringify(expected)) {
    throw new Error("Linear provenance receipt does not match its inputs");
  }
  return value as unknown as LinearProvenanceReceipt;
}

export function assertLinearProvenanceCandidateFresh(
  candidate: LinearProvenanceCandidate,
  now = Date.now(),
): void {
  const createdAt = Date.parse(candidate.createdAt);
  const expiresAt = Date.parse(candidate.expiresAt);
  if (createdAt > now + 60_000 || now > expiresAt) {
    throw new Error("Linear provenance candidate is stale");
  }
}

export function sameProvenanceChanges(
  left: LinearProvenanceCandidate,
  right: LinearProvenanceCandidate,
): boolean {
  return JSON.stringify(left.changes) === JSON.stringify(right.changes);
}
