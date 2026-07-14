/**
 * Gate: `section10_plan_gating_source_citation_completeness`
 *
 * Assertion: §10 phase behavior cites §5.11, §34.1.1, and §39 source rows
 * instead of carrying orphan plan-gating or object-limit literals.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor?: string;
  title?: RegExp;
  label: string;
  signals: string[];
}

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "10.6-phase-6-vendor-bidding-opens",
    label: "§10.6 Phase 6 bidding window",
    signals: [
      "minimum window per §39",
      "minimum 7 calendar days from phase entry per §39 row `Phase6BiddingCloseMinimumDuration`",
      "bidding_close_at >= phase_6_entered_at + 7 calendar days` per §39 row `Phase6BiddingCloseMinimumDuration`",
      "earlier than `phase_6_entered_at + 7 calendar days` per §39 row `Phase6BiddingCloseMinimumDuration` with HTTP 422 `phase_6_bidding_close_below_minimum_window`",
    ],
  },
  {
    anchor: "10.10-phase-10-team-evaluation-and-scoring",
    label: "§10.10 scoring constraints",
    signals: [
      "up to 500 characters per §39 row `ScoreRationaleCharLimit`",
      "In Team Mode, each Requirement is assigned to 1-5 reviewers per §39 row `ScoreAssignmentsPerRequirement`; one reviewer is individual scoring, while consensus and divergence behavior apply only at 2+ reviewers per §13.6.",
    ],
  },
  {
    anchor: "10.12-phase-12-selection-and-recommendation",
    label: "§10.12 Approval Workflow plan / role binding",
    signals: [
      "Availability and role access are governed by §5.11 row `approval_workflow`",
      "plan-tier availability is Buyer Business Starter+ per §34.1.1 row **Approval Workflow (Phase 12)**",
      "Approver decision is recorded on Approval Workflow (§4.3.25) using Appendix J `approval_workflow_status`",
      "Selection Report (§4.3.23) signed and, when approval is required, Approval Workflow (§4.3.25) is `approved`",
    ],
  },
  {
    title: /^10\.16\.4\b/,
    label: "§10.16.4 plan-gating source citations",
    signals: [
      "Phase advancement itself is not plan-gated",
      "every plan tier (Free / Solo / Starter / Growth / Scale / Enterprise) can advance a read-write Workspace through the pipeline",
      "Soft-gate skip is plan-keyed indirectly via `evaluation_owner_mode=solo` (default for Free / Solo per §34.1.1; default Off for Starter+ per §2.8.7 AC #1)",
      "Per-phase capability access (e.g., Defense View on Phase 12 entry) is gated at the capability layer per §5.11 + §34.1",
    ],
  },
  {
    anchor: "39.-object-size-constraints",
    label: "§39 object-size source rows",
    signals: [
      "| Score | rationale (`ScoreRationaleCharLimit`) | 500 chars | Source row for §10.10 scoring rationale.",
      "| Score Assignment | scorers per Requirement / Vendor (`ScoreAssignmentsPerRequirement`) | Minimum 1, maximum 5 Team Members | Source row for §10.10 scoring-assignment cardinality.",
      "| Workspace Phase 6 | bidding close minimum duration (`Phase6BiddingCloseMinimumDuration`) | 7 calendar days from `phase_6_entered_at` | Source row for §10.6 and §10.16.1 `phase_6_bidding_close_below_minimum_window`",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "| Route / approve Phase 12 Approval Workflow (`approval_workflow`; `business_starter`+ entitlement per §34.1.1 row **Approval Workflow (Phase 12)** and §10.12 Step 5)",
  "| **Default `evaluation_owner_mode` at Workspace creation (§4.3.1)** | `solo` | `solo` | `team` | `team` | `team` | `team` | §4.3.1; §5.11 Notes",
  "| **Approval Workflow (Phase 12)** | — | — | Included (Business Starter+; multi-stakeholder approval routing) | Included | Included | Included + custom approver policy | BPS §5.3 / §11 upgrade-trigger narrative; §10.12 Step 5; §5.11 row `approval_workflow` |",
  "| 422 | `phase_6_bidding_close_below_minimum_window` | Phase 5 -> 6 advance attempted with `bidding_close_at < phase_6_entered_at + 7 calendar days` per §10.6 / §39 row `Phase6BiddingCloseMinimumDuration`. |",
  "| `section10_plan_gating_source_citation_completeness` | 4.2 |",
];

function sectionText(doc: SpecDoc, expectation: SectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = expectation.anchor
    ? findSectionByAnchor(doc, expectation.anchor)
    : expectation.title
      ? findSectionByTitle(doc, expectation.title)
      : null;
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function findLine(doc: SpecDoc, signal: string): number {
  return doc.lines.findIndex((line) => line.includes(signal));
}

export const gate: SpecLintGate = {
  id: "section10_plan_gating_source_citation_completeness",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const expectation of SECTION_EXPECTATIONS) {
      const section = sectionText(doc, expectation);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: expectation.label,
          message: `parse_error: ${expectation.label} section not found.`,
        });
        continue;
      }
      for (const signal of expectation.signals) {
        if (!section.text.includes(signal)) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: signal,
            message: `${expectation.label} is missing required source citation "${signal}".`,
          });
        }
      }
    }

    for (const signal of GLOBAL_SIGNALS) {
      const line = findLine(doc, signal);
      if (line < 0) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: signal,
          message: `Missing global Section 10 plan-gating source binding "${signal}".`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
