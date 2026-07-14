/**
 * Gate: `pipeline_surface_compression_no_separate_seller_phase_counter`
 *
 * Assertion: Seller pipeline rendering is a projection of the bound buyer
 * Workspace `pipeline_stage_id`; no seller-specific phase field or counter is
 * allowed in the spec or UX contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, fenceMask } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const FORBIDDEN_IDENTIFIER_RE =
  /\b(?:seller_phase_id|seller_phase_number|seller_phase_counter|seller_pipeline_stage_id|seller_pipeline_phase|bid_phase_counter|bid_phase_number|bid_workspace_phase_counter|sellerPhaseId|sellerPhaseNumber|sellerPhaseCounter|sellerPipelineStageId|sellerPipelinePhase|bidPhaseCounter|bidPhaseNumber|bidWorkspacePhaseCounter)\b/;

function sectionTextByAnchor(doc: SpecDoc, anchor: string): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function sectionTextByTitle(doc: SpecDoc, title: RegExp): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function requireTokens(
  doc: SpecDoc,
  section: { text: string; line: number; anchor?: string } | null,
  label: string,
  tokens: string[],
): Finding[] {
  if (!section) {
    return [{ file: doc.path, line: 0, anchor: label, message: `${label} section is missing.` }];
  }
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing seller-phase-counter invariant text: ${token}`,
      });
    }
  }
  return findings;
}

function forbiddenIdentifierFindings(doc: SpecDoc): Finding[] {
  const mask = fenceMask(doc);
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    if (mask[line]) continue;
    const text = doc.lines[line] ?? "";
    if (text.includes("pipeline_surface_compression_no_separate_seller_phase_counter")) continue;
    const match = FORBIDDEN_IDENTIFIER_RE.exec(text);
    if (!match) continue;
    findings.push({
      file: doc.path,
      line,
      anchor: anchorForLine(doc, line),
      matched_text: match[0],
      message: `${match[0]} is a seller-specific phase/counter identifier. Seller surfaces must read the bound buyer Workspace pipeline_stage_id projection instead.`,
    });
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "pipeline_surface_compression_no_separate_seller_phase_counter",
  sourcePhase: "14.6",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    findings.push(...forbiddenIdentifierFindings(doc));
    if (ctx.uxSpec) findings.push(...forbiddenIdentifierFindings(ctx.uxSpec));
    else findings.push({
      file: "UX_Design_of_Sourcera.md",
      line: 0,
      message: "parse_error: UX spec input is required for seller phase-counter validation.",
    });

    findings.push(...requireTokens(doc, sectionTextByAnchor(doc, "3.14-pipeline-surface-compression"), "§3.14 Pipeline Surface Compression", [
      "The seller does not have a separately-numbered 13-phase engine pipeline",
      "Engineering should not implement a separate seller-side phase counter",
      "`pipeline_stage_id` field on the bound buyer Workspace is the single source of truth",
      "seller's compressed surface reads it via the §25 Console Bridge",
      "**`pipeline_surface_compression_no_separate_seller_phase_counter`.** No engine code path may introduce a seller-specific phase counter distinct from the bound buyer Workspace's `pipeline_stage_id`.",
    ]));

    findings.push(...requireTokens(doc, sectionTextByAnchor(doc, "22.19-seller-compressed-surface-mapping"), "§22.19 Seller Compressed Surface Mapping", [
      "The seller side does not have a separately-numbered 13-phase engine pipeline.",
      "reads the buyer's `pipeline_stage_id` via the Console Bridge (§4.7.1, §25)",
      "No engine code path may introduce a seller-specific phase counter distinct from the bound buyer Workspace's `pipeline_stage_id`.",
      "CI gate `pipeline_surface_compression_no_separate_seller_phase_counter` (§3.14.4) asserts.",
    ]));

    if (ctx.uxSpec) {
      findings.push(...requireTokens(ctx.uxSpec, sectionTextByTitle(ctx.uxSpec, /^5\.2\.19 PipelineSurface$/), "UX §5.2.19 PipelineSurface", [
        "`currentPhase` (integer 1–13): the engine `pipeline_stage_id`.",
        "Compute its own phase counter or read any field other than `currentPhase` to determine state. (Honors `pipeline_surface_compression_no_separate_seller_phase_counter`.)",
        "| Seller | n/a (field is Buyer-only per §2.8.6) | `solo` (4-step Seller bar) | Master Spec §3.14.2 / §22.19.1 |",
      ]));
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
