/**
 * Gate: `audit_event_retention_authority_consistency`
 *
 * Assertion: AuditEvent UI retention has one numerical authority and the
 * entity-level residency note defers to the current §6.7.5.A contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const GATE_ID = "audit_event_retention_authority_consistency";
const RETENTION_LITERAL = /\b(?:30\s*days?|30d|1\s*year|1y|3\s*years?|3y|7\s*years?|7y)\b/i;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({ file: doc.path, line, matched_text: matched, message });
}

function sectionText(doc: SpecDoc, section: ReturnType<typeof findSectionByTitle>) {
  return section ? { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine } : null;
}

function requireTokens(findings: Finding[], doc: SpecDoc, label: string, value: { text: string; line: number } | null, tokens: readonly string[]) {
  if (!value) {
    push(findings, doc, 0, label, `${label} is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!value.text.includes(token)) push(findings, doc, value.line, token, `${label} is missing required retention-authority token: ${token}`);
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function noInlineLiteral(findings: Finding[], doc: SpecDoc, label: string, value: { text: string; line: number } | null) {
  if (!value) return;
  const match = RETENTION_LITERAL.exec(value.text);
  if (match) push(findings, doc, value.line, match[0], `${label} must cite retention authority rather than restating a plan-duration value.`);
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const entity = sectionText(doc, findSectionByTitle(doc, /^4\.6\.1\.1 Audit Event Indexes, Retention, DSAR & State Machine/));
  requireTokens(findings, doc, "§4.6.1.1 AuditEvent retention and residency", entity, [
    "§34.1.1 / §34.1.2 cell **Audit Log Retention (UI)**",
    "§40.2 AuditEvent row",
    "§6.7.5.A is the sole AuditEvent residency authority",
  ]);
  if (entity) {
    const defaultRetention = entity.text.split("\n").find((line) => line.includes("Default UI retention"));
    noInlineLiteral(findings, doc, "§4.6.1.1 Default UI retention", defaultRetention ? { text: defaultRetention, line: entity.line } : null);
  }

  const policy = sectionText(doc, findSectionByTitle(doc, /^6\.7\.3 Retention Policy by Plan/));
  requireTokens(findings, doc, "§6.7.3 retention policy", policy, [
    "§34.1.1 / §34.1.2 cell **Audit Log Retention (UI)**",
    "§40.2 Data Retention & Deletion",
    "current per-tier UI window",
  ]);
  if (policy) {
    const policyStatement = policy.text.split("\n").find((line) => line.startsWith("Audit-log UI retention is authoritative"));
    noInlineLiteral(findings, doc, "§6.7.3 retention policy", policyStatement ? { text: policyStatement, line: policy.line } : null);
  }

  const m1 = findLine(doc, (line) => line.startsWith("| Audit Event (§4.6.1) |"));
  requireTokens(findings, doc, "Appendix M.1 Audit Event row", m1, [
    "Retention per §40.2 AuditEvent row + §34.1.1 / §34.1.2 cell **Audit Log Retention (UI)**",
  ]);
  noInlineLiteral(findings, doc, "Appendix M.1 Audit Event row", m1);

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  requireTokens(findings, doc, `§M.5 ${GATE_ID} row`, m5, [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 AuditEvent residency and retention hygiene closure",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
