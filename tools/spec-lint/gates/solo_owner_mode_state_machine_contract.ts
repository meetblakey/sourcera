/**
 * Gate: `solo_owner_mode_state_machine_contract`
 *
 * Assertion: the existing Buyer Workspace ownership-mode lifecycle remains
 * explicit, source-bound, sticky across plan changes, and firewalled.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "solo_owner_mode_state_machine_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "l-22-evaluation-owner-mode-state-machine"),
    "Appendix L.22 evaluation owner mode state machine",
    [
      "**Entity.** Buyer Workspace.`evaluation_owner_mode`.",
      "**Enum.** Appendix J `EvaluationOwnerMode`: `solo`, `team`.",
      "field never crosses the §1.3 / §7.2 firewall",
      "| `(create)` | `solo` | Workspace create |",
      "Buyer Free or Buyer Solo",
      "| `(create)` | `team` | Workspace create |",
      "Buyer Starter, Growth, Scale, or Enterprise",
      "| `solo` | `team` | Authorized Workspace Owner changes the Workspace Settings toggle |",
      "trigger_reason=manual_workspace_setting",
      "| `solo` | `team` | Second eligible non-guest membership acceptance |",
      "trigger_reason=automatic_team_threshold_reached",
      "| `team` | `solo` | Authorized Workspace Owner changes the Workspace Settings toggle |",
      "zero outstanding non-deleted invitations",
      "evaluation_owner_mode_team_to_solo_blocked_stakeholders_present",
      "| `solo` / `team` | same value | Upgrade or downgrade |",
      "No transition and no mode-change AuditEvent.",
      "including a `team` Workspace after a Solo or Free downgrade",
      "§2.8.3.1's no-webhook boundary.",
    ],
  );
  requireTokens(
    findings,
    doc,
    sectionTextByAnchor(doc, "2.8-single-operator-mode"),
    "§2.8 Single-Operator Mode",
    [
      "§13.11.4: Buyer Solo receives the full, unwatermarked view and full PDF export",
      "Buyer Solo Mode never reads from, writes to, or projects into the §22 Seller Knowledge Base",
      "Phase 14.9 (Solo Plan Tier — pricing & entitlement)",
    ],
  );
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 Single-Operator Mode residual closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
