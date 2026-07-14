/**
 * Gate: `audit_log_scope_single_source`
 * Source phase: v7.2.0-REM Phase 1.5 P1 (D-1.5-010)
 *
 * Assertion: §6.7.1 Audit Log Scope must be registry-driven through §4.6.1
 * and Appendix J, not a stale finite checklist of pre-v7.0.0 mutation domains.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_PHRASES = [
  "registry-driven",
  "§4.6.1 Audit Event row",
  "Appendix J `audit_event_entity_type`",
  "Appendix J `audit_event_action_type`",
  "Every customer-Org-mutating action",
  "§6.7.6",
];

const STALE_SCOPE_TEXT = [
  "Logged mutations include:",
  "Excluded from audit logs:",
  "Vendor response creation",
  "Marketplace Listing publication",
  "Payment/billing events",
  "API token creation, revocation",
  "Webhook subscription creation, deletion, failure events",
  "Internal system operations (background jobs, cache invalidation)",
];

export const gate: SpecLintGate = {
  id: "audit_log_scope_single_source",
  sourcePhase: "v7.2.0-REM Phase 1.5 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByTitle(doc, /^6\.7\.1 Audit Log Scope$/);

    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "6.7.1-audit-log-scope",
        message: "§6.7.1 Audit Log Scope section is missing; cannot verify audit-scope source binding.",
      }];
    }

    const lines = doc.lines.slice(section.startLine, section.endLine + 1);
    const text = lines.join("\n");

    for (const phrase of REQUIRED_PHRASES) {
      if (!text.includes(phrase)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor ?? section.heading.title,
          matched_text: phrase,
          message: `§6.7.1 must bind Audit Log Scope to the canonical §4.6.1 / Appendix J registries; missing phrase: ${phrase}`,
        });
      }
    }

    for (const phrase of STALE_SCOPE_TEXT) {
      const offset = lines.findIndex((line) => line.includes(phrase));
      if (offset >= 0) {
        findings.push({
          file: doc.path,
          line: section.startLine + offset,
          anchor: section.heading.anchor ?? section.heading.title,
          matched_text: phrase,
          message: `§6.7.1 must not reintroduce the stale finite audit-scope checklist text: ${phrase}`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
