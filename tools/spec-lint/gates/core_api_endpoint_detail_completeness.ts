/**
 * Gate: `core_api_endpoint_detail_completeness`
 *
 * Assertion: every core §32.5 endpoint family resolves to a full §32.10.9
 * API contract, or to a named specialized owner section.
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

const GATE_ID = "core_api_endpoint_detail_completeness";

const ENDPOINT_INDEX_TOKENS = [
  "D-V8.1-001 closes the remaining list-only gap",
  "binding Workspaces, Use Cases, Requirements, Responses, Scores, Vendors / Target Accounts, Selection Reports, Traceability Matrices, Capability Declarations, Internal Comments, Audit Events, and Users & Organization to §32.10.9",
  "Families with pre-existing detail remain single-sourced in their cited sections: Phase Advancement (§10.16), Vendor Disqualification (§25.3), Scenario Modeling (§32.10.3.E), TCO Modeling (§32.5.2), Workspace Analytics (§32.10.3.A), Policy Ingestion (§32.10.3.C), Template Library (§32.10.3.D), Phase 13 Integration Exports (§32.10.3.F), Intelligence (§32.5.1), Webhook Subscriptions (§31.11.3), Vendor Opt-Outs (§27.10.6), Marketplace Discovery (§27.11.7), Billing (§32.8), and Seller KB Export (§32.9).",
  "GET    /v1/workspaces",
  "POST   /v1/workspaces",
  "GET    /v1/workspaces/{workspace\\_id}/requirements",
  "POST   /v1/workspaces/{workspace\\_id}/requirements",
  "GET    /v1/workspaces/{workspace\\_id}/responses",
  "POST   /v1/workspaces/{workspace\\_id}/scores",
  "GET    /v1/workspaces/{workspace\\_id}/vendors",
  "GET    /v1/workspaces/{workspace\\_id}/reports",
  "GET    /v1/workspaces/{workspace\\_id}/traceability-matrices",
  "GET    /v1/vendors/{vendor\\_org\\_id}/capabilities",
  "GET    /v1/audit-events",
  "GET    /v1/users/me",
] as const;

const DETAIL_PACK_TOKENS = [
  "### 32.10.9 Core Buyer and Administration API Detail Pack {#32.10.9-core-buyer-and-administration-api-detail-pack}",
  "**Scope.** This pack covers Workspaces, Use Cases, Requirements, Responses, Scores, Vendors / Target Accounts, Selection Reports, Traceability Matrices, Capability Declarations, Internal Comments alias binding, Audit Events, and Users & Organization.",
  "| Contract axis | Requirement |",
  "| Base URL | All paths are relative to §32.1 `https://api.sourcera.io/v1`; generated OpenAPI MUST NOT reintroduce an api-prefixed root. |",
  "| Authorization | `Authorization: Bearer <api_token>` is required. The endpoint-local `Auth Scope` cell names the minimum Appendix J `api_token_scope` unless the endpoint is token self-introspection, in which case any active registered scope is sufficient. |",
  "| Console scope | Buyer endpoints require `ApiToken.console_scope IN ('buyer','both')`; seller Capability Declaration endpoints require `ApiToken.console_scope IN ('seller','both')`; Audit Events may use the unified audit projection only for Org Owner, Org Admin, Billing Admin, or Ops-supported readers named in §4.6.1 / §6.7. |",
  "| Pagination | List endpoints use the §32.3 cursor envelope, default, and maximum. No endpoint in this pack owns an inline pagination limit. |",
  "| Idempotency | POST / PATCH / DELETE routes require `Idempotency-Key`. Same key + same body returns the original response; same key + different body returns HTTP 409 `idempotency_key_request_mismatch`. |",
  "| Optimistic concurrency | PATCH and DELETE routes that mutate persistent customer rows require `expected_version` unless the owning specialized section defines a stricter state-machine transition. |",
  "| Audit | Mutations write one §4.6.1 AuditEvent after validation and before commit. Read-only audit-event reads write an audit-of-audit row when cross-console or export authority is exercised per §4.6.1 / §6.7. |",
  "| Residency / DSAR | Read and write routes enforce the parent Org / Workspace / Seller Org residency partition before response serialization. DSAR and retention behavior is inherited from the owning §4 entity plus §6.8 and §40.2. |",
  "| Method | Path | Request schema | Response schema | Auth Scope | RBAC | Rate-Limit Class | Idempotency | Error set |",
  "| GET | `/v1/workspaces` | `WorkspaceListQuery` | `WorkspaceListResponse` | `read:workspaces` | Org Owner / Org Admin / Workspace member visible in buyer console | `workspace_read` | N/A | `WorkspaceReadErrors` |",
  "| POST | `/v1/workspaces` | `WorkspaceCreateRequest` | `WorkspaceMutationResponse` | `write:workspaces` | Org Owner / Org Admin / role with §5.11 Workspace create permission | `data_mutation` | Required | `WorkspaceWriteErrors` |",
  "| DELETE | `/v1/workspaces/{workspace_id}` | `WorkspaceDeleteRequest` | `WorkspaceMutationResponse` | `admin:workspaces` | Org Owner / Org Admin; soft-delete only | `data_mutation` | Required | `WorkspaceWriteErrors` |",
  "| GET | `/v1/workspaces/{workspace_id}/requirements` | `RequirementListQuery` | `RequirementListResponse` | `read:requirements` | Workspace member or scoped guest with requirement visibility | `workspace_read` | N/A | `RequirementReadErrors` |",
  "| POST | `/v1/workspaces/{workspace_id}/requirements` | `RequirementWriteRequest` | `RequirementMutationResponse` | `write:requirements` | Workspace owner, Use Case Lead, or editor role per §12 | `data_mutation` | Required | `RequirementWriteErrors` |",
  "| GET | `/v1/workspaces/{workspace_id}/responses` | `ResponseListQuery` | `ResponseListResponse` | `read:responses` | Buyer Workspace member; seller response bodies remain behind seller/bid APIs | `workspace_read` | N/A | `ResponseReadErrors` |",
  "| POST | `/v1/workspaces/{workspace_id}/scores` | `ScoreWriteRequest` | `ScoreMutationResponse` | `write:scores` | Workspace owner, evaluation lead, or score editor | `data_mutation` | Required | `ScoreWriteErrors` |",
  "| GET | `/v1/workspaces/{workspace_id}/vendors` | `TargetAccountListQuery` | `TargetAccountListResponse` | `read:workspaces` | Workspace member with vendor-list visibility | `workspace_read` | N/A | `TargetAccountReadErrors` |",
  "| POST | `/v1/workspaces/{workspace_id}/reports` | `SelectionReportCreateRequest` | `SelectionReportMutationResponse` | `write:workspaces` | Workspace owner, evaluation lead, or approver per §10.12 / §10.13 | `data_mutation` | Required | `SelectionReportWriteErrors` |",
  "| GET | `/v1/workspaces/{workspace_id}/traceability-matrices` | `TraceabilityMatrixListQuery` | `TraceabilityMatrixListResponse` | `read:requirements` | Workspace member with requirement visibility | `workspace_read` | N/A | `TraceabilityReadErrors` |",
  "| GET | `/v1/vendors/{vendor_org_id}/capabilities` | `CapabilityDeclarationListQuery` | `CapabilityDeclarationListResponse` | `read:kb` | Seller Org Owner/Admin, seller marketing editor, marketplace publisher, or seller KB editor with declaration visibility | `standard_authenticated_per_org` | N/A | `CapabilityDeclarationReadErrors` |",
  "| GET | `/v1/audit-events` | `AuditEventListQuery` | `AuditEventListResponse` | `export:audit_events` | Org Owner / Org Admin / Billing Admin; Ops support reads per §50 only | `audit_events_export` | N/A | `AuditEventReadErrors` |",
  "| GET | `/v1/users/me` | None | `UserSelfResponse` | Any active Appendix J `api_token_scope` on the caller token | Token subject only | `standard_authenticated_per_org` | N/A | `IdentityReadErrors` |",
  "**Response envelope shapes.** Read and mutation responses use §32.3 envelopes",
  "Every live §32.5 endpoint family MUST either cite a specialized owner section or appear in a §32.10.9 endpoint matrix with request schema, response schema, error set, auth scope, rate-limit class, idempotency behavior, and RBAC.",
  "Generated OpenAPI / SDK references MUST fail build if any §32.5 route has method + path only and lacks an owning detail reference.",
  "Mutating routes in §32.10.9 MUST reject missing `Idempotency-Key`; same-key / different-body replay MUST return HTTP 409 `idempotency_key_request_mismatch`.",
  "PATCH / DELETE routes in §32.10.9 MUST enforce `expected_version` where the route changes a customer row and no stricter owning state-machine section applies.",
  "List endpoints in §32.10.9 MUST use §32.3 cursor semantics and MUST NOT define a duplicate inline page-size limit.",
] as const;

const M5_ROW_TOKENS = [
  "Every live §32.5 route either cites a specialized owner section or appears in §32.10.9",
  "request schema, response schema, error set, auth scope, rate-limit class, idempotency behavior, and RBAC",
  "method+path-only rows fail",
  "spec-tree §32.5 ↔ §32.10.9 endpoint-detail completeness only",
  "product OpenAPI generation, SDK generation, endpoint handlers, auth middleware, idempotency persistence, and API contract tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 8.1",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.5-endpoints"), "§32.5 endpoint index", ENDPOINT_INDEX_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.10.9-core-buyer-and-administration-api-detail-pack"), "§32.10.9 Core Buyer and Administration API Detail Pack", DETAIL_PACK_TOKENS);

    const m5Row = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
    if (m5Row) {
      for (const token of M5_ROW_TOKENS) {
        if (!m5Row.text.includes(token)) push(findings, doc, m5Row.line, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
