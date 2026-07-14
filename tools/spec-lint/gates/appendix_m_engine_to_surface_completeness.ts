/**
 * Gate: `appendix_m_engine_to_surface_completeness`
 *
 * Assertion: high-risk engine concepts introduced by the current selection and
 * surface-abstraction corpus resolve to concrete Appendix M.1 mappings.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

interface MappingExpectation {
  label: string;
  conceptIncludes: string;
  specHomeIncludes: string[];
  surfaceIncludes: string[];
  tierIncludes: string[];
  forbiddenSpecHomeIncludes?: string[];
}

const EXPECTED_MAPPINGS: MappingExpectation[] = [
  {
    label: "Selection Report Draft",
    conceptIncludes: "Selection Report Draft",
    specHomeIncludes: ["§4.3.21"],
    surfaceIncludes: ["Selection Report", "Finalists"],
    tierIncludes: ["All"],
  },
  {
    label: "Selection Report",
    conceptIncludes: "Selection Report (finalized recommendation artifact)",
    specHomeIncludes: ["§4.3.23", "§10.12"],
    surfaceIncludes: ["Selection Report", "signed recommendation"],
    tierIncludes: ["All"],
  },
  {
    label: "Selection Record",
    conceptIncludes: "Selection Record (immutable closure bundle)",
    specHomeIncludes: ["§4.3.24", "§10.13"],
    surfaceIncludes: ["Final evaluation record", "Defense View source bundle"],
    tierIncludes: ["All", "Ent"],
  },
  {
    label: "Approval Workflow",
    conceptIncludes: "Approval Workflow (Phase 12 report sign-off)",
    specHomeIncludes: ["§4.3.25", "§10.12", "Appendix L.12"],
    surfaceIncludes: ["Approval", "sign-off"],
    tierIncludes: ["St", "Gr", "Sc", "Ent"],
  },
  {
    label: "Cancellation Request",
    conceptIncludes: "Cancellation Request (Workspace cancellation lifecycle)",
    specHomeIncludes: ["§4.3.26", "§10.14"],
    surfaceIncludes: ["Cancellation pending", "Recover evaluation"],
    tierIncludes: ["All"],
  },
  {
    label: "Post-Evaluation Feedback",
    conceptIncludes: "Post-Evaluation Feedback",
    specHomeIncludes: ["§4.3.27", "§10.13"],
    surfaceIncludes: ["How did this evaluation go?"],
    tierIncludes: ["All"],
  },
  {
    label: "Selection Report SHA-256 content hash",
    conceptIncludes: "Selection Report SHA-256 content hash",
    specHomeIncludes: ["§4.3.23", "§4.3.24", "§32.7"],
    surfaceIncludes: ["Verified Selection Report", "Audit Receipt"],
    tierIncludes: ["F", "Bs", "St", "Gr", "Sc", "Ent"],
    forbiddenSpecHomeIncludes: ["§4.3.21"],
  },
];

const GLOBAL_SIGNALS = [
  "Every engine concept that exists anywhere in the corpus has a corresponding row here mapping it to a surface metaphor",
  "The contract is bidirectional: the row binds the surface to the engine concept",
  "Every pull request that modifies `Sourcera_Master_Spec.md` and introduces a new engine concept MUST include a corresponding row in Appendix M (§M.1) in the same diff.",
  "The lint check enforces presence of an Appendix M row update when the PR diff introduces any of the following concept classes.",
  "| `appendix_m_engine_to_surface_completeness` | 14.2 |",
];

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

export const gate: SpecLintGate = {
  id: "appendix_m_engine_to_surface_completeness",
  sourcePhase: "14.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const section = findSectionByTitle(doc, /^M\.1 Master Surface\/Engine Mapping Table$/);
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        message: "parse_error: Appendix M.1 mapping table section not found.",
      }];
    }

    const table = parseTableAt(doc, section.startLine + 1, section.endLine);
    if (!table.header || table.rows.length === 0) {
      return [{
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        message: "parse_error: Appendix M.1 mapping table not found.",
      }];
    }

    const headers = table.header.cells.map((cell) => stripMd(cell).toLowerCase());
    const conceptIdx = headers.findIndex((h) => h === "engine concept");
    const specIdx = headers.findIndex((h) => h === "spec home");
    const surfaceIdx = headers.findIndex((h) => h === "surface metaphor");
    const tierIdx = headers.findIndex((h) => h === "tier visibility");
    if (conceptIdx < 0 || specIdx < 0 || surfaceIdx < 0 || tierIdx < 0) {
      return [{
        file: doc.path,
        line: table.header.line,
        anchor: anchorForLine(doc, table.header.line),
        message: "parse_error: Appendix M.1 table is missing Engine concept, Spec home, Surface metaphor, or Tier visibility columns.",
      }];
    }

    for (const expectation of EXPECTED_MAPPINGS) {
      const row = table.rows.find((candidate) => stripMd(candidate.cells[conceptIdx] ?? "").includes(expectation.conceptIncludes));
      if (!row) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: expectation.conceptIncludes,
          message: `Appendix M.1 is missing required surface/engine mapping for ${expectation.label}.`,
        });
        continue;
      }

      const specHome = stripMd(row.cells[specIdx] ?? "");
      const surface = stripMd(row.cells[surfaceIdx] ?? "");
      const tier = stripMd(row.cells[tierIdx] ?? "");

      for (const signal of expectation.specHomeIncludes) {
        if (!specHome.includes(signal)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: specHome,
            message: `${expectation.label} Appendix M.1 row must cite ${signal} in Spec home.`,
          });
        }
      }
      for (const signal of expectation.surfaceIncludes) {
        if (!surface.includes(signal)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: surface,
            message: `${expectation.label} Appendix M.1 row must bind to the user-facing surface signal "${signal}".`,
          });
        }
      }
      for (const signal of expectation.tierIncludes) {
        if (!tier.includes(signal)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: tier,
            message: `${expectation.label} Appendix M.1 row must carry Tier visibility signal "${signal}".`,
          });
        }
      }
      for (const forbidden of expectation.forbiddenSpecHomeIncludes ?? []) {
        if (specHome.includes(forbidden)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: anchorForLine(doc, row.line),
            matched_text: specHome,
            message: `${expectation.label} Appendix M.1 row must not cite stale Spec home ${forbidden}.`,
          });
        }
      }
    }

    for (const signal of GLOBAL_SIGNALS) {
      const line = doc.lines.findIndex((candidate) => candidate.includes(signal));
      if (line < 0) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: signal,
          message: `Missing Appendix M completeness doctrine signal "${signal}".`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
