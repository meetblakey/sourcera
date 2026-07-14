/**
 * Gate: `protected_asset_archive_state_canonical`
 *
 * Assertion: Class-1 protected downgrade buckets use the canonical
 * `archived_class_1_protected` terminal with retention metadata, never the
 * standard `archived` terminal.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "protected_asset_archive_state_canonical";

const BUCKET_TOKENS = [
  "| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored` | |",
  "| `archive_retention_horizon_years` | Integer | Nullable until archive; standard bucket = 7; Class-1 protected bucket = 10 | Retention metadata asserted by `protected_asset_downgrade_firewall`; values are sourced from §34.6.3 / §34.6.3.A |",
  "| `self_service_restore_until` | Timestamp | Nullable | Populated only for `status=archived_class_1_protected`; computed from §34.6.3.A customer-initiated restoration window |",
  "| `archive_pending` | `archived_class_1_protected` | Cron archives Class-1 protected assets to cold storage | `data_class=kb_entries_over_cap`; `archive_storage_ref` set; `archive_retention_horizon_years=10`; `self_service_restore_until` set per §34.6.3.A | Class-1 carve-out; NOT the standard `archived` terminal |",
  "| `archived_class_1_protected` | `restored` | Customer requests self-service restore OR Ops-assisted restore inside the §34.6.3.A window | Cold-storage rehydration; SLA: 24 hours; `restored_at` stamped; class-retention metadata retained for audit | Customer-initiated restoration remains available until `self_service_restore_until` |",
] as const;

const CARVE_OUT_TOKENS = [
  "| Cold-storage retention | 7 years (§4.8.10 AC #5) | 10 years |",
  "| Customer-initiated restoration window | 0 days post-archive (Ops-assisted only) | 5 years post-archive (self-service via Settings → Billing → \"Restore preserved data\") |",
  "| `status` | `archived` (§4.8.10 enum value) | `archived_class_1_protected` (Phase 7 V7 D-V7-009 — value added to §4.8.10 `status` enum + Appendix J `downgrade_excess_bucket_status`) |",
  "The `protected_asset_downgrade_firewall` deploy-time validator (§34.20.16 AC #80) is updated to assert that Class-1 assets enter `status=archived_class_1_protected` (NOT `status=archived`) and that the cold-storage retention metadata (`archive_retention_horizon_years`) is set to 10 (NOT 7).",
] as const;

const CROSS_SECTION_TOKENS = [
  "Deploy-time validator `protected_asset_downgrade_firewall` asserts that every Class-1 asset in any DowngradeExcessDataBucket carries `status=archived_class_1_protected` (not `status=archived`) AND `archive_retention_horizon_years=10` (not 7).",
  "State-machine authority lives in §4.8.10. `archived_class_1_protected` is the Class-1 Protected-Asset Carve-Out terminal for protected KB-entry buckets at `preservation_until`; it is distinct from the standard `archived` state and carries `archive_retention_horizon_years` plus `self_service_restore_until` metadata per §34.6.3.A.",
] as const;

const M5_ROW_TOKENS = [
  "cross_feature_invariant",
  "**`runtime_active`**",
  "tools/spec-lint/gates/protected_asset_archive_state_canonical.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "spec-tree §4.8.10 / §34.6.3.A / §34.19 / Appendix J archive-state contract only",
  "product archive cron, cold-storage writes, restore execution, and deploy validators remain product-pack evidence",
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
    requireDocTokens(findings, ctx.masterSpec, "§4.8.10 DowngradeExcessDataBucket", BUCKET_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "§34.6.3.A Class-1 Protected-Asset Carve-Out", CARVE_OUT_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "Protected-asset archive cross-section contract", CROSS_SECTION_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
