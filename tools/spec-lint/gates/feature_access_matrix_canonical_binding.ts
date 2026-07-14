/**
 * Gate: `feature_access_matrix_canonical_binding`
 *
 * Assertion: §5.11 display labels, Defense View roles, Disqualification
 * references, and the Marketplace Solo summary retain one binding contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "feature_access_matrix_canonical_binding";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "5.4-guest-role-and-permission-profiles-(gap-s-2)"), "§5.4 Defense View role binding", [
    "the non-Guest `defense_view_generate` role gate is `org_owner` only",
    "canonical §5.11 **Regenerate Defense View** row",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "5.11-feature-access-matrix-(comprehensive)"), "§5.11 header binding", [
    "**Header binding.**",
    "Org Owner → `org_owner`",
    "Workspace Owner → `workspace_owner`",
    "display labels do not define a competing RBAC vocabulary",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "13.11.11-plan-gating-feature-access-and-object-size"), "§13.11 Defense View access binding", [
    "§5.11 **Open Defense View** row",
    "§5.11 **Regenerate Defense View** row",
    "§5.11 is the canonical role grid.",
  ]);
  const disqualification = sectionTextByAnchor(doc, "25.3-disqualification-(gap-25.2)");
  requireTokens(findings, doc, disqualification, "§25.3 Disqualification matrix binding", [
    "**Vendor Curation & Disqualification (§25.3)**",
    "Buyer-plan availability is authoritative in §34.1.1",
  ]);
  if (disqualification?.text.includes("Core Workflows — All Tiers")) {
    const row = findLine(doc, (line) => line.includes("Core Workflows — All Tiers"));
    if (row) push(findings, doc, row.line, row.text.trim(), "§25.3 must not cite the retired Core Workflows — All Tiers label; cite the §5.11 Vendor Curation & Disqualification group.");
  }
  requireTokens(findings, doc, sectionTextByAnchor(doc, "27.2-availability"), "§27.2 Solo availability", [
    "| Solo | Browse only (per §34.1.1) |",
    "Verified eligibility (per §34.1.2 Published Seller Profile and Verification Tier Cap)",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 3.2 feature-access matrix closure",
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
