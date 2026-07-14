/**
 * Gate: `org_residency_change_api_contract_complete`
 *
 * Assertion: §32.8.25 defines the complete Org residency migration API
 * contract, and the supporting Appendix C/G/I/J registries align to it.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const ANCHOR = "32.8.25-post-org-residency-migration-request";

const SECTION_TOKENS = [
  "POST /v1/orgs/{org_id}/residency-migration-requests",
  "GET /v1/orgs/{org_id}/residency-migration-requests/{residency_change_id}",
  "scope `admin:org`",
  "active UI-session step-up",
  "`step_up_required`",
  "`role ∈ {org_owner, enterprise_admin}`",
  "plan tier Enterprise",
  "`org_residency_change` (§32.4.5)",
  "**Idempotency.** REQUIRED",
  "`Idempotency-Key` dedupes by `(org_id, requested_region, key)`",
  "`X-Idempotent-Replay: true`",
  "`idempotency_key_request_mismatch`",
  "Replay MUST NOT create a duplicate residency migration request, Ops approval task, audit row, customer notification, Stripe-Customer reconciliation step, or regional execution job",
  "\"residency_change_id\"",
  "\"state\"",
  "\"current_region\"",
  "\"requested_region\"",
  "\"eligibility\"",
  "\"ops_review_required\"",
  "\"poll_url\"",
  "state ∈ Appendix J org_residency_change_state",
  "Terminal states are `completed`, `rolled_back`, and `cancelled`",
  "`entity_type=organization`",
  "`action=created`",
  "`changes.residency_change_id`",
  "`changes.state=requested`",
  "emits no Appendix C webhook at request creation",
  "Appendix C `org.residency_change.initiated` is emitted only after eligibility passes and the §34.10.5.A transaction begins",
  "Appendix C `org.residency_change.*` family",
  "`lo_org_residency_change_blocked`",
  "The endpoint MUST NOT mutate Organization.`data_residency_region`",
  "The endpoint MUST reject a second non-terminal residency migration request for the same Org",
  "The endpoint MUST be covered by CI gate `org_residency_change_api_contract_complete`",
] as const;

const REQUEST_FIELDS = [
  "requested_region",
  "custom_sovereign_residency_label",
  "business_justification",
  "acknowledged_production_evaluation_pause",
] as const;

const ERROR_CODES = [
  "step_up_required",
  "enterprise_plan_required",
  "org_residency_change_eligibility_predicate_violated",
  "org_residency_change_blocked_by_active_dsar",
  "idempotency_key_request_mismatch",
  "organization_custom_residency_label_required",
  "rate_limit_exceeded",
  "org_residency_change_stripe_api_failure",
] as const;

const APPENDIX_I_CODES = [
  "stripe_customer_active_duplicate",
  "org_residency_change_stripe_api_failure",
  "org_residency_change_eligibility_predicate_violated",
  "organization_custom_residency_label_required",
  "org_residency_change_blocked_by_active_dsar",
] as const;

const APPENDIX_C_EVENTS = [
  "org.residency_change.initiated",
  "org.residency_change.stripe_customer_created",
  "org.residency_change.stripe_customer_closed",
  "org.residency_change.completed",
  "org.residency_change.rollback",
] as const;

const APPENDIX_G_EVENTS = [
  "org_residency_change_initiated",
  "org_residency_change_stripe_customer_created",
  "org_residency_change_stripe_customer_closed",
  "org_residency_change_completed",
  "org_residency_change_rollback",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/org_residency_change_api_contract_complete.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "`POST /v1/orgs/{org_id}/residency-migration-requests` and polling MUST declare auth scope, RBAC, rate-limit class, idempotency, request / response schema, error table, and events",
  "with class `org_residency_change` registered in §32.4.5 and Appendix J",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function codeValues(text: string): string[] {
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) values.push(match[1].trim());
  return values;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function findLineInRange(
  doc: SpecDoc,
  startLine: number,
  endLine: number,
  predicate: (line: string) => boolean,
): { text: string; line: number } | null {
  for (let line = startLine; line <= endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required API-contract token: ${token}`);
}

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, ANCHOR);
  if (!section) {
    push(findings, doc, 0, ANCHOR, "§32.8.25 Org residency migration endpoint section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of SECTION_TOKENS) requireToken(findings, doc, text, section.startLine, "§32.8.25", token);
  return findings;
}

function requestSchemaFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, ANCHOR);
  if (!section) return findings;
  const marker = findLineInRange(doc, section.startLine, section.endLine, (line) => line.includes("**Request.**"));
  if (!marker) {
    push(findings, doc, section.startLine, "**Request.**", "§32.8.25 request schema block is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line, section.endLine);
  const headers = table.header?.cells ?? [];
  for (const header of ["Field", "Type", "Required", "Constraints", "Notes"]) {
    if (!headers.includes(header)) push(findings, doc, table.header?.line ?? marker.line, header, `§32.8.25 request schema table is missing ${header} column.`);
  }
  const seen = new Map<string, number>();
  for (const row of table.rows) {
    const value = codeValues(row.cells[0] ?? "")[0];
    if (value) seen.set(value, row.line);
  }
  for (const field of REQUEST_FIELDS) {
    if (!seen.has(field)) push(findings, doc, marker.line, field, `§32.8.25 request schema table is missing ${field}.`);
  }
  return findings;
}

function errorTableFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, ANCHOR);
  if (!section) return findings;
  const marker = findLineInRange(doc, section.startLine, section.endLine, (line) => line.includes("**Errors.**"));
  if (!marker) {
    push(findings, doc, section.startLine, "**Errors.**", "§32.8.25 error table is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line, section.endLine);
  const seen = new Map<string, number>();
  for (const row of table.rows) {
    const code = codeValues(row.cells[1] ?? "")[0];
    if (code) seen.set(code, row.line);
  }
  for (const code of ERROR_CODES) {
    if (!seen.has(code)) push(findings, doc, marker.line, code, `§32.8.25 error table is missing ${code}.`);
  }
  return findings;
}

function rateLimitFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `org_residency_change` |"));
  if (!row) {
    push(findings, doc, 0, "`org_residency_change`", "§32.4.5 rate-limit class row org_residency_change is missing.");
    return findings;
  }
  for (const token of ["Org residency migration request creation and polling", "`rate_limit_exceeded`", "only one non-terminal §1.6.1 migration may exist per Org"]) {
    requireToken(findings, doc, row.text, row.line, "§32.4.5 org_residency_change row", token);
  }
  return findings;
}

function appendixIFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const code of APPENDIX_I_CODES) {
    const row = findLine(doc, (line) => line.trim().startsWith(`- \`${code}\``));
    if (!row) {
      push(findings, doc, 0, code, `Appendix I registration for ${code} is missing.`);
      continue;
    }
    if (!row.text.includes("HTTP ")) push(findings, doc, row.line, "HTTP ", `Appendix I ${code} row is missing HTTP status.`);
    if (!row.text.includes("Localization key:")) push(findings, doc, row.line, "Localization key:", `Appendix I ${code} row is missing localization key.`);
  }
  const duplicate = findLine(doc, (line) => line.trim().startsWith("- `stripe_customer_active_duplicate`"));
  if (duplicate) {
    requireToken(findings, doc, duplicate.text, duplicate.line, "Appendix I stripe_customer_active_duplicate row", "§32 `POST /v1/orgs/{org_id}/residency-migration-requests`");
    if (duplicate.text.includes("/v1/organizations/{org_id}/residency-migration-requests")) {
      push(findings, doc, duplicate.line, "/v1/organizations/{org_id}/residency-migration-requests", "Appendix I stripe_customer_active_duplicate row still cites stale organizations path.");
    }
  }
  return findings;
}

function appendixCFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const event of APPENDIX_C_EVENTS) {
    const row = findLine(doc, (line) => line.trim().startsWith(`| \`${event}\` |`));
    if (!row) push(findings, doc, 0, event, `Appendix C residency-change event ${event} is missing.`);
  }
  return findings;
}

function appendixGFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const event of APPENDIX_G_EVENTS) {
    const row = findLine(doc, (line) => line.trim().startsWith(`| \`${event}\` |`));
    if (!row) push(findings, doc, 0, event, `Appendix G residency-change mirror ${event} is missing.`);
  }
  return findings;
}

function appendixJFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const adminScope = findLine(doc, (line) => line.trim().startsWith("| `admin:org` |"));
  if (!adminScope || !adminScope.text.includes("§32.8.25 residency migration initiation")) {
    push(findings, doc, adminScope?.line ?? 0, "`admin:org`", "Appendix J api_token_scope row admin:org must bind to §32.8.25 residency migration initiation.");
  }
  const rateClass = findLine(doc, (line) => line.includes("`org_residency_change`") && line.includes("`analytics_export`"));
  if (!rateClass) {
    push(findings, doc, 0, "`org_residency_change`", "Appendix J api_rate_limit_class enum must include org_residency_change.");
  }
  const stateHeading = findLine(doc, (line) => line.startsWith("### `org_residency_change_state`"));
  if (!stateHeading) {
    push(findings, doc, 0, "### `org_residency_change_state`", "Appendix J org_residency_change_state enum is missing.");
  }
  const actionTypes = findLine(doc, (line) => line.includes("`created`, `updated`, `deleted`"));
  if (!actionTypes || !actionTypes.text.includes("`created`")) {
    push(findings, doc, actionTypes?.line ?? 0, "`created`", "Appendix J audit_event_action_type bare-verb registry must include created for the request AuditEvent.");
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `org_residency_change_api_contract_complete` |"));
  if (!row) {
    push(findings, doc, 0, "`org_residency_change_api_contract_complete`", "§M.5 row org_residency_change_api_contract_complete is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 org_residency_change_api_contract_complete row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "org_residency_change_api_contract_complete",
  sourcePhase: "V9.3",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...sectionFindings(doc),
      ...requestSchemaFindings(doc),
      ...errorTableFindings(doc),
      ...rateLimitFindings(doc),
      ...appendixIFindings(doc),
      ...appendixCFindings(doc),
      ...appendixGFindings(doc),
      ...appendixJFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
