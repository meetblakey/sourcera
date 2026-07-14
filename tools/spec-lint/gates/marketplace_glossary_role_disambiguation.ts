/**
 * Gate: `marketplace_glossary_role_disambiguation`
 *
 * Assertion: Appendix K keeps the Marketplace vocabulary and the similarly
 * named Seller/Ops Marketing Editor roles source-bound and unambiguous.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "marketplace_glossary_role_disambiguation";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-k-phase-6-2-marketplace-glossary"), "Appendix K Phase 6.2 Marketplace glossary", [
    "**Marketplace Match Score.**",
    "**Hide Sponsored.**",
    "**Verification Badge.**",
    "**Vendor Opt-Out Authority Attestation.**",
    "**Marketplace Abuse Evidence Bundle.**",
    "**Legal-Process Ingest.**",
    "**Marketplace Transparency Report.**",
    "**Hot-Registry Index.**",
    "**FTC Disclosure.**",
    "**Featured Lane.**",
    "**Distinctiveness Veto (legacy narrative label).**",
    "It is not a persisted enum, API value, webhook value, or replacement for Appendix J's canonical aggregation reason `distinctiveness_exceeds_threshold`",
    "**Coordinated Abuse.**",
    "**Cost-Center Firewall.**",
    "**Ops Marketing Editor** (`ops_marketing_editor`).",
    "**Marketing Editor Role Disambiguation.**",
    "does not create a shared permission, Console Bridge projection, audit identity, or cross-console grant.",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Marketplace glossary and role disambiguation closure",
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
