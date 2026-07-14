/**
 * Gate: `solo_capability_registry_field_registration`
 *
 * Assertion: the Solo surface-treatment fields are registered on
 * CapabilityRegistryEntry, bound to Appendix J enum values, and cross-linked to
 * §44.6.4.1 / §44.6.8 acceptance criteria.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  findSectionByAnchor,
  findSectionByTitle,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionText {
  line: number;
  text: string;
  anchor?: string;
}

function sectionByAnchor(doc: SpecDoc, anchor: string): SectionText | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    anchor: section.heading.anchor,
  };
}

function sectionByTitle(doc: SpecDoc, titleMatch: string | RegExp): SectionText | null {
  const section = findSectionByTitle(doc, titleMatch);
  if (!section) return null;
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function stripBackticks(value: string): string {
  return value.trim().replace(/^`|`$/g, "");
}

function requireTokens(
  doc: SpecDoc,
  section: SectionText | null,
  label: string,
  tokens: string[],
): Finding[] {
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    }];
  }
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing Solo CapabilityRegistryEntry binding: ${token}`,
      });
    }
  }
  return findings;
}

function requireFieldRow(
  doc: SpecDoc,
  rowsByField: Map<string, { cells: string[]; line: number }>,
  field: string,
  tokens: string[],
): Finding[] {
  const row = rowsByField.get(field);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: field,
      message: `§4.8.2 CapabilityRegistryEntry field table is missing ${field}.`,
    }];
  }
  const joined = row.cells.join(" | ");
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!joined.includes(token)) {
      findings.push({
        file: doc.path,
        line: row.line,
        matched_text: token,
        message: `${field} row is missing required registration detail: ${token}`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "solo_capability_registry_field_registration",
  sourcePhase: "14.10",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const capabilityRegistry = findSectionByAnchor(doc, "4.8.2-capabilityregistryentry");
    if (!capabilityRegistry) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "4.8.2-capabilityregistryentry",
        message: "§4.8.2 CapabilityRegistryEntry section is missing.",
      }];
    }

    const table = parseTableAt(doc, capabilityRegistry.startLine, capabilityRegistry.endLine);
    const rowsByField = new Map(
      table.rows.map((row) => [stripBackticks(row.cells[0] ?? ""), row]),
    );

    findings.push(...requireFieldRow(doc, rowsByField, "surface_throttling_class", [
      "Enum",
      "See Appendix J `surface_throttling_class`",
      "`active_workflow`",
      "`low_priority_background`",
      "`never_throttle`",
      "Default `active_workflow`",
      "§44.6.4.1",
      "Internal-only attribute; never surfaced",
      "low_priority_background_solo_throttling_membership_canonical",
    ]));

    findings.push(...requireFieldRow(doc, rowsByField, "solo_envelope_override_value_cents", [
      "Integer",
      "Nullable; ≥ 0",
      "Per-capability override",
      "Internal-only; never surfaced",
      "ops_finance_admin",
      "solo_envelope_throttling_threshold_out_of_range",
    ]));

    findings.push(...requireFieldRow(doc, rowsByField, "solo_envelope_no_block", [
      "Boolean",
      "Default `false`",
      "MUST NOT be silently throttled",
      "first_pass_rfp_draft",
      "engine-side only; never surfaced",
      "Schema-validation test `solo_capability_registry_field_registration`",
    ]));

    const section482 = sectionByAnchor(doc, "4.8.2-capabilityregistryentry");
    findings.push(...requireTokens(doc, section482, "§4.8.2 CapabilityRegistryEntry", [
      "8. **Solo-tier surface treatment fields (Phase 14.10 / 14.10.1).**",
      "Every `CapabilityRegistryEntry` MUST carry `surface_throttling_class`, `solo_envelope_override_value_cents`, and `solo_envelope_no_block` per §44.6.4.1.",
      "Schema-validation test `solo_capability_registry_field_registration` (§M.4 catalog; §44.6.8 #17) asserts presence of each field.",
      "`surface_throttling_class` MUST be one of the three Appendix J enum values",
      "HTTP 422 `solo_envelope_throttling_threshold_out_of_range`",
    ]));

    const section44641 = sectionByTitle(doc, /^44\.6\.4\.1\b/);
    findings.push(...requireTokens(doc, section44641, "§44.6.4.1 surface_throttling_class", [
      "| `surface_throttling_class` | Enum | See Appendix J `surface_throttling_class`",
      "| `solo_envelope_override_value_cents` | Integer | Nullable; ≥ 0 |",
      "| `solo_envelope_no_block` | Boolean | Default false |",
      "Appendix J registration: `surface_throttling_class` enum values are `active_workflow`, `low_priority_background`, `never_throttle`.",
      "§21.4.6 is the canonical §4.8.2-shape authority",
      "ctx.db.capabilityRegistryEntry(capabilityId)",
    ]));

    const section4468 = sectionByAnchor(doc, "44.6.8-acceptance-criteria");
    findings.push(...requireTokens(doc, section4468, "§44.6.8 Acceptance Criteria", [
      "17. **`solo_capability_registry_field_registration`.**",
      "The §4.8.2 CapabilityRegistryEntry MUST carry `surface_throttling_class`, `solo_envelope_override_value_cents`, and `solo_envelope_no_block` as defined in §44.6.4.1.",
      "Schema-validation test on the CapabilityRegistryEntry table asserts.",
    ]));

    const appendixJ = sectionByTitle(doc, /^Surface Throttling Class\b/);
    findings.push(...requireTokens(doc, appendixJ, "Appendix J Surface Throttling Class", [
      "### Surface Throttling Class (§4.8.2, §44.6.4.1)",
      "`active_workflow`",
      "`low_priority_background`",
      "`never_throttle`",
    ]));

    const appendixM = sectionByAnchor(doc, "appendix-m-surface-engine-mapping");
    findings.push(...requireTokens(doc, appendixM, "Appendix M solo capability registry row", [
      "| `solo_capability_registry_field_registration` | 14.10 |",
      "The `CapabilityRegistryEntry` table MUST carry `surface_throttling_class`, `solo_envelope_override_value_cents`, and `solo_envelope_no_block`",
      "§44.6.8 #17, §4.8.2 #8.",
    ]));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
