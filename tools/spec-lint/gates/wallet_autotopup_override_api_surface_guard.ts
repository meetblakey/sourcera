/**
 * Gate: `wallet_autotopup_override_api_surface_guard`
 *
 * Assertion: the customer auto-topup API cannot expose the Enterprise Ops
 * monthly-ceiling override path, and Appendix I registers both required errors.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "wallet_autotopup_override_api_surface_guard";

const API_TOKENS = [
  "### 32.8.4 POST /v1/orgs/{org_id}/wallet/auto-topup",
  "`max_monthly_value_dollars_cents`",
  "This customer endpoint rejects values above the self-serve ceiling",
  "Enterprise Ops override values above that ceiling must use §4.8.3.B / §50.23 and cannot be supplied by customer API tokens",
  "| 422 | `wallet_autotopup_max_monthly_out_of_range` (new; Appendix I) | Max monthly outside the caller's allowed §4.8.3 / §4.8.3.B bounds |",
  "| 403 | `wallet_autotopup_ops_override_forbidden` (new; Appendix I) | Caller attempts an Enterprise Ops override without §4.8.3.B eligibility or authority |",
  "Customer-facing writes MUST NOT set §4.8.3.B override audit fields",
] as const;

const OPS_TOKENS = [
  "The customer-facing auto-topup configuration surface is capped at the self-serve ceiling",
  "customer `org_owner` / `billing_admin` tokens cannot set values above the self-serve ceiling",
  "Writes above this maximum return `wallet_autotopup_max_monthly_out_of_range`",
  "Non-Enterprise target returns `wallet_autotopup_ops_override_forbidden`",
  "Customer-facing API writes MUST reject `auto_topup_max_monthly_value_dollars` values above the self-serve ceiling",
] as const;

const APPENDIX_I_TOKENS = [
  "| `wallet_autotopup_max_monthly_out_of_range` | 422 | `POST /v1/orgs/{org_id}/wallet/auto-topup` or §50.23 Ops override with monthly auto-topup cap outside the caller's allowed §4.8.3 / §4.8.3.B bounds | `permanent` | Customer endpoint returns the self-serve bound source. Ops override returns the Enterprise absolute bound source and rejected value. | `error.billing.wallet_autotopup_max_monthly_out_of_range` |",
  "| `wallet_autotopup_ops_override_forbidden` | 403 | §50.23 monthly auto-topup ceiling override attempted for non-Enterprise target, non-Ops caller, missing approval chain, or missing override reason | `permanent` | Per §4.8.3.B. Body returns the missing predicate without exposing customer financial internals. | `error.billing.wallet_autotopup_ops_override_forbidden` |",
] as const;

const M5_TOKENS = [
  "spec-tree §32.8.4 / §4.8.3.B / Appendix I guard only",
  "product request validators, Ops approval workflow, wallet mutation handlers, Stripe scheduler behavior, deploy validators, and runtime API tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase DEC",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.8.4-post-wallet-auto-topup"), "§32.8.4 wallet auto-topup API", API_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "4.8.3.b-ops-finance-monthly-auto-topup-ceiling-override"), "§4.8.3.B Ops override", OPS_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-pre-existing-billing-codes"), "Appendix I Pre-existing Billing Domain Codes", APPENDIX_I_TOKENS);

    const m5Row = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
    if (m5Row) {
      for (const token of M5_TOKENS) {
        if (!m5Row.text.includes(token)) push(findings, doc, m5Row.line, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
