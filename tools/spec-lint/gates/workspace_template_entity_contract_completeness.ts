/**
 * Gate: `workspace_template_entity_contract_completeness`
 *
 * Assertion: §19 Template Library resolves to WorkspaceTemplate and
 * WorkspaceTemplateVersion production entity contracts, including source
 * version FKs on Workspace.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  fieldNamesByAnchor,
  fieldNamesByTitle,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
  tableRowsByAnchor,
} from "./workspace_template_gate_helpers.js";

const ENTITIES = [
  {
    anchor: "4.3.29-workspacetemplate",
    label: "§4.3.29 WorkspaceTemplate",
    fields: [
      "id",
      "org_id",
      "console",
      "source",
      "template_library_entry_id",
      "current_version_id",
      "name",
      "description_markdown",
      "kind",
      "category",
      "icon_token",
      "color_token",
      "update_state",
      "latest_available_version_label",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    stateMachine: false,
  },
  {
    anchor: "4.3.30-workspacetemplateversion",
    label: "§4.3.30 WorkspaceTemplateVersion",
    fields: [
      "id",
      "org_id",
      "console",
      "template_id",
      "version_label",
      "version_bump_kind",
      "status",
      "source_version_id",
      "superseded_by_version_id",
      "content_snapshot_json",
      "changelog_md",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    stateMachine: true,
  },
] as const;

function entityFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const entity of ENTITIES) {
    const section = sectionTextByAnchor(doc, entity.anchor);
    if (!section) {
      push(findings, doc, 0, entity.anchor, `${entity.label} section is missing.`);
      continue;
    }
    const table = tableRowsByAnchor(doc, entity.anchor);
    if (!table?.header || table.header.cells.join("|") !== "Field|Type|Constraints|Notes") {
      push(findings, doc, section.startLine, "Field | Type | Constraints | Notes", `${entity.label} must carry a production field table.`);
    }
    const fields = fieldNamesByAnchor(doc, entity.anchor);
    for (const field of entity.fields) {
      if (!fields.includes(field)) {
        push(findings, doc, section.startLine, field, `${entity.label} is missing required field ${field}.`);
      }
    }
    requireTokens(findings, doc, section, entity.label, [
      "**Scope isolation.**",
      "**Required indexes.**",
      "**Retention, DSAR, and residency.**",
      "**Acceptance criteria.**",
      "§40.2",
      "§6.8.4",
      "Organization.`data_residency_region`",
    ]);
    if (entity.stateMachine && !section.text.includes("**State machine.**")) {
      push(findings, doc, section.startLine, "State machine", `${entity.label} has lifecycle state and must carry a state-machine table.`);
    }
  }
  return findings;
}

function workspaceSourceFkFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const fields = fieldNamesByTitle(doc, "4.3.1 Workspace (Console-Scoped, Buyer)");
  for (const field of ["source_workspace_template_id", "source_workspace_template_version_id"]) {
    if (!fields.includes(field)) {
      push(findings, doc, 0, field, `§4.3.1 Workspace is missing source-template FK field ${field}.`);
    }
  }
  return findings;
}

function templateSectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.7-template-design-framework"), "§2.7", [
    "Templates authored under this framework are stored and versioned through §19 Template Library using WorkspaceTemplate (§4.3.29) and WorkspaceTemplateVersion (§4.3.30).",
    "Use Sourcera's Template Builder to auto-generate RFP from requirements.",
    "Applying a new Sourcera-provided RFI / RFP / Use Case Bundle version MUST follow §19.2.2",
    "existing Workspaces remain pinned to their original WorkspaceTemplateVersion",
    "only newly-created Workspaces or explicit Apply Update flows consume the new version.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.1-overview"), "§19.1", [
    "WorkspaceTemplate (§4.3.29)",
    "WorkspaceTemplateVersion (§4.3.30)",
    "TemplateLibraryEntry (§4.4.28) is the separate marketplace-domain template concept",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.1.1-console-scoping"), "§19.1.1", [
    "buyer-console scoped",
    "Seller-console users have no access to the §19 Template Library",
    "seller-console reads return HTTP 404",
    "not direct sharing of WorkspaceTemplate rows",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.5-template-to-workspace-flow"), "§19.5", [
    "Workspace.`source_workspace_template_id`",
    "Workspace.`source_workspace_template_version_id`",
    "The Workspace is a snapshot",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_entity_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...entityFindings(ctx.masterSpec),
      ...workspaceSourceFkFindings(ctx.masterSpec),
      ...templateSectionFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_entity_contract_completeness"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
