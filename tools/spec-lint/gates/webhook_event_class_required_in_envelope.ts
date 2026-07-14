/**
 * Gate: `webhook_event_class_required_in_envelope`
 *
 * Assertion: event_class is a required root envelope/header field and resolves
 * to Appendix J `webhook_event_class` for all webhook families.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireDocumentTokens, requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_event_class_required_in_envelope",
  sourcePhase: "v7.2.0-REM Webhook Foundation P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireSectionTokens(doc, "31.2 Webhook Payload Structure", [
        "event_class",
        "Appendix J `webhook_event_class`; required",
      ], "§31.2 root webhook envelope must require event_class"),
      ...requireSectionTokens(doc, "31.5 Webhook Configuration", [
        "X-Sourcera-Event-Class",
        "Required for class-level filters across every domain",
      ], "§31.5 standard webhook headers must carry event_class"),
      ...requireSectionTokens(doc, "31.8.2 Common Billing-Webhook Payload Envelope", [
        "event_class",
        "value `billing_domain`",
        "not create billing-only overrides",
      ], "Billing webhooks must use the shared event_class contract"),
      ...requireDocumentTokens(doc, [
        "webhook_event_class",
        "product_domain",
        "billing_domain",
      ], "Appendix J must register webhook_event_class values"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
