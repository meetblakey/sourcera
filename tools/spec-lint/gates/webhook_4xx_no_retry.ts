/**
 * Gate: `webhook_4xx_no_retry`
 *
 * Assertion: consumer 4xx responses are terminal and do not consume the
 * webhook retry budget across §31 and Appendix F.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireSectionTokens } from "./webhook_foundation_helpers.js";

export const gate: SpecLintGate = {
  id: "webhook_4xx_no_retry",
  sourcePhase: "v7.2.0-REM Webhook Foundation P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_retry_class_binding",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...requireSectionTokens(doc, "31.6 Webhook Consumer Requirements", [
        "4xx",
        "Terminal failure for this delivery; no automatic retry",
        "do NOT consume the 5-attempt retry budget",
      ], "§31.6 must make consumer 4xx terminal"),
      ...requireSectionTokens(doc, "31.7 Acceptance Criteria", [
        "Consumer 4xx responses never trigger automatic retry",
        "5xx and timeouts retry per Appendix F",
      ], "§31.7 must bind the 4xx no-retry rule"),
      ...requireSectionTokens(doc, "F.1 Standard Retry Curve", [
        "HTTP 4xx is terminal and does not consume the retry budget",
        "If payload invalid (malformed), return 4xx (will NOT retry).",
      ], "Appendix F.1 must bind 4xx terminal behavior"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

