/**
 * Gate: `workspace_template_enum_registration_consistency`
 *
 * Assertion: WorkspaceTemplate enum vocabularies used by §2.7, §4.3.29,
 * §4.3.30, and §19 are registered in Appendix J and cited by rendering prose.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  enumValuesInSection,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
  sectionTextByTitle,
} from "./workspace_template_gate_helpers.js";

const ENUMS = [
  { title: /^`workspace_template_source`/, label: "workspace_template_source", values: ["sourcera_provided", "org_custom"] },
  { title: /^`workspace_template_category`/, label: "workspace_template_category", values: ["security", "compliance", "operations", "cloud_infrastructure", "data_privacy", "finance_billing", "customer_support", "integration_api", "custom"] },
  { title: /^`workspace_template_kind`/, label: "workspace_template_kind", values: ["use_case_bundle", "rfi", "rfp"] },
  { title: /^`workspace_template_update_state`/, label: "workspace_template_update_state", values: ["current", "update_available", "update_applied", "update_dismissed"] },
  { title: /^`workspace_template_version_bump_kind`/, label: "workspace_template_version_bump_kind", values: ["patch", "minor", "major"] },
  { title: /^`workspace_template_version_status`/, label: "workspace_template_version_status", values: ["active", "superseded", "deprecated"] },
] as const;

function enumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const item of ENUMS) {
    const section = sectionTextByTitle(doc, item.title);
    if (!section) {
      push(findings, doc, 0, item.label, `Appendix J enum section ${item.label} is missing.`);
      continue;
    }
    const values = enumValuesInSection(doc, item.title);
    for (const value of item.values) {
      if (!values.has(value)) {
        push(findings, doc, section.startLine, value, `Appendix J enum ${item.label} is missing required value ${value}.`);
      }
    }
  }
  return findings;
}

function consumerFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.29-workspacetemplate"), "§4.3.29", [
    "Appendix J `workspace_template_source`",
    "Appendix J `workspace_template_kind`",
    "Appendix J `workspace_template_category`",
    "Appendix J `workspace_template_update_state`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.30-workspacetemplateversion"), "§4.3.30", [
    "Appendix J `workspace_template_version_bump_kind`",
    "Appendix J `workspace_template_version_status`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.7-template-design-framework"), "§2.7", [
    "WorkspaceTemplate.`kind`",
    "Appendix J `workspace_template_kind`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.2-sourcera-provided-templates"), "§19.2", [
    "Appendix J `workspace_template_kind`",
    "Appendix J `workspace_template_category`",
    "version_bump_kind",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "19.4-template-library-ui"), "§19.4", [
    "Appendix J `workspace_template_kind` display label",
    "Appendix J `workspace_template_source`",
    "Appendix J `workspace_template_source` and `workspace_template_category` display labels",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "workspace_template_enum_registration_consistency",
  sourcePhase: "v7.2.0-REM Phase 4.10",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...enumFindings(ctx.masterSpec),
      ...consumerFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "workspace_template_enum_registration_consistency"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
