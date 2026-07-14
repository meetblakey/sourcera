/**
 * Gate: `protected_asset_purge_guard`
 *
 * Assertion: customer-initiated purge of Class-1 protected downgraded assets
 * fails with `protected_asset_purge_forbidden`; legal / DSAR purge remains the
 * only purge path.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "protected_asset_purge_guard";

const CUSTOMER_ACTION_TOKENS = [
  "| **Hard-delete preserved entity** | Customer can choose to permanently delete a non-Class-1 preserved entity inside the bucket; this is irreversible and audit-logged with `org.preserved_entity_purged`. Class-1 protected assets reject customer-initiated purge with HTTP 422 `protected_asset_purge_forbidden`; legal / DSAR purge paths remain governed by §6.8 / §40.2 and require Ops + Legal audit evidence, not customer acknowledgement. |",
] as const;

const PURGE_TOKENS = [
  "Protected-asset downgrade firewall MUST block Class-1 protected assets from entering the standard `status=archived` terminal in a DowngradeExcessDataBucket; deploy-time validator asserts they enter `status=archived_class_1_protected` with §34.6.3.A retention metadata, and that customer-initiated purge returns `protected_asset_purge_forbidden`.",
  "The protected-asset downgrade firewall MUST reject any Class-1 protected asset bucket whose §4.8.10 `status` enters the standard `archived` state instead of `archived_class_1_protected`; deploy-time validator asserts `archive_retention_horizon_years`, `self_service_restore_until`, and the `protected_asset_purge_forbidden` customer-purge rejection path.",
  "| `protected_asset_purge_forbidden` | 422 | §32.8 billing endpoint family | §34.6.2 customer attempted to hard-delete a Class-1 protected asset inside a DowngradeExcessDataBucket; legal / DSAR purge paths must use §6.8 / §40.2 Ops + Legal audit workflow instead. | `error.billing.protected_asset_purge_forbidden` |",
  "Customer self-serve purge is rejected with `protected_asset_purge_forbidden`; legal / DSAR purge follows §6.8 / §40.2.",
] as const;

const M5_ROW_TOKENS = [
  "cross_feature_invariant",
  "**`runtime_active`**",
  "tools/spec-lint/gates/protected_asset_purge_guard.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "spec-tree §34.6.2 / §34.19.7 / §34.20.16 / Appendix I purge-forbidden contract only",
  "product billing endpoint implementation, customer action handler, legal / DSAR purge workflow, and deploy validators remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 34.19",
  rowClass: "cross_feature_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "§34.6.2 Customer Actions During the 90-Day Window", CUSTOMER_ACTION_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "Protected-asset purge guard contract", PURGE_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
