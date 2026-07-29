#!/usr/bin/env node

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface Finding {
  severity: string;
  file: string;
  line: number;
  id: string;
  message: string;
}

interface StampResult {
  summary: {
    runtime_rows: number;
    runtime_status_counts: Record<string, number>;
    blocker_count: number;
  };
  findings: Finding[];
}

interface InventoryRow extends Finding {
  blockerKind: "runtime_evidence" | "release_ratification" | "other";
  section: string;
  sourcePhase: string;
  runtimeStatus: string;
  owningPack: string;
  rowClassOrScope: string;
  executionContext: string;
  assertion: string;
  missingEvidence: string;
  artifactStatus: string;
  evidencePosture: string;
}

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);

const root = resolve(args.get("--root") ?? ".");
const stampPath = args.get("--stamp-json");
const mdPath = args.get("--md");
const csvPath = args.get("--csv");
const matrixPath = args.get("--matrix");
const closurePlanPath = args.get("--closure-plan");
const date = args.get("--date") ?? new Date().toISOString().slice(0, 10);
if (!stampPath || !mdPath || !csvPath) {
  throw new Error(
    "Required: --stamp-json <path> --md <path> --csv <path> [--matrix <path>] [--closure-plan <path>] [--date YYYY-MM-DD]",
  );
}

const stamp = JSON.parse(readFileSync(resolve(root, stampPath), "utf8")) as StampResult;
const specPath = resolve(root, "Sourcera_Master_Spec.md");
const specLines = readFileSync(specPath, "utf8").split(/\r?\n/);

function cells(line: string): string[] {
  return line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

const DEFECT_STATUS_RE = /^(open|blocked|proposed_extension|wont_fix|remediated|superseded|partially_remediated)(\s|$)/i;
const CLOSED_DEFECT_STATUS_RE = /remediat|superseded|wont_fix|partially/i;

function canonicalDefectStatus(parsed: string[]): string | undefined {
  for (let index = parsed.length - 1; index >= Math.max(0, parsed.length - 6); index -= 1) {
    if (DEFECT_STATUS_RE.test(parsed[index])) return parsed[index];
  }
  return undefined;
}

function key(value: string): string {
  return value.toLowerCase().replace(/[`*]/g, "").replace(/\s+/g, " ").trim();
}

function nearestSection(lineNumber: number): string {
  for (let index = lineNumber - 1; index >= 0; index--) {
    const match = specLines[index].match(/^####\s+(.+)$/);
    if (match) return match[1];
  }
  return "Unknown section";
}

function tableHeader(lineNumber: number): string[] {
  for (let index = lineNumber - 2; index >= 0; index--) {
    const line = specLines[index];
    if (!line.startsWith("|")) continue;
    const parsed = cells(line);
    const names = parsed.map(key);
    if (
      names.some((name) => name === "gate id" || name === "gate_id") &&
      names.some((name) => name === "runtime status" || name === "runtime_status")
    ) return parsed;
  }
  throw new Error(`No §M.5 header found above line ${lineNumber}`);
}

function field(headers: string[], values: string[], ...aliases: string[]): string {
  const normalized = headers.map(key);
  for (const alias of aliases) {
    const index = normalized.indexOf(alias);
    if (index >= 0) return values[index] ?? "";
  }
  return "";
}

function clean(value: string): string {
  const cleaned = value.replace(/\*\*/g, "").trim();
  if (/^`[^`]+`$/.test(cleaned)) return cleaned.slice(1, -1);
  return cleaned;
}

const evidenceByStatus: Record<string, string[]> = {
  spec_binding_pending_pack_m11_3: [
    ".github/workflows/deploy-validator.yml",
    ".github/workflows/test-strategy.yml",
    "convex/deploy_validators",
    "tests/integration",
  ],
  spec_binding_pending_pack_m21_3: [
    ".github/workflows/marketplace-runtime.yml",
    "convex/deploy_validators",
    "tests/marketplace",
    "tests/analytics",
  ],
  spec_binding_pending_pack_m24_3: [
    ".github/workflows/billing-runtime.yml",
    "tests/billing",
    "convex/deploy_validators",
  ],
};

function requiredArtifacts(assertion: string, status: string, gateId: string, message: string): string[] {
  const marker = assertion.match(
    /\bRequired (?:(?:missing|runtime|future)(?:\/(?:missing|runtime|future))?\s+)*artifacts?:/i,
  );
  if (marker?.index !== undefined) {
    const paths = [...assertion.slice(marker.index + marker[0].length).matchAll(/`([^`]+)`/g)]
      .map((item) => item[1]);
    if (paths.length) return paths;
  }
  const localGuardPaths = [...assertion.matchAll(/Local (?:pr_lint )?guard `([^`]+)`/gi)].map((item) => item[1]);
  if (localGuardPaths.length) return localGuardPaths;
  const checkedMarker = message.indexOf("Checked:");
  if (checkedMarker >= 0) {
    const paths = message
      .slice(checkedMarker + "Checked:".length)
      .trim()
      .replace(/\.$/, "")
      .split(/,\s*/)
      .filter(Boolean);
    if (paths.length) return paths;
  }
  return (evidenceByStatus[status] ?? []).map((path) => path.replace("<gate_id>", gateId));
}

function missingEvidenceDescription(assertion: string, executionContext: string, artifacts: string[]): string {
  const boundary = assertion.match(/((?:deployed|current)[^.]*?evidence remains required)/i)?.[1];
  if (boundary) return boundary;
  const pendingBoundary = assertion.match(/((?:the )?composite row remains pending for (?:`[^`]+`|[^.])*)/i)?.[1];
  if (pendingBoundary) return pendingBoundary;
  if (/\bRequired (?:(?:missing|runtime|future)(?:\/(?:missing|runtime|future))?\s+)*artifacts?:/i.test(assertion)
    && artifacts.length) return artifacts.join(", ");
  const context = (executionContext || "runtime proof named by the row assertion").replace(/[.]+$/, "");
  if (/local (?:pr_lint )?guard/i.test(assertion)) return `External execution evidence required: ${context}.`;
  if (artifacts.length) return artifacts.join(", ");
  return `Execution context requires: ${context}.`;
}

function releaseRatificationRow(finding: Finding): InventoryRow {
  return {
    ...finding,
    blockerKind: "release_ratification",
    section: "Authored Extension ratification",
    sourcePhase: "v7.1.1 AE ledger",
    runtimeStatus: "release_gate_pending_ae",
    owningPack: "human_ratification",
    rowClassOrScope: "authored_extension",
    executionContext: "human ratification",
    assertion: "Pending human sign-off for the target stamp.",
    missingEvidence: "Human ratification by the named sign-off owner(s).",
    artifactStatus: "not a product-runtime artifact",
    evidencePosture: "human_ratification_pending",
  };
}

function artifactPresence(artifactStatus: string): "all_missing" | "mixed" | "all_present" | "none_named" {
  if (artifactStatus === "no named local artifact path") return "none_named";
  const statuses = artifactStatus.split("; ").filter(Boolean);
  const present = statuses.filter((status) => status.endsWith(":present")).length;
  const missing = statuses.filter((status) => status.endsWith(":missing")).length;
  if (present > 0 && missing > 0) return "mixed";
  if (present > 0) return "all_present";
  return "all_missing";
}

function evidencePosture(assertion: string, artifactStatus: string): string {
  const presence = artifactPresence(artifactStatus);
  if (presence === "mixed") return "partial_local_chain_external_evidence_pending";
  if (presence === "all_present" && /local (?:pr_lint )?guard/i.test(assertion)) {
    return "local_guard_present_external_evidence_pending";
  }
  if (presence === "all_present") return "named_artifacts_present_runtime_status_pending";
  return "required_product_runtime_evidence_missing";
}

function artifactExists(path: string): boolean {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) && !statSync(absolutePath).isDirectory();
}

function runtimeEvidenceRow(finding: Finding): InventoryRow {
  const values = cells(specLines[finding.line - 1]);
  const headers = tableHeader(finding.line);
  const section = nearestSection(finding.line);
  const runtimeStatus = finding.message.match(/spec_binding_pending_pack_[a-z0-9_]+/)?.[0]
    ?? clean(field(headers, values, "runtime status", "runtime_status"));
  const assertion = clean(field(headers, values, "assertion (summary)", "assertion", "trigger"));
  const executionContext = clean(field(
    headers,
    values,
    "execution context",
    "execution_context",
    "source scope (files / detectors / fixtures)",
    "source scope",
    "scope",
  ));
  const artifacts = requiredArtifacts(assertion, runtimeStatus, finding.id, finding.message);
  const artifactStatus = artifacts.length > 0
    ? artifacts.map((path) => `${path}:${artifactExists(path) ? "present" : "missing"}`).join("; ")
    : "no named local artifact path";
  return {
    ...finding,
    blockerKind: "runtime_evidence",
    section,
    sourcePhase: clean(field(headers, values, "source phase", "source_phase")) || section.replace(/^M\.5\.\d+\s*/, ""),
    runtimeStatus,
    owningPack: (clean(field(headers, values, "pack")) || runtimeStatus.replace("spec_binding_pending_pack_", "")).toLowerCase().replace(/\./g, "_"),
    rowClassOrScope: clean(field(headers, values, "row class", "row_class", "scope")),
    executionContext,
    assertion,
    missingEvidence: missingEvidenceDescription(assertion, executionContext, artifacts),
    artifactStatus,
    evidencePosture: evidencePosture(assertion, artifactStatus),
  };
}

const rows: InventoryRow[] = stamp.findings.map((finding) => {
  if (finding.file.endsWith("AUTHORED_EXTENSIONS_LEDGER.md") || finding.id.startsWith("AE-") || finding.id.startsWith("BC-")) {
    return releaseRatificationRow(finding);
  }
  return runtimeEvidenceRow(finding);
});

const duplicateIds = rows
  .map((row) => row.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  throw new Error(`Duplicate live blocker ids: ${[...new Set(duplicateIds)].sort().join(", ")}`);
}

function csv(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const csvHeaders = [
  "id", "blocker_kind", "file", "line", "section", "severity", "source_phase", "runtime_status", "owning_pack",
  "row_class_or_scope", "execution_context", "assertion", "missing_evidence", "evidence_artifact_status", "evidence_posture", "message",
];
const csvBody = [csvHeaders.join(","), ...rows.map((row) => [
  row.id, row.blockerKind, row.file, row.line, row.section, row.severity, row.sourcePhase, row.runtimeStatus, row.owningPack,
  row.rowClassOrScope, row.executionContext, row.assertion, row.missingEvidence, row.artifactStatus, row.evidencePosture, row.message,
].map(csv).join(","))].join("\n") + "\n";
writeFileSync(resolve(root, csvPath), csvBody);

const ledgerLines = readFileSync(resolve(root, "_audit/DEFECT_LEDGER.md"), "utf8").split(/\r?\n/);
const defectCounts: Record<string, number> = { P0: 0, P1: 0, P2: 0, P3: 0, blockedP1: 0 };
for (const line of ledgerLines) {
  if (!line.startsWith("| D-")) continue;
  const parsed = cells(line);
  const severity = parsed[1];
  if (!(severity in defectCounts) || parsed.length < 12) continue;
  const status = canonicalDefectStatus(parsed);
  if (!status || CLOSED_DEFECT_STATUS_RE.test(status)) continue;
  if (/^open(\s|$)/i.test(status) && severity in defectCounts) defectCounts[severity]++;
  if (severity === "P1" && /^blocked(\s|$)/i.test(status)) defectCounts.blockedP1++;
}

function md(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const statusCounts = stamp.summary.runtime_status_counts;
const byPack = new Map<string, number>();
for (const row of rows) byPack.set(row.owningPack, (byPack.get(row.owningPack) ?? 0) + 1);
const m02 = rows.filter((row) => row.owningPack === "m02_3");
const runtimeEvidenceRows = rows.filter((row) => row.blockerKind === "runtime_evidence");
const ratificationRows = rows.filter((row) => row.blockerKind === "release_ratification");
const artifactPresenceCounts = { allMissing: 0, mixed: 0, allPresent: 0, noneNamed: 0 };
for (const row of runtimeEvidenceRows) {
  const presence = artifactPresence(row.artifactStatus);
  if (presence === "mixed") artifactPresenceCounts.mixed++;
  else if (presence === "all_present") artifactPresenceCounts.allPresent++;
  else if (presence === "none_named") artifactPresenceCounts.noneNamed++;
  else artifactPresenceCounts.allMissing++;
}
const byEvidencePosture = new Map<string, number>();
for (const row of rows) byEvidencePosture.set(row.evidencePosture, (byEvidencePosture.get(row.evidencePosture) ?? 0) + 1);

let report = `# v7.1.1 Runtime Stamp-Gate Blocker Inventory\n\n`;
report += `**Date:** ${date}\n`;
report += `**Source command:** \`tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json\`\n`;
report += `**Full row inventory:** \`${csvPath}\`\n`;
report += `**JSON source:** \`${stampPath}\`\n\n`;
report += `## Verdict\n\nStamp gate outcome: **FAIL**.\n`;
report += `Runtime rows parsed: **${stamp.summary.runtime_rows}**.\n`;
report += `Runtime active rows: **${statusCounts.runtime_active ?? 0}**.\n`;
report += `Blockers: **${stamp.summary.blocker_count}**.\n\n`;
report += `Exact-status right-edge scan: **${defectCounts.P0} open P0, ${defectCounts.P1} open P1, ${defectCounts.blockedP1} blocked P1, ${defectCounts.P2} open P2, ${defectCounts.P3} open P3**.\n\n`;
if (ratificationRows.length === 0) {
  report += `The inventory reports the current documentation posture. All current blockers are product/runtime evidence; release-ratification blockers are zero. Runtime rows close only when the named evidence lands and the Master Spec status is explicitly promoted to \`runtime_active\`.\n\n`;
} else {
  report += `The inventory reports the current documentation posture and exposes both product/runtime evidence and release-ratification blockers. Runtime rows close only when the named evidence lands and the Master Spec status is explicitly promoted to \`runtime_active\`; an Authored Extension row closes only on its explicit ledger disposition.\n\n`;
}
report += `## Runtime Status Counts\n\n| Runtime status | Count |\n|---|---:|\n`;
for (const [status, count] of Object.entries(statusCounts)) report += `| \`${status}\` | ${count} |\n`;
report += `\n## Blockers By Owning Pack\n\n| Owning pack | Blockers | Missing evidence class |\n|---|---:|---|\n`;
const descriptions: Record<string, string> = {
  m02_3: "Local spec guards where applicable, plus the product, deploy, schema, render, and runtime proof named by each row.",
  m11_3: "Deploy validators, product workflows, integration/render tests, and runtime evidence.",
  m21_3: "Marketplace/mobile/runtime UI workflows, validators, accessibility, marketplace, and analytics tests.",
  m24_3: "Billing runtime workflows, billing tests, API guards, and deploy validators.",
  human_ratification: "No active human-ratification work; this count must remain zero.",
};
for (const pack of ["m02_3", "m11_3", "m21_3", "m24_3", "human_ratification"]) {
  report += `| \`${pack}\` | ${byPack.get(pack) ?? 0} | ${descriptions[pack]} |\n`;
}
report += `| \`release_gate_only\` | 0 | Release-orchestration rows are not blockers. |\n\n`;
report += `## Artifact Presence Check\n\nNamed path presence: **${artifactPresenceCounts.allMissing} all missing / ${artifactPresenceCounts.mixed} mixed / ${artifactPresenceCounts.allPresent} all present / ${artifactPresenceCounts.noneNamed} not named**. A present local path does not promote a pending runtime row. Rows without a named local path are classified from their execution context and assertion. The row remains blocked until every assertion and external product/runtime proof named by its §M.5 contract passes. Human sign-off blockers: ${ratificationRows.length}.\n\n`;
report += `| Evidence posture | Count |\n|---|---:|\n`;
for (const [posture, count] of [...byEvidencePosture.entries()].sort(([left], [right]) => left.localeCompare(right))) {
  report += `| \`${posture}\` | ${count} |\n`;
}
report += `\n`;
report += `## Current M02.3 Blockers\n\n| Gate | Line | Section | Execution context | Evidence posture | Missing evidence | Artifact status |\n|---|---:|---|---|---|---|---|\n`;
for (const row of m02) report += `| \`${row.id}\` | ${row.line} | ${md(row.section)} | ${md(row.executionContext)} | \`${row.evidencePosture}\` | ${md(row.missingEvidence)} | ${md(row.artifactStatus)} |\n`;
report += `\n## Full Blocker Inventory\n\n| Blocker | Kind | Line | Section | Runtime status | Owning pack | Source phase | Execution context | Evidence posture | Missing evidence | Artifact status |\n|---|---|---:|---|---|---|---|---|---|---|---|\n`;
for (const row of rows) {
  report += `| \`${row.id}\` | \`${row.blockerKind}\` | ${row.line} | ${md(row.section)} | \`${row.runtimeStatus}\` | \`${row.owningPack}\` | ${md(row.sourcePhase)} | ${md(row.executionContext)} | \`${row.evidencePosture}\` | ${md(row.missingEvidence)} | ${md(row.artifactStatus)} |\n`;
}
writeFileSync(resolve(root, mdPath), report);

interface MatrixGroupRouting {
  byGate: Map<string, string>;
  groupOrder: string[];
}

const BOOTSTRAP_EXECUTION_GROUPS: Record<string, string> = {
  buyer_trial_audit_action_registration: "Billing, wallets, trials, subscriptions, and settlement",
  query_scoping_console_required: "Identity, permissions, entitlements, and console isolation",
};

function unquoteCsv(value: string): string {
  return value.replace(/""/g, '"');
}

function readMatrixGroupRouting(path: string): MatrixGroupRouting {
  const lines = readFileSync(resolve(root, path), "utf8").split(/\r?\n/).filter(Boolean);
  const expectedHeader = "execution_group,gate_id,release_evidence_lane,evidence_posture,required_execution,missing_evidence";
  if (lines[0] !== expectedHeader) throw new Error(`Unexpected execution-matrix header in ${path}`);

  const byGate = new Map<string, string>();
  const groupOrder: string[] = [];
  for (const line of lines.slice(1)) {
    const match = line.match(/^"((?:[^"]|"")*)","((?:[^"]|"")*)",/);
    if (!match) throw new Error(`Malformed execution-matrix row in ${path}: ${line}`);
    const group = unquoteCsv(match[1]);
    const gateId = unquoteCsv(match[2]);
    if (byGate.has(gateId)) throw new Error(`Duplicate execution-matrix gate id: ${gateId}`);
    byGate.set(gateId, group);
    if (!groupOrder.includes(group)) groupOrder.push(group);
  }
  return { byGate, groupOrder };
}

interface MatrixGroupCount {
  total: number;
  byLane: Record<string, number>;
}

function writeExecutionMatrix(path: string): Map<string, MatrixGroupCount> {
  const routing = readMatrixGroupRouting(path);
  for (const [gateId, group] of Object.entries(BOOTSTRAP_EXECUTION_GROUPS)) {
    const prior = routing.byGate.get(gateId);
    if (prior && prior !== group) {
      throw new Error(`Execution-group bootstrap drift for ${gateId}: expected ${group}, got ${prior}`);
    }
    routing.byGate.set(gateId, group);
    if (!routing.groupOrder.includes(group)) routing.groupOrder.push(group);
  }

  const unknown = rows.filter((row) => !routing.byGate.has(row.id)).map((row) => row.id).sort();
  if (unknown.length > 0) {
    throw new Error(`Live blockers lack execution-group routing: ${unknown.join(", ")}`);
  }

  const groupIndex = new Map(routing.groupOrder.map((group, index) => [group, index]));
  const sortedRows = rows
    .map((row, index) => ({ row, index, group: routing.byGate.get(row.id)! }))
    .sort((left, right) => (
      (groupIndex.get(left.group) ?? Number.MAX_SAFE_INTEGER) - (groupIndex.get(right.group) ?? Number.MAX_SAFE_INTEGER)
      || left.index - right.index
    ));

  const header = "execution_group,gate_id,release_evidence_lane,evidence_posture,required_execution,missing_evidence";
  const body = [header, ...sortedRows.map(({ row, group }) => [
    group,
    row.id,
    row.owningPack,
    row.evidencePosture,
    row.executionContext,
    row.missingEvidence,
  ].map(csv).join(","))].join("\n") + "\n";
  writeFileSync(resolve(root, path), body);

  const counts = new Map<string, MatrixGroupCount>();
  for (const { row, group } of sortedRows) {
    const current = counts.get(group) ?? { total: 0, byLane: {} };
    current.total += 1;
    current.byLane[row.owningPack] = (current.byLane[row.owningPack] ?? 0) + 1;
    counts.set(group, current);
  }
  return counts;
}

function replaceRequired(text: string, pattern: RegExp, replacement: string, label: string): string {
  if (!pattern.test(text)) throw new Error(`Closure-plan field not found: ${label}`);
  pattern.lastIndex = 0;
  return text.replace(pattern, replacement);
}

function refreshClosurePlan(path: string, groupCounts: Map<string, MatrixGroupCount>): void {
  let text = readFileSync(resolve(root, path), "utf8");
  const requiredMissing = byEvidencePosture.get("required_product_runtime_evidence_missing") ?? 0;
  const localGuardPending = byEvidencePosture.get("local_guard_present_external_evidence_pending") ?? 0;
  const partialChain = byEvidencePosture.get("partial_local_chain_external_evidence_pending") ?? 0;

  text = replaceRequired(text, /^\*\*Date:\*\* .+$/m, `**Date:** ${date}`, "date");
  text = replaceRequired(text, /^- \d+ runtime rows$/m, `- ${stamp.summary.runtime_rows} runtime rows`, "runtime rows");
  text = replaceRequired(
    text,
    /^- \d+ `runtime_active`$/m,
    `- ${stamp.summary.runtime_status_counts.runtime_active ?? 0} \`runtime_active\``,
    "runtime-active rows",
  );
  text = replaceRequired(text, /^- \d+ product\/runtime blockers$/m, `- ${rows.length} product/runtime blockers`, "blockers");
  text = replaceRequired(
    text,
    /^- \d+ rows missing required product\/runtime evidence$/m,
    `- ${requiredMissing} rows missing required product/runtime evidence`,
    "missing evidence",
  );
  text = replaceRequired(
    text,
    /^- \d+ rows with a local guard but external proof pending$/m,
    `- ${localGuardPending} rows with a local guard but external proof pending`,
    "local guards",
  );
  text = replaceRequired(
    text,
    /^- \d+ row(?:s)? with a partial local chain$/m,
    `- ${partialChain} ${partialChain === 1 ? "row" : "rows"} with a partial local chain`,
    "partial chains",
  );
  text = replaceRequired(
    text,
    /^- \d+ human-ratification blockers$/m,
    `- ${ratificationRows.length} human-ratification blockers`,
    "human ratification",
  );
  text = replaceRequired(
    text,
    /The execution matrix maps all \d+ blockers/,
    `The execution matrix maps all ${rows.length} blockers`,
    "matrix blocker count",
  );

  const laneOrder = ["m02_3", "m11_3", "m21_3", "m24_3"];
  let summary = "| Execution group | Rows | M02.3 | M11.3 | M21.3 | M24.3 |\n";
  summary += "|---|---:|---:|---:|---:|---:|\n";
  for (const [group, counts] of groupCounts) {
    summary += `| ${group} | ${counts.total} | ${laneOrder.map((lane) => counts.byLane[lane] ?? 0).join(" | ")} |\n`;
  }
  summary += `| **Total** | **${rows.length}** | ${laneOrder.map((lane) => `**${byPack.get(lane) ?? 0}**`).join(" | ")} |`;
  text = replaceRequired(
    text,
    /\| Execution group \| Rows \| M02\.3 \| M11\.3 \| M21\.3 \| M24\.3 \|\n\|---\|---:\|---:\|---:\|---:\|---:\|\n(?:\|.*\|\n)*?\| \*\*Total\*\* \|.*\|/,
    summary,
    "execution summary",
  );

  for (const [group, counts] of groupCounts) {
    const escaped = group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = replaceRequired(
      text,
      new RegExp(`(## ${escaped}\\n\\n\\*\\*Rows:\\*\\*) \\d+`),
      `$1 ${counts.total}`,
      `${group} row count`,
    );
  }
  writeFileSync(resolve(root, path), text);
}

if (matrixPath) {
  const groupCounts = writeExecutionMatrix(matrixPath);
  if (closurePlanPath) refreshClosurePlan(closurePlanPath, groupCounts);
} else if (closurePlanPath) {
  throw new Error("--closure-plan requires --matrix");
}

process.stdout.write(JSON.stringify({
  rows: rows.length,
  blockersByPack: Object.fromEntries(byPack),
  matrixRows: matrixPath ? rows.length : undefined,
}) + "\n");
