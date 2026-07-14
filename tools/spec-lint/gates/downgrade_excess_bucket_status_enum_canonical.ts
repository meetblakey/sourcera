/**
 * Gate: `downgrade_excess_bucket_status_enum_canonical`
 *
 * Assertion: DowngradeExcessDataBucket status values used by §4.8.10 / §34.6
 * / §34.19 resolve to Appendix J, and the retired phantom
 * `preservation_status=hard_archived` wording cannot re-enter active contract
 * text.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "downgrade_excess_bucket_status_enum_canonical";
const EXPECTED = [
  "active_preservation",
  "notice_sent_d60",
  "notice_sent_d80",
  "archive_pending",
  "archived",
  "archived_class_1_protected",
  "restored",
] as const;

const FIELD_AND_STATE_TOKENS = [
  "| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored` | |",
  "| `archive_pending` | `archived` | Cron archives non-Class-1 entities to cold storage |",
  "| `archive_pending` | `archived_class_1_protected` | Cron archives Class-1 protected assets to cold storage |",
  "| `archived_class_1_protected` | `restored` | Customer requests self-service restore OR Ops-assisted restore inside the §34.6.3.A window |",
] as const;

const APPENDIX_J_TOKENS = [
  "### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)",
  "`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored`",
  "State-machine authority lives in §4.8.10.",
] as const;

const CROSS_SECTION_TOKENS = [
  "| `status` | `archived` (§4.8.10 enum value) | `archived_class_1_protected`",
  "The `preservation_status=hard_archived` field name referenced in the prior §34.19.6 #2 wording is retired; the validator now asserts against the canonical §4.8.10 `status` enum membership.",
  "The prior wording \"no asset in the 13-class list enters `preservation_status=hard_archived`\" referenced a phantom field/value combination not present in §4.8.10's `status` enum; that wording is retired in favor of the canonical §4.8.10 enum membership check.",
] as const;

const M5_ROW_TOKENS = [
  "enum_consistency",
  "runtime_active",
  "tools/spec-lint/gates/downgrade_excess_bucket_status_enum_canonical.ts",
  "spec-tree §4.8.10 / §34.6 / §34.19 / Appendix J status-enum coverage only",
  "product downgrade cron, archive writes, protected-asset restore execution, and runtime firewall behavior remain product-pack evidence",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string): void {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function requireDocTokens(findings: Finding[], doc: SpecDoc, tokens: readonly string[], label: string): void {
  for (const token of tokens) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
  }
}

function appendixJEnumValues(doc: SpecDoc): string[] {
  const section = findSectionByTitle(doc, "`downgrade_excess_bucket_status`");
  if (!section) return [];
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  for (let line = section.startLine + 1; line <= section.endLine; line += 1) {
    const text = doc.lines[line] ?? "";
    let match: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((match = re.exec(text)) !== null) {
      const value = match[1];
      if (EXPECTED.includes(value as never)) values.push(value);
    }
    if (values.length > 0) break;
  }
  return values;
}

function enumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const values = appendixJEnumValues(doc);
  if (values.length === 0) {
    push(findings, doc, 0, "downgrade_excess_bucket_status", "Appendix J downgrade_excess_bucket_status enum is missing or empty.");
    return findings;
  }
  const same =
    values.length === EXPECTED.length &&
    EXPECTED.every((expected, index) => values[index] === expected);
  if (!same) {
    push(
      findings,
      doc,
      0,
      values.join(", "),
      `Appendix J downgrade_excess_bucket_status must expose exactly: ${EXPECTED.map((v) => `\`${v}\``).join(", ")}.`,
    );
  }
  return findings;
}

function phantomFieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line += 1) {
    const text = doc.lines[line] ?? "";
    if (!text.includes("preservation_status=hard_archived")) continue;
    const lower = text.toLowerCase();
    const isRetirementReference =
      lower.includes("retired") ||
      lower.includes("prior") ||
      lower.includes("former") ||
      lower.includes("phantom");
    if (!isRetirementReference) {
      push(
        findings,
        doc,
        line,
        "preservation_status=hard_archived",
        "The retired phantom preservation_status=hard_archived wording may only appear in explicit retirement/history text.",
      );
    }
  }
  return findings;
}

function sectionPresenceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const anchor of [
    "4.8.10-downgradeexcessdatabucket",
    "34.5.1.a-buyer-side-upgrade-carry-over-set",
    "34.19.1.a-protected-asset-sub-class-bridge",
  ]) {
    if (!findSectionByAnchor(doc, anchor)) {
      push(findings, doc, 0, anchor, `Required section anchor is missing: ${anchor}`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 34.19",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "4.8.10-downgradeexcessdatabucket",
      "§4.8.10 DowngradeExcessDataBucket",
      FIELD_AND_STATE_TOKENS,
    );
    requireDocTokens(findings, ctx.masterSpec, APPENDIX_J_TOKENS, "Appendix J downgrade status enum");
    requireDocTokens(findings, ctx.masterSpec, CROSS_SECTION_TOKENS, "Downgrade status cross-section retirement contract");
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return [
      ...findings,
      ...enumFindings(ctx.masterSpec),
      ...phantomFieldFindings(ctx.masterSpec),
      ...sectionPresenceFindings(ctx.masterSpec),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
