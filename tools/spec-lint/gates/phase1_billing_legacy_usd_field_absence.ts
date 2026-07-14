/**
 * Gate: `phase1_billing_legacy_usd_field_absence`
 *
 * Assertion: retired Phase 1 USD-dollar field names do not reappear in the
 * live Master Spec after the Phase DEC cents-backed migration.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const LEGACY_FIELDS = [
  "credit_value_usd",
  "credit_redeemed_usd",
  "ai_value_dollars",
  "loaded_hourly_rate_usd",
  "value_saved_usd",
];

const CANONICAL_FIELDS = [
  "credit_value_cents",
  "credit_redeemed_cents",
  "ai_value_consumed_cents",
  "loaded_hourly_rate_cents",
  "value_saved_cents",
];

const M5_ROW_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/phase1_billing_legacy_usd_field_absence.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "historical `_versions` snapshots or migration notes explicitly marked retired",
];

function findM5Row(doc: SpecDoc): { line: number; text: string } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (text.trim().startsWith("| `phase1_billing_legacy_usd_field_absence` |")) return { line, text };
  }
  return null;
}

function requireTokens(doc: SpecDoc, line: number, text: string, label: string, tokens: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: token,
        message: `${label} is missing Phase 1 legacy-USD guard binding: ${token}`,
      });
    }
  }
  return findings;
}

function isAllowedReference(line: string): boolean {
  const lower = line.toLowerCase();
  if (line.includes("`phase1_billing_legacy_usd_field_absence`")) return true;
  return (
    lower.includes("migration note") &&
    lower.includes("retired") &&
    lower.includes("legacy")
  );
}

function legacyFieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (isAllowedReference(text)) continue;
    for (const field of LEGACY_FIELDS) {
      if (!text.includes(field)) continue;
      findings.push({
        file: doc.path,
        line,
        anchor: anchorForLine(doc, line),
        matched_text: field,
        message: `Retired Phase 1 billing field \`${field}\` appears in live spec text; use the cents-backed field name from the Phase DEC migration.`,
      });
    }
  }
  return findings;
}

function canonicalFieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const field of CANONICAL_FIELDS) {
    if (!doc.text.includes(`\`${field}\``)) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: field,
        message: `Canonical Phase 1 cents-backed field \`${field}\` is missing from the live Master Spec.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "phase1_billing_legacy_usd_field_absence",
  sourcePhase: "v7.2.0-REM Phase DEC",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const m5 = findM5Row(doc);
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`phase1_billing_legacy_usd_field_absence`",
        message: "Appendix M.5 row phase1_billing_legacy_usd_field_absence is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.line, m5.text, "§M.5 phase1_billing_legacy_usd_field_absence row", M5_ROW_TOKENS));
    }

    findings.push(...canonicalFieldFindings(doc));
    findings.push(...legacyFieldFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
