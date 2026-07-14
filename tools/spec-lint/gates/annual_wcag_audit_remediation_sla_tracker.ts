/**
 * Gate: `annual_wcag_audit_remediation_sla_tracker`
 *
 * Assertion: external WCAG audit findings are release-trackable and unresolved
 * P0/P1 findings cannot coexist with a WCAG-conformance release claim.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, loadDoc, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const TRACKER_FILE = "_audit/WCAG_AUDIT_FINDING_TRACKER.md";
const CLOSED_STATUSES = new Set(["remediated", "closed", "superseded", "no_external_findings_received"]);

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function requireTokens(
  doc: SpecDoc,
  target: { text: string; line: number; anchor?: string },
  label: string,
  tokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!target.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: target.line,
        anchor: target.anchor,
        matched_text: token,
        message: `${label} is missing required WCAG audit tracker token: ${token}`,
      });
    }
  }
  return findings;
}

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    });
    return { text: "", line: 0, anchor: label };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function trackerDoc(masterSpec: SpecDoc): SpecDoc | null {
  if (masterSpec.text.includes("# WCAG Audit Finding Tracker")) return masterSpec;
  const root = dirname(resolve(masterSpec.path));
  const path = join(root, TRACKER_FILE);
  return existsSync(path) ? loadDoc(path) : null;
}

function masterContractFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section37 = sectionText(doc, /^37\.5 Testing & Audit Pipeline$/, "§37.5", findings);
  findings.push(...requireTokens(doc, section37, "§37.5 Testing & Audit Pipeline", [
    "Annual external audit",
    "annually +/- 60 days",
    "before any Enterprise customer contract that names WCAG conformance as a pre-signature requirement",
    "P0/P1/P2/P3 remediation targets follow §42.3.0",
  ]));

  const ac = sectionText(doc, /^37\.6 Acceptance Criteria$/, "§37.6", findings);
  findings.push(...requireTokens(doc, ac, "§37.6 Acceptance Criteria", [
    "Annual third-party audit findings MUST be logged as defects, mapped to severity, assigned an owner, and tracked to closure",
    "unresolved P0/P1 findings block any release claiming WCAG conformance",
  ]));

  const row = findLineIncludingAll(doc, ["| `annual_wcag_audit_remediation_sla_tracker` |"]);
  if (!row) {
    findings.push({
      file: doc.path,
      line: 0,
      matched_text: "`annual_wcag_audit_remediation_sla_tracker`",
      message: "Appendix M.5 annual_wcag_audit_remediation_sla_tracker row is missing.",
    });
  } else {
    findings.push(...requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 annual_wcag_audit_remediation_sla_tracker row", [
      "**`runtime_active`**",
      "tools/spec-lint/gates/annual_wcag_audit_remediation_sla_tracker.ts",
      "_audit/WCAG_AUDIT_FINDING_TRACKER.md",
      "unresolved P0/P1 findings block releases claiming WCAG conformance",
      "not_permitted_accessibility_conformance",
    ]));
  }

  return findings;
}

function trackerFindings(doc: SpecDoc | null, masterPath: string): Finding[] {
  if (!doc) {
    return [{
      file: masterPath,
      line: 0,
      matched_text: TRACKER_FILE,
      message: `WCAG audit finding tracker is missing: ${TRACKER_FILE}.`,
    }];
  }

  const findings: Finding[] = [];
  findings.push(...requireTokens(doc, { text: doc.text, line: 1, anchor: "tracker" }, "WCAG audit tracker", [
    "**Canonical owner:** Design Lead + Engineering Lead",
    "**Release gate:** `annual_wcag_audit_remediation_sla_tracker`",
    "**Source authority:** Master Spec §37.5 / §37.6 AC #11",
    "**Current open P0/P1 findings:** 0",
    "before any Enterprise contract that names WCAG conformance as a pre-signature requirement",
  ]));

  const trackerSection = findSectionByTitle(doc, /^WCAG Audit Finding Tracker$/);
  const table = parseTableAt(
    doc,
    trackerSection ? trackerSection.startLine + 1 : 1,
    trackerSection?.endLine,
  );
  if (!table.header || table.rows.length === 0) {
    return findings.concat([{
      file: doc.path,
      line: 1,
      anchor: "tracker",
      message: "parse_error: WCAG audit finding tracker table is missing.",
    }]);
  }

  const headers = table.header.cells.map((cell) => stripMd(cell).toLowerCase());
  const required = [
    "finding id",
    "external audit cycle",
    "success criterion",
    "severity",
    "owner",
    "defect id",
    "status",
    "release blocking",
    "target close date",
    "closure evidence",
  ];
  const indices = new Map<string, number>();
  for (const requiredHeader of required) {
    const index = headers.indexOf(requiredHeader);
    if (index < 0) {
      findings.push({
        file: doc.path,
        line: table.header.line,
        anchor: anchorForLine(doc, table.header.line),
        matched_text: requiredHeader,
        message: `WCAG audit finding tracker table is missing required column: ${requiredHeader}`,
      });
    } else {
      indices.set(requiredHeader, index);
    }
  }
  if (findings.some((finding) => finding.message.includes("missing required column"))) return findings;

  let openP0P1 = 0;
  for (const row of table.rows) {
    const findingId = stripMd(row.cells[indices.get("finding id")!] ?? "");
    if (!findingId) continue;
    const severity = stripMd(row.cells[indices.get("severity")!] ?? "");
    const status = stripMd(row.cells[indices.get("status")!] ?? "");
    if (findingId === "none_current") continue;

    for (const [header, idx] of indices) {
      const value = stripMd(row.cells[idx] ?? "");
      if (!value || value === "N/A") {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: findingId,
          message: `WCAG audit finding ${findingId} has an empty or N/A ${header} cell.`,
        });
      }
    }

    if (!/^P[0-3]$/.test(severity)) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: severity,
        message: `WCAG audit finding ${findingId} has invalid severity; expected P0, P1, P2, or P3.`,
      });
    }

    if (/^P[01]$/.test(severity) && !CLOSED_STATUSES.has(status)) {
      openP0P1 += 1;
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: findingId,
        message: `Unresolved ${severity} WCAG audit finding ${findingId} blocks any release claiming WCAG conformance.`,
      });
    }
  }

  const declaredOpen = Number((doc.text.match(/\*\*Current open P0\/P1 findings:\*\*\s*(\d+)/) ?? [])[1] ?? NaN);
  if (!Number.isFinite(declaredOpen) || declaredOpen !== openP0P1) {
    findings.push({
      file: doc.path,
      line: 1,
      anchor: "tracker",
      matched_text: `declared=${Number.isFinite(declaredOpen) ? declaredOpen : "missing"} computed=${openP0P1}`,
      message: "WCAG audit tracker current open P0/P1 count does not match table rows.",
    });
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "annual_wcag_audit_remediation_sla_tracker",
  sourcePhase: "Phase 37 P1",
  rowClass: "spec_tree_lint",
  executionContext: "release_stamp",
  overridePath: "not_permitted_accessibility_conformance",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...masterContractFindings(ctx.masterSpec),
      ...trackerFindings(trackerDoc(ctx.masterSpec), ctx.masterSpec.path),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
