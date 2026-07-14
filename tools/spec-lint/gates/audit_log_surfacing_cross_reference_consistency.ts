/**
 * Gate: `audit_log_surfacing_cross_reference_consistency`
 *
 * Assertion: all audit-log surfacing sections carry the same composed access
 * set and resolve the required cross-references.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, splitUnescapedPipes } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface RequiredSection {
  label: string;
  ownRef: string;
  anchor?: string;
  title?: RegExp;
}

const REQUIRED_SECTIONS: RequiredSection[] = [
  { label: "§6.7.4 Audit Log Access", ownRef: "§6.7.4", title: /^6\.7\.4 Audit Log Access$/ },
  { label: "§36.2 Organization Settings", ownRef: "§36.2", anchor: "36.2-organization-settings" },
  { label: "§5.2.1.4 Audit Semantics", ownRef: "§5.2.1.4", title: /^5\.2\.1\.4 Audit Semantics$/ },
  { label: "§50.5.4 Billing Admin Audit View rendering", ownRef: "§50.5.4", anchor: "50.5.4-rendering-in-billing-admin-audit-view" },
  { label: "§50.5.5 Seller Billing Audit View rendering", ownRef: "§50.5.5", anchor: "50.5.5-rendering-in-seller-billing-audit-view" },
];

const REQUIRED_PATTERNS: Array<[RegExp, string]> = [
  [/Org Owner/i, "Org Owner full-view access"],
  [/Org Admin/i, "Org Admin full-view access"],
  [/full cross-namespace/i, "full cross-namespace scope"],
  [/Billing Admin/i, "Billing Admin filtered access"],
  [/filtered/i, "filtered billing view"],
  [/Workspace Owner/i, "Workspace Owner scoped access"],
  [/workspace-scoped/i, "workspace-scoped access"],
  [/Team Owner/i, "Team Owner scoped access"],
  [/team-scoped/i, "team-scoped access"],
  [/Sourcera Ops/i, "Ops attribution chip"],
  [/actor_type='ops_actor'/, "ops actor filter value"],
  [/Seller Console parity|seller parity/i, "Seller Console parity"],
];

const REQUIRED_CROSS_REFS = ["§6.7.4", "§36.2", "§5.2.1.4", "§50.5.4", "§50.5.5"];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function section(doc: SpecDoc, item: RequiredSection) {
  if (item.anchor) return findSectionByAnchor(doc, item.anchor);
  if (item.title) return findSectionByTitle(doc, item.title);
  return null;
}

function findM5Row(doc: SpecDoc): { cells: string[]; line: number; raw: string } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    if (!raw.includes("| `audit_log_surfacing_cross_reference_consistency` |")) continue;
    const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
    return { cells: splitUnescapedPipes(trimmed).map((cell) => cell.trim()), line, raw };
  }
  return null;
}

export const gate: SpecLintGate = {
  id: "audit_log_surfacing_cross_reference_consistency",
  sourcePhase: "V11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const item of REQUIRED_SECTIONS) {
      const range = section(doc, item);
      if (!range) {
        push(findings, doc, 0, item.label, `${item.label} is missing or its anchor does not resolve.`);
        continue;
      }
      const text = doc.lines.slice(range.startLine, range.endLine + 1).join("\n");
      for (const [pattern, label] of REQUIRED_PATTERNS) {
        if (!pattern.test(text)) {
          push(findings, doc, range.startLine, label, `${item.label} is missing the audit-log surfacing access-set element: ${label}.`);
        }
      }
      for (const ref of REQUIRED_CROSS_REFS) {
        if (ref === item.ownRef) continue;
        if (!text.includes(ref)) {
          push(findings, doc, range.startLine, ref, `${item.label} must cross-reference ${ref} as part of the composed audit-log surfacing contract.`);
        }
      }
    }

    const m5Row = findM5Row(doc);
    if (!m5Row) {
      push(findings, doc, 0, "audit_log_surfacing_cross_reference_consistency", "§M.5 row audit_log_surfacing_cross_reference_consistency is missing.");
    } else {
      const rowText = m5Row.cells.join(" | ");
      if (!rowText.includes("runtime_active")) {
        push(findings, doc, m5Row.line, m5Row.raw, "§M.5 row audit_log_surfacing_cross_reference_consistency must be promoted to runtime_active with detector evidence.");
      }
      for (const ref of REQUIRED_CROSS_REFS) {
        if (!rowText.includes(ref)) {
          push(findings, doc, m5Row.line, m5Row.raw, `§M.5 row audit_log_surfacing_cross_reference_consistency must cite ${ref}.`);
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
