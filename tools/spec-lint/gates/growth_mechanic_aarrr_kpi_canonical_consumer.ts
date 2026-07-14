/**
 * Gate: `growth_mechanic_aarrr_kpi_canonical_consumer`
 *
 * Assertion: §48.5 owns the M1-M17 AARRR / north-star KPI registry, and each
 * mechanic body cites that registry instead of restating its metric values.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const MECHANICS = [
  ["M1", "48.5.1-m1-stakeholder-read-only-invite"],
  ["M2", "48.5.2-m2-selection-report-public-link"],
  ["M3", "48.5.3-m3-evaluation-certificate-badge"],
  ["M4", "48.5.4-m4-kick-off-next-evaluation-on-close"],
  ["M5", "48.5.5-m5-buyer-pull-vendor-invite"],
  ["M6", "48.5.6-m6-domain-based-auto-join"],
  ["M7", "48.5.7-m7-suggested-team-discovery"],
  ["M8", "48.5.8-m8-org-intelligence-value-curve"],
  ["M9", "48.6.5-m9-per-category-marketplace-landing-pages"],
  ["M10", "48.6.6-m10-how-to-evaluate-x-guides"],
  ["M11", "48.6.7-m11-software-comparison-pages"],
  ["M12", "48.6.8-m12-aggregate-market-intelligence-reports"],
  ["M13", "48.6.9-m13-public-marketplace-heat-map"],
  ["M14", "48.7.1-m14-seller-bid-success-share"],
  ["M15", "48.7.2-m15-ghost-bid-importer"],
  ["M16", "48.7.3-m16-buyer-referral-credit"],
  ["M17", "48.7.4-m17-buyer-funded-pro-trial-seat"],
] as const;

const REQUIRED_HEADER = ["Mechanic", "Description (anchor)", "AARRR Target Loop", "North-Star KPI", "Source Field"];
const REGISTRY_INTRO = "AARRR Target Loop Classification + Per-Mechanic North-Star KPI Registry";
const METADATA_INTRO = "**Growth metadata.** `aarrr_target_loop` and `north_star_kpi` are sourced from §48.5";
const INLINE_BAN = "this section MUST NOT restate the registry values inline";

function registryLine(doc: SpecDoc): number {
  for (let line = 1; line < doc.lines.length; line += 1) {
    if ((doc.lines[line] ?? "").includes(REGISTRY_INTRO)) return line;
  }
  return 0;
}

function registryFindings(doc: SpecDoc): { findings: Finding[]; kpisByMechanic: Map<string, string[]> } {
  const findings: Finding[] = [];
  const kpisByMechanic = new Map<string, string[]>();
  const line = registryLine(doc);
  if (!line) {
    push(findings, doc, 0, REGISTRY_INTRO, "§48.5 AARRR / KPI registry heading is missing.");
    return { findings, kpisByMechanic };
  }
  const section = findSectionByAnchor(doc, "48.5-m1-m8-growth-mechanics");
  const table = parseTableAt(doc, line, section?.endLine);
  const header = table.header?.cells ?? [];
  for (const token of REQUIRED_HEADER) {
    if (!header.includes(token)) push(findings, doc, table.header?.line ?? line, token, "AARRR / KPI registry table is missing a required header.");
  }
  for (const [mechanic, anchor] of MECHANICS) {
    const row = table.rows.find((candidate) => (candidate.cells[0] ?? "").includes(`**${mechanic}**`));
    if (!row) {
      push(findings, doc, line, mechanic, `AARRR / KPI registry is missing ${mechanic}.`);
      continue;
    }
    const text = row.cells.join(" | ");
    for (const token of [mechanic, anchor.split("-")[0], "`"]) {
      if (!text.includes(token)) push(findings, doc, row.line, token, `AARRR / KPI registry row ${mechanic} is missing token: ${token}`);
    }
    const kpis = [...(row.cells[3] ?? "").matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    if (kpis.length === 0) push(findings, doc, row.line, row.cells[3] ?? "", `AARRR / KPI registry row ${mechanic} is missing backticked KPI id.`);
    kpisByMechanic.set(mechanic, kpis);
  }
  return { findings, kpisByMechanic };
}

function bodyCitationFindings(doc: SpecDoc, kpisByMechanic: Map<string, string[]>): Finding[] {
  const findings: Finding[] = [];
  for (const [mechanic, anchor] of MECHANICS) {
    const section = findSectionByAnchor(doc, anchor);
    if (!section) {
      push(findings, doc, 0, anchor, `${mechanic} body section is missing.`);
      continue;
    }
    const body = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    for (const token of [METADATA_INTRO, `row **${mechanic}**`, INLINE_BAN]) {
      if (!body.includes(token)) push(findings, doc, section.startLine, token, `${mechanic} body must cite the §48.5 AARRR / KPI registry.`);
    }
    const metadataLines = new Set<number>();
    for (let line = section.startLine; line <= section.endLine; line += 1) {
      if ((doc.lines[line] ?? "").includes(METADATA_INTRO)) metadataLines.add(line);
    }
    for (const kpi of kpisByMechanic.get(mechanic) ?? []) {
      for (let line = section.startLine; line <= section.endLine; line += 1) {
        if (metadataLines.has(line)) continue;
        const text = doc.lines[line] ?? "";
        if (text.includes(kpi)) push(findings, doc, line, kpi, `${mechanic} body must not restate the registry KPI id inline.`);
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "growth_mechanic_aarrr_kpi_canonical_consumer",
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const { findings, kpisByMechanic } = registryFindings(doc);
    findings.push(...bodyCitationFindings(doc, kpisByMechanic));
    findings.push(...m5RuntimeActiveFindings(doc, "growth_mechanic_aarrr_kpi_canonical_consumer"));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
