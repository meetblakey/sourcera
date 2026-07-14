/**
 * Gate: `plan_change_pipeline_phase_grandfather_completeness`
 *
 * Assertion: plan-tier changes never recompute §10 pipeline state, and the
 * endpoint / notification / analytics registries carry the same impact contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor?: string;
  title?: RegExp;
  label: string;
  signals: string[];
}

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "10.17-cross-phase-state-preservation-under-plan-change",
    label: "§10.17 plan-change pipeline preservation",
    signals: [
      "Plan changes are Org-level billing mutations owned by §32.8.15 and §34.5.",
      "Upgrade to a higher Buyer plan",
      "Downgrade scheduled but not yet effective",
      "Downgrade effective, Workspace remains within new plan caps",
      "Downgrade effective, Workspace exceeds new plan caps or is selected as excess",
      "Console-scope change on a dual-console Org",
      "Plan changes MUST NOT automatically mutate:",
      "`Workspace.pipeline_phase`",
      "`Workspace.pipeline_stage_id`",
      "`Workspace.status`",
      "`Workspace.evaluation_owner_mode`",
      "Any data preservation or read-only state caused by downgrade MUST be represented through §34.6 / §4.8.10",
      "`billing.plan.upgraded` includes affected Workspace count",
      "`billing.plan.downgrade_scheduled` includes affected Workspace IDs visible to the recipient",
      "`billing.plan.downgraded` includes affected Workspace IDs visible to the recipient",
      "Recipients are governed by Appendix C Billing-Domain Events",
      "The impact summary MUST respect the Workspace membership scope and the dual-console firewall",
      "The §M.5 gate `plan_change_pipeline_phase_grandfather_completeness` MUST fail",
    ],
  },
  {
    title: /^10\.16\.4\b/,
    label: "§10.16.4 phase-advancement plan gating",
    signals: [
      "Phase advancement itself is not plan-gated",
      "Plan changes after Workspace creation follow the §10.17 preservation rules",
      "§34.6 read-only preservation cannot mutate or advance until restored, re-upgraded, or otherwise brought back under cap",
    ],
  },
  {
    anchor: "32.8.15-post-plan-change",
    label: "§32.8.15 plan-change endpoint",
    signals: [
      "POST /v1/orgs/{org_id}/plan-change",
      "Idempotency-Key",
      "DowngradeExcessDataBucket",
      "`billing.plan.change_requested`",
      "`billing.plan.change_applied`",
      "`billing.plan.downgrade_scheduled`",
      "`billing.plan.upgraded`",
      "`billing.plan.downgraded`",
      "§10.17.4 Workspace impact summary scoped to each recipient's visible Workspaces",
    ],
  },
  {
    anchor: "34.5-plan-upgrade-/-downgrade",
    label: "§34.5 plan upgrade / downgrade",
    signals: [
      "phase and ownership state do not recompute on upgrade",
      "Effective time | At the next billing cycle",
      "14 days before the effective downgrade",
      "§34.6 90-day read-only preservation flow",
      "DowngradeExcessDataBucket",
    ],
  },
  {
    anchor: "34.6-downgrade-excess-data-handling",
    label: "§34.6 downgrade excess data handling",
    signals: [
      "read-only preservation",
      "downgrade-preservation window",
      "Re-upgrade",
      "bucket transitions to `restored`",
      "active read-write atomically",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "| `billing.plan.upgraded` | Plan tier upgraded on either console | Billing Admin, Org Owner, all Workspace Owners (digest)",
  "Activation messaging includes `feature_access_diff.capabilities_unlocked`.",
  "| `billing.plan.downgraded` | Plan tier downgrade takes effect | Billing Admin, Org Owner, all Workspace Owners (digest)",
  "Includes `excess_data_bucket_summary` if applicable; CTA \"Restore data\" linking to §4.8.10 surface.",
  "| `billing.plan.downgrade_scheduled` | Plan downgrade scheduled (effective at next anniversary) | Billing Admin, Org Owner",
  "Subject line surfaces `scheduled_effective_at` and `cancellation_window_until`.",
  "| `billing.plan.change_applied` | Plan change commits | Billing Admin, Org Owner, affected Workspace Owners (digest)",
  "Carries scoped impact summary.",
  "| `billing_plan_upgraded` | Mirror of §31.8.5 `billing.plan.upgraded` webhook / notification",
  "| `billing_plan_downgraded` | Mirror of §31.8.5 `billing.plan.downgraded` webhook / notification",
  "| `billing_plan_downgrade_scheduled` | Mirror of §31.8.5 `billing.plan.downgrade_scheduled` webhook / notification",
  "### Plan Change Origin (§31.8.5) (new)",
  "`billing.plan.upgraded.change_origin` accepts:",
  "`billing.plan.downgraded.change_origin` accepts:",
  "`billing.plan.downgrade_scheduled` does NOT carry `change_origin`",
  "| `plan_change_pipeline_phase_grandfather_completeness` | 4.2 |",
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
  id: "plan_change_pipeline_phase_grandfather_completeness",
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
            message: `${expectation.label} is missing required plan-change preservation binding "${signal}".`,
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
          message: `Missing global plan-change pipeline preservation binding "${signal}".`,
        });
      }
    }

    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i];
      if (!/30[- ]day/i.test(line) || !/plan[- ]change/i.test(line) || /no orphan|rejects an orphan|unsupported/i.test(line)) {
        continue;
      }
      findings.push({
        file: doc.path,
        line: i,
        anchor: anchorForLine(doc, i),
        matched_text: line.trim(),
        message: "Plan-change pipeline preservation MUST NOT introduce an orphan 30-day plan-change grace value; use §34.5 / §34.6.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
