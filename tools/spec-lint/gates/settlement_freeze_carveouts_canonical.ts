/**
 * Gate: `settlement_freeze_carveouts_canonical`
 *
 * Assertion: AIOperation Settlement Freeze carve-outs are single-sourced from
 * §4.8.1. Post-contest-window writes permit exactly two classes: DSAR
 * redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_4_8_1 = "4.8.1-aioperation";
const APPENDIX_I_BILLING = "appendix-i-pre-existing-billing-codes";

const SECTION_TOKENS = [
  "post-`contest_window_at`, only two write classes are permitted",
  "DSAR redaction (Pattern B per §6.8.4.1)",
  "Ops emergency reversal under the §4.8.1.A Ops Emergency Reversal Protocol",
  "only `redacted_at` (DSAR) writes AND the **Ops emergency-reversal path** documented in the §4.8.1 state-machine row",
  "Deploy-time validator `settlement_freeze_carveouts_canonical` (Appendix M.5) asserts no other code path mutates a frozen AIOperation",
];

const APPENDIX_I_TOKENS = [
  "Any AIOperation mutation after Settlement Freeze",
  "once `contest_window_at < now`, only DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A are permitted",
  "Body names the attempted field and the permitted carve-out set",
];

const GLOSSARY_TOKENS = [
  "all writes other than DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A are rejected",
  "Reached when `settlement_state ∈ {accepted, rejected, auto_accepted, reversed}` AND `contest_window_at < now`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/settlement_freeze_carveouts_canonical.ts",
  "§4.8.1 Settlement Freeze paragraph",
  "Appendix I `ai_operation_immutable_after_settlement`",
  "Appendix K Settlement Freeze",
  "post-`contest_window_at`, the only permitted write classes are DSAR redaction per §6.8.4.1 Pattern B and Ops emergency reversal under §4.8.1.A",
  "binding §4.8.1 financial-record-integrity invariant",
];

const FORBIDDEN_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /state-machine row at line/i, label: "stale line-number state-machine pointer" },
  { re: /line 8166/i, label: "stale line 8166 pointer" },
  { re: /§34\.18\.x settlement-freeze/i, label: "stale §34.18.x settlement-freeze authority" },
  { re: /§34\.18 settlement-freeze canonical anchor/i, label: "stale §34.18 settlement-freeze authority" },
  {
    re: /only `accept_reject_status`, `accept_reject_reason_text`, contest-related fields are mutable post-settlement/i,
    label: "legacy post-settlement mutability carve-out",
  },
  {
    re: /all writes other than DSAR redaction are rejected with `ai_operation_immutable_after_settlement`/i,
    label: "legacy glossary text omits Ops emergency reversal",
  },
];

function sectionText(
  doc: SpecDoc,
  anchor: string,
  label: string,
  findings: Finding[],
): { text: string; line: number } {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor,
      message: `${label} section is missing; cannot verify Settlement Freeze carve-outs.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(
  doc: SpecDoc,
  text: string,
  baseLine: number,
  label: string,
  tokens: string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line: baseLine,
        matched_text: token,
        message: `${label} is missing Settlement Freeze carve-out binding: ${token}`,
      });
    }
  }
  return findings;
}

function findLine(doc: SpecDoc, token: string): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    if (text.includes(token)) return { text, line: i };
  }
  return null;
}

function findLineMatching(
  doc: SpecDoc,
  predicate: (text: string) => boolean,
): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    if (predicate(text)) return { text, line: i };
  }
  return null;
}

function forbiddenFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.re.test(text)) {
        findings.push({
          file: doc.path,
          line: i,
          matched_text: pattern.label,
          message: `Settlement Freeze carve-out text contains ${pattern.label}; cite §4.8.1 and include both DSAR redaction and Ops emergency reversal.`,
        });
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "settlement_freeze_carveouts_canonical",
  sourcePhase: "V11 (D-11.3-002 remediation)",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const aiOperation = sectionText(doc, SECTION_4_8_1, "§4.8.1 AIOperation", findings);
    findings.push(...requireTokens(doc, aiOperation.text, aiOperation.line, "§4.8.1 Settlement Freeze", SECTION_TOKENS));

    const appendixI = sectionText(doc, APPENDIX_I_BILLING, "Appendix I billing codes", findings);
    const appendixIRow = appendixI.text
      .split(/\n/)
      .find((line) => line.includes("`ai_operation_immutable_after_settlement`")) ?? "";
    findings.push(...requireTokens(doc, appendixIRow, appendixI.line, "Appendix I ai_operation_immutable_after_settlement row", APPENDIX_I_TOKENS));

    const glossaryLine = findLineMatching(
      doc,
      (line) => line.includes("**Settlement Freeze.** The state of an AIOperation"),
    );
    if (!glossaryLine) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "**Settlement Freeze.**",
        message: "Appendix K Settlement Freeze glossary entry is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, glossaryLine.text, glossaryLine.line, "Appendix K Settlement Freeze glossary entry", GLOSSARY_TOKENS));
    }

    const m5Row = findLineMatching(
      doc,
      (line) => line.trim().startsWith("| `settlement_freeze_carveouts_canonical` |"),
    );
    if (!m5Row) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`settlement_freeze_carveouts_canonical`",
        message: "Appendix M.5 settlement_freeze_carveouts_canonical row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5Row.text, m5Row.line, "Appendix M.5 settlement_freeze_carveouts_canonical row", M5_TOKENS));
    }

    findings.push(...forbiddenFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
