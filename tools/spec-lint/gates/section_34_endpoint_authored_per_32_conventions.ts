/**
 * Gate: `section_34_endpoint_authored_per_32_conventions`
 *
 * Assertion: §34 billing references resolve to authored §32.8 endpoint
 * contracts, and the endpoint-local error codes are registered in Appendix I.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§32.8.0 Billing endpoint conventions",
    anchor: "32.8.0-common-conventions-for-billing-endpoints",
    tokens: [
      "All list endpoints follow §32.3: cursor-based",
      "Every state-mutating POST endpoint in §32.8 requires an `Idempotency-Key` request header",
      "Every error includes `request_id` for support escalation",
    ],
  },
  {
    label: "§32.8.1 Public Pricing API",
    anchor: "32.8.1-get-pricing",
    tokens: [
      "**Method & Path.** `GET https://api.sourcera.io/v1/pricing`",
      "**Auth Scope.** None.",
      "**RBAC.** N/A (no authentication).",
      "**Rate-Limit Class.** `public_pricing_unauth`",
      "**Query Parameters.**",
      "**Request Headers.**",
      "**Response Headers.**",
      "**Response Body (HTTP 200).**",
      "**Error Codes.**",
      "`pricing_table_currency_not_published`",
      "`pricing_table_version_not_found`",
      "`pricing_table_capability_not_published`",
      "**Pagination.** None",
      "**Idempotency.** N/A (read endpoint).",
      "**Concrete Example (curl).**",
    ],
  },
  {
    label: "§32.8.5 Billing Ledger list",
    anchor: "32.8.5-get-ai-operations-list",
    tokens: [
      "**Method & Path.** `GET https://api.sourcera.io/v1/orgs/{org_id}/ai-operations`",
      "**Auth Scope.** `read:billing`.",
      "Cross-console union (`?console=all`) requires `role ∈ {org_owner, billing_admin}`",
      "**Rate-Limit Class.** `standard_authenticated_per_org`",
      "**Query Parameters.**",
      "**Response Body (HTTP 200).**",
      "**Error Codes.**",
      "`billing_ledger_cross_console_role_insufficient`",
      "`ai_operation_cross_org_access`",
      "`pagination_cursor_expired`",
      "**Pagination.** §32.3 cursor-based, default 50, max 250.",
      "**Idempotency.** N/A.",
      "**Concrete Example.**",
    ],
  },
  {
    label: "§32.8.7 Contest filing",
    anchor: "32.8.7-post-ai-operation-contest",
    tokens: [
      "**Method & Path.** `POST https://api.sourcera.io/v1/orgs/{org_id}/ai-operations/{op_id}/contest`",
      "**Auth Scope.** `admin:billing`",
      "**RBAC.** `role = billing_admin` ONLY",
      "**Rate-Limit Class.** `standard_authenticated_per_org`",
      "**Request Body (JSON).**",
      "`reason_code`",
      "`reason_narrative`",
      "`provenance_hash_at_file`",
      "**Response Body (HTTP 201 Created).**",
      "**Error Codes.**",
      "`contest_role_must_be_billing_admin`",
      "`contest_already_filed`",
      "`ai_operation_contest_window_expired`",
      "`contest_provenance_hash_mismatch`",
      "`contest_invalid_settlement_state`",
      "`contest_requested_credit_exceeds_charge`",
      "`contest_locked_for_dsar`",
      "`contest_filing_rate_limit_exceeded`",
      "**Idempotency.** REQUIRED.",
      "`X-Idempotent-Replay: true`",
      "`idempotency_key_request_mismatch`",
      "**State-Machine Effect.**",
      "emits webhook `billing.contest.filed`",
      "**Concrete Example.**",
    ],
  },
  {
    label: "§32.8.23 Billing endpoint acceptance criteria",
    anchor: "32.8.23-acceptance-criteria-billing",
    tokens: [
      "Public Pricing API never requires authentication.",
      "AIOperation list endpoint enforces order `created_at DESC, id ASC`",
      "Contest endpoint enforces 14-day window using database transaction commit time.",
      "Contest endpoint rejects role-non-`billing_admin` filings.",
      "Contest endpoint atomically transitions AIOperation, places soft credit, and creates the ContestRecord",
      "Implicit-Org alias paths (`/v1/billing/...`) MUST resolve identically to explicit-Org canonical paths",
      "Every §32.8.10-.22 endpoint error table MUST resolve to Appendix I.",
    ],
  },
];

const SOURCE_REFERENCE_REQUIREMENTS = [
  {
    label: "§34 public pricing reference",
    tokens: ["Public Pricing API", "`GET /v1/pricing` per §32.8.1"],
  },
  {
    label: "§34 billing ledger reference",
    tokens: [
      "Billing Ledger view (`GET /v1/orgs/{org_id}/ai-operations` per §32.8.5; implicit alias `GET /v1/billing/operations`)",
    ],
  },
  {
    label: "§34 contest filing reference",
    tokens: [
      "API `POST /v1/orgs/{org_id}/ai-operations/{op_id}/contest` per §32.8.7",
    ],
  },
  {
    label: "§34 endpoint convention acceptance criterion",
    tokens: [
      "API endpoints for §34 (Billing Ledger, Public Pricing API, Wallet read/configure, Contest file/list",
      "Canonical paths live in §32.8.",
    ],
  },
];

const APPENDIX_I_REQUIREMENTS = [
  ["pricing_table_currency_not_published", "400"],
  ["pricing_table_version_not_found", "404"],
  ["pricing_table_capability_not_published", "404"],
  ["billing_ledger_cross_console_role_insufficient", "403"],
  ["ai_operation_cross_org_access", "404"],
  ["ai_operation_cross_console_access", "404"],
  ["ai_operation_not_found", "404"],
  ["pagination_cursor_expired", "422"],
  ["query_unsupported_filter_combination", "422"],
  ["contest_role_must_be_billing_admin", "403"],
  ["contest_filing_rate_limit_exceeded", "429"],
  ["contest_already_filed", "409"],
  ["ai_operation_contest_window_expired", "410"],
  ["contest_provenance_hash_mismatch", "422"],
  ["contest_invalid_settlement_state", "422"],
  ["contest_requested_credit_exceeds_charge", "422"],
  ["contest_locked_for_dsar", "423"],
  ["idempotency_key_request_mismatch", "409"],
] as const;

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/section_34_endpoint_authored_per_32_conventions.ts",
  "§34 references to public pricing, billing operations, and contest filing",
  "method/path/auth/rate-limit/pagination/idempotency/schemas/examples",
  "Appendix I error registrations",
  "`endpoint pending` placeholders fail",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = findSectionByAnchor(doc, req.anchor);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor,
      message: `${req.label} section is missing; cannot verify §32.8 endpoint contract completeness.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing required §32.8 API contract text: ${token}`,
      });
    }
  }
  return findings;
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function sourceReferenceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of SOURCE_REFERENCE_REQUIREMENTS) {
    const text = doc.text;
    for (const token of req.tokens) {
      if (!text.includes(token)) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: token,
          message: `${req.label} does not resolve to the canonical §32.8 endpoint contract: ${token}`,
        });
      }
    }
  }
  return findings;
}

function appendixIRegistrationFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const [code, http] of APPENDIX_I_REQUIREMENTS) {
    const row = findLineIncludingAll(doc, [`\`${code}\``, `| ${http} |`]);
    if (!row) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: `| \`${code}\` | ${http} |`,
        message: `Appendix I is missing required §32.8 error-code registration for ${code} with HTTP ${http}.`,
      });
    }
  }
  return findings;
}

function pendingPlaceholderFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    const allowedM5Rule =
      line.includes("`section_34_endpoint_authored_per_32_conventions`") &&
      line.includes("`endpoint pending` placeholders fail");
    if (allowedM5Rule) continue;

    const legacyEndpointAdditionsPlaceholder =
      /_integration\/RECONCILIATION\.md.*Endpoint Additions/i.test(line);
    if (/endpoint pending/i.test(line) || legacyEndpointAdditionsPlaceholder) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: line.trim(),
        message: "Live §32.8/§34 billing API prose still contains an endpoint-pending placeholder.",
      });
    }
  }
  return findings;
}

function m5RowFindings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `section_34_endpoint_authored_per_32_conventions` |"]);
  if (!row) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "`section_34_endpoint_authored_per_32_conventions`",
        message: "Appendix M.5 section_34_endpoint_authored_per_32_conventions row is missing.",
      },
    ];
  }
  return requireTokens(doc, row.text, row.line, "Appendix M.5 section_34_endpoint_authored_per_32_conventions row", M5_TOKENS);
}

export const gate: SpecLintGate = {
  id: "section_34_endpoint_authored_per_32_conventions",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const req of SECTION_REQUIREMENTS) {
      const section = sectionText(doc, req, findings);
      findings.push(...requireTokens(doc, section.text, section.line, req.label, req.tokens));
    }

    findings.push(...sourceReferenceFindings(doc));
    findings.push(...appendixIRegistrationFindings(doc));
    findings.push(...pendingPlaceholderFindings(doc));
    findings.push(...m5RowFindings(doc));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
