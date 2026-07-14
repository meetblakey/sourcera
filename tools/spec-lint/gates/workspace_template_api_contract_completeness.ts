/**
 * Gate: `workspace_template_api_contract_completeness`
 *
 * Assertion: §19 Template Library operations resolve to the §32.5 index and
 * the full §32.10.3.D API contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./workspace_template_gate_helpers.js";

const ENDPOINTS = [
  "GET    /v1/orgs/{org\\_id}/templates",
  "POST   /v1/orgs/{org\\_id}/templates",
  "GET    /v1/orgs/{org\\_id}/templates/{template\\_id}",
  "PATCH  /v1/orgs/{org\\_id}/templates/{template\\_id}",
  "DELETE /v1/orgs/{org\\_id}/templates/{template\\_id}",
  "POST   /v1/orgs/{org\\_id}/templates/{template\\_id}/apply-update",
  "POST   /v1/workspaces/{workspace\\_id}/save-as-template",
  "POST   /v1/workspaces/from-template",
  "POST   /v1/orgs/{org\\_id}/templates/{template\\_id}/suggest-improvement",
] as const;

const API_DETAIL_ENDPOINTS = [
  "`/v1/orgs/{org_id}/templates`",
  "`/v1/orgs/{org_id}/templates/{template_id}`",
  "`/v1/orgs/{org_id}/templates/{template_id}/apply-update`",
  "`/v1/workspaces/{workspace_id}/save-as-template`",
  "`/v1/workspaces/from-template`",
  "`/v1/orgs/{org_id}/templates/{template_id}/suggest-improvement`",
] as const;

const MATRIX_TOKENS = [
  "| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |",
  "`read:workspaces`",
  "`write:workspaces`",
  "§5.11",
  "§34.1.1 Custom Templates",
  "`workspace_read`",
  "`data_mutation`",
  "REQUIRED",
] as const;

const CONTRACT_TOKENS = [
  "**Console firewall.**",
  "**List query parameters.**",
  "`kind` | Enum | null | Appendix J `workspace_template_kind`",
  "`limit` | Integer | 50 | 1-250 | §32.3 cursor page size.",
  "`cursor` | String | null | Opaque | §32.3 cursor.",
  "**Create / metadata request.**",
  "\"kind\": \"use_case_bundle\"",
  "**Apply update request.**",
  "**Save as Template request.**",
  "\"kind\": \"rfp\"",
  "**Workspace from Template request.**",
  "**Suggest Improvement request.**",
  "**Response object fields.**",
  "`template_id`, `org_id`, `source`, `template_library_entry_id`, `current_version_id`, `name`, `description_markdown`, `kind`, `category`",
  "List responses use §32.3 cursor pagination with `limit` default 50 and max 250.",
  "**Endpoint-specific side effects.**",
  "**Errors.**",
  "`template_not_found`",
  "`template_authoring_plan_required`",
  "`template_mutation_role_insufficient`",
  "`idempotency_key_request_mismatch`",
  "`template_update_already_applied`",
  "`template_apply_update_partial_failure_rolled_back`",
  "**Example.**",
  "Idempotency-Key",
  "**Acceptance criteria.**",
] as const;

function endpointIndexFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const index = sectionTextByAnchor(doc, "32.5-endpoints");
  requireTokens(findings, doc, index, "§32.5 endpoint index", ["Template Library (§32.10.3.D)", ...ENDPOINTS]);
  return findings;
}

function apiDetailFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const detail = sectionTextByAnchor(doc, "32.10.3.d-template-library-endpoints");
  requireTokens(findings, doc, detail, "§32.10.3.D Template Library API contract", [
    ...MATRIX_TOKENS,
    ...CONTRACT_TOKENS,
    ...API_DETAIL_ENDPOINTS,
  ]);
  return findings;
}

function section19BindingFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.6.2-api-event-and-atomicity-binding"), "§19.6.2 API binding", [
    "Template Library public API routes are registered in §32.5 and detailed in §32.10.3.D",
    "§19 owns user workflow and UI semantics only",
    "All state-mutating §32.10.3.D endpoints require `Idempotency-Key`",
    "Same-key / different-body replay returns HTTP 409 `idempotency_key_request_mismatch`",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_api_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...endpointIndexFindings(ctx.masterSpec),
      ...apiDetailFindings(ctx.masterSpec),
      ...section19BindingFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_api_contract_completeness"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
