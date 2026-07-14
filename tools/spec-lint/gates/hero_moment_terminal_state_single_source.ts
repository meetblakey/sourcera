/**
 * Gate: `hero_moment_terminal_state_single_source`
 *
 * Assertion: Seller Hero Moment completion has one terminal predicate:
 * `SellerOnboardingSession.hero_moment_completed_at` written by the Bid
 * Workspace render path at first paint when the Stage-3 surfaces and latency
 * predicate pass. Stake-Reveal is post-Hero-Moment reinforcement only.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_SECTIONS = [
  {
    anchor: "4.4.22-selleronboardingsession",
    label: "§4.4.22 SellerOnboardingSession",
    tokens: [
      "`hero_moment_completed_at` | Timestamp",
      "**Authoritative hero-moment timestamp**",
      "all three Stage 3 surfaces render pre-touch",
      "`stage_3_population_latency_ms` satisfies §44.1 `Seller onboarding Stage-3 population-latency threshold`",
      "`hero_moment_completed_at IS NOT NULL` iff all three Stage 3 surfaces",
      "Written by the Bid Workspace render path at first paint",
    ],
  },
  {
    anchor: "48.1.5-seller-hero-moment-framework-cross-reference",
    label: "§48.1.5 Seller Hero Moment Framework",
    tokens: [
      "SINGLE canonical Hero Moment terminal predicate",
      "§4.4.22 `hero_moment_completed_at` write",
      "POST-HERO-MOMENT surfaces",
      "do NOT redefine the Hero Moment's terminal predicate",
      "`activation_metric_elapsed_seconds = first_requirement_response_at - stage_1_arrival_at`",
      "NOT end-to-end-to-Stake-Reveal",
      "`hero_moment_terminal_state_single_source`",
    ],
  },
  {
    anchor: "48.8.5-post-submission-reveal-hour-1",
    label: "§48.8.5 Post-Submission Reveal",
    tokens: [
      "post-Hero-Moment reinforcement surface",
      "after `hero_moment_completed_at` writes",
      "MUST NOT write or redefine `hero_moment_completed_at`",
      "`reveal_moment = post_submission_reveal`",
    ],
  },
  {
    anchor: "48.8.10-acceptance-criteria-aggregate",
    label: "§48.8.10 Acceptance Criteria",
    tokens: [
      "Hero Moment terminal predicate remains `hero_moment_completed_at`",
      "Stake-Reveal measurements are post-Hero-Moment reinforcement metrics",
      "do not redefine completion",
    ],
  },
];

const APPENDIX_G_TOKEN =
  "| `hero_moment_completed` | `hero_moment_completed_at` write per §4.4.22 (single canonical terminal predicate per §48.1.5";

const M5_ROW_TOKENS = [
  "`hero_moment_terminal_state_single_source`",
  "runtime_active",
  "tools/spec-lint/gates/hero_moment_terminal_state_single_source.ts",
  "§4.4.22 `hero_moment_completed_at` predicate",
  "§48.1.5 / §48.8.5 / §48.8.10",
  "Stake-Reveal remains post-Hero-Moment",
];

const FORBIDDEN_SECTION_48_8_5 = [
  "where the vendor first perceives Sourcera as an asset",
  "moment-of-value-perception",
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

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  tokens: string[],
) {
  for (const token of tokens) {
    if (!text.includes(token)) {
      push(findings, doc, line, token, `${label} is missing Hero Moment terminal-state binding: ${token}`);
    }
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
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

export const gate: SpecLintGate = {
  id: "hero_moment_terminal_state_single_source",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "github_actions + post-build",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const item of REQUIRED_SECTIONS) {
      const section = sectionText(doc, item.anchor);
      if (!section) {
        push(findings, doc, 0, item.anchor, `${item.label} is missing.`);
        continue;
      }
      requireTokens(findings, doc, section.text, section.line, item.label, item.tokens);
    }

    const postSubmission = sectionText(doc, "48.8.5-post-submission-reveal-hour-1");
    if (postSubmission) {
      for (const stale of FORBIDDEN_SECTION_48_8_5) {
        if (postSubmission.text.includes(stale)) {
          push(
            findings,
            doc,
            postSubmission.line,
            stale,
            "§48.8.5 must not frame Stake-Reveal as the first value-perception or terminal Hero Moment; it is post-Hero-Moment reinforcement.",
          );
        }
      }
    }

    for (const number of ["30", "31"]) {
      const line = numberedLine(doc, "48.8.10-acceptance-criteria-aggregate", number);
      if (!line) {
        push(findings, doc, 0, `AC #${number}`, `§48.8.10 AC #${number} is missing.`);
        continue;
      }
      if (!line.text.includes("activation_metric_elapsed_seconds")) {
        push(findings, doc, line.line, line.text, `§48.8.10 AC #${number} must measure activation via activation_metric_elapsed_seconds, not Stake-Reveal.`);
      }
      if (/stake_reveal|stake-reveal/i.test(line.text)) {
        push(findings, doc, line.line, line.text, `§48.8.10 AC #${number} must not use Stake-Reveal as the Hero Moment measurement endpoint.`);
      }
    }

    const appendixG = findLine(doc, (line) => line.includes(APPENDIX_G_TOKEN));
    if (!appendixG) {
      push(
        findings,
        doc,
        0,
        APPENDIX_G_TOKEN,
        "Appendix G `hero_moment_completed` row must bind to the §4.4.22 canonical terminal predicate.",
      );
    }

    const m5Row = findLine(doc, (line) => line.trim().startsWith("| `hero_moment_terminal_state_single_source` |"));
    if (!m5Row) {
      push(findings, doc, 0, "`hero_moment_terminal_state_single_source`", "§M.5 row hero_moment_terminal_state_single_source is missing.");
    } else {
      requireTokens(findings, doc, m5Row.text, m5Row.line, "§M.5 hero_moment_terminal_state_single_source row", M5_ROW_TOKENS);
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
