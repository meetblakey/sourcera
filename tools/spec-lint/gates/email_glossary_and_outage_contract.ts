/**
 * Gate: `email_glossary_and_outage_contract`
 *
 * Assertion: §41 provider outage behavior and the Appendix K email vocabulary
 * retain their cross-section contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "email_glossary_and_outage_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "41.1-email-provider-and-loopsso-integration-contract"), "§41.1 outage execution", [
    "**Outage execution.**",
    "`loops_degraded` preserves the EmailSend row",
    "§4.9.2 `deferred → queued` transition",
    "Appendix F owns retry and DLQ handling.",
    "email_provider_unavailable",
    "same `idempotency_key`, suppression checks, residency route, and audit trail",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-k-glossary"), "Appendix K email vocabulary", [
    "**Email Deliverability.**",
    "**Sender Domain.**",
    "**From Alignment.**",
    "**Transactional-Critical Email.**",
    "**Lifecycle Email.**",
    "**Bounce Rate.**",
    "**Complaint Rate.**",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Email glossary and outage closure",
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
