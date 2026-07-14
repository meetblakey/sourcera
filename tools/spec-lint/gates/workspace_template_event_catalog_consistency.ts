/**
 * Gate: `workspace_template_event_catalog_consistency`
 *
 * Assertion: every §19.6.2 Template Library event resolves exactly once across
 * §31.15, Appendix C, and Appendix G, with dotted webhook names mirrored by
 * underscore PostHog names carrying `source_webhook_event_type`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./workspace_template_gate_helpers.js";

const EVENTS = [
  ["template.created", "template_created"],
  ["template.metadata_updated", "template_metadata_updated"],
  ["template.update_available_received", "template_update_available_received"],
  ["template.update_applied", "template_update_applied"],
  ["template.deleted", "template_deleted"],
  ["template.suggestion_submitted", "template_suggestion_submitted"],
  ["workspace.created_from_template", "workspace_created_from_template"],
] as const;

interface Block {
  text: string;
  startLine: number;
  label: string;
}

function blockBetween(doc: SpecDoc, start: string, end: string, label: string): Block | null {
  const startIndex = doc.lines.findIndex((line) => line.includes(start));
  if (startIndex < 1) return null;
  const endIndex = doc.lines.findIndex((line, index) => index > startIndex && line.includes(end));
  const last = endIndex > startIndex ? endIndex - 1 : doc.lines.length - 1;
  return { text: doc.lines.slice(startIndex, last + 1).join("\n"), startLine: startIndex, label };
}

function rowCount(block: Block, eventName: string): number {
  const re = new RegExp(String.raw`^\| \`${escapeRegExp(eventName)}\` \|`, "gm");
  return [...block.text.matchAll(re)].length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactRowFindings(doc: SpecDoc, block: Block | null, eventName: string, label: string): Finding[] {
  const findings: Finding[] = [];
  if (!block) {
    push(findings, doc, 0, label, `${label} block is missing.`);
    return findings;
  }
  const count = rowCount(block, eventName);
  if (count !== 1) {
    push(findings, doc, block.startLine, eventName, `${label} must contain exactly one table row for ${eventName}; found ${count}.`);
  }
  return findings;
}

function section19Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "19.6.2-api-event-and-atomicity-binding");
  requireTokens(findings, doc, section, "§19.6.2 Template Library event binding", [
    "Every mutation below writes exactly one AuditEvent",
    "matching Appendix C webhook / notification event plus Appendix G PostHog mirror",
    "Webhook delivery inherits §31.1-§31.6 and the §31.15 Template Library pack.",
  ]);
  if (!section) return findings;
  for (const [webhook, posthog] of EVENTS) {
    for (const token of [`\`${webhook}\``, `\`${posthog}\``]) {
      if (!section.text.includes(token)) {
        push(findings, doc, section.startLine, token, `§19.6.2 is missing Template Library event mapping token ${token}.`);
      }
    }
  }
  return findings;
}

function catalogFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section31 = sectionTextByAnchor(doc, "31.15-template-library-webhook-completeness-pack");
  const appendixC = blockBetween(
    doc,
    "**Template Library notification and webhook registrations (§19 / §31.15).**",
    "**Scenario Modeling webhook registrations (§14 / §31.16).**",
    "Appendix C Template Library block",
  );
  const appendixG = sectionTextByAnchor(doc, "appendix-g-v72rem-phase-4-10-template-library-api-event-p1");
  const appendixGBlock = appendixG ? { text: appendixG.text, startLine: appendixG.startLine, label: "Appendix G Template Library block" } : null;

  requireTokens(findings, doc, section31, "§31.15 Template Library webhook pack", [
    "HMAC-SHA256 signing",
    "immutable `event_id`",
    "payload size ceiling",
    "Payloads MUST NOT include `content_snapshot_json`",
    "Appendix C and Appendix G registrations MUST match the §31.15 event names and payload field sets.",
  ]);
  requireTokens(findings, doc, appendixG, "Appendix G Template Library mirrors", [
    "Dotted Appendix C names normalize to underscore-form PostHog names.",
    "workspace_template_kind",
    "source_webhook_event_type",
  ]);
  if (appendixC && !appendixC.text.includes("workspace_template_kind")) {
    push(findings, doc, appendixC.startLine, "workspace_template_kind", "Appendix C Template Library payloads must carry workspace_template_kind.");
  }
  if (section31 && !section31.text.includes("workspace_template_kind")) {
    push(findings, doc, section31.startLine, "workspace_template_kind", "§31.15 Template Library payloads must carry workspace_template_kind.");
  }

  for (const [webhook, posthog] of EVENTS) {
    findings.push(...exactRowFindings(doc, section31 ? { text: section31.text, startLine: section31.startLine, label: "§31.15" } : null, webhook, "§31.15"));
    findings.push(...exactRowFindings(doc, appendixC, webhook, "Appendix C Template Library block"));
    findings.push(...exactRowFindings(doc, appendixGBlock, posthog, "Appendix G Template Library block"));
    if (appendixG && !appendixG.text.includes(`source_webhook_event_type='${webhook}'`)) {
      push(findings, doc, appendixG.startLine, webhook, `Appendix G mirror ${posthog} must carry source_webhook_event_type='${webhook}'.`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_event_catalog_consistency",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "webhook_catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...section19Findings(ctx.masterSpec),
      ...catalogFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_event_catalog_consistency"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
