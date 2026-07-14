/**
 * Gate: `email_spf_dkim_dmarc_citations_resolve`
 *
 * Assertion: §41.3.1 and §48.4.2 are the paired deliverability and operational
 * homes for SPF, DKIM, DMARC, and sender-domain reputation.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionText } from "./email_domain_gate_helpers.js";

function citationFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, "41.3.1-spf-dkim-and-dmarc-posture", "§41.3.1 SPF, DKIM, and DMARC Posture", [
    "§48.4.2 is the operational home for DMARC/SPF reputation enforcement.",
    "SPF validation",
    "DKIM signing",
    "DMARC alignment scan",
    "Inbound citations that say \"SPF/DKIM/DMARC per §41\" resolve to this subsection",
  ]);
  requireTokens(findings, doc, "48.4.2-dmarc-spf-reputation", "§48.4.2 DMARC/SPF Reputation", [
    "§41.3 Email Compliance",
    "Nightly DMARC alignment scan",
    "SPF record validation",
    "DKIM signing",
    "email_dkim_signing_failed",
  ]);
  requireTokens(findings, doc, "41.1-email-provider-and-loopsso-integration-contract", "§41.1 Email Provider", [
    "| SPF / DKIM / DMARC reputation | §48.4.2 | §41.3.1 is the email-domain compliance landing section for inbound citations. |",
  ]);

  const canonicalSection = sectionText(doc, "41.3.1-spf-dkim-and-dmarc-posture");
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    const inCanonicalSection = canonicalSection && line >= canonicalSection.startLine && line <= canonicalSection.endLine;
    if (!inCanonicalSection && text.includes("SPF/DKIM/DMARC per §41") && !text.includes("§41.3.1")) {
      push(findings, doc, line, text.trim(), "Stale SPF/DKIM/DMARC citation must resolve to §41.3.1.");
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "email_spf_dkim_dmarc_citations_resolve",
  sourcePhase: "v7.2.0-REM Phase 41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...citationFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "email_spf_dkim_dmarc_citations_resolve")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
