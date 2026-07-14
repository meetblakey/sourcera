/**
 * Gate: `integration_export_contract_completeness`
 *
 * Assertion: Phase 13 Integration Export remains buildable from the spec tree:
 * entities, API routes, plan/RBAC, retention, events, errors, enums, glossary,
 * state machine, and Appendix M surface mapping all resolve.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "integration_export_contract_completeness";

const SECTION_31_TOKENS = [
  "Phase-13 Integration Export is a Buyer-console-only workflow.",
  "Configuration authority is §5.11 row **Configure Phase 13 Integration Export Mapping**",
  "Run authority is §5.11 row **Run Phase 13 Integration Export**",
  "Seller-console, Marketplace, guest, and cross-Workspace sessions return non-leaking HTTP 404.",
  "`IntegrationExportConfiguration` | Org-default or Workspace-level target mapping, target credential pointer, and target field mapping | §4.3.38 |",
  "`IntegrationExportRun` | One async export attempt against a closed Workspace and selected target configuration | §4.3.39 |",
  "The target provider MUST NOT receive Sourcera internal scores, scoring rationale, Internal Comment bodies, draft Selection Report text, non-winning vendors, or Marketplace Match Score internals.",
  "| `integration.export.canceled` | `IntegrationExportRun.queued/running -> canceled` |",
  "PostHog mirrors are registered in Appendix G as `integration_export_initiated`, `integration_export_completed`, `integration_export_failed`, and `integration_export_canceled`.",
  "Plan downgrades below §34.1.1 cell **Phase 13 Standard Integration Export** MUST preserve existing configuration rows in read-only / reconnect-disabled mode",
] as const;

const CONFIG_ENTITY_TOKENS = [
  "| `target_system` | Enum (Appendix J `integration_export_target_system`) | Required |",
  "| `status` | Enum (Appendix J `integration_export_configuration_status`) | Required |",
  "| `credential_ciphertext_ref` | String | Required when `status != deleted`; internal vault reference only |",
  "**Scope isolation.** Buyer-console and Org-scoped, with optional Workspace override.",
  "**Required indexes.** `(org_id, target_system, workspace_id, deleted_at) UNIQUE WHERE deleted_at IS NULL`",
  "**Retention, DSAR, and residency.** Retention is §40.2 row **IntegrationExportConfiguration / IntegrationExportRun**.",
] as const;

const RUN_ENTITY_TOKENS = [
  "| `status` | Enum (Appendix J `integration_export_run_status`) | Required |",
  "| `failure_code` | Enum (Appendix J `integration_export_failure_code`) | Nullable |",
  "| `cancel_reason` | Enum (Appendix J `integration_export_cancel_reason`) | Nullable | Required when `status='canceled'`",
  "| (init) | `queued` | Export request accepted | Workspace is Phase 13 / `closed`; configuration active; plan and RBAC checks pass | Emits Appendix G `integration_export_initiated` |",
  "| `running` | `completed` | All target writes succeed | Target refs stored; counts reconciled | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |",
  "| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item summary stored without bodies | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true` |",
  "| `queued` / `running` | `canceled` | Workspace reopened, deleted, DSAR hold invalidates source rows, or user cancels before first provider write | No target refs persisted; accepted target record forces `partial_failure` instead | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled` |",
  "Every terminal run MUST emit exactly one Appendix C terminal event and exactly one Appendix G terminal mirror.",
] as const;

const API_TOKENS = [
  "| POST | `/v1/workspaces/{workspace_id}/exports` | `write:workspaces` | §5.11 Run Phase 13 Integration Export row; §34.1.1 cell **Phase 13 Standard Integration Export**; Workspace Phase 13 / closed | `data_mutation` | REQUIRED |",
  "| GET | `/v1/workspaces/{workspace_id}/exports/{export_id}` | `read:workspaces` | Requester, Workspace Owner/Admin, or current §5.11 run-authorized Workspace role | `workspace_read` | N/A |",
  "`target_system` MUST be one of Appendix J `integration_export_target_system`.",
  "`cancel_reason`",
  "| Export create | Creates `IntegrationExportRun`, writes AuditEvent `integration_export.requested`, emits Appendix G `integration_export_initiated`, dispatches the worker after transaction commit |",
  "| 403 | `integration_export_plan_required` | Current Buyer plan lacks §34.1.1 cell **Phase 13 Standard Integration Export** |",
  "| 409 | `integration_export_workspace_not_closed` | Workspace is not Phase 13 / `closed` or lacks a finalized SelectionRecord |",
  "| 207 | `integration_export_partial_failure` | Poll response for a terminal partial-failure run; response carries safe per-item summaries |",
] as const;

const GLOBAL_TOKENS = [
  "| Configure Phase 13 Integration Export Mapping (§31.3; §4.3.38; §34.1.1 cell **Phase 13 Standard Integration Export**) |",
  "| Run Phase 13 Integration Export (§31.3; §4.3.39; §32.10.3.F; §34.1.1 cell **Phase 13 Standard Integration Export**) |",
  "| **Phase 13 Standard Integration Export** |",
  "| IntegrationExportConfiguration / IntegrationExportRun (§4.3.38 / §4.3.39 / §31.3) |",
  "| `integration.export.completed` | IntegrationExportRun `running -> completed` (§4.3.39) |",
  "| `integration.export.failed` | IntegrationExportRun `running -> failed` or `running -> partial_failure` (§4.3.39) |",
  "| `integration.export.canceled` | IntegrationExportRun `queued/running -> canceled` (§4.3.39) |",
  "| `integration_export_completed` | Mirror of Appendix C `integration.export.completed` |",
  "| `integration_export_failed` | Mirror of Appendix C `integration.export.failed` |",
  "| `integration_export_canceled` | Mirror of Appendix C `integration.export.canceled` |",
  "| `integration_export_plan_required` | 403 | §31.3 / §32.10.3.F export create |",
  "| `integration_export_invalid_state_transition` | 409 | Appendix L.18 worker/admin transition guard |",
  "#### `integration_export_target_system` (§4.3.38, §4.3.39, §31.3)",
  "#### `integration_export_run_status` (§4.3.39, Appendix L.18)",
  "#### `integration_export_failure_code` (§4.3.39, Appendix C `integration.export.failed`)",
  "#### `integration_export_cancel_reason` (§4.3.39, Appendix C `integration.export.canceled`)",
  "**Phase 13 Integration Export.** Buyer-console closed-Workspace workflow",
  "**IntegrationExportConfiguration.** Org-default or Workspace-level Buyer integration mapping",
  "**IntegrationExportRun.** Async job and audit row",
  "### L.18 Integration Export Run State Machine (§4.3.39 / §31.3) {#l-18-integration-export-run-state-machine}",
  "| Integration Phase Export Mapping / Phase 13 Integration Export | §31.3, §4.3.38, §4.3.39, §32.10.3.F |",
] as const;

const M5_ROW_TOKENS = [
  "api_contract_completeness",
  "**`runtime_active`**",
  "tools/spec-lint/gates/integration_export_contract_completeness.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "scope boundary: spec-tree §31.3 / §4.3.38-§4.3.39 / §32.10.3.F / Appendix catalogs only",
  "product route handlers, OpenAPI generation, auth/rate-limit middleware, provider writes, worker execution, deploy validators, and integration tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 8.2",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "31.3-integration-phase-export-mapping", "§31.3 Integration Export", SECTION_31_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "4.3.38-integrationexportconfiguration", "§4.3.38 IntegrationExportConfiguration", CONFIG_ENTITY_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "4.3.39-integrationexportrun", "§4.3.39 IntegrationExportRun", RUN_ENTITY_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "32.10.3.f-phase-13-integration-export-endpoints", "§32.10.3.F Integration Export API", API_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "Integration Export cross-section contract", GLOBAL_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
