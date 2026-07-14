/**
 * Gate: `dsar_pseudonym_field_name_canonicality`
 *
 * Assertion: DSAR pseudonymization references for AIOperation,
 * ContestRecord, and CommittedSpendContract must cite live §4 fields, not
 * stale aliases from pre-remediation text.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt, type SectionRange, type TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_FIELD_ROWS = [
  { anchor: "4.8.1-aioperation", entity: "AIOperation", field: "actor_id" },
  { anchor: "4.8.5-contestrecord", entity: "ContestRecord", field: "filed_by_user_id" },
  { anchor: "4.8.8-committedspendcontract", entity: "CommittedSpendContract", field: "signed_by_user_id" },
];

const STALE_ALIASES = [
  { token: "submitter_user_id", canonical: "AIOperation.`actor_id`" },
  { token: "accepter_user_id", canonical: "ContestRecord.`filed_by_user_id`" },
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function strip(cell: string): string {
  return cell.replace(/[*`]/g, "").trim();
}

function rowText(row: TableRow): string {
  return row.cells.join(" ");
}

function isHistoryNote(text: string): boolean {
  return /\b(pre-remediation|historical|D-3\.5-003|D-3\.5-016|remediation)\b/i.test(text);
}

function findRow(rows: TableRow[], re: RegExp): TableRow | null {
  return rows.find((row) => re.test(rowText(row))) ?? null;
}

function scanStaleAliases(findings: Finding[], doc: SpecDoc, section: SectionRange) {
  for (let line = section.startLine; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (isHistoryNote(text)) continue;
    for (const stale of STALE_ALIASES) {
      if (text.includes(stale.token)) {
        push(findings, doc, line, stale.token, `Stale DSAR pseudonym field \`${stale.token}\` is active prose; cite ${stale.canonical} instead.`);
      }
    }
  }
}

function requireFieldRow(findings: Finding[], doc: SpecDoc, anchor: string, entity: string, field: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `§4 entity section for ${entity} is missing.`);
    return;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const hit = table.rows.find((row) => strip(row.cells[0] ?? "") === field);
  if (!hit) {
    push(findings, doc, section.startLine, field, `${entity} must expose live field \`${field}\` in its §4 field table.`);
  }
}

export const gate: SpecLintGate = {
  id: "dsar_pseudonym_field_name_canonicality",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const row of REQUIRED_FIELD_ROWS) {
      requireFieldRow(findings, doc, row.anchor, row.entity, row.field);
    }

    const pattern = findSectionByAnchor(doc, "6.8.4.1-cascade-pseudonymization-pattern");
    if (!pattern) {
      push(findings, doc, 0, "§6.8.4.1", "§6.8.4.1 Cascade Pseudonymization Pattern is missing.");
    } else {
      scanStaleAliases(findings, doc, pattern);
      const table = parseTableAt(doc, pattern.startLine, pattern.endLine);

      const aiOperation = findRow(table.rows, /§4\.8\.1 AIOperation/);
      if (!aiOperation) {
        push(findings, doc, pattern.startLine, "§4.8.1 AIOperation", "§6.8.4.1 must assign a pseudonymization pattern for AIOperation.");
      } else {
        const text = rowText(aiOperation);
        if (!/actor_id/.test(text)) {
          push(findings, doc, aiOperation.line, text, "§6.8.4.1 AIOperation row must cite `actor_id`.");
        }
        if (!/actor_type/.test(text)) {
          push(findings, doc, aiOperation.line, text, "§6.8.4.1 AIOperation row must state the `actor_type` condition for user/ops actors.");
        }
      }

      const contest = findRow(table.rows, /§4\.8\.5 ContestRecord/);
      if (!contest) {
        push(findings, doc, pattern.startLine, "§4.8.5 ContestRecord", "§6.8.4.1 must assign a pseudonymization pattern for ContestRecord.");
      } else if (!/filed_by_user_id/.test(rowText(contest))) {
        push(findings, doc, contest.line, rowText(contest), "§6.8.4.1 ContestRecord row must cite `filed_by_user_id`.");
      }

      const commit = findRow(table.rows, /§4\.8\.8 CommittedSpendContract/);
      if (!commit) {
        push(findings, doc, pattern.startLine, "§4.8.8 CommittedSpendContract", "§6.8.4.1 must assign a pseudonymization pattern for CommittedSpendContract.");
      } else if (!/signed_by_user_id/.test(rowText(commit))) {
        push(findings, doc, commit.line, rowText(commit), "§6.8.4.1 CommittedSpendContract row must cite `signed_by_user_id`.");
      }
    }

    const retained = findSectionByAnchor(doc, "6.8.5-audit-integrity-exemption");
    if (!retained) {
      push(findings, doc, 0, "§6.8.5", "§6.8.5 Audit-Integrity Exemption section is missing.");
    } else {
      scanStaleAliases(findings, doc, retained);
      const table = parseTableAt(doc, retained.startLine, retained.endLine);
      const row = findRow(table.rows, /^3\s+BillingLedgerEntry, AIOperation/);
      if (!row) {
        push(findings, doc, retained.startLine, "row class #3", "§6.8.5 must contain retained-row class #3 for financial audit rows.");
      } else {
        const text = rowText(row);
        for (const required of ["AIOperation `actor_id`", "ContestRecord `filed_by_user_id`", "CommittedSpendContract `signed_by_user_id`"]) {
          if (!text.includes(required)) {
            push(findings, doc, row.line, required, `§6.8.5 row #3 must cite canonical field ${required}.`);
          }
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
