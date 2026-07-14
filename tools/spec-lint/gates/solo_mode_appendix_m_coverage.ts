/**
 * Gate: `solo_mode_appendix_m_coverage`
 *
 * Assertion: Appendix M.1 carries the Solo-mode suppression / opt-in posture
 * for the team-oriented surfaces named by §2.8.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

interface TargetRow {
  label: string;
  conceptIncludes: string;
  specHomeIncludes: string;
  allowedTierSignals: RegExp[];
  requiredSurfaceSignals: RegExp[];
}

const TARGET_ROWS: TargetRow[] = [
  {
    label: "Stakeholder Cohorts",
    conceptIncludes: "Stakeholder Cohorts",
    specHomeIncludes: "§2.8.5",
    allowedTierSignals: [/surface-suppressed/i],
    requiredSurfaceSignals: [/Solo Mode: surface suppressed/i],
  },
  {
    label: "Pulse Inbox",
    conceptIncludes: "Pulse Inbox + InboxItem + Inbox Item Group",
    specHomeIncludes: "§20.2",
    allowedTierSignals: [/surface-suppressed/i],
    requiredSurfaceSignals: [/What to do this week/i],
  },
  {
    label: "Pulse Health Score",
    conceptIncludes: "Pulse Health Score",
    specHomeIncludes: "§20.3",
    allowedTierSignals: [/surface-suppressed/i],
    requiredSurfaceSignals: [/per-component breakdown/i],
  },
  {
    label: "Pulse Digest Email",
    conceptIncludes: "Pulse Digest Email",
    specHomeIncludes: "§20.4",
    allowedTierSignals: [/Solo/i, /opt-in/i],
    requiredSurfaceSignals: [/default-suppressed/i, /opt-in/i],
  },
  {
    label: "SLA Timers",
    conceptIncludes: "SLA Timers",
    specHomeIncludes: "§8.4",
    allowedTierSignals: [/surface-suppressed/i],
    requiredSurfaceSignals: [/deadline countdown/i],
  },
];

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

export const gate: SpecLintGate = {
  id: "solo_mode_appendix_m_coverage",
  sourcePhase: "14.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
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

    const findings: Finding[] = [];
    for (const target of TARGET_ROWS) {
      const row = table.rows.find((candidate) => {
        const concept = stripMd(candidate.cells[conceptIdx] ?? "");
        const specHome = stripMd(candidate.cells[specIdx] ?? "");
        return concept.includes(target.conceptIncludes) && specHome.includes(target.specHomeIncludes);
      });
      if (!row) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: target.label,
          message: `Appendix M.1 is missing the Solo-mode coverage row for ${target.label}.`,
        });
        continue;
      }

      const surface = stripMd(row.cells[surfaceIdx] ?? "");
      const tier = stripMd(row.cells[tierIdx] ?? "");
      if (!target.allowedTierSignals.every((re) => re.test(tier))) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: tier,
          message: `${target.label} Tier visibility must carry the Solo-mode suppression / opt-in annotation required by §2.8.`,
        });
      }
      if (!target.requiredSurfaceSignals.every((re) => re.test(surface))) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: surface,
          message: `${target.label} Surface metaphor must describe the Solo-mode suppression or replacement surface required by §2.8.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
