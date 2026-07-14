/**
 * Gate: `appendix_l_policy_ingestion_state_machine_canonicality`
 * Source phase: v7.2.0-REM Phase 10 (§M.5.19)
 *
 * Assertion: Appendix L.9 and L.10 carry canonical state-machine tables whose
 * states are registered in Appendix J.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const JOB_STATES = new Set([
  "(none)",
  "*",
  "parsing",
  "framework_detected",
  "extracting",
  "dedup_pending",
  "dedup_resolved",
  "mapping",
  "amendments_drafted",
  "completed",
  "failed",
]);

const AMENDMENT_STATES = new Set([
  "(none)",
  "pending_review",
  "approved",
  "rejected",
  "pending_refinement",
  "active",
]);

function stripState(raw: string): string[] {
  return raw
    .replace(/`/g, "")
    .replace(/\s+\([^)]*\)/g, "")
    .split(/\s*\/\s*|\s+or\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function checkMachine(
  ctx: GateContext,
  anchor: string,
  allowed: Set<string>,
  label: string,
): Finding[] {
  const doc = ctx.masterSpec;
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      anchor,
      message: `${label} section is missing from Appendix L.`,
    }];
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const header = table.header?.cells.join(" | ") ?? "";
  const findings: Finding[] = [];
  if (header !== "From | To | Trigger | Conditions | Notes") {
    findings.push({
      file: doc.path,
      line: table.header?.line ?? section.startLine,
      anchor,
      matched_text: header,
      message: `${label} must use From | To | Trigger | Conditions | Notes table shape.`,
    });
  }
  for (const row of table.rows) {
    for (const state of [...stripState(row.cells[0] ?? ""), ...stripState(row.cells[1] ?? "")]) {
      if (!allowed.has(state)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor,
          matched_text: state,
          message: `${label} references unregistered state ${state}.`,
        });
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "appendix_l_policy_ingestion_state_machine_canonicality",
  sourcePhase: "v7.2.0-REM Phase 10",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...checkMachine(ctx, "l-9-policy-ingestion-job", JOB_STATES, "PolicyIngestionJob"),
      ...checkMachine(ctx, "l-10-policy-amendment", AMENDMENT_STATES, "PolicyAmendment"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
