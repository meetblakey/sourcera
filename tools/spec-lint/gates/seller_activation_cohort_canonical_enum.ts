/**
 * Gate: `seller_activation_cohort_canonical_enum`
 *
 * Historical gate id; current assertion: seller activation metric and dashboard
 * cohort references must use the canonical Appendix J
 * `seller_onboarding_invite_source` enum, not stale partial invite-source lists.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  findSectionByAnchor,
  findSectionByTitle,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED_INVITE_SOURCES = [
  "buyer_invite",
  "ghost_bid_conversion",
  "direct_signup",
  "marketplace_search",
  "buyer_referral_m16",
  "pro_trial_seat_m17",
];

interface RequiredLine {
  anchor: string;
  number: string;
  label: string;
}

const REQUIRED_LINES: RequiredLine[] = [
  { anchor: "48.8.10-acceptance-criteria-aggregate", number: "30", label: "§48.8.10 AC #30 p50 activation metric" },
  { anchor: "48.8.10-acceptance-criteria-aggregate", number: "31", label: "§48.8.10 AC #31 p90 activation metric" },
  { anchor: "48.8.10-acceptance-criteria-aggregate", number: "39", label: "§48.8.10 AC #39 invite-source breakdown" },
  { anchor: "49.1.10-acceptance-criteria", number: "1", label: "§49.1.10 AC #1 p50 activation metric" },
  { anchor: "49.1.10-acceptance-criteria", number: "2", label: "§49.1.10 AC #2 p90 activation metric" },
  { anchor: "49.1.10-acceptance-criteria", number: "10", label: "§49.1.10 AC #10 invite-source breakdown" },
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

function numberedLine(doc: SpecDoc, anchor: string, number: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  const re = new RegExp(`^${number}\\.\\s+`);
  for (let line = section.startLine; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (re.test(text)) return { text, line };
  }
  return null;
}

function isCanonicalReference(text: string): boolean {
  return /all six canonical/i.test(text)
    && text.includes("seller_onboarding_invite_source")
    && EXPECTED_INVITE_SOURCES.every((token) => text.includes(token));
}

function appendixJEnumSection(doc: SpecDoc) {
  return findSectionByTitle(doc, /`seller_onboarding_invite_source`/);
}

function findM5Row(doc: SpecDoc): { cells: string[]; line: number; raw: string } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const raw = doc.lines[line] ?? "";
    if (!raw.includes("| `seller_activation_cohort_canonical_enum` |")) continue;
    const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
    return { cells: splitUnescapedPipes(trimmed).map((cell) => cell.trim()), line, raw };
  }
  return null;
}

export const gate: SpecLintGate = {
  id: "seller_activation_cohort_canonical_enum",
  sourcePhase: "V11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const enumSection = appendixJEnumSection(doc);
    if (!enumSection) {
      push(findings, doc, 0, "seller_onboarding_invite_source", "Appendix J `seller_onboarding_invite_source` enum section is missing.");
    } else {
      const enumText = doc.lines.slice(enumSection.startLine, enumSection.endLine + 1).join("\n");
      for (const token of EXPECTED_INVITE_SOURCES) {
        if (!enumText.includes(token)) {
          push(findings, doc, enumSection.startLine, token, `Appendix J seller_onboarding_invite_source is missing ${token}.`);
        }
      }
    }

    for (const item of REQUIRED_LINES) {
      const hit = numberedLine(doc, item.anchor, item.number);
      if (!hit) {
        const section = findSectionByAnchor(doc, item.anchor);
        push(findings, doc, section?.startLine ?? 0, item.label, `${item.label} is missing.`);
        continue;
      }
      if (!isCanonicalReference(hit.text)) {
        const missing = EXPECTED_INVITE_SOURCES.filter((token) => !hit.text.includes(token));
        push(
          findings,
          doc,
          hit.line,
          hit.text,
          `${item.label} must cite Appendix J seller_onboarding_invite_source and enumerate all six canonical invite-source values; missing: ${missing.join(", ") || "canonical all-six wording"}.`,
        );
      }
    }

    for (let line = 1; line < doc.lines.length; line++) {
      const text = doc.lines[line] ?? "";
      if (/direct_signup[`']?\s+sellers are NOT part of the hero-path cohort for activation-metric measurement/i.test(text)) {
        push(
          findings,
          doc,
          line,
          "direct_signup sellers are NOT part",
          "`direct_signup` may be excluded from Stage-3 latency/draft cohorts, but must not be silently excluded from the all-six invite-source activation metric/dashboard cohort contract.",
        );
      }
    }

    const m5Row = findM5Row(doc);
    if (!m5Row) {
      push(findings, doc, 0, "seller_activation_cohort_canonical_enum", "§M.5 row seller_activation_cohort_canonical_enum is missing.");
    } else {
      const rowBody = m5Row.cells.slice(1).join(" | ");
      if (!rowBody.includes("runtime_active")) {
        push(findings, doc, m5Row.line, m5Row.raw, "§M.5 row seller_activation_cohort_canonical_enum must be promoted to runtime_active with detector evidence.");
      }
      if (!rowBody.includes("seller_onboarding_invite_source")) {
        push(findings, doc, m5Row.line, m5Row.raw, "§M.5 row seller_activation_cohort_canonical_enum must bind to Appendix J `seller_onboarding_invite_source`.");
      }
      if (/Appendix J `seller_activation_cohort`|pre_activation|magic_link_clicked|first_win|dormant|churned/.test(rowBody)) {
        push(findings, doc, m5Row.line, m5Row.raw, "§M.5 row must not describe a phantom Appendix J `seller_activation_cohort` enum.");
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
