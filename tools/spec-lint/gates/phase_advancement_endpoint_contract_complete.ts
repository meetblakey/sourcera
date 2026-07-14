/**
 * Gate: `phase_advancement_endpoint_contract_complete`
 *
 * Assertion: §10.16 carries the complete Phase Advancement endpoint contract
 * required by the V8.1 remediation row.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const ANCHOR = "10.16-phase-advancement-api";

const REQUIRED_TEXTS = [
  "POST /v1/workspaces/{workspace_id}/advance",
  "Authorization: Bearer {access_token}",
  "Idempotency-Key: {client-generated UUID per §32.3 idempotency convention; required on every mutation per §32 conventions}",
  "X-Sourcera-Console: buyer",
  "**Auth scope (§32 / §6.6.3 canonical scope axis):** `write:workspaces`",
  "**Rate-limit class (§32.4.5):** `data_mutation`",
  "**Cursor pagination:** n/a (single-resource mutation).",
  "**Request body schema:**",
  "**Response (success — 200 OK):**",
  "**Response (idempotent no-op — 200 OK; already at target phase):**",
  "**Response (Solo soft-gate skip — 200 OK with warnings):**",
  "**Response (Gate Failure — 422 Unprocessable Entity; team-mode hard-gate):**",
  "**Error codes (registered in Appendix I; D-4.2-003 closure):**",
  "The endpoint is idempotent on two axes per §32.3 idempotency convention:",
  "Each advancement is logged to §4.6.1 AuditEvent:",
  "The audit row also emits a §4.7.1 Console Bridge Event projection `phase_advanced`",
  "The `workspace.phase_advanced` webhook event (§31; Appendix C transactional events) fires on every successful phase advancement",
  "### 10.16.6 Acceptance Criteria",
];

const REQUIRED_ERROR_ROWS = [
  "| 400 | `pipeline_phase_invalid_enum_value` |",
  "| 401 | `unauthenticated` |",
  "| 403 | `workspace_role_insufficient_for_phase_advance` |",
  "| 404 | `workspace_not_found` |",
  "| 409 | `phase_advancement_concurrent_request_in_flight` |",
  "| 422 | `gate_validation_failed` |",
  "| 422 | `phase_advancement_soft_gates_not_permitted_in_team_mode` |",
  "| 422 | `phase_6_bidding_close_below_minimum_window` |",
  "| 422 | `phase_advancement_backward_transition_forbidden` |",
  "| 422 | `phase_advancement_terminal_phase_no_advance` |",
  "| 503 | `phase_advancement_dependency_unavailable` |",
];

export const gate: SpecLintGate = {
  id: "phase_advancement_endpoint_contract_complete",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, ANCHOR);
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: ANCHOR,
        message: "§10.16 Phase Advancement API section is missing.",
      }];
    }

    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    const findings: Finding[] = [];
    for (const required of [...REQUIRED_TEXTS, ...REQUIRED_ERROR_ROWS]) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: ANCHOR,
          matched_text: required,
          message: `§10.16 endpoint contract is missing required binding: ${required}`,
        });
      }
    }

    const acMatches = text.match(/^\d+\.\s+/gm) ?? [];
    if (acMatches.length < 9) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: ANCHOR,
        message: "§10.16.6 must contain numbered acceptance criteria covering the endpoint contract.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
