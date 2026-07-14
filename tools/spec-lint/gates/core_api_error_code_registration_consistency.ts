/**
 * Gate: `core_api_error_code_registration_consistency`
 *
 * Assertion: §32.10.9 error sets, auth scopes, and rate-limit classes resolve
 * to Appendix I, Appendix J, and §32.4.5 registries.
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

const GATE_ID = "core_api_error_code_registration_consistency";

const ERROR_SET_TOKENS = [
  "| `WorkspaceReadErrors` | `invalid_workspace_id`, `workspace_not_found`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |",
  "| `WorkspaceWriteErrors` | `invalid_workspace_id`, `workspace_not_found`, `invalid_use_case_id`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |",
  "| `ResponseReadErrors` | `invalid_workspace_id`, `invalid_response_id`, `invalid_requirement_id`, `invalid_target_account_id`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |",
  "| `ScoreWriteErrors` | `invalid_workspace_id`, `invalid_score_id`, `invalid_requirement_id`, `invalid_target_account_id`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `score_lead_override_final`, `scoring_realtime_unavailable`, `bad_request`, `rate_limit_exceeded` |",
  "| `ScoreExclusionWriteErrors` | `invalid_workspace_id`, `invalid_score_id`, `score_exclusion_proposal_not_found`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `score_exclusion_self_approval_forbidden`, `score_exclusion_rejection_reason_required`, `score_exclusion_pending_conflict`, `score_exclusion_approver_unavailable`, `score_lead_override_final`, `scoring_realtime_unavailable`, `phase_lock_violation`, `rate_limit_exceeded` |",
  "| `SelectionReportWriteErrors` | `invalid_workspace_id`, `invalid_report_id`, `selection_record_not_finalized`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |",
  "| `TraceabilityReadErrors` | `invalid_workspace_id`, `invalid_matrix_id`, `invalid_requirement_id`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |",
  "| `CapabilityDeclarationWriteErrors` | `invalid_capability_id`, `capability_declaration_taxonomy_violation`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |",
  "| `AuditEventReadErrors` | `audit_event_cross_org_access`, `audit_event_direct_write_forbidden`, `audit_event_immutable`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |",
  "| `IdentityReadErrors` | `unauthenticated`, `token_scope_insufficient`, `not_found`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |",
] as const;

const APPENDIX_I_TOKENS = [
  "`invalid_workspace_id`",
  "`workspace_not_found`",
  "`invalid_requirement_id`",
  "`invalid_response_id`",
  "`invalid_score_id`",
  "`score_exclusion_proposal_not_found`",
  "`score_lead_override_final`",
  "`score_exclusion_self_approval_forbidden`",
  "`score_exclusion_rejection_reason_required`",
  "`score_exclusion_pending_conflict`",
  "`score_exclusion_approver_unavailable`",
  "`scoring_realtime_unavailable`",
  "`invalid_target_account_id`",
  "`invalid_vendor_id`",
  "`invalid_capability_id`",
  "`invalid_report_id`",
  "`invalid_matrix_id`",
  "`invalid_comment_id`",
  "`invalid_use_case_id`",
  "`token_scope_insufficient`",
  "`query_unsupported_filter_combination`",
  "`pagination_cursor_expired`",
  "`idempotency_key_request_mismatch`",
  "`bad_request`",
  "`rate_limit_exceeded`",
  "`selection_record_not_finalized`",
  "`capability_declaration_taxonomy_violation`",
  "`audit_event_cross_org_access`",
  "`audit_event_direct_write_forbidden`",
  "`audit_event_immutable`",
  "`unauthenticated`",
  "`not_found`",
] as const;

const APPENDIX_J_SCOPE_TOKENS = [
  "`read:workspaces`",
  "`write:workspaces`",
  "`admin:workspaces`",
  "`read:requirements`",
  "`write:requirements`",
  "`read:responses`",
  "`write:responses`",
  "`read:scores`",
  "`write:scores`",
  "`read:kb`",
  "`write:kb`",
  "`export:audit_events`",
  "`admin:ops_compliance`",
] as const;

const RATE_LIMIT_TOKENS = [
  "| `standard_authenticated_per_org` | Default authenticated API class unless an endpoint declares another class | Org | §39.1 `standard_authenticated_per_org` soft limit | §39.1 `standard_authenticated_per_org` hard limit | §39.1 `standard_authenticated_per_org` burst / concurrency | `rate_limit_exceeded` | Also subject to the canonical-plan monthly API-call quotas in §32.4. |",
  "| `data_mutation` | High-volume workspace data mutation endpoints | Org + Workspace | 60 requests/minute | 60 requests/minute hard | N/A | `rate_limited` | Used by §4 / §11 mutation flows. |",
  "| `workspace_read` | Workspace read endpoints | Org | Standard class limits | Standard class limits | Standard class burst | `rate_limit_exceeded` | Registered as a named read class so workspace endpoints do not need to restate the default. |",
  "| `audit_events_export` | Audit-event export initiation and polling | Org | 5 exports/hour | 10 exports/hour | 5 exports/hour burst | `rate_limit_exceeded` | Presigned download URL constraints are handled by §33.1.2. |",
  "`standard_authenticated_per_org`, `public_pricing_unauth`, `marketplace_public_unauth`, `dsar_subject_request`, `data_mutation`, `workspace_read`, `ai_invocation`, `internal_comment_api`, `kb_export_request`, `kb_export_poll`,",
  "`audit_events_export`",
] as const;

const ACCEPTANCE_TOKENS = [
  "No Auth Scope in §32.10.9 may be absent from Appendix J `api_token_scope`, and no Rate-Limit Class may be absent from §32.4.5 / Appendix J `api_rate_limit_class`.",
] as const;

const M5_ROW_TOKENS = [
  "Every error code referenced by §32.10.9 error sets resolves to Appendix I",
  "every Auth Scope / Rate-Limit Class token in §32.10.9 resolves to Appendix J / §32.4.5",
  "spec-tree §32.10.9 error/scope/rate-limit registration consistency only",
  "product error mappers, auth-scope middleware, rate-limit middleware, generated OpenAPI schemas, and runtime API tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 8.1",
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.10.9-core-buyer-and-administration-api-detail-pack"), "§32.10.9 Core API error sets", ERROR_SET_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-api-error-code-catalog"), "Appendix I API Error Code Catalog", APPENDIX_I_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"), "Appendix J API token scopes and rate-limit classes", APPENDIX_J_SCOPE_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.4.5-rate-limit-class-registry"), "§32.4.5 Rate-Limit Class Registry", RATE_LIMIT_TOKENS.slice(0, 4));
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"), "Appendix J API rate-limit classes", RATE_LIMIT_TOKENS.slice(4));
    requireTokens(findings, doc, sectionTextByAnchor(doc, "32.10.9.i-acceptance-criteria"), "§32.10.9.I Acceptance criteria", ACCEPTANCE_TOKENS);

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
