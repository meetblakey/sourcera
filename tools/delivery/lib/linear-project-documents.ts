import type { Finding } from "./model.js";

export type LinearCanonicalDocumentKind =
  | "prd"
  | "engineering_readiness_brief";

export interface LinearProjectDocumentScopeRow {
  id: string;
  projectId: string;
  projectName: string;
  kind: LinearCanonicalDocumentKind;
  title: string;
  contentFingerprint: string;
  requiredSections: string[];
  masterSpecSections: string[];
}

export interface LinearSupplementaryDocumentScopeRow {
  id: string;
  projectId: string;
  title:
    | "R0 Defensible Evaluation PRD"
    | "R0 Pilot Target Set"
    | "R0 Production Readiness Runbook";
  contentFingerprint: string;
  requiredSections: string[];
  masterSpecSections: string[];
}

export interface LinearDecisionLabelDefinition {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
}

export interface LinearTrackedDecisionScopeRow {
  decisionIdentifier: string;
  decisionTitle: string;
  decisionUrl: string;
  descriptionFingerprint: string;
  requiredSections: string[];
  decisionProjectId: string;
  labelIds: string[];
  resolution: "open" | "completed";
  blockedIssues: Array<{
    identifier: string;
    projectId: string;
  }>;
}

export interface LinearProjectDocumentDecisionReferenceScopeRow {
  documentId: string;
  decisionIdentifier: string;
}

export interface LinearProjectDocumentDecisionContract {
  workspaceSlug: string;
  decisionLabelId: string;
  labelDefinitions: LinearDecisionLabelDefinition[];
  trackedDecisions: LinearTrackedDecisionScopeRow[];
  references: LinearProjectDocumentDecisionReferenceScopeRow[];
}

export interface LinearProjectDocumentFingerprint {
  id: string;
  title: string;
  updatedAt: string;
  archivedAt: string | null;
  initiativeId: string | null;
  projectId: string | null;
  projectName: string | null;
  teamId: string | null;
  issueId: string | null;
  contentFingerprint: string;
  sectionHeadings: string[];
  masterSpecSha256: string | null;
  masterSpecSections: string[];
  unresolvedDecisionReferences: Array<{
    identifier: string;
    url: string;
  }>;
  contentPolicyFindings: string[];
}

export interface LinearProjectDocumentConflictFingerprint {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string | null;
}

export interface LinearDecisionIssueFingerprint {
  identifier: string;
  title: string;
  url: string;
  descriptionFingerprint: string;
  sectionHeadings: string[];
  archivedAt: string | null;
  stateType: string;
  labels: LinearDecisionLabelDefinition[];
  projectId: string | null;
  relations: string[];
}

export interface LinearDecisionTargetFingerprint {
  identifier: string;
  archivedAt: string | null;
  stateType: string;
  projectId: string | null;
  relations: string[];
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const ISSUE_IDENTIFIER = /^(?:PLA|BUY|SEL|INT)-\d+$/;

export const SOURCERA_LINEAR_WORKSPACE_SLUG = "sourcera-production";
export const SOURCERA_DECISION_LABEL_ID =
  "df2bcb0f-2fca-41cb-a45c-37770a01aac2";
export const SOURCERA_DECISION_LABEL_NAME = "decision";
export const SOURCERA_DECISION_LABEL_GROUP_ID =
  "b11e20d5-df7e-4e8b-a710-294827ff9b40";
export const SOURCERA_DECISION_LABEL_GROUP_NAME = "Type";

export const CANONICAL_PROJECT_DOCUMENT_SECTIONS = [
  "Problem, users and measurable outcome",
  "Scope and explicit non-goals",
  "Journeys, failure states and recovery",
  "Security, privacy, accessibility and localization",
  "Success thresholds",
  "Rollout, rollback, migration and support",
  "Master Spec binding",
  "Unresolved decisions",
] as const;

export const ENGINEERING_BRIEF_PROJECT_NAMES = [
  "Platform & Delivery Foundations",
  "Data, Audit & Cross-Console Foundations",
  "Realtime, Search & Collaboration Infrastructure",
  "Security, Privacy, Compliance & Residency",
  "Observability, Reliability & Performance",
  "QA, Release, Deployment & Launch",
] as const;

export const REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES = [
  "R0 Defensible Evaluation PRD",
  "R0 Pilot Target Set",
  "R0 Production Readiness Runbook",
] as const;

export const SUPPLEMENTARY_DOCUMENT_PROJECT_NAMES: Record<
  LinearSupplementaryDocumentScopeRow["title"],
  string
> = {
  "R0 Defensible Evaluation PRD": "Buyer Workspaces & Evaluation Pipeline",
  "R0 Pilot Target Set": "Product Analytics, Growth & Network Effects",
  "R0 Production Readiness Runbook": "QA, Release, Deployment & Launch",
};

export const SUPPLEMENTARY_DOCUMENT_REQUIRED_SECTIONS: Record<
  LinearSupplementaryDocumentScopeRow["title"],
  readonly string[]
> = {
  "R0 Defensible Evaluation PRD": [
    "Problem, users and measurable outcome",
    "R0 journey and exclusions",
    "Actors, access and entry",
    "Invitation and seller participation",
    "Scoring, Selection Report and export",
    "Master Spec binding",
    "Unresolved decisions",
  ],
  "R0 Pilot Target Set": [
    "Pilot cohort and observation windows",
    "Activation and time-to-value thresholds",
    "Completion and abandonment thresholds",
    "Trust, reliability and support thresholds",
    "Measurement and approval",
    "Master Spec binding",
    "Unresolved decisions",
  ],
  "R0 Production Readiness Runbook": [
    "Production targets and domains",
    "Provider readiness and degraded operation",
    "Checkpoints C1-C8 and evidence",
    "Canary, rollback and recovery",
    "Support ownership and approval",
    "Master Spec binding",
    "Unresolved decisions",
  ],
};

const NATIVE_ISSUE_URL =
  /(https:\/\/linear\.app\/[^/\s)<>]+\/issue\/((?:PLA|BUY|SEL|INT)-\d+)(?:\/[a-z0-9-]+)?(?:\?[^\s),;<>]+)?)/gi;
const NATIVE_ISSUE_AUTOLINK =
  /\[(https:\/\/linear\.app\/[^/\s)<>]+\/issue\/((?:PLA|BUY|SEL|INT)-\d+)(?:\/[a-z0-9-]+)?(?:\?[^\s),;<>]+)?)\]\(<(https:\/\/linear\.app\/[^/\s)<>]+\/issue\/((?:PLA|BUY|SEL|INT)-\d+)(?:\/[a-z0-9-]+)?(?:\?[^\s),;<>]+)?)>\)/gi;

interface NativeIssueReference {
  identifier: string;
  url: string;
  raw: string;
  offset: number;
}

function maskRange(buffer: string[], start: number, end: number): void {
  for (let index = start; index < end; index++) {
    if (buffer[index] !== "\n" && buffer[index] !== "\r") buffer[index] = " ";
  }
}

function visibleMarkdownReferenceText(content: string): string {
  const buffer = content.split("");
  let fenced: { character: "`" | "~"; length: number } | null = null;
  for (const match of content.matchAll(/[^\n]*(?:\n|$)/g)) {
    if (!match[0]) continue;
    const offset = match.index ?? 0;
    const line = match[0].replace(/\r?\n$/, "");
    if (fenced) {
      maskRange(buffer, offset, offset + match[0].length);
      const close = /^ {0,3}(`+|~+)[ \t]*$/.exec(line)?.[1];
      if (
        close?.[0] === fenced.character &&
        close.length >= fenced.length
      ) fenced = null;
      continue;
    }
    const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (opening) {
      fenced = {
        character: opening[0] as "`" | "~",
        length: opening.length,
      };
      maskRange(buffer, offset, offset + match[0].length);
    }
  }

  let visible = buffer.join("");
  for (const match of visible.matchAll(/<!--[\s\S]*?(?:-->|$)/g)) {
    maskRange(buffer, match.index ?? 0, (match.index ?? 0) + match[0].length);
  }
  visible = buffer.join("");
  for (const match of visible.matchAll(
    /!\[[^\]\n]*\]\(\s*(?:<[^>\n]*>|[^)\n]*)\)/g,
  )) {
    maskRange(buffer, match.index ?? 0, (match.index ?? 0) + match[0].length);
  }

  visible = buffer.join("");
  for (let index = 0; index < visible.length;) {
    if (visible[index] !== "`") {
      index++;
      continue;
    }
    let runEnd = index + 1;
    while (visible[runEnd] === "`") runEnd++;
    const runLength = runEnd - index;
    let close = runEnd;
    while (close < visible.length) {
      if (visible[close] !== "`") {
        close++;
        continue;
      }
      let closeEnd = close + 1;
      while (visible[closeEnd] === "`") closeEnd++;
      if (closeEnd - close === runLength) {
        maskRange(buffer, index, closeEnd);
        index = closeEnd;
        break;
      }
      close = closeEnd;
    }
    if (close >= visible.length) index = runEnd;
  }
  return buffer.join("");
}

function nativeIssueReferences(content: string): {
  links: NativeIssueReference[];
  findings: string[];
} {
  const findings: string[] = [];
  const links: NativeIssueReference[] = [];
  const occupied: Array<{ start: number; end: number }> = [];
  const visibleContent = visibleMarkdownReferenceText(content);
  for (const match of visibleContent.matchAll(NATIVE_ISSUE_AUTOLINK)) {
    const offset = match.index ?? 0;
    const raw = match[0];
    occupied.push({ start: offset, end: offset + raw.length });
    if (
      match[1] !== match[3] ||
      match[2].toUpperCase() !== match[4].toUpperCase()
    ) {
      findings.push(
        `native_issue_autolink_target_mismatch:line_${lineNumberAt(content, offset)}`,
      );
      continue;
    }
    links.push({
      identifier: match[2].toUpperCase(),
      url: match[1],
      raw,
      offset,
    });
  }
  for (const match of visibleContent.matchAll(NATIVE_ISSUE_URL)) {
    const offset = match.index ?? 0;
    if (occupied.some((range) => offset >= range.start && offset < range.end)) {
      continue;
    }
    const prefix = content.slice(Math.max(0, offset - 3), offset);
    if (prefix.endsWith("](") || prefix.endsWith("](<")) {
      findings.push(
        `native_issue_reference_arbitrary_markdown_label:line_${lineNumberAt(content, offset)}`,
      );
    }
    links.push({
      identifier: match[2].toUpperCase(),
      url: match[1],
      raw: match[0],
      offset,
    });
  }
  return {
    links: links.sort((left, right) => left.offset - right.offset),
    findings: [...new Set(findings)].sort(),
  };
}

function duplicate(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function exactKeys(value: unknown, expected: readonly string[]): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  return JSON.stringify(actual) === JSON.stringify([...expected].sort());
}

function sectionBody(content: string, heading: string): string | null {
  const lines = content.split(/\r?\n/);
  const headings = lines.flatMap((line, index) => {
    const match = /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line);
    return match?.[1]?.trim() === heading ? [index] : [];
  });
  if (headings.length !== 1) return null;
  const start = headings[0] + 1;
  const relativeEnd = lines.slice(start).findIndex((line) => /^##(?!#)\s+/.test(line));
  return lines.slice(start, relativeEnd < 0 ? lines.length : start + relativeEnd)
    .join("\n")
    .trim();
}

function masterSpecFingerprint(content: string): string | null {
  const binding = sectionBody(content, "Master Spec binding");
  if (binding === null) return null;
  const matches = binding
    .split(/\r?\n/)
    .filter((line) => line.includes("Sourcera_Master_Spec.md"))
    .flatMap((line) =>
      [...line.matchAll(/(?:sha256:)?([a-f0-9]{64})/gi)].map((match) =>
        match[1].toLowerCase()
      )
    );
  return matches.length === 1 ? matches[0] : null;
}

function masterSpecSectionReferences(content: string): string[] {
  const binding = sectionBody(content, "Master Spec binding") ?? "";
  return [
    ...binding.matchAll(
      /§\s*((?:[A-M]\.)?\d+(?:\.\d+)*(?:[a-z])?)|\bAppendix\s+([A-M](?:\.\d+)*)\b/gi,
    ),
  ]
    .map((match) =>
      match[1]
        ? `§${match[1].replace(/^[a-m]\./i, (prefix) => prefix.toUpperCase())}`
        : `Appendix ${match[2].toUpperCase()}`
    )
    .filter((value, index, values) => values.indexOf(value) === index)
    .sort();
}

function lineNumberAt(content: string, offset: number): number {
  return content.slice(0, offset).split(/\r?\n/).length;
}

function contentPolicy(
  content: string,
  title: string,
): Pick<
  LinearProjectDocumentFingerprint,
  "unresolvedDecisionReferences" | "contentPolicyFindings"
> {
  const parsedReferences = nativeIssueReferences(content);
  const findings = [...parsedReferences.findings];
  const links = parsedReferences.links;
  const unresolved = sectionBody(content, "Unresolved decisions");
  const unresolvedStart = unresolved === null ? -1 : content.indexOf(unresolved);
  const unresolvedEnd = unresolvedStart < 0 ? -1 : unresolvedStart + unresolved!.length;
  const unresolvedLinks = links.filter(
    (link) => link.offset >= unresolvedStart && link.offset < unresolvedEnd,
  );
  const outsideLinks = links.filter((link) => !unresolvedLinks.includes(link));
  for (const link of outsideLinks) {
    findings.push(`native_issue_reference_outside_decisions:line_${lineNumberAt(content, link.offset)}`);
  }

  if (unresolved !== null) {
    const body = unresolved.trim();
    if (/^(?:none|no (?:open|unresolved) decisions)\.?$/i.test(body)) {
      if (unresolvedLinks.length) findings.push("unresolved_decisions_none_with_references");
    } else {
      const entries = body.split(/\r?\n/).filter((line) => line.trim());
      if (!entries.length) findings.push("unresolved_decisions_empty");
      for (const entry of entries) {
        const entryLinks = nativeIssueReferences(entry).links;
        if (!/^\s*[-*+]\s+/.test(entry) || entryLinks.length !== 1) {
          findings.push("unresolved_decision_entry_not_native_single_reference");
        }
      }
      if (!unresolvedLinks.length) findings.push("unresolved_decisions_lack_native_references");
      if (duplicate(unresolvedLinks.map((link) => link.identifier))) {
        findings.push("unresolved_decision_reference_duplicated");
      }
    }
  }

  const masked = content.split("");
  for (const link of links) {
    for (let index = link.offset; index < link.offset + link.raw.length; index++) {
      if (masked[index] !== "\n" && masked[index] !== "\r") masked[index] = " ";
    }
  }
  const unlinked = masked.join("");
  for (const match of unlinked.matchAll(/\b(?:PLA|BUY|SEL|INT)-\d+\b/g)) {
    findings.push(
      `manual_issue_reference:line_${lineNumberAt(unlinked, match.index ?? 0)}`,
    );
  }
  for (const match of unlinked.matchAll(/https:\/\/linear\.app\//gi)) {
    findings.push(`manual_linear_url:line_${lineNumberAt(unlinked, match.index ?? 0)}`);
  }
  if (/<issue\b/i.test(unlinked)) findings.push("manual_issue_markup");

  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const nativeField = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s+)?(?:\*\*)?(Release(?: version)?|Linear release|Team|Project|Initiative|Milestone|Parent|Owner|Lead|Assignee|Estimate|Priority|Labels|Status|State|Cycle|Due date|Start(?: date| on|s at)?|Target(?: date| on| completion)?|Deadline)(?:\*\*)?\s*:/i.exec(
      line,
    );
    if (nativeField) {
      findings.push(`native_field_${nativeField[1].toLowerCase().replace(/\s+/g, "_")}:line_${index + 1}`);
    }
    if (
      /^\s*#{1,6}\s+(?:Dependencies?|Prerequisites?|Blocking|Blockers?|Relations?)\b/i.test(line) ||
      /^\s*(?:[-*+]\s+)?(?:\*\*)?(?:Blocked by|Blocks|Depends on|Prerequisites?|Related(?: to)?)(?:\*\*)?\s*:/i.test(line)
    ) {
      findings.push(`native_relation_duplicated:line_${index + 1}`);
    }
    const heading = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/.exec(line)?.[1]?.trim();
    if (heading === title.trim()) {
      findings.push(`native_title_duplicated:line_${index + 1}`);
    }
  }
  for (const heading of lines.flatMap((line) => {
    const match = /^##(?!#)\s+(.+?)\s*#*\s*$/.exec(line);
    return match ? [match[1].trim()] : [];
  })) {
    if (sectionBody(content, heading)?.trim() === "") {
      findings.push(`empty_section:${heading}`);
    }
  }
  if (/\b(?:TBD|TODO|FIXME|REPLACE_WITH_[A-Z0-9_]+)\b|[<\[]placeholder[>\]]/i.test(content)) {
    findings.push("unresolved_placeholder");
  }

  return {
    unresolvedDecisionReferences: unresolvedLinks
      .map(({ identifier, url }) => ({ identifier, url }))
      .sort((left, right) => left.identifier.localeCompare(right.identifier)),
    contentPolicyFindings: [...new Set(findings)].sort(),
  };
}

export function linearProjectDocumentFingerprint(
  document: {
    id: string;
    title: string;
    content: string | null;
    updatedAt: string;
    archivedAt: string | null;
    initiative: { id: string } | null;
    project: { id: string; name: string } | null;
    team: { id: string } | null;
    issue: { id: string } | null;
  },
  fingerprint: (value: string | null | undefined) => string,
  sectionHeadings: (value: string | null | undefined) => string[],
): LinearProjectDocumentFingerprint {
  const content = document.content ?? "";
  return {
    id: document.id,
    title: document.title,
    updatedAt: document.updatedAt,
    archivedAt: document.archivedAt,
    initiativeId: document.initiative?.id ?? null,
    projectId: document.project?.id ?? null,
    projectName: document.project?.name ?? null,
    teamId: document.team?.id ?? null,
    issueId: document.issue?.id ?? null,
    contentFingerprint: fingerprint(content),
    sectionHeadings: sectionHeadings(content),
    masterSpecSha256: masterSpecFingerprint(content),
    masterSpecSections: masterSpecSectionReferences(content),
    ...contentPolicy(content, document.title),
  };
}

function add(findings: Finding[], code: string, message: string): void {
  findings.push({ code, message });
}

function scopeRowValid(
  row: LinearProjectDocumentScopeRow | LinearSupplementaryDocumentScopeRow,
): boolean {
  return Boolean(
    UUID.test(row?.id ?? "") &&
      UUID.test(row?.projectId ?? "") &&
      row?.title?.trim() &&
      SHA256.test(row?.contentFingerprint ?? "") &&
      Array.isArray(row?.requiredSections) &&
      row.requiredSections.length > 0 &&
      !duplicate(row.requiredSections) &&
      row.requiredSections.every((section) => section.trim()) &&
      Array.isArray(row?.masterSpecSections) &&
      row.masterSpecSections.length > 0 &&
      !duplicate(row.masterSpecSections) &&
      row.masterSpecSections.every((section) => section.trim()),
  );
}

function canonicalDecisionUrl(
  url: string,
  identifier: string,
  workspaceSlug: string,
): boolean {
  return new RegExp(
    `^https://linear\\.app/${workspaceSlug}/issue/${identifier}(?:/[a-z0-9-]+)?$`,
    "i",
  ).test(url);
}

export function linearProjectDocumentTitleReserved(
  title: string,
  canonical: LinearProjectDocumentScopeRow[],
  supplementary: LinearSupplementaryDocumentScopeRow[],
): boolean {
  const normalize = (value: string): string =>
    value
      .normalize("NFKC")
      .trim()
      .replace(/[-‐‑‒–—―−]/g, "—")
      .replace(/\s+/g, " ")
      .toLowerCase();
  const normalized = normalize(title);
  return [...canonical, ...supplementary].some(
    (row) => normalize(row.title) === normalized,
  ) || /^(?:prd|engineering\/readiness brief)\s*—\s*/.test(normalized);
}

export function linearProjectDocumentCaptureSelection<
  T extends {
    id: string;
    title: string;
    archivedAt: string | null;
    project: { id: string; name: string } | null;
  },
>(
  documents: T[],
  expectedDocumentIds: ReadonlySet<string>,
  governedProjectIds: ReadonlySet<string>,
  canonical: LinearProjectDocumentScopeRow[],
  supplementary: LinearSupplementaryDocumentScopeRow[],
): {
  governed: T[];
  conflicts: LinearProjectDocumentConflictFingerprint[];
} {
  return {
    governed: documents.filter((document) => expectedDocumentIds.has(document.id)),
    conflicts: documents
      .filter(
        (document) =>
          !expectedDocumentIds.has(document.id) &&
          document.archivedAt === null &&
          governedProjectIds.has(document.project?.id ?? "") &&
          linearProjectDocumentTitleReserved(
            document.title,
            canonical,
            supplementary,
          ),
      )
      .map((document) => ({
        id: document.id,
        title: document.title,
        projectId: document.project?.id ?? null,
        projectName: document.project?.name ?? null,
      })),
  };
}

export function linearProjectDocumentScopeFindings(
  canonical: LinearProjectDocumentScopeRow[],
  supplementary: LinearSupplementaryDocumentScopeRow[],
  projectIds: string[],
  decisionContract: LinearProjectDocumentDecisionContract,
): Finding[] {
  const findings: Finding[] = [];
  const canonicalIds = canonical.map((row) => row.id);
  const canonicalProjectIds = canonical.map((row) => row.projectId);
  const expectedEngineeringNames = new Set<string>(ENGINEERING_BRIEF_PROJECT_NAMES);
  if (
    canonical.length !== 26 ||
    canonical.filter((row) => row.kind === "prd").length !== 20 ||
    canonical.filter((row) => row.kind === "engineering_readiness_brief").length !== 6 ||
    duplicate(canonicalIds) ||
    duplicate(canonicalProjectIds) ||
    canonical.some(
      (row) =>
        !scopeRowValid(row) ||
        !row.projectName?.trim() ||
        (row.kind === "engineering_readiness_brief") !==
          expectedEngineeringNames.has(row.projectName) ||
        row.title !==
          `${
            row.kind === "prd" ? "PRD" : "Engineering/Readiness Brief"
          } — ${row.projectName}` ||
        CANONICAL_PROJECT_DOCUMENT_SECTIONS.some(
          (section) => !row.requiredSections.includes(section),
        ),
    ) ||
    projectIds.some((id) => !canonicalProjectIds.includes(id)) ||
    canonicalProjectIds.some((id) => !projectIds.includes(id))
  ) {
    add(
      findings,
      "linear_project_document_scope_invalid",
      "Canonical Linear project-document scope is incomplete or invalid",
    );
  }

  const supplementaryIds = supplementary.map((row) => row.id);
  const supplementaryTitles = supplementary.map((row) => row.title);
  const canonicalByProjectName = new Map(
    canonical.map((row) => [row.projectName, row]),
  );
  if (
    supplementary.length !== REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES.length ||
    duplicate(supplementaryIds) ||
    duplicate(supplementaryTitles) ||
    supplementary.some(
      (row) =>
        !scopeRowValid(row) ||
        !projectIds.includes(row.projectId) ||
        !REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES.includes(row.title) ||
        canonicalByProjectName.get(
          SUPPLEMENTARY_DOCUMENT_PROJECT_NAMES[row.title],
        )?.projectId !== row.projectId ||
        SUPPLEMENTARY_DOCUMENT_REQUIRED_SECTIONS[row.title].some(
          (section) => !row.requiredSections.includes(section),
        ),
    ) ||
    REQUIRED_SUPPLEMENTARY_DOCUMENT_TITLES.some(
      (title) => !supplementaryTitles.includes(title),
    ) ||
    supplementaryIds.some((id) => canonicalIds.includes(id))
  ) {
    add(
      findings,
      "linear_supplementary_document_scope_invalid",
      "Required R0 supplementary-document scope is incomplete or invalid",
    );
  }

  const documentIds = new Set([...canonicalIds, ...supplementaryIds]);
  const labelDefinitions = decisionContract?.labelDefinitions ?? [];
  const labelDefinitionIds = labelDefinitions.map((definition) => definition.id);
  const trackedDecisions = decisionContract?.trackedDecisions ?? [];
  const trackedDecisionIds = trackedDecisions.map(
    (decision) => decision.decisionIdentifier,
  );
  const trackedDecisionById = new Map(
    trackedDecisions.map((decision) => [decision.decisionIdentifier, decision]),
  );
  const references = decisionContract?.references ?? [];
  const referenceKeys = references.map(
    (reference) => `${reference.documentId}:${reference.decisionIdentifier}`,
  );
  const usedLabelIds = [...new Set(
    trackedDecisions.flatMap((decision) => decision.labelIds ?? []),
  )].sort();
  const decisionLabelDefinition = labelDefinitions.find(
    (definition) => definition.id === decisionContract?.decisionLabelId,
  );
  if (
    !exactKeys(decisionContract, [
      "workspaceSlug",
      "decisionLabelId",
      "labelDefinitions",
      "trackedDecisions",
      "references",
    ]) ||
    decisionContract?.workspaceSlug !== SOURCERA_LINEAR_WORKSPACE_SLUG ||
    decisionContract?.decisionLabelId !== SOURCERA_DECISION_LABEL_ID ||
    !Array.isArray(decisionContract?.labelDefinitions) ||
    labelDefinitions.length === 0 ||
    duplicate(labelDefinitionIds) ||
    labelDefinitions.some(
      (definition) =>
        !exactKeys(definition, ["id", "name", "groupId", "groupName"]) ||
        !UUID.test(definition.id) ||
        !definition.name.trim() ||
        !UUID.test(definition.groupId) ||
        !definition.groupName.trim(),
    ) ||
    decisionLabelDefinition?.name !== SOURCERA_DECISION_LABEL_NAME ||
    decisionLabelDefinition?.groupId !== SOURCERA_DECISION_LABEL_GROUP_ID ||
    decisionLabelDefinition?.groupName !== SOURCERA_DECISION_LABEL_GROUP_NAME ||
    !Array.isArray(decisionContract?.trackedDecisions) ||
    duplicate(trackedDecisionIds) ||
    trackedDecisions.some(
      (decision) =>
        !exactKeys(decision, [
          "decisionIdentifier",
          "decisionTitle",
          "decisionUrl",
          "descriptionFingerprint",
          "requiredSections",
          "decisionProjectId",
          "labelIds",
          "resolution",
          "blockedIssues",
        ]) ||
        !ISSUE_IDENTIFIER.test(decision.decisionIdentifier) ||
        !decision.decisionTitle?.trim() ||
        !SHA256.test(decision.descriptionFingerprint ?? "") ||
        !Array.isArray(decision.requiredSections) ||
        decision.requiredSections.length === 0 ||
        duplicate(decision.requiredSections) ||
        decision.requiredSections.some((section) => !section.trim()) ||
        !canonicalDecisionUrl(
          decision.decisionUrl,
          decision.decisionIdentifier,
          decisionContract.workspaceSlug,
        ) ||
        !UUID.test(decision.decisionProjectId) ||
        !projectIds.includes(decision.decisionProjectId) ||
        !Array.isArray(decision.labelIds) ||
        decision.labelIds.length === 0 ||
        duplicate(decision.labelIds) ||
        !decision.labelIds.includes(decisionContract.decisionLabelId) ||
        decision.labelIds.some((id) => !labelDefinitionIds.includes(id)) ||
        (decision.resolution !== "open" &&
          decision.resolution !== "completed") ||
        !Array.isArray(decision.blockedIssues) ||
        decision.blockedIssues.length === 0 ||
        duplicate(decision.blockedIssues.map((issue) => issue.identifier)) ||
        decision.blockedIssues.some(
          (issue) =>
            !exactKeys(issue, ["identifier", "projectId"]) ||
            !ISSUE_IDENTIFIER.test(issue.identifier) ||
            issue.identifier === decision.decisionIdentifier ||
            !UUID.test(issue.projectId) ||
            !projectIds.includes(issue.projectId),
        ),
    ) ||
    (trackedDecisions.length > 0 &&
      JSON.stringify(usedLabelIds) !==
        JSON.stringify([...labelDefinitionIds].sort())) ||
    !Array.isArray(decisionContract?.references) ||
    duplicate(referenceKeys) ||
    references.some(
      (reference) =>
        !exactKeys(reference, ["documentId", "decisionIdentifier"]) ||
        !documentIds.has(reference.documentId) ||
        !ISSUE_IDENTIFIER.test(reference.decisionIdentifier) ||
        trackedDecisionById.get(reference.decisionIdentifier)?.resolution !== "open",
    ) ||
    trackedDecisions.some(
      (decision) =>
        (decision.resolution === "open") !==
          references.some(
            (reference) =>
              reference.decisionIdentifier === decision.decisionIdentifier,
          ),
    )
  ) {
    add(
      findings,
      "linear_project_document_decision_scope_invalid",
      "Linear project-document Decision contract is missing or invalid",
    );
  }
  return findings;
}

export function linearProjectDocumentFingerprintFindings(
  canonical: LinearProjectDocumentScopeRow[],
  supplementary: LinearSupplementaryDocumentScopeRow[],
  live: LinearProjectDocumentFingerprint[],
  conflicts: LinearProjectDocumentConflictFingerprint[] = [],
): Finding[] {
  const findings: Finding[] = [];
  const expected = [...canonical, ...supplementary];
  const liveById = new Map(live.map((row) => [row.id, row]));
  const expectedIds = expected.map((row) => row.id).sort();
  const actualIds = live.map((row) => row.id).sort();
  if (
    duplicate(actualIds) ||
    JSON.stringify(actualIds) !== JSON.stringify(expectedIds)
  ) {
    add(
      findings,
      "linear_project_document_inventory_changed",
      "Attested Linear project-document IDs differ from the exact governed inventory",
    );
  }
  if (conflicts.length) {
    add(
      findings,
      "linear_project_document_unapproved",
      `Tracked projects contain conflicting active documents: ${conflicts.map((row) => row.title).sort().join(", ")}`,
    );
  }
  const canonicalByProjectId = new Map(
    canonical.map((row) => [row.projectId, row]),
  );
  for (const row of expected) {
    const actual = liveById.get(row.id);
    const expectedProjectName = "projectName" in row
      ? row.projectName
      : canonicalByProjectId.get(row.projectId)?.projectName;
    if (
      !actual ||
      actual.title !== row.title ||
      actual.archivedAt !== null ||
      actual.initiativeId !== null ||
      actual.projectId !== row.projectId ||
      actual.projectName !== expectedProjectName ||
      actual.teamId !== null ||
      actual.issueId !== null
    ) {
      add(
        findings,
        "linear_project_document_topology_changed",
        `Linear project document ${row.title} is missing or attached incorrectly`,
      );
      continue;
    }
    if (
      actual.contentFingerprint !== row.contentFingerprint ||
      !SHA256.test(actual.contentFingerprint)
    ) {
      add(
        findings,
        "linear_project_document_content_changed",
        `Linear project document ${row.title} differs from its approved body`,
      );
    }
    if (
      row.requiredSections.some((section) => !actual.sectionHeadings.includes(section)) ||
      duplicate(actual.sectionHeadings)
    ) {
      add(
        findings,
        "linear_project_document_section_missing",
        `Linear project document ${row.title} lacks required sections`,
      );
    }
    if (
      !SHA256.test(actual.masterSpecSha256 ?? "") ||
      JSON.stringify([...actual.masterSpecSections].sort()) !==
        JSON.stringify([...row.masterSpecSections].sort())
    ) {
      add(
        findings,
        "linear_project_document_master_spec_binding_invalid",
        `Linear project document ${row.title} lacks its exact Master Spec binding`,
      );
    }
    if (actual.contentPolicyFindings.length) {
      add(
        findings,
        "linear_project_document_native_metadata_duplicated",
        `Linear project document ${row.title} violates native-reference policy: ${actual.contentPolicyFindings.join(", ")}`,
      );
    }
  }
  return findings;
}

export function linearProjectDocumentDecisionFindings(
  documents: LinearProjectDocumentFingerprint[],
  decisionIssues: LinearDecisionIssueFingerprint[],
  issues: LinearDecisionTargetFingerprint[],
  contract: LinearProjectDocumentDecisionContract,
  expectedDocumentIds: string[],
): Finding[] {
  const findings: Finding[] = [];
  const expectedDocuments = new Set(expectedDocumentIds);
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const decisionIssueByIdentifier = new Map(
    decisionIssues.map((issue) => [issue.identifier.toUpperCase(), issue]),
  );
  const issueByIdentifier = new Map(
    issues.map((issue) => [issue.identifier.toUpperCase(), issue]),
  );
  const actualReferences = documents
    .filter((document) => expectedDocuments.has(document.id))
    .flatMap((document) =>
      document.unresolvedDecisionReferences.map((reference) => ({
        documentId: document.id,
        ...reference,
      }))
    );
  const actualKeys = actualReferences.map(
    (reference) => `${reference.documentId}:${reference.identifier}`,
  );
  const expectedKeys = contract.references.map(
    (reference) => `${reference.documentId}:${reference.decisionIdentifier}`,
  );
  if (
    duplicate(actualKeys) ||
    JSON.stringify([...actualKeys].sort()) !==
      JSON.stringify([...expectedKeys].sort())
  ) {
    add(
      findings,
      "linear_project_document_decision_inventory_changed",
      "Linear project-document Decision references differ from the approved contract",
    );
  }
  if (
    duplicate(decisionIssues.map((issue) => issue.identifier.toUpperCase()))
  ) {
    add(
      findings,
      "linear_project_document_decision_issue_duplicate",
      "Linear project-document Decision issues are duplicated",
    );
  }
  const expectedDecisionIds = contract.trackedDecisions
    .map((decision) => decision.decisionIdentifier.toUpperCase())
    .sort();
  const actualDecisionIds = decisionIssues
    .map((decision) => decision.identifier.toUpperCase())
    .sort();
  if (JSON.stringify(expectedDecisionIds) !== JSON.stringify(actualDecisionIds)) {
    add(
      findings,
      "linear_project_document_decision_history_changed",
      "Tracked Linear Decision identity or history differs from the approved contract",
    );
  }
  const inactive = (issue: LinearDecisionTargetFingerprint): boolean =>
    issue.archivedAt !== null ||
    ["completed", "canceled", "duplicate"].includes(issue.stateType);

  const trackedDecisionById = new Map(
    contract.trackedDecisions.map((decision) => [
      decision.decisionIdentifier.toUpperCase(),
      decision,
    ]),
  );
  const labelDefinitionById = new Map(
    contract.labelDefinitions.map((definition) => [definition.id, definition]),
  );
  for (const expectedReference of contract.references) {
    const expectedDecision = trackedDecisionById.get(
      expectedReference.decisionIdentifier.toUpperCase(),
    );
    const document = documentById.get(expectedReference.documentId);
    const reference = document?.unresolvedDecisionReferences.find(
      (candidate) =>
        candidate.identifier === expectedReference.decisionIdentifier,
    );
    if (
      !expectedDecision ||
      !document ||
      !reference ||
      reference.url !== expectedDecision.decisionUrl ||
      !canonicalDecisionUrl(
        reference.url,
        expectedReference.decisionIdentifier,
        contract.workspaceSlug,
      )
    ) {
      add(
        findings,
        "linear_project_document_decision_reference_invalid",
        `Linear project document ${document?.title ?? expectedReference.documentId} has a stale or mis-scoped Decision reference`,
      );
    }
  }

  for (const expected of contract.trackedDecisions) {
    const decision = decisionIssueByIdentifier.get(
      expected.decisionIdentifier.toUpperCase(),
    );
    const expectedLabels = expected.labelIds
      .map((id) => labelDefinitionById.get(id))
      .filter((definition): definition is LinearDecisionLabelDefinition =>
        definition !== undefined
      )
      .sort((left, right) => left.id.localeCompare(right.id));
    const actualLabels = [...(decision?.labels ?? [])]
      .sort((left, right) => left.id.localeCompare(right.id));
    const expectedBlocks = expected.blockedIssues
      .map(
        (target) =>
          `blocks:${expected.decisionIdentifier}:${target.identifier}`,
      )
      .sort();
    const actualOutgoingBlocks = (decision?.relations ?? [])
      .filter((relation) =>
        relation.startsWith(`blocks:${expected.decisionIdentifier}:`)
      )
      .sort();
    let invalid =
      !decision ||
      decision.title !== expected.decisionTitle ||
      decision.url !== expected.decisionUrl ||
      decision.descriptionFingerprint !== expected.descriptionFingerprint ||
      expected.requiredSections.some(
        (section) => !decision.sectionHeadings.includes(section),
      ) ||
      duplicate(decision.sectionHeadings) ||
      decision.archivedAt !== null ||
      decision.projectId !== expected.decisionProjectId ||
      JSON.stringify(actualLabels) !== JSON.stringify(expectedLabels) ||
      JSON.stringify(actualOutgoingBlocks) !== JSON.stringify(expectedBlocks) ||
      (expected.resolution === "open"
        ? inactive(decision)
        : decision.stateType !== "completed");

    for (const expectedTarget of expected.blockedIssues) {
      const target = issueByIdentifier.get(expectedTarget.identifier.toUpperCase());
      const exactBlock =
        `blocks:${expected.decisionIdentifier}:${expectedTarget.identifier}`;
      invalid ||=
        !target ||
        target.projectId !== expectedTarget.projectId ||
        !target.relations.includes(exactBlock) ||
        (expected.resolution === "open" && inactive(target));
    }
    if (invalid) {
      add(
        findings,
        "linear_project_document_decision_reference_invalid",
        `Tracked Linear Decision ${expected.decisionIdentifier} has stale identity, labels, lifecycle, or blocking relations`,
      );
    }
  }
  return findings;
}
