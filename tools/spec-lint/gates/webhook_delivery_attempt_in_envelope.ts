/**
 * Gate: `webhook_delivery_attempt_in_envelope`
 *
 * Assertion: delivery_attempt is a required root webhook field, mirrored by the
 * standard delivery header, and domain catalogs inherit rather than redefine it.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_delivery_attempt_in_envelope",
  sourcePhase: "v7.2.0-REM Webhook Delivery Attempt P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireSectionTokens(doc, "31.2 Webhook Payload Structure", [
        "delivery_attempt",
        "Integer | 1–5",
        "Mirrors Appendix F attempt count",
      ], "§31.2 root webhook envelope must carry delivery_attempt"),
      ...requireSectionTokens(doc, "31.5 Webhook Configuration", [
        "X-Sourcera-Delivery-Attempt",
        "delivery_attempt",
        "Integer 1–5",
      ], "§31.5 standard webhook headers must mirror delivery_attempt"),
      ...requireSectionTokens(doc, "31.7 Acceptance Criteria", [
        "delivery_attempt",
        "corresponding standard headers in §31.5",
      ], "§31.7 acceptance criteria must bind delivery_attempt"),
      ...requireSectionTokens(doc, "31.8.2 Common Billing-Webhook Payload Envelope", [
        "delivery_attempt",
        "do not create billing-only overrides",
        "Per Appendix F retry curve; populated to aid consumer dedupe + observability",
      ], "Billing webhooks must inherit root delivery_attempt semantics"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

