/** Local pr_lint half of the Solo migration-trial lifetime gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "solo_trial_one_per_org_lifetime";

function sectionText(doc: SpecDoc, title: RegExp): { text: string; line: number } | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const trial = sectionText(doc, /^34\.9\.5 90-Day Solo Trial/);
  if (!trial) {
    push(findings, doc, 0, "34.9.5 90-Day Solo Trial", "§34.9.5 Solo migration-trial contract is missing.");
    return findings;
  }

  const trialTokens = [
    "v2-cohort",
    "(org_id, console, legal_entity, trial_kind)",
    "per-evaluation charges MUST NOT fire",
    "per-bid charges MUST NOT fire",
    "billing.plan.downgraded",
    "billing.solo_trial.ended",
    "org.solo_trial_ended",
    "same transaction as the plan-tier change",
    "solo_trial_already_redeemed",
    "emits no plan change",
  ];
  for (const token of trialTokens) {
    if (!trial.text.includes(token)) {
      push(findings, doc, trial.line, token, `§34.9.5 is missing Solo trial contract token: ${token}.`);
    }
  }

  for (const token of [
    "billing.solo_trial.started",
    "billing.solo_trial.expiry_notice_sent",
    "billing.solo_trial.ended",
    "solo_trial_started",
    "solo_trial_expiry_notice_sent",
    "solo_trial_ended",
    "trial_state_id",
    "trial_state_kind",
    "solo_trial_state",
    "solo_trial_outcome",
    "org.solo_trial_started",
    "org.solo_trial_ended",
  ]) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `Solo trial Appendix C/G/J or audit registration is missing: ${token}.`);
  }

  const error = findLine(doc, (line) => line.trim().startsWith("| `solo_trial_already_redeemed` | 409 |"));
  if (!error || !error.text.includes("legal_entity")) {
    push(findings, doc, error?.line ?? 0, "legal_entity", "Appendix I solo_trial_already_redeemed must bind the full legal_entity uniqueness key.");
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "deployed eligibility, transaction, and billing-suppression validator evidence remains required",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}.`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Solo Trial P1",
  rowClass: "cross_feature_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
