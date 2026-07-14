/**
 * Gate: `webhook_payload_no_selection_report_narrative`
 * Source defect: D-8.2-032.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const EVENTS = [
  { source: "selection_report.draft_published", mirror: "selection_report_draft_published" },
  { source: "selection_report.finalized", mirror: "selection_report_finalized" },
];
const FORBIDDEN_FIELDS = [
  "narrative_markdown",
  "content_markdown",
  "content_markdown_snapshot",
  "content_canonical_json",
  "risk_assessment_json",
  "evidence_refs_json",
  "redline_diff",
  "internal_comment",
  "score_rationale",
];

export const gate: SpecLintGate = {
  id: "webhook_payload_no_selection_report_narrative",
  sourcePhase: "v7.1.1 Phase 8.2 webhook residual P2/P3 closure",
  rowClass: "webhook_catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const event of EVENTS) {
      const rows: number[] = [];
      for (let line = 1; line < doc.lines.length; line++) {
        const raw = doc.lines[line] ?? "";
        if (!raw.trimStart().startsWith(`| \`${event.source}\``)) continue;
        rows.push(line);
        for (const field of FORBIDDEN_FIELDS) {
          if (raw.includes(field)) {
            findings.push({ file: doc.path, line, matched_text: field, message: `${event.source} payload row exposes a forbidden Selection Report narrative or evidence field.` });
          }
        }
      }
      if (rows.length < 2) {
        findings.push({ file: doc.path, line: 1, matched_text: event.source, message: `${event.source} must be registered in the owning §10 contract and Appendix C.` });
      }
      const mirrorRows = doc.lines.filter((raw) => raw.trimStart().startsWith(`| \`${event.mirror}\``));
      if (mirrorRows.length < 1) {
        findings.push({ file: doc.path, line: 1, matched_text: event.mirror, message: `${event.source} must have an underscore-form Appendix G mirror.` });
      }
      for (let line = 1; line < doc.lines.length; line++) {
        const raw = doc.lines[line] ?? "";
        if (!raw.trimStart().startsWith(`| \`${event.mirror}\``)) continue;
        for (const field of FORBIDDEN_FIELDS) {
          if (raw.includes(field)) {
            findings.push({ file: doc.path, line, matched_text: field, message: `${event.mirror} mirror exposes a forbidden Selection Report narrative or evidence field.` });
          }
        }
      }
    }
    const requiredExclusion = "Selection Report webhook payloads are metadata-only";
    if (!doc.text.includes(requiredExclusion)) {
      findings.push({ file: doc.path, line: 1, matched_text: requiredExclusion, message: "The canonical Selection Report webhook body-exclusion invariant is missing." });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
