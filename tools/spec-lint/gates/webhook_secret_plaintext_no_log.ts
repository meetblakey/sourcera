/**
 * Gate: `webhook_secret_plaintext_no_log`
 *
 * Assertion: plaintext webhook secret material is one-time response only and
 * forbidden from logs, events, analytics, DLQ, support exports, and notifications.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_secret_plaintext_no_log",
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
        "new plaintext secret is returned exactly once",
        "never persisted in plaintext",
        "secret material is excluded from logs, AuditEvent metadata, PostHog, and webhooks",
        "The plaintext secret is never included.",
        "Plaintext secret material MUST be returned exactly once and MUST NOT appear in AuditEvent, PostHog, webhook payloads, logs, DLQ rows, or support exports",
        "MUST NOT display secret material after the one-time reveal",
      ], "§31.10 must forbid plaintext secret exposure"),
      ...requireSectionTokens(doc, "Webhook-Administration Events", [
        "Secret material is never included in the event body, notification body, PostHog mirror, AuditEvent metadata, logs, DLQ rows, or support exports.",
        "plaintext secret never included",
      ], "Appendix C must forbid plaintext secret exposure"),
      ...requireSectionTokens(doc, "v7.2.0-REM Webhook Foundation P1 Additions", [
        "webhook_secret_rotated",
        "no secret material",
      ], "Appendix G must forbid plaintext secret exposure"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

