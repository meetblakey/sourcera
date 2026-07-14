/**
 * Gate: `legal_entity_enum_canonical_consistency`
 *
 * Assertion: Appendix J body-side Legal Entity and envelope-facing
 * `legal_entity_kind` expose the same canonical four-value set, and live
 * `legal_entity` citations resolve to Appendix J `legal_entity_kind`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED = ["sourcera_us_llc", "sourcera_eu_gmbh", "sourcera_apac_pte", "sourcera_custom"] as const;
const EXPECTED_DISPLAY = EXPECTED.map((value) => `\`${value}\``).join(", ");

const BODY_SECTION_TOKENS = [
  "**Canonical 4-value set",
  "**Mapping (deterministic from `data_residency_region`; total + surjective; closed set):**",
  "**Retired value: `sourcera_uk_ltd`.**",
  "**Companion: `legal_entity_kind` envelope enum",
] as const;

const LIVE_CITATION_TOKENS = [
  "| `legal_entity` | Enum | See Appendix J `legal_entity_kind` | Mirrors AIOperation rule; locked from Org's `data_residency_region` |",
  "requires an Appendix J `legal_entity_kind` enum addition plus a Stripe-invoicing entity provisioning runbook",
  "| `legal_entity` | Enum | Per Appendix J `legal_entity_kind` | Mirrors AIWallet.`legal_entity`; subscribers performing accounting reconciliation MUST partition on this field |",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/legal_entity_enum_canonical_consistency.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "every live `legal_entity` field/table citation resolves to Appendix J `legal_entity_kind`",
  "Runtime Stripe Customer binding and residency-change behavior remain owned by sibling M24.3 / M11.3 rows",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function codeValues(text: string): string[] {
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const value = match[1].trim();
    if (value.startsWith("sourcera_")) values.push(value);
  }
  return values;
}

function valuesEqual(values: string[]): boolean {
  return values.length === EXPECTED.length && EXPECTED.every((value, index) => values[index] === value);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function firstLegalEntityValueLine(doc: SpecDoc, startLine: number, endLine: number): { text: string; line: number } | null {
  for (let line = startLine + 1; line <= endLine; line++) {
    const text = doc.lines[line] ?? "";
    const values = codeValues(text);
    if (values.some((value) => EXPECTED.includes(value as never) || value === "sourcera_uk_ltd")) {
      return { text, line };
    }
  }
  return null;
}

function appendixEnumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const body = findSectionByTitle(doc, "Legal Entity (§4.8.1, §4.8.3)");
  if (!body) {
    push(findings, doc, 0, "Legal Entity (§4.8.1, §4.8.3)", "Appendix J body-side Legal Entity section is missing.");
  } else {
    const text = doc.lines.slice(body.startLine, body.endLine + 1).join("\n");
    for (const token of BODY_SECTION_TOKENS) {
      if (!text.includes(token)) push(findings, doc, body.startLine, token, `Body-side Legal Entity section is missing token: ${token}`);
    }
    const valueLine = firstLegalEntityValueLine(doc, body.startLine, body.endLine);
    const values = valueLine ? codeValues(valueLine.text) : [];
    if (!valuesEqual(values)) {
      push(findings, doc, valueLine?.line ?? body.startLine, values.join(", "), `Body-side Legal Entity enum must expose exactly: ${EXPECTED_DISPLAY}.`);
    }
  }

  const envelope = findSectionByTitle(doc, "`legal_entity_kind`");
  if (!envelope) {
    push(findings, doc, 0, "`legal_entity_kind`", "Appendix J envelope-facing `legal_entity_kind` section is missing.");
  } else {
    const valueLine = firstLegalEntityValueLine(doc, envelope.startLine, envelope.endLine);
    const values = valueLine ? codeValues(valueLine.text) : [];
    if (!valuesEqual(values)) {
      push(findings, doc, valueLine?.line ?? envelope.startLine, values.join(", "), `Envelope-facing legal_entity_kind enum must expose exactly: ${EXPECTED_DISPLAY}.`);
    }
  }

  return findings;
}

function liveCitationFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const stale = /Appendix J `legal_entity`(?!_kind)|Appendix J legal_entity(?!_kind)/g;
  let match: RegExpExecArray | null;
  while ((match = stale.exec(doc.text)) !== null) {
    const line = doc.text.slice(0, match.index).split(/\r?\n/).length;
    push(findings, doc, line, match[0], "Live legal_entity citations must resolve to Appendix J `legal_entity_kind`, not a nonexistent Appendix J `legal_entity` enum.");
  }

  for (const token of LIVE_CITATION_TOKENS) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `Missing canonical legal_entity citation token: ${token}`);
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `legal_entity_enum_canonical_consistency` |"));
  if (!row) {
    push(findings, doc, 0, "`legal_entity_enum_canonical_consistency`", "§M.5 row legal_entity_enum_canonical_consistency is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `§M.5 legal_entity_enum_canonical_consistency row is missing required token: ${token}`);
  }
  if (row.text.includes("convex/deploy_validators/legal_entity_enum_canonical_consistency.ts")) {
    push(findings, doc, row.line, "convex/deploy_validators/legal_entity_enum_canonical_consistency.ts", "This M02.3 spec-tree promotion must not claim deploy-validator evidence; runtime behavior remains on sibling M24.3 / M11.3 rows.");
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "legal_entity_enum_canonical_consistency",
  sourcePhase: "V72REM-PH5",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...appendixEnumFindings(doc),
      ...liveCitationFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
