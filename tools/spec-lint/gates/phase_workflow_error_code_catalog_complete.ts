/**
 * Gate: `phase_workflow_error_code_catalog_complete`
 *
 * Assertion: every active phase/workflow error code referenced in §2, §10, or
 * §32 resolves to an Appendix I Phase & Workflow Errors row with HTTP status,
 * usage, meaning, and localization key.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface RegistryRow {
  code: string;
  http: string;
  usedBy: string;
  meaning: string;
  localizationKey: string;
  line: number;
}

const SCANNED_SECTION_PREFIXES = ["2", "10", "32"];
const EXCLUDED_TOKENS = new Set([
  "phase_advanced_with_unmet_gates",
  "phase_advancement_requested",
  "phase_advancement_completed",
]);

function normalizedHeader(cell: string): string {
  return cell.replace(/[*`]/g, "").trim().toLowerCase();
}

function codeToken(cell: string): string {
  return cell.match(/`([^`]+)`/)?.[1] ?? "";
}

function httpStatus(cell: string): string {
  return cell.match(/\b(\d{3})\b/)?.[1] ?? "";
}

function push(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function scannedRanges(doc: SpecDoc) {
  return computeSectionRanges(doc).filter((range) => {
    if (range.heading.level !== 2) return false;
    return SCANNED_SECTION_PREFIXES.some((prefix) =>
      range.heading.title.startsWith(`${prefix} `) ||
      range.heading.title.startsWith(`${prefix}.`),
    );
  });
}

function phaseWorkflowSection(doc: SpecDoc) {
  return computeSectionRanges(doc).find((range) =>
    /^Phase & Workflow Errors\b/.test(range.heading.title),
  ) ?? null;
}

function isPhaseWorkflowErrorCandidate(token: string): boolean {
  if (!/^[a-z][a-z0-9_]+$/.test(token)) return false;
  if (EXCLUDED_TOKENS.has(token)) return false;
  if (/^error\./.test(token)) return false;
  if (/(?:_canonicality|_completeness|_consistency|_required|_single_source)$/.test(token)) return false;

  return [
    /^phase_advancement_/,
    /^phase_lock_violation$/,
    /^phase_\d+_.*(?:below|minimum|violation|failed|forbidden|invalid|unavailable|no_advance|dependency)/,
    /^pipeline_phase_.*(?:invalid|error|violation|failed)/,
    /^scores_immutable_phase_/,
    /^gate_validation_failed$/,
    /^workspace_role_insufficient_for_phase_advance$/,
    /^workspace_abort_/,
    /^invalid_phase_transition$/,
    /^incomplete_requirement$/,
    /^incomplete_response$/,
    /^vendor_nda_not_signed$/,
    /^workspace_cancelled$/,
    /^workspace_archived$/,
  ].some((re) => re.test(token));
}

function referencedCodes(doc: SpecDoc): Map<string, number[]> {
  const refs = new Map<string, number[]>();
  const add = (code: string, line: number) => {
    if (!isPhaseWorkflowErrorCandidate(code)) return;
    const lines = refs.get(code) ?? [];
    lines.push(line);
    refs.set(code, lines);
  };

  for (const range of scannedRanges(doc)) {
    for (let line = range.startLine; line <= range.endLine; line++) {
      const text = doc.lines[line] ?? "";
      const backtickRe = /`([a-z][a-z0-9_]+)`/g;
      const jsonCodeRe = /"code"\s*:\s*"([a-z][a-z0-9_]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = backtickRe.exec(text)) !== null) add(match[1], line);
      while ((match = jsonCodeRe.exec(text)) !== null) add(match[1], line);
    }
  }

  return refs;
}

function registryRows(doc: SpecDoc, findings: Finding[]): Map<string, RegistryRow> {
  const section = phaseWorkflowSection(doc);
  if (!section) {
    push(findings, doc, 0, "Phase & Workflow Errors", "Appendix I Phase & Workflow Errors section is missing.");
    return new Map();
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, section.heading.title, "Appendix I Phase & Workflow Errors must contain a table.");
    return new Map();
  }

  const headers = table.header.cells.map(normalizedHeader);
  const codeIdx = headers.findIndex((h) => h === "code");
  const httpIdx = headers.findIndex((h) => h === "http");
  const usedByIdx = headers.findIndex((h) => h === "used by" || h === "endpoint");
  const meaningIdx = headers.findIndex((h) => h === "meaning" || h === "description" || h === "notes");
  const localizationIdx = headers.findIndex((h) => h === "localization key" || h === "localization_key");

  if ([codeIdx, httpIdx, usedByIdx, meaningIdx, localizationIdx].some((idx) => idx < 0)) {
    push(
      findings,
      doc,
      table.header.line,
      table.header.cells.join(" | "),
      "Phase & Workflow Errors table must include Code, HTTP, Used By, Meaning, and Localization Key columns.",
    );
    return new Map();
  }

  const map = new Map<string, RegistryRow>();
  for (const row of table.rows) {
    const code = codeToken(row.cells[codeIdx] ?? "");
    if (!code) continue;
    const entry: RegistryRow = {
      code,
      http: httpStatus(row.cells[httpIdx] ?? ""),
      usedBy: (row.cells[usedByIdx] ?? "").trim(),
      meaning: (row.cells[meaningIdx] ?? "").trim(),
      localizationKey: codeToken(row.cells[localizationIdx] ?? "") || (row.cells[localizationIdx] ?? "").trim(),
      line: row.line,
    };
    map.set(code, entry);
  }

  return map;
}

export const gate: SpecLintGate = {
  id: "phase_workflow_error_code_catalog_complete",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const registry = registryRows(doc, findings);
    const refs = referencedCodes(doc);

    for (const [code, lines] of refs.entries()) {
      const row = registry.get(code);
      const firstLine = lines[0];
      if (!row) {
        push(
          findings,
          doc,
          firstLine,
          `\`${code}\``,
          `Active §2/§10/§32 reference to \`${code}\` has no Appendix I Phase & Workflow Errors row.`,
        );
        continue;
      }
      if (!row.http) {
        push(findings, doc, row.line, `\`${code}\``, `Appendix I Phase & Workflow row for \`${code}\` is missing HTTP status.`);
      }
      if (!row.usedBy) {
        push(findings, doc, row.line, `\`${code}\``, `Appendix I Phase & Workflow row for \`${code}\` is missing Used By.`);
      }
      if (!row.meaning) {
        push(findings, doc, row.line, `\`${code}\``, `Appendix I Phase & Workflow row for \`${code}\` is missing Meaning.`);
      }
      if (row.localizationKey !== `error.workflow.${code}` && !row.localizationKey.startsWith("error.entity.") && !row.localizationKey.startsWith("error.platform.")) {
        push(
          findings,
          doc,
          row.line,
          row.localizationKey || `\`${code}\``,
          `Appendix I Phase & Workflow row for \`${code}\` has missing or malformed localization key.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
