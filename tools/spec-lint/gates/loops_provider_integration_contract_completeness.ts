/**
 * Gate: `loops_provider_integration_contract_completeness`
 *
 * Assertion: §41.1 defines the Loops.so provider integration contract and binds
 * auth/key rotation, template sync, webhooks, suppression sync, segmentation,
 * residency, outage behavior, Appendix G, and Appendix I.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens } from "./email_domain_gate_helpers.js";

function loopsFindings(doc: GateContext["masterSpec"]): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, "41.1-email-provider-and-loopsso-integration-contract", "§41.1 Email Provider and Loops.so Integration Contract", [
    "Sourcera sends transactional, lifecycle, operational-critical, and marketing email through Loops.so unless §42.6 marks `loops_degraded`",
    "| API auth and key rotation | Loops.so API keys live in the secret broker",
    "| Template sync | EmailTemplate rows (§4.9.1) are source-controlled, synced to Loops.so",
    "| Inbound provider webhook ingestion | Loops.so delivery events (`delivered`, `bounced`, `complained`, `opened`, `clicked`, `unsubscribed`, `suppressed`, `failed`) POST to Sourcera's provider-ingest endpoint with HMAC-SHA256 verification",
    "Appendix G `email_loops_webhook_ingested` / `email_loops_webhook_failed`",
    "| Suppression sync | SuppressionListEntry and UnsubscribePreference changes propagate to Loops.so before the next send attempt",
    "| Audience segmentation | Loops.so audiences are segmented by `org_id`, `console`, `data_residency_region`, and email category.",
    "| Data residency | EmailSend.`data_residency_region` is selected from the owning Org / Workspace.",
    "| Outage behavior | During `loops_degraded`, new EmailSend rows enter `deferred` until the provider recovers",
    "Appendix I",
  ]);
  requireTokens(findings, doc, "appendix-g-v72rem-phase-41-email-domain", "Appendix G Phase 41 Email Events", [
    "email_loops_webhook_ingested",
    "email_loops_webhook_failed",
    "email_send_queued",
    "email_send_bounced",
    "email_send_complained",
    "email_send_suppressed",
  ]);
  requireTokens(findings, doc, "appendix-i-api-error-code-catalog", "Appendix I Email Errors", [
    "email_provider_unavailable",
    "email_provider_webhook_signature_invalid",
    "email_provider_event_duplicate",
    "email_residency_transport_unavailable",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "loops_provider_integration_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...loopsFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "loops_provider_integration_contract_completeness")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
