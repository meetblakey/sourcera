/**
 * Gate: `webhook_secret_rotation_contract`
 *
 * Assertion: §31.10 defines a uniform Org-scoped secret rotation contract and
 * registers its customer notification, analytics mirror, and errors.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_secret_rotation_contract",
  sourcePhase: "v7.2.0-REM Webhook Foundation P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireSectionTokens(doc, "31.10 Webhook Secret Rotation", [
        "Rotation applies uniformly to every webhook event class",
        "Exactly one active secret version signs new deliveries for an Org.",
        "At most one previous version remains valid during the 30-day overlap window after rotation.",
        "X-Sourcera-Webhook-Secret-Version",
        "POST /v1/orgs/{org_id}/webhook-secret/rotate",
        "Idempotency-Key` REQUIRED",
        "webhook_idempotency_key_replayed",
        "seller_integrations_admin",
        "webhook.secret_rotated",
        "webhook_secret_rotated",
      ], "§31.10 must define the rotation contract"),
      ...requireSectionTokens(doc, "Webhook-Administration Events", [
        "webhook.secret_rotated",
        "retry class `standard`",
        "plaintext secret never included",
      ], "Appendix C must register webhook secret rotation"),
      ...requireSectionTokens(doc, "v7.2.0-REM Webhook Foundation P1 Additions", [
        "webhook_secret_rotated",
        "no secret material",
      ], "Appendix G must register webhook secret rotation mirror"),
      ...requireSectionTokens(doc, "Webhook Delivery Integrity Codes", [
        "webhook_secret_rotation_role_forbidden",
        "webhook_secret_rotation_rate_limited",
        "webhook_secret_rotation_in_progress",
        "webhook_idempotency_key_replayed",
        "seller_integrations_admin",
      ], "Appendix I must register webhook secret rotation errors"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

