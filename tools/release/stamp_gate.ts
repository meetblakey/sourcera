#!/usr/bin/env node
/**
 * Sourcera release stamp gate.
 *
 * Gate: `v7_1_1_stamp_gate_runtime_status_audit`
 * Authority: Sourcera_Master_Spec.md §M.5.4 release-stamp-gate row and §M.5.1.1.
 *
 * This tool is intentionally fail-closed. It does not promote runtime rows and
 * does not infer missing product-code artifacts from prose. A row passes only
 * when the catalog status and local evidence are already present.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type Severity = "info" | "blocker";

interface Finding {
  severity: Severity;
  file: string;
  line: number;
  id: string;
  message: string;
}

interface Doc {
  path: string;
  text: string;
  lines: string[];
}

interface GateRow {
  id: string;
  runtimeStatus: string;
  pack: string;
  line: number;
  table: string;
}

interface Args {
  spec: string;
  aeLedger: string;
  defectLedger: string;
  json: boolean;
}

const STATUS_RE =
  /\b(runtime_active|spec_binding_pending_pack_[a-z0-9_]+|spec_binding_release_gate_only)\b/;
const GATE_ID_RE = /^`([a-z0-9_]+)`$/;
const AE_ID_RE = /^(?:AE|BC)-[A-Za-z0-9_.-]+$/;
const DEFECT_ID_RE = /^D-[A-Za-z0-9_.-]+$/;
const VERSION_RE = /\bv7\.(0\.0|1\.0a|1\.0|1\.1)\b/;
const RUNTIME_ACTIVE_ARTIFACTS: Record<string, string[]> = {
  appendix_k_glossary_canonicality: [join("tools", "spec-lint", "appendix_k_canonicality.ts")],
  appendix_m_coverage_on_diff: [join("tools", "spec-lint", "appendix_m_coverage_on_diff.ts")],
  appendix_m_tier_visibility_smoke: [
    join("tools", "release", "runtime_evidence", "appendix_m_tier_visibility_smoke.json"),
  ],
  appendix_m5_override_path_canonicalization: [join("tools", "spec-lint", "sibling_override_cli.ts")],
  spec_lint_comment_template_canonicality: [join("tools", "spec-lint", "comment_templates.ts")],
  entity_console_field_or_scope_paragraph_required: [
    join("tools", "spec-lint", "gates", "entity_console_scope_paragraph_required.ts"),
  ],
};
const PENDING_ARTIFACTS: Record<string, string[]> = {
  appendix_m_coverage_on_diff: [
    join("tools", "spec-lint", "appendix_m_coverage_on_diff.ts"),
    join("tools", "spec-lint", "override_parser.ts"),
    join("tools", "spec-lint", "cross_validation.ts"),
    join("tools", "spec-lint", "cosmetic_edit_filter.ts"),
    join("tools", "spec-lint", "comment_poster.ts"),
    join("tools", "spec-lint", "audit_emit.ts"),
    join(".github", "workflows", "spec-lint.yml"),
    join("convex", "crons", "appendix_m_gate_nightly_digest.ts"),
    join("convex", "audit", "spec_lint_audit_event.ts"),
    join("tools", "release", "runtime_evidence", "appendix_m_coverage_on_diff.json"),
  ],
};

function parseArgs(argv: string[]): Args {
  const out: Args = {
    spec: "Sourcera_Master_Spec.md",
    aeLedger: "_integration/AUTHORED_EXTENSIONS_LEDGER.md",
    defectLedger: "_audit/DEFECT_LEDGER.md",
    json: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--spec") out.spec = next();
    else if (a === "--ae-ledger") out.aeLedger = next();
    else if (a === "--defect-ledger") out.defectLedger = next();
    else if (a === "--json") out.json = true;
  }
  return out;
}

function loadDoc(path: string): Doc {
  const text = readFileSync(path, "utf8");
  return { path, text, lines: ["", ...text.split(/\r?\n/)] };
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function splitRow(raw: string): string[] {
  const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "\\" && trimmed[i + 1] === "|") {
      cur += "\\|";
      i++;
      continue;
    }
    if (trimmed[i] === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += trimmed[i];
  }
  cells.push(cur.trim());
  return cells;
}

function isDelimiter(cells: string[]): boolean {
  return cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
}

function headerKey(s: string): string {
  return stripMd(s).toLowerCase().replace(/[\s-]+/g, "_");
}

function parseGateRows(doc: Doc): GateRow[] {
  const rows: GateRow[] = [];
  let header: string[] | null = null;
  let statusIndex = -1;
  let idIndex = -1;
  let tableName = "";

  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line];
    if (/^#{2,6}\s+/.test(raw)) tableName = stripMd(raw.replace(/^#{2,6}\s+/, ""));
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      header = null;
      statusIndex = -1;
      idIndex = -1;
      continue;
    }
    const cells = splitRow(raw);
    if (isDelimiter(cells)) continue;
    if (!header) {
      header = cells;
      const keys = cells.map(headerKey);
      statusIndex = keys.findIndex((k) => k === "runtime_status");
      idIndex = keys.findIndex((k) => k === "gate_id" || k === "gate");
      if (idIndex < 0) idIndex = 0;
      continue;
    }
    if (statusIndex < 0) continue;
    const gateCell = cells[idIndex] ?? cells[0] ?? "";
    const idMatch = GATE_ID_RE.exec(gateCell.trim());
    if (!idMatch) continue;
    const status = stripMd(cells[statusIndex] ?? "");
    const statusMatch = STATUS_RE.exec(status);
    rows.push({
      id: idMatch[1],
      runtimeStatus: statusMatch?.[1] ?? status,
      pack: statusMatch?.[1]?.replace(/^spec_binding_pending_pack_/, "") ?? "",
      line,
      table: tableName,
    });
  }
  return rows;
}

function dedupeGateRows(rows: GateRow[]): GateRow[] {
  const byId = new Map<string, GateRow>();
  for (const row of rows) {
    const prior = byId.get(row.id);
    if (!prior || row.line > prior.line) byId.set(row.id, row);
  }
  return [...byId.values()].sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
}

function artifactCandidates(root: string, row: GateRow): string[] {
  const explicit = PENDING_ARTIFACTS[row.id];
  if (explicit) return explicit.map((candidate) => join(root, candidate));
  const specLintGate = join(root, "tools", "spec-lint", "gates", `${row.id}.ts`);
  const releaseGate = join(root, "tools", "release", `${row.id}.ts`);
  const releaseSelf = join(root, "tools", "release", "stamp_gate.ts");
  switch (row.pack) {
    case "m02_3":
      return [];
    case "release_orchestration":
      return [specLintGate, releaseGate, releaseSelf];
    case "m11_3":
      return [
        join(root, ".github", "workflows", "deploy-validator.yml"),
        join(root, ".github", "workflows", "test-strategy.yml"),
        join(root, "convex", "deploy_validators"),
        join(root, "tests", "integration"),
      ];
    case "m21_3":
      return [
        join(root, ".github", "workflows", "marketplace-runtime.yml"),
        join(root, "convex", "deploy_validators"),
        join(root, "tests", "marketplace"),
        join(root, "tests", "analytics"),
      ];
    case "m24_3":
      return [
        join(root, ".github", "workflows", "billing-runtime.yml"),
        join(root, "tests", "billing"),
        join(root, "convex", "deploy_validators"),
      ];
    default:
      return [];
  }
}

function hasArtifact(root: string, row: GateRow): boolean {
  if (row.runtimeStatus === "spec_binding_release_gate_only") {
    return existsSync(join(root, "tools", "release", "stamp_gate.ts"));
  }
  if (row.runtimeStatus === "runtime_active") {
    for (const candidate of RUNTIME_ACTIVE_ARTIFACTS[row.id] ?? []) {
      if (existsSync(join(root, candidate))) return true;
    }
    return (
      existsSync(join(root, "tools", "spec-lint", "gates", `${row.id}.ts`)) ||
      existsSync(join(root, "tools", "release", `${row.id}.ts`))
    );
  }
  return artifactCandidates(root, row).some((p) => existsSync(p));
}

function auditRuntimeRows(root: string, doc: Doc): Finding[] {
  const findings: Finding[] = [];
  const rows = dedupeGateRows(parseGateRows(doc));
  if (rows.length === 0) {
    findings.push({
      severity: "blocker",
      file: doc.path,
      line: 0,
      id: "runtime_catalog_parse",
      message: "Parsed zero §M.5 runtime-status gate rows.",
    });
    return findings;
  }

  for (const row of rows) {
    if (!STATUS_RE.test(row.runtimeStatus)) {
      findings.push({
        severity: "blocker",
        file: doc.path,
        line: row.line,
        id: row.id,
        message: `Malformed runtime status: ${row.runtimeStatus || "<empty>"}.`,
      });
      continue;
    }
    if (row.runtimeStatus.startsWith("spec_binding_pending_pack_")) {
      const candidates = artifactCandidates(root, row).map((p) => p.replace(root + "/", ""));
      const candidateDetail = candidates.length > 0
        ? ` Checked: ${candidates.join(", ")}.`
        : " No candidate path is inferred; use the row execution context and assertion.";
      findings.push({
        severity: "blocker",
        file: doc.path,
        line: row.line,
        id: row.id,
        message: `Runtime status is still ${row.runtimeStatus}; required artifact evidence not promoted.${candidateDetail}`,
      });
      continue;
    }
    if (!hasArtifact(root, row)) {
      findings.push({
        severity: "blocker",
        file: doc.path,
        line: row.line,
        id: row.id,
        message: `Runtime status is ${row.runtimeStatus}, but no matching runtime artifact was found.`,
      });
    }
  }
  return findings;
}

function auditAeRows(doc: Doc): Finding[] {
  const findings: Finding[] = [];
  let header: string[] | null = null;
  let statusIndex = -1;
  let targetIndex = -1;

  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line];
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      header = null;
      statusIndex = -1;
      targetIndex = -1;
      continue;
    }
    const cells = splitRow(raw);
    if (isDelimiter(cells)) continue;
    if (!header) {
      header = cells;
      const keys = cells.map(headerKey);
      statusIndex = keys.findIndex((k) => k === "status" || k === "current_status");
      targetIndex = keys.findIndex((k) => k === "target_phase" || k === "target_version");
      continue;
    }
    const id = stripMd(cells[0] ?? "");
    if (!AE_ID_RE.test(id) || statusIndex < 0) continue;
    const status = stripMd(cells[statusIndex] ?? "").toLowerCase();
    const targetText = targetIndex >= 0 ? stripMd(cells[targetIndex] ?? "") : cells.join(" | ");
    const targetStamp = VERSION_RE.test(targetText) || !/\bv7\./i.test(targetText);
    const closedTransition = /\bpending\s*(?:→|->)\s*(?:approved|acknowledged|ratified|superseded|re-targeted)\b/.test(
      status,
    );
    if ((status === "pending" || status.startsWith("pending ")) && !closedTransition && targetStamp) {
      findings.push({
        severity: "blocker",
        file: doc.path,
        line,
        id,
        message: "Active AE row remains pending for a target <= v7.1.1.",
      });
    }
  }
  return findings;
}

function auditDefectRows(doc: Doc): Finding[] {
  const findings: Finding[] = [];
  let header: string[] | null = null;
  let severityIndex = -1;
  let statusIndex = -1;

  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line];
    if (!/^\s*\|.*\|\s*$/.test(raw)) {
      header = null;
      severityIndex = -1;
      statusIndex = -1;
      continue;
    }
    const cells = splitRow(raw);
    if (isDelimiter(cells)) continue;
    if (!header) {
      header = cells;
      const keys = cells.map(headerKey);
      severityIndex = keys.findIndex((k) => k === "severity" || k === "sev");
      statusIndex = keys.findIndex((k) => k === "status");
      continue;
    }
    const id = stripMd(cells[0] ?? "");
    if (!DEFECT_ID_RE.test(id) || severityIndex < 0 || statusIndex < 0) continue;
    const severity = stripMd(cells[severityIndex] ?? "");
    if (severity !== "P0" && severity !== "P1") continue;
    const status = stripMd(cells[statusIndex] ?? "").toLowerCase();
    if (status === "open" || status === "blocked") {
      findings.push({
        severity: "blocker",
        file: doc.path,
        line,
        id,
        message: `${severity} defect row remains ${status}.`,
      });
    }
  }
  return findings;
}

function summarize(rows: GateRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.runtimeStatus] = (counts[row.runtimeStatus] ?? 0) + 1;
  return counts;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const spec = loadDoc(args.spec);
  const aeLedger = loadDoc(args.aeLedger);
  const defectLedger = loadDoc(args.defectLedger);
  const root = dirname(resolve(args.spec));

  const gateRows = dedupeGateRows(parseGateRows(spec));
  const findings = [
    ...auditRuntimeRows(root, spec),
    ...auditAeRows(aeLedger),
    ...auditDefectRows(defectLedger),
  ];
  const blockers = findings.filter((f) => f.severity === "blocker");
  const payload = {
    gate_id: "v7_1_1_stamp_gate_runtime_status_audit",
    outcome: blockers.length === 0 ? "pass" : "fail",
    summary: {
      runtime_rows: gateRows.length,
      runtime_status_counts: summarize(gateRows),
      blocker_count: blockers.length,
      scanned_files: [spec.path, aeLedger.path, defectLedger.path],
      tool_path: join("tools", "release", "stamp_gate.ts"),
    },
    findings,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(`${payload.gate_id}: ${payload.outcome}\n`);
    process.stdout.write(
      `runtime rows: ${payload.summary.runtime_rows}; blockers: ${payload.summary.blocker_count}\n`,
    );
    process.stdout.write(
      `runtime status counts: ${JSON.stringify(payload.summary.runtime_status_counts)}\n`,
    );
    for (const finding of blockers.slice(0, 40)) {
      process.stderr.write(
        `[blocker] ${finding.file}:${finding.line} ${finding.id} - ${finding.message}\n`,
      );
    }
    if (blockers.length > 40) {
      process.stderr.write(`[blocker] ... ${blockers.length - 40} more blockers omitted; rerun with --json for full output.\n`);
    }
  }

  process.exitCode = blockers.length === 0 ? 0 : 1;
}

main();
