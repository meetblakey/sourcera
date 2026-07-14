/**
 * Gate: `aioperation_settlement_state_canonical_consumer`
 *
 * Assertion: active AIOperation settlement-state consumers use only the
 * Appendix J `ai_operation_settlement_state` values or a pointer to
 * ContestRecord.`original_settlement_state`; retired states such as
 * `committed` are forbidden.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  fenceMask,
  findSectionByAnchor,
  findSectionByTitle,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED = [
  "pending",
  "accepted",
  "rejected",
  "auto_accepted",
  "contested",
  "reversed",
];

const BAD_STATE_TOKENS = new Set([
  "committed",
  "settled",
  "resolved",
  "completed",
]);

interface Section {
  heading: { anchor?: string; title: string };
  startLine: number;
  endLine: number;
}

function sectionText(doc: SpecDoc, section: Section): string {
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

function backtickTokens(s: string): string[] {
  return [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v) => b.includes(v));
}

function push(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function allowedHistoricalOrRuleLine(line: string): boolean {
  return /historical|retired|non-canonical|forbidden|MUST NOT|gate|D-V8\.1-022|§M\.5/i.test(line);
}

function settlementLine(line: string): boolean {
  return /settlement[_ -]?state|settlement state|prior_settlement_state|original_settlement_state/i.test(line);
}

function originalSettlementPointerPresent(text: string): boolean {
  return /ContestRecord\.`?original_settlement_state`?|ContestRecord\.original_settlement_state|`original_settlement_state`/i.test(text);
}

function requireSection(
  findings: Finding[],
  doc: SpecDoc,
  section: Section | null,
  label: string,
): section is Section {
  if (section) return true;
  findings.push({
    file: doc.path,
    line: 0,
    matched_text: label,
    message: `${label} section is missing; cannot verify AIOperation settlement-state canonicality.`,
  });
  return false;
}

export const gate: SpecLintGate = {
  id: "aioperation_settlement_state_canonical_consumer",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const appendixEnum = findSectionByTitle(doc, /^AI Operation Settlement State\b/);
    if (requireSection(findings, doc, appendixEnum, "Appendix J AI Operation Settlement State")) {
      const text = sectionText(doc, appendixEnum);
      const values = backtickTokens(text).filter((token) => EXPECTED.includes(token) || BAD_STATE_TOKENS.has(token));
      if (!sameSet([...new Set(values)], EXPECTED)) {
        push(
          findings,
          doc,
          appendixEnum.startLine,
          values.join(", ") || "<empty>",
          `Appendix J ai_operation_settlement_state must define exactly ${EXPECTED.join(", ")}.`,
        );
      }
    }

    const aiOperation = findSectionByAnchor(doc, "4.8.1-aioperation");
    if (requireSection(findings, doc, aiOperation, "§4.8.1 AIOperation")) {
      const fieldLine = doc.lines.findIndex((line) => line.includes("| `settlement_state` | Enum |"));
      if (fieldLine < aiOperation.startLine || fieldLine > aiOperation.endLine) {
        push(findings, doc, aiOperation.startLine, "`settlement_state`", "§4.8.1 is missing the AIOperation `settlement_state` field row.");
      } else {
        const values = backtickTokens(doc.lines[fieldLine]).filter((token) => EXPECTED.includes(token) || BAD_STATE_TOKENS.has(token));
        if (!sameSet([...new Set(values)], EXPECTED)) {
          push(
            findings,
            doc,
            fieldLine,
            doc.lines[fieldLine],
            "§4.8.1 AIOperation `settlement_state` field row must list only the canonical Appendix J values.",
          );
        }
      }
    }

    const contestRecord = findSectionByTitle(doc, /^4\.8\.5\s+ContestRecord\b/);
    if (requireSection(findings, doc, contestRecord, "§4.8.5 ContestRecord")) {
      const text = sectionText(doc, contestRecord);
      if (!/`original_settlement_state`\s*\|\s*Enum\s*\|\s*`accepted`,\s*`auto_accepted`/i.test(text)) {
        push(
          findings,
          doc,
          contestRecord.startLine,
          "`original_settlement_state`",
          "§4.8.5 must define ContestRecord.`original_settlement_state` as the canonical accepted/auto_accepted restore pointer.",
        );
      }
      if (!/AIOperation restores to `original_settlement_state`|restore the AIOperation to `original_settlement_state`/i.test(text)) {
        push(
          findings,
          doc,
          contestRecord.startLine,
          "`original_settlement_state`",
          "§4.8.5 must state that contest rejection or withdrawal restores AIOperation to ContestRecord.`original_settlement_state`.",
        );
      }
    }

    const withdraw = findSectionByAnchor(doc, "32.8.13-post-contest-withdraw");
    if (requireSection(findings, doc, withdraw, "§32.8.13 contest withdraw endpoint")) {
      const text = sectionText(doc, withdraw);
      if (!/AIOperation `settlement_state` transitions from `contested` back to ContestRecord\.`?original_settlement_state`?/i.test(text)) {
        push(
          findings,
          doc,
          withdraw.startLine,
          "ContestRecord.`original_settlement_state`",
          "§32.8.13 response must restore AIOperation.`settlement_state` from `contested` to ContestRecord.`original_settlement_state`.",
        );
      }
      if (!/`?contested\s*(?:→|->)\s*ContestRecord\.original_settlement_state`?/i.test(text)) {
        push(
          findings,
          doc,
          withdraw.startLine,
          "`contested → ContestRecord.original_settlement_state`",
          "§32.8.13 atomicity block must name the canonical ContestRecord.original_settlement_state restoration.",
        );
      }
      if (/AIOperation\s+`status`\s+transitions/i.test(text)) {
        push(
          findings,
          doc,
          withdraw.startLine,
          "AIOperation `status` transitions",
          "§32.8.13 must describe AIOperation.`settlement_state`, not AIOperation.`status`, for contest withdrawal.",
        );
      }
    }

    const mask = fenceMask(doc);
    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      if (mask[lineNo]) continue;
      const line = doc.lines[lineNo] ?? "";
      if (allowedHistoricalOrRuleLine(line)) continue;

      if (/(?:contested\s*(?:→|->)\s*`?committed`?|`contested`\s*(?:→|->)\s*`committed`)/i.test(line)) {
        push(
          findings,
          doc,
          lineNo,
          "contested → committed",
          "AIOperation contest withdrawal must restore to ContestRecord.`original_settlement_state`, not `committed`.",
        );
      }

      if (/AIOperation\s+`status`\s+transitions/i.test(line)) {
        push(
          findings,
          doc,
          lineNo,
          "AIOperation `status` transitions",
          "AIOperation contest and settlement prose must use `settlement_state`, not a `status` field.",
        );
      }

      if (!settlementLine(line)) continue;
      for (const token of backtickTokens(line)) {
        if (EXPECTED.includes(token)) continue;
        if (token === "original_settlement_state" || token === "ai_operation_settlement_state") continue;
        if (!BAD_STATE_TOKENS.has(token)) continue;
        if (token === "committed" && /committed_spend/i.test(line)) continue;
        push(
          findings,
          doc,
          lineNo,
          `\`${token}\``,
          `AIOperation settlement-state consumer uses non-canonical token \`${token}\`; use Appendix J values or ${originalSettlementPointerPresent(line) ? "the existing" : "ContestRecord.`original_settlement_state`"} pointer.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
