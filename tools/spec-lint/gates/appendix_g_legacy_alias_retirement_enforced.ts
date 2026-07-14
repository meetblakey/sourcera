/** Local pr_lint half of the Appendix G legacy-alias retirement gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { computeSectionRanges, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "appendix_g_legacy_alias_retirement_enforced";
const ALIASES = new Map([
  ["seller_onboarding_conversion_moment_recorded", "seller_onboarding_conversion_moment_fired"],
  ["stake_reveal_displayed", "stake_reveal_rendered"],
  ["stake_reveal_dismissed", "stake_reveal_navigated_away"],
  ["hero_moment_first_pass_response_submitted", "seller_onboarding_first_requirement_response"],
  ["seller_invite_pre_arrival_dispatched", "seller_invite_pre_arrival_enrichment_started"],
  ["seller_invite_pre_arrival_failed", "seller_invite_pre_arrival_enrichment_failed"],
]);

function unquote(value: string): string {
  return value.replace(/`/g, "").trim();
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const marker = findLine(doc, (line) => line.includes("Alias-retirement enforcement."));
  if (!marker) {
    push(findings, doc, 0, "Alias-retirement enforcement", "Appendix G alias-retirement contract is missing.");
    return findings;
  }
  for (const token of [
    "six legacy alias names",
    "Production emitters MUST NOT emit them",
    "PostHog dashboards MUST NOT consume them",
    "usage_analytics_alias_retirement_overdue",
  ]) {
    if (!marker.text.includes(token)) push(findings, doc, marker.line, token, `Alias-retirement contract is missing token: ${token}`);
  }
  const table = parseTableAt(doc, marker.line + 1);
  const rows = new Map(table.rows.map((row) => [unquote(row.cells[0] ?? ""), { replacement: unquote(row.cells[1] ?? ""), timeline: row.cells[2] ?? "", line: row.line }]));
  for (const [alias, replacement] of ALIASES) {
    const row = rows.get(alias);
    if (!row || row.replacement !== replacement || !/retired at v7\.1\.0/i.test(row.timeline)) {
      push(findings, doc, row?.line ?? marker.line, alias, `Legacy alias ${alias} must map to ${replacement} and be retired at v7.1.0.`);
    }
  }
  if (rows.size !== ALIASES.size) push(findings, doc, marker.line, String(rows.size), `Alias-retirement table must contain exactly ${ALIASES.size} legacy rows.`);

  const overdue = findLine(
    doc,
    (line) =>
      line.trim().startsWith("| `usage_analytics_alias_retirement_overdue` |") &&
      line.includes("retired_alias_name") &&
      line.includes("canonical_event_name"),
  );
  if (!overdue || !overdue.text.includes("retired_alias_name") || !overdue.text.includes("canonical_event_name")) {
    push(findings, doc, overdue?.line ?? 0, "usage_analytics_alias_retirement_overdue", "Alias-retirement overdue event must register retired and canonical event names.");
  }

  for (const section of computeSectionRanges(doc).filter((range) => /^51\.[345](?:\.|\s)/.test(range.heading.title))) {
    for (let line = section.startLine + 1; line <= section.endLine; line += 1) {
      const text = doc.lines[line] ?? "";
      for (const alias of ALIASES.keys()) {
        if (text.includes(`\`${alias}\``)) push(findings, doc, line, alias, `Legacy alias ${alias} is consumed by an active dashboard section.`);
      }
    }
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "runtime emitter and dashboard-query evidence",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 9.1",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
