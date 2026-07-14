/**
 * Gate: `audit_event_schema_single_source_of_truth`
 * Source phase: v7.2.0-REM Phase 1.5 P1 (D-1.5-008)
 *
 * Assertion: §6.7.2 Audit Log Structure must not restate a stale AuditEvent
 * field list; §4.6.1 is the single schema source for audit rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const STALE_ALIASES = [
  "organization_id",
  "resource_type",
  "resource_id",
  "api_token_id",
];

const REQUIRED_CANONICAL_FIELDS = [
  "org_id",
  "console",
  "entity_type",
  "entity_id",
  "user_agent",
  "status",
  "failure_reason",
  "notes",
];

export const gate: SpecLintGate = {
  id: "audit_event_schema_single_source_of_truth",
  sourcePhase: "v7.2.0-REM Phase 1.5 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByTitle(doc, /^6\.7\.2 Audit Log Structure$/);

    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "6.7.2-audit-log-structure",
        message: "§6.7.2 Audit Log Structure section is missing; cannot verify Audit Event schema source.",
      }];
    }

    const lines = doc.lines.slice(section.startLine, section.endLine + 1);
    const text = lines.join("\n");

    if (!text.includes("§4.6.1 Audit Event") || !text.includes("sole schema source")) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor ?? section.heading.title,
        message: "§6.7.2 must state that §4.6.1 Audit Event is the sole schema source.",
      });
    }

    for (const alias of STALE_ALIASES) {
      const offset = lines.findIndex((line) => line.includes(`\`${alias}\``));
      if (offset >= 0) {
        findings.push({
          file: doc.path,
          line: section.startLine + offset,
          anchor: section.heading.anchor ?? section.heading.title,
          matched_text: alias,
          message: `§6.7.2 must not restate stale Audit Event alias \`${alias}\`; cite §4.6.1 instead.`,
        });
      }
    }

    for (const field of REQUIRED_CANONICAL_FIELDS) {
      if (!text.includes(`\`${field}\``)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor ?? section.heading.title,
          matched_text: field,
          message: `§6.7.2 must name canonical §4.6.1 field \`${field}\` in its schema-source pointer.`,
        });
      }
    }

    const fieldBulletLines = lines.filter((line) => /^-\s+`[^`]+`:\s+/.test(line.trim()));
    if (fieldBulletLines.length > 0) {
      findings.push({
        file: doc.path,
        line: section.startLine + lines.findIndex((line) => /^-\s+`[^`]+`:\s+/.test(line.trim())),
        anchor: section.heading.anchor ?? section.heading.title,
        message: "§6.7.2 must not carry a local audit-field bullet list; field-table detail belongs only in §4.6.1.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
