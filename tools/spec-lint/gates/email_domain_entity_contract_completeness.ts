/**
 * Gate: `email_domain_entity_contract_completeness`
 *
 * Assertion: §4.9.1 through §4.9.5 carry production entity contracts:
 * field table, scope isolation, indexes, retention / DSAR / residency, and
 * state machines where the entity has lifecycle state.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  fieldNames,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionText,
  tableRows,
} from "./email_domain_gate_helpers.js";

const ENTITIES = [
  {
    anchor: "4.9.1-emailtemplate",
    label: "§4.9.1 EmailTemplate",
    fields: ["id", "org_id", "console", "template_key", "email_kind", "email_category", "opt_out_class", "loops_template_id", "sender_address", "reply_to_policy", "status", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"],
    stateMachine: true,
  },
  {
    anchor: "4.9.2-emailsend",
    label: "§4.9.2 EmailSend",
    fields: ["id", "org_id", "console", "email_template_id", "email_kind", "email_category", "opt_out_class", "recipient_user_id", "recipient_email_hash", "status", "failure_reason", "provider_message_id", "idempotency_key", "data_residency_region", "queued_at", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"],
    stateMachine: true,
  },
  {
    anchor: "4.9.3-emailevent",
    label: "§4.9.3 EmailEvent",
    fields: ["id", "org_id", "console", "email_send_id", "provider_event_id", "provider_event_type", "email_event_kind", "event_received_at", "raw_event_hash", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"],
    stateMachine: false,
  },
  {
    anchor: "4.9.4-suppressionlistentry",
    label: "§4.9.4 SuppressionListEntry",
    fields: ["id", "org_id", "console", "subject_kind", "subject_value_hash", "reason_code", "source", "effective_at", "expires_at", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"],
    stateMachine: false,
  },
  {
    anchor: "4.9.5-unsubscribepreference",
    label: "§4.9.5 UnsubscribePreference",
    fields: ["id", "org_id", "console", "user_id", "recipient_email_hash", "email_category", "opt_out_class", "preference_state", "source", "effective_at", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"],
    stateMachine: true,
  },
] as const;

function entityContractFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const entity of ENTITIES) {
    const section = sectionText(doc, entity.anchor);
    if (!section) {
      push(findings, doc, 0, entity.anchor, `${entity.label} section is missing.`);
      continue;
    }
    const table = tableRows(doc, entity.anchor);
    if (!table?.header || table.header.cells.join("|") !== "Field|Type|Constraints|Notes") {
      push(findings, doc, section.startLine, "Field | Type | Constraints | Notes", `${entity.label} must carry a production field table.`);
    }
    const names = fieldNames(doc, entity.anchor);
    for (const field of entity.fields) {
      if (!names.includes(field)) {
        push(findings, doc, section.startLine, field, `${entity.label} is missing required field ${field}.`);
      }
    }
    requireTokens(findings, doc, entity.anchor, entity.label, [
      "**Scope Isolation.**",
      "**Required indexes.**",
      "**Retention, DSAR, and residency.**",
    ]);
    if (entity.stateMachine && !section.text.includes("**State Machine.**")) {
      push(findings, doc, section.startLine, "State Machine", `${entity.label} has lifecycle state and must carry a state-machine table.`);
    }
    if (!section.text.includes("§40.2") || !section.text.includes("§6.8")) {
      push(findings, doc, section.startLine, "§40.2 / §6.8", `${entity.label} must bind retention and DSAR to the canonical sections.`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "email_domain_entity_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 41",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...entityContractFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "email_domain_entity_contract_completeness")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
