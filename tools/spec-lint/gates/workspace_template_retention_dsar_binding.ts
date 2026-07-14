/**
 * Gate: `workspace_template_retention_dsar_binding`
 *
 * Assertion: WorkspaceTemplate and WorkspaceTemplateVersion bind entity-level
 * retention, DSAR sweep, cascade-class, residency, and downgrade behavior.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  m5RuntimeActiveFindings,
  requireTokens,
  sectionTextByAnchor,
} from "./workspace_template_gate_helpers.js";

function retentionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.29-workspacetemplate"), "§4.3.29", [
    "**Retention, DSAR, and residency.**",
    "§40.2",
    "§6.8.4 Pattern B",
    "§6.8.4.5 PII sweep",
    "Residency follows Organization.`data_residency_region`",
    "downgrade never deletes templates",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.30-workspacetemplateversion"), "§4.3.30", [
    "**Retention, DSAR, and residency.**",
    "Inherits parent WorkspaceTemplate retention",
    "§6.8.4.5 body-field sweep",
    "Residency follows Organization.`data_residency_region`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.8.4.3-cascade-class-coverage-registry"), "§6.8.4.3", [
    "| §4.3.29 | WorkspaceTemplate | 4 | Pattern B on `created_by`, `updated_by`; body-field sweep on `name` / `description_markdown` |",
    "| §4.3.30 | WorkspaceTemplateVersion | 4 | Pattern B on `created_by`, `updated_by`; body-field sweep on `content_snapshot_json` / `changelog_md` |",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "40.2-data-retention-and-deletion"), "§40.2", [
    "**WorkspaceTemplate / WorkspaceTemplateVersion (§4.3.29 / §4.3.30)**",
    "Soft-deleted template rows remain recoverable for 30 days",
    "Workspace.`source_workspace_template_id` / `source_workspace_template_version_id` audit replay",
    "Plan downgrade does not delete or hide rows",
    "§34.1.1 cell **Custom Templates (author / share)**",
    "template body fields are swept per §6.8.4.5",
    "Residency follows Organization.`data_residency_region`",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_retention_dsar_binding",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...retentionFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_retention_dsar_binding")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
