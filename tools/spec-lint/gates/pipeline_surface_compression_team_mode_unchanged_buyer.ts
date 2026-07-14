/**
 * Gate: `pipeline_surface_compression_team_mode_unchanged_buyer`
 *
 * Assertion: Buyer Team Mode keeps the 13-phase chip ribbon and never renders
 * the four-step compressed bar.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const MASTER_ANCHOR = "3.14-pipeline-surface-compression";
const UX_TITLE_RE = /^5\.2\.19 PipelineSurface$/;

const MASTER_REQUIRED = [
  "the four-step bar renders when `evaluation_owner_mode=solo`, the full 13-phase chip ribbon (§3.3.1, Appendix M) renders when `evaluation_owner_mode=team`",
  "**`pipeline_surface_compression_team_mode_unchanged_buyer`.** The Buyer Team-Mode 13-phase chip ribbon (§3.3.1) is unchanged by Phase 14.6. Team-Mode rendering MUST NOT pick up the four-step bar under any plan tier.",
  "Buyer Team render MUST show the 13-phase chip ribbon and MUST NOT render the four-step compressed bar.",
];

const UX_REQUIRED = [
  "| Buyer | `team` | `team` (13-phase chip ribbon) | Master Spec §3.3.1 |",
  "**Behavior — `team` state (Buyer only):**",
  "**Render.** Twelve chips left-to-right",
  "Render the four-step bar when `mode=team`. (Honors `pipeline_surface_compression_team_mode_unchanged_buyer`.)",
  "PipelineSurface renders in `team` state when `Workspace.evaluation_owner_mode=team`. 13-phase chip ribbon shows all twelve chips (Phase 4 + 5 share one). Four-step bar MUST NOT render.",
];

function sectionText(doc: SpecDoc, anchorOrTitle: string | RegExp): { line: number; text: string } | null {
  const section = typeof anchorOrTitle === "string"
    ? findSectionByAnchor(doc, anchorOrTitle)
    : findSectionByTitle(doc, anchorOrTitle);
  if (!section) return null;
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

export const gate: SpecLintGate = {
  id: "pipeline_surface_compression_team_mode_unchanged_buyer",
  sourcePhase: "14.6",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const master = ctx.masterSpec;
    const ux = ctx.uxSpec;
    const findings: Finding[] = [];

    const masterSection = sectionText(master, MASTER_ANCHOR);
    if (!masterSection) {
      findings.push({
        file: master.path,
        line: 0,
        anchor: MASTER_ANCHOR,
        message: "§3.14 Pipeline Surface Compression section is missing.",
      });
    } else {
      for (const required of MASTER_REQUIRED) {
        if (!masterSection.text.includes(required)) {
          findings.push({
            file: master.path,
            line: masterSection.line,
            anchor: MASTER_ANCHOR,
            matched_text: required,
            message: `§3.14 is missing Buyer Team-mode chip-ribbon invariant text: ${required}`,
          });
        }
      }
    }

    if (!ux) {
      findings.push({
        file: "UX_Design_of_Sourcera.md",
        line: 0,
        message: "parse_error: UX spec input is required for PipelineSurface Team-mode validation.",
      });
      return findings;
    }

    const uxSection = sectionText(ux, UX_TITLE_RE);
    if (!uxSection) {
      findings.push({
        file: ux.path,
        line: 0,
        message: "UX §5.2.19 PipelineSurface section is missing.",
      });
    } else {
      for (const required of UX_REQUIRED) {
        if (!uxSection.text.includes(required)) {
          findings.push({
            file: ux.path,
            line: uxSection.line,
            matched_text: required,
            message: `UX §5.2.19 is missing Buyer Team-mode chip-ribbon invariant text: ${required}`,
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
