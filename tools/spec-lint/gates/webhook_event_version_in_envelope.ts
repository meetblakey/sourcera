/**
 * Gate: `webhook_event_version_in_envelope`
 *
 * Assertion: every webhook root envelope declares event/schema version fields
 * and standard delivery headers.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_event_version_in_envelope",
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
        "event_version",
        "schema_version",
      ], "§31.2 root webhook envelope must carry version fields"),
      ...requireSectionTokens(doc, "31.5 Webhook Configuration", [
        "X-Sourcera-Event-Version",
        "X-Sourcera-Schema-Version",
      ], "§31.5 standard webhook headers must carry version fields"),
      ...requireSectionTokens(doc, "31.7 Acceptance Criteria", [
        "event_version",
        "schema_version",
        "standard headers",
      ], "§31.7 acceptance criteria must bind version fields"),
      ...requireSectionTokens(doc, "31.8.2 Common Billing-Webhook Payload Envelope", [
        "event_version",
        "schema_version",
        "do not create billing-only overrides",
      ], "Billing webhooks must inherit the root envelope version contract"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
