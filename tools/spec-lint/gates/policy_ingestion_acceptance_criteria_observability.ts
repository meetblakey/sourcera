/**
 * Gate: `policy_ingestion_acceptance_criteria_observability`
 *
 * Assertion: §12.9 keeps observable, scope-bound acceptance criteria for the
 * complete Policy Ingestion workflow without creating an unsupported latency
 * target or dropping the existing safety, mobile, outage, and billing paths.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "policy_ingestion_acceptance_criteria_observability";

const REQUIRED_TOKENS = [
  "Given an authorized Buyer caller and an `upload_ref`",
  "p95 budget (≤ 30 seconds)",
  "`resume_token_hash`",
  "HTTP 409 `policy_extraction_partial_resume_required`",
  "`policy_ingestion_dedup_failed` after the §44.1 retry budget",
  "Use Case Lead → Workspace Admin → Workspace Owner → Org Owner",
  "`Workspace.evaluation_owner_mode='solo'`",
  "`source='policy_ingestion'`",
  "at most one customer-chargeable `policy_parsing` parent AIOperation",
  "Seller-console, Marketplace, public, cross-Org, or cross-Workspace",
  "Retention, DSAR, residency, logs, backups, and provider-processing behavior MUST match §40.2, §6.8, §42.4.2, and §42.6.1.B.",
  "§32.10.3.C endpoints MUST provide auth scope, RBAC, rate-limit class, request/response schema, error codes, idempotency, pagination where applicable, and examples",
  "credential, seller data, or cross-console data",
  "Webhook redelivery remains Appendix F.1 / §31",
  "`provider_kind='voyage_ai'`",
  "Given Convex, Stripe, or Loops.so degradation",
] as const;

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "12.9-acceptance-criteria");
  requireTokens(findings, doc, section, "§12.9 observable acceptance criteria", REQUIRED_TOKENS);
  if (!section) return findings;

  const criteria = section.text.match(/^\d+\. Given /gm) ?? [];
  if (criteria.length < 15) {
    push(
      findings,
      doc,
      section.startLine,
      "Given/when/then acceptance criteria",
      "§12.9 must retain at least 15 observable Given/when/then acceptance criteria across the Policy Ingestion workflow.",
    );
  }
  if (section.text.includes("5-second framework-detection latency")) {
    push(
      findings,
      doc,
      section.startLine,
      "5-second framework-detection latency",
      "§12.9 must cite the canonical §44.1 framework-detection budget rather than introduce a conflicting five-second target.",
    );
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 4.3 Policy acceptance-criteria closure",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...findingsFor(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, GATE_ID)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
