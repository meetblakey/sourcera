/**
 * Local pr_lint half of `outcome_contract_signal_subject_enum_bound`.
 * The composite §M.5 row remains pending until the deployed publisher validator exists.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "outcome_contract_signal_subject_enum_bound";

function backticks(text: string): string[] {
  return [...text.matchAll(/`([a-z0-9_]+)`/g)].map((match) => match[1]!);
}

function sameSet(left: string[], right: string[]): boolean {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const field = findLine(doc, (line) => line.trim().startsWith("| `signal_subject_entity_kinds` |"));
  if (!field) {
    push(findings, doc, 0, "signal_subject_entity_kinds", "§4.8.4 signal_subject_entity_kinds field row is missing.");
    return findings;
  }
  for (const token of [
    "Non-empty subset of Appendix J `outcome_contract_signal_subject_entity_kind`",
    "The contract rule MUST reference only kinds required by that capability's accepted/rejected signals.",
  ]) {
    if (!field.text.includes(token)) push(findings, doc, field.line, token, `OutcomeContract subject field is missing required contract: ${token}`);
  }
  const watchText = field.text.split("resolver may watch:")[1]?.split("The contract rule")[0] ?? "";
  const fieldValues = backticks(watchText);

  const enumSection = findSectionByTitle(doc, /^Outcome Contract Signal Subject Entity Kind/);
  if (!enumSection) {
    push(findings, doc, 0, "Outcome Contract Signal Subject Entity Kind", "Appendix J outcome_contract_signal_subject_entity_kind section is missing.");
    return findings;
  }
  const enumLineNumber = Array.from(
    { length: enumSection.endLine - enumSection.startLine },
    (_, index) => enumSection.startLine + index + 1,
  ).find((line) => (doc.lines[line] ?? "").trim().startsWith("`"));
  const enumLine = enumLineNumber ? doc.lines[enumLineNumber] ?? "" : "";
  const enumValues = backticks(enumLine);
  if (!sameSet(fieldValues, enumValues)) {
    const unknown = fieldValues.filter((value) => !enumValues.includes(value));
    const missing = enumValues.filter((value) => !fieldValues.includes(value));
    push(
      findings,
      doc,
      field.line,
      [...unknown, ...missing].join(", ") || field.text,
      `OutcomeContract subject set differs from Appendix J; unknown values: ${unknown.join(", ") || "none"}; missing field values: ${missing.join(", ") || "none"}.`,
    );
  }

  const rejection = findLine(doc, (line) => line.trim().startsWith("| `outcome_contract_signal_subject_kind_invalid` | 422 |"));
  if (!rejection) push(findings, doc, 0, "outcome_contract_signal_subject_kind_invalid", "Appendix I HTTP 422 rejection row is missing.");

  const assertion = findLine(doc, (line) => line.includes("Every `signal_subject_entity_kinds` value MUST resolve"));
  if (!assertion || !assertion.text.includes("unknown, empty, or rule-unreferenced kinds MUST reject publication")) {
    push(findings, doc, assertion?.line ?? 0, "unknown, empty, or rule-unreferenced", "§4.8.4 publication rejection contract is incomplete.");
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "deployed OutcomeContract publisher",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 1.7",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
