/** Gate: `ui_preference_resilience_contract`. */
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "ui_preference_resilience_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.2\.15 UserUIPreference/), "§4.2.15 UserUIPreference", ["`breakpoint_observation_metadata_by_console_json`", "`client_observed_at` and a UUID `idempotency_key`", "Class 4 Pattern A rule is canonical"]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "38.6.3-breakpoint-aware-entity-fields"), "§38.6.3 UserUIPreference mirror", ["`created_by` | UUID (FK → User or system actor)", "`updated_by` | UUID (FK → User or system actor)", "There is deliberately no stored `console` field", "±5-minute server-receipt skew window", "On membership, entitlement, or plan change that removes access to a console"]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^40\.2 Data Retention & Deletion/), "§40.2 UserUIPreference retention", ["| UserUIPreference (§4.2.15) |", "entire Class 4 Pattern A row hard-deletes"]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-responsive-mobile-surface-errors"), "Appendix I responsive errors", ["`ui_preference_breakpoint_observation_stale`", "`ui_preference_breakpoint_observation_clock_skew`"]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = { id: GATE_ID, sourcePhase: "v7.1.1 UserUIPreference resilience closure", rowClass: "spec_tree_lint", executionContext: "pr_lint", overridePath: "not_permitted_console_firewall", inputs: { masterSpec: true }, version: "1.0.0", run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); } };
if (isEntrypoint(import.meta.url)) void runGateCli(gate);
