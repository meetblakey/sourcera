/** Gate: material amendments carry an enforceable three-calendar-day source contract. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const GATE_ID = "material_amendment_three_day_notice";

const REQUIRED_TOKENS = [
  "### 4.3.4.1 RequirementAmendment",
  "`material_scope_change` requires the three-calendar-day floor",
  "`effective_at` | Timestamp",
  "`effective_at >= created_at + 3 calendar days`",
  "HTTP 422 `material_amendment_notice_below_minimum`",
  "`requirement_amendment_required`",
  "`requirement_amendment_phase_restricted`",
  "`requirement_amendment_version_conflict`",
  "`requirement_amendment_pending_conflict`",
  "`requirement_amendment_patch_forbidden`",
  "`requirement_amendment_kind`",
  "`requirement_amendment_status`",
  "POST | `/v1/workspaces/{workspace_id}/requirements/{requirement_id}/amendments`",
  "#### 32.10.9.A.1 Requirement Amendment endpoint",
  "Semantic Requirement PATCH during Phase 6–9 attempted to bypass",
  "`amendment_id`, `amendment_kind`, `effective_at`, `amendment_diff_summary`",
  "§4.3.4.1 | RequirementAmendment | 4",
  "Requirement and RequirementAmendment",
  "`material_amendment_three_day_notice` | spec_tree_lint | **`runtime_active`**",
  "tools/spec-lint/gates/material_amendment_three_day_notice.ts",
] as const;

function add(findings: Finding[], ctx: GateContext, line: number, matched: string, message: string) {
  findings.push({
    file: ctx.masterSpec.path,
    line,
    anchor: anchorForLine(ctx.masterSpec, line),
    matched_text: matched,
    message,
  });
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const phase6 = findSectionByAnchor(ctx.masterSpec, "10.6-phase-6-vendor-bidding-opens");
    if (!phase6) {
      add(findings, ctx, 0, "§10.6", "Phase 6 Amendment Protocol section is missing.");
      return findings;
    }
    const phase6Text = ctx.masterSpec.lines.slice(phase6.startLine, phase6.endLine + 1).join("\n");
    for (const token of REQUIRED_TOKENS) {
      const line = ctx.masterSpec.lines.findIndex((entry) => entry.includes(token));
      if (line < 0) add(findings, ctx, phase6.startLine, token, `Missing material-amendment contract token: ${token}`);
    }
    for (const token of [
      "`amendment_kind` is Appendix J `requirement_amendment_kind`",
      "`effective_at >= created_at + 3 calendar days`",
      "No direct Phase 6–9 PATCH bypass is allowed",
    ]) {
      if (!phase6Text.includes(token)) add(findings, ctx, phase6.startLine, token, `§10.6 lacks the enforceable material-amendment binding: ${token}`);
    }
    const stale = "Effective date: immediate or future (Workspace Owner chooses)";
    const staleLine = ctx.masterSpec.lines.findIndex((entry) => entry.includes(stale));
    if (staleLine >= 0) add(findings, ctx, staleLine, stale, "Unbounded effective-date prose bypasses the material-amendment notice floor.");
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
