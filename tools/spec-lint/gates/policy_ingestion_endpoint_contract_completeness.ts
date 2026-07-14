/**
 * Gate: `policy_ingestion_endpoint_contract_completeness`
 *
 * Assertion: §12 Policy Ingestion operations resolve to the §32.5 index and
 * complete §32.10.3.C endpoint contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { forbidTokens, m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./policy_ingestion_gate_helpers.js";

const ENDPOINT_INDEX_TOKENS = [
  "GET    /v1/workspaces/{workspace\\_id}/policy-ingestions",
  "POST   /v1/workspaces/{workspace\\_id}/policy-ingestions",
  "GET    /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}",
  "POST   /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/framework-confirmations",
  "POST   /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/cancel",
  "GET    /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/controls",
  "POST   /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/dedup-resolutions",
  "GET    /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/amendments",
  "POST   /v1/workspaces/{workspace\\_id}/policy-ingestions/{job\\_id}/publish",
] as const;

const API_DETAIL_TOKENS = [
  "| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |",
  "`/v1/workspaces/{workspace_id}/policy-ingestions`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/framework-confirmations`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/cancel`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/controls`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/dedup-resolutions`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/amendments`",
  "`/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/publish`",
  "`read:workspaces`",
  "`write:workspaces`",
  "§5.8 roles",
  "§34.1.1 Policy Ingestion",
  "§34.8.5 `policy_parsing`",
  "`ai_invocation` plus upload sublimits",
  "`workspace_read`",
  "`data_mutation`",
  "REQUIRED",
  "**Console firewall.**",
  "**Create request.**",
  "\"data_residency_region\": \"us\"",
  "**Create response (HTTP 202 Accepted).**",
  "**Framework confirmation request.**",
  "**Dedup resolution request.**",
  "**Publish request.**",
  "**Response object fields.**",
  "List responses use §32.3 cursor pagination with `limit` default 50 and max 250.",
  "**Endpoint-specific side effects.**",
  "emits `policy.ingestion.queued`",
  "**Errors.**",
  "`policy_ingestion_role_insufficient`",
  "`capability_requires_plan_upgrade`",
  "`policy_ingestion_concurrent_request_in_flight`",
  "`policy_extraction_partial_resume_required`",
  "`policy_ingestion_residency_mismatch`",
  "`policy_dedup_resolution_invalid`",
  "`policy_ingestion_mobile_review_not_supported`",
  "**Example.**",
  "Idempotency-Key",
  "**Acceptance criteria.**",
] as const;

const APPENDIX_I_TOKENS = [
  "`policy_ingestion_unsupported_language`",
  "`policy_ingestion_unsupported_format`",
  "`policy_ingestion_scanned_image_rejected`",
  "`policy_ingestion_extraction_token_limit_exceeded`",
  "`policy_ingestion_extraction_timeout`",
  "`policy_ingestion_monthly_cap_exceeded`",
  "`policy_ingestion_pages_per_upload_exceeded`",
  "`policy_ingestion_anthropic_outage`",
  "`policy_ingestion_dedup_failed`",
  "`policy_amendment_review_deadline_expired`",
  "`policy_amendment_workflow_violation`",
  "`policy_ingestion_residency_mismatch`",
  "`policy_ingestion_concurrent_request_in_flight`",
  "`policy_ingestion_capability_state_blocked`",
  "`policy_ingestion_not_found`",
  "`policy_extraction_partial_resume_required`",
  "`policy_dedup_resolution_invalid`",
  "`policy_ingestion_mobile_review_not_supported`",
] as const;

function endpointIndexFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "32.5-endpoints"), "§32.5 Policy Ingestion endpoint index", [
    "### Policy Ingestion",
    ...ENDPOINT_INDEX_TOKENS,
  ]);
  return findings;
}

function endpointDetailFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const detail = sectionTextByAnchor(doc, "32.10.3.c-policy-ingestion-endpoints");
  requireTokens(findings, doc, detail, "§32.10.3.C Policy Ingestion API contract", API_DETAIL_TOKENS);
  forbidTokens(findings, doc, detail, "§32.10.3.C Policy Ingestion API contract", ["policy.ingestion.uploaded"]);
  return findings;
}

function appendixFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-v72rem-phase-10"), "Appendix I Policy Ingestion errors", APPENDIX_I_TOKENS);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.9-acceptance-criteria"), "§12.9 Policy Ingestion acceptance criteria", [
    "§32.10.3.C endpoints MUST provide auth scope, RBAC, rate-limit class, request/response schema, error codes, idempotency, pagination where applicable, and examples",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "policy_ingestion_endpoint_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 12",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...endpointIndexFindings(ctx.masterSpec),
      ...endpointDetailFindings(ctx.masterSpec),
      ...appendixFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "policy_ingestion_endpoint_contract_completeness"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
