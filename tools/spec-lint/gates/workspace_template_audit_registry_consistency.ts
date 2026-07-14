/**
 * Gate: `workspace_template_audit_registry_consistency`
 *
 * Assertion: Template Library mutation actions and WorkspaceTemplate entities
 * are registered in Appendix J audit vocabularies.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./workspace_template_gate_helpers.js";

const ACTIONS = [
  "template.created",
  "template.metadata_updated",
  "template.update_available_received",
  "template.update_applied",
  "template.deleted",
  "template.suggestion_submitted",
  "workspace.created_from_template",
] as const;

const ENTITY_TYPES = ["workspace_template", "workspace_template_version"] as const;

export const gate: SpecLintGate = {
  id: "workspace_template_audit_registry_consistency",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "audit_registry_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const actionSection = sectionTextByTitle(doc, /^`audit_event_action_type` - §19 Template Library additions/);
    const entitySection = sectionTextByTitle(doc, /^`audit_event_entity_type` - §19 Template Library additions/);
    const bindingSection = sectionTextByAnchor(doc, "19.6.2-api-event-and-atomicity-binding");
    return [
      ...(() => {
        const findings: Finding[] = [];
        requireTokens(findings, doc, actionSection, "Appendix J §19 Template Library audit actions", [
          ...ACTIONS.map((action) => `\`${action}\``),
          "entity_type = workspace_template",
          "entity_type = workspace_template_version",
          "entity_type = workspace",
        ]);
        requireTokens(findings, doc, entitySection, "Appendix J §19 Template Library audit entity types", [
          ...ENTITY_TYPES.map((entity) => `\`${entity}\``),
          "WorkspaceTemplate (§4.3.29)",
          "WorkspaceTemplateVersion (§4.3.30)",
        ]);
        requireTokens(findings, doc, bindingSection, "§19.6.2 Template Library audit binding", [
          "Every mutation below writes exactly one AuditEvent (§4.6.1) using Appendix J `audit_event_action_type`",
          ...ACTIONS.map((action) => `\`${action}\``),
          ...["`workspace_template`", "`workspace_template_version`", "`workspace`"],
        ]);
        return findings;
      })(),
      ...m5RuntimeActiveFindings(doc, "workspace_template_audit_registry_consistency"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
