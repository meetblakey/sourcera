/**
 * Gate: `webhook_event_id_canonical_format`
 *
 * Assertion: §31.1 is the sole canonical home for webhook event_id format and
 * active transport summaries either cite it or use the exact canonical token.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_event_id_canonical_format",
  sourcePhase: "v7.2.0-REM Webhook Event ID Canonical Format P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireSectionTokens(doc, "31.1 Webhook Event Types", [
        "evt_{unix_ms}_{base32_random10}",
        "sole canonical webhook event identifier format",
        "not UUID / UUIDv7",
      ], "§31.1 must own the canonical webhook event_id format"),
      ...requireSectionTokens(doc, "31.2 Webhook Payload Structure", [
        "event_id",
        "MUST match §31.1 canonical format `evt_{unix_ms}_{base32_random10}`",
      ], "§31.2 must cite the §31.1 event_id format"),
      ...requireSectionTokens(doc, "31.5 Webhook Configuration", [
        "event_id",
        "§31.1 canonical string format",
        "evt_{unix_ms}_{base32_random10}",
      ], "§31.5 must cite the §31.1 event_id format"),
      ...requireSectionTokens(doc, "31.8.2 Common Billing-Webhook Payload Envelope", [
        "event_id",
        "`evt_{unix_ms}_{base32_random10}`; immutable across retries",
        "Per §31.1; persists across all 5 retry attempts",
      ], "Billing webhooks must inherit the §31.1 event_id format"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
