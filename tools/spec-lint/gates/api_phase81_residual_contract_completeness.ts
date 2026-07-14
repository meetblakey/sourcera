/**
 * Gate: `api_phase81_residual_contract_completeness`
 * Source defects: D-V8.1-007, D-V8.1-017, D-V8.1-019,
 * D-V8.1-027 through D-V8.1-032.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "MCPSessionTokenRecord mint and revoke are internal-only security operations",
  "not exposed through the §32 public v1 API",
  "`Retry-After` is the canonical retry-delay header on every HTTP 429 response",
  "`X-RateLimit-RetryAfter` is a compatibility augmentation",
  "| `buyer_free` | No general API entitlement",
  "| `buyer_solo` | No general API entitlement",
  "| `business_starter` | 10,000 when the §34.1.1 API Add-On is active | 3,000 |",
  "| `seller_scale` | 250,000 read-only calls | Not available |",
  "| `seller_enterprise` | Unlimited read/write calls | Not available |",
  "### 32.6.3 HTTP Status Conventions {#32.6.3-http-status-conventions}",
  "| 207 Multi-Status |",
  "| 304 Not Modified |",
  "| 410 Gone |",
  "| 423 Locked |",
  "`vendor_disqualification_reversal_cascade_action`",
  "1. Every public §32 endpoint MUST have a §32.5 catalog row",
  "`stripe_unavailable` | Stripe times out, is unavailable, or returns a retryable 5xx",
  "`billing.ledger.export_failed`",
  "`billing.plan.change_request_expired`",
  "`plan_change_ops_signoff_timeout_expired`",
  "`status` is one of `queued`, `running`, `paused`, `ready`, `failed`, or `expired`",
  "A `workspace_id` outside the token's authorized console scope returns HTTP 404 `billing_ledger_workspace_not_found`",
  "| API rate limit class `standard_authenticated_per_org` |",
  "| API rate limit class `public_pricing_unauth` |",
  "#### M.5.84 v7.1.1 Phase 8.1 API Residual Contract and Runtime Evidence additions",
  "`api_phase81_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**",
  "`api_multistatus_schema_registration` | openapi_schema_runtime_consistency | **`spec_binding_pending_pack_m02_3`**",
  "`api_standard_retry_after_runtime_consistency` | api_middleware_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`billing_async_failure_state_runtime_consistency` | billing_runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`api_rate_limit_plan_quota_runtime_consistency` | entitlement_runtime_consistency | **`spec_binding_pending_pack_m24_3`**",
];

const FORBIDDEN = [
  "| Free | 1,000 | Wallet-charged via §34.3.4",
  "| Starter | 10,000 | 3,000 |",
  "| Growth | 50,000 | 10,000 |",
  "| Scale | 250,000 | Unlimited (subject to wallet) |",
  "| Enterprise | Unlimited | Committed (per §34.1.1) |",
  "- All endpoints documented with curl examples in API reference.",
  "- API test coverage ≥ 95%.",
  "(5,000/h soft, 10,000/h hard, 100/min burst)",
  "Per source IP: 600/h soft, 1,200/h hard, 60/min burst",
  "§32.4.5; 60/min burst",
  ">3 top-ups/hour per Org",
  ">10/h per Org",
  "more than 3 manual wallet top-ups/hour",
  "more than 10 plan-change requests/hour",
];

export const gate: SpecLintGate = {
  id: "api_phase81_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 8.1 API residual P2 closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const token of REQUIRED) {
      if (!doc.text.includes(token)) {
        findings.push({ file: doc.path, line: 1, matched_text: token, message: "Required Phase 8.1 residual API contract is missing." });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({ file: doc.path, line: lineForToken(doc, token), matched_text: token, message: "Stale or ambiguous Phase 8.1 API wording remains active." });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
