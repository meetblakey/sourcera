/**
 * Gate: `phase_advancement_endpoint_path_canonical`
 *
 * Assertion: the active Phase Advancement REST path is exactly
 * `POST /v1/workspaces/{workspace_id}/advance`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const CANONICAL = "POST /v1/workspaces/{workspace_id}/advance";
const LEGACY_ADVANCE_PHASE = /POST\s+\/workspaces\/:workspaceId\/advance-phase/;
const LEGACY_PHASE_PATH = /POST\s+`?\/v1\/workspaces\/\{(?:id|workspace_id)\}\/phase`?/;
const HISTORICAL_ALLOW_RE = /\b(?:retired|historical-only|Pre-V4|legacy|may appear only)\b/i;

const REQUIRED_TEXTS = [
  "The §32-canonical endpoint is `POST /v1/workspaces/{workspace_id}/advance`",
  "POST /v1/workspaces/{workspace_id}/advance",
  "| POST | `/v1/workspaces/{workspace_id}/advance` | §10.16 request |",
];

export const gate: SpecLintGate = {
  id: "phase_advancement_endpoint_path_canonical",
  sourcePhase: "V8.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const required of REQUIRED_TEXTS) {
      if (!doc.text.includes(required)) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: required,
          message: `Missing active Phase Advancement canonical path binding: ${required}`,
        });
      }
    }

    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo] ?? "";
      if (LEGACY_ADVANCE_PHASE.test(line) && !HISTORICAL_ALLOW_RE.test(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: "POST /workspaces/:workspaceId/advance-phase",
          message: "Legacy Phase Advancement path appears outside an explicit historical retirement note.",
        });
      }
      if (LEGACY_PHASE_PATH.test(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: line.trim(),
          message: `Active Phase Advancement path must be ${CANONICAL}.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
