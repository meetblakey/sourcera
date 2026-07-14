/**
 * Gate: `mcp_rate_limit_launch_posture_canonicality`
 *
 * Assertion: §22.13.1 carries the conservative MCP launch target, confirmation
 * workflow, §42 runbook binding, §50.15 SIM detector, Appendix J enum, and
 * §M.5 runtime-active row for D-DEC-009.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    anchor: "22.13.1-env-kb-runner",
    label: "§22.13.1 env_sourcera_kb_runner",
    tokens: [
      "Initial deployment target: 30 rps sustained / 60 rps burst",
      "Target steady-state: 60 rps sustained / 120 rps burst after Anthropic per-MCP-server quota confirmation.",
      "`mcp_rate_limit_confirmation_pending`",
      "`mcp_rate_limit_confirmation_log`",
      "`RB-PERF-011`",
      "Raising the live config to the 60 rps / 120 burst target before that log exists is forbidden.",
    ],
  },
  {
    anchor: "22.16.4-observability-and-metrics",
    label: "§22.16.4 Observability & Metrics",
    tokens: [
      "MCP 429 rate > 0.5% for 5 min",
      "`mcp_rate_limit_confirmation_pending` remains open inside 14 days of launch",
      "runbook `RB-PERF-011`",
    ],
  },
  {
    anchor: "42.2.3-alarm-rules-v12-rewrite",
    label: "§42.2.3 Alarm Rules",
    tokens: [
      "`mcp_rate_limit_confirmation_pending` open inside 14 days of launch OR MCP 429 rate > 0.5% over 5 min during canary/launch",
      "keep or revert to 30 rps / 60 burst until confirmation log exists",
      "`RB-PERF-011`",
    ],
  },
  {
    anchor: "42.5.1-runbook-inventory",
    label: "§42.5.1 Runbook Inventory",
    tokens: ["RB-PERF-001 through RB-PERF-011"],
  },
  {
    anchor: "50.15.4-detector-catalog-four-new-categories",
    label: "§50.15.4 Detector Catalog",
    tokens: [
      "`mcp_rate_limit_confirmation_detector_v1`",
      "`mcp_rate_limit_confirmation_pending`",
      "`mcp_rate_limit_confirmation_log`",
      "auto-revert to 30 rps / 60 burst",
    ],
  },
  {
    anchor: "50.15.5-sim-signal-class-catalog-extensions",
    label: "§50.15.5 SIM Signal-Class Catalog Extensions",
    tokens: [
      "`mcp_rate_limit_confirmation_pending`",
      "warning (critical inside launch window or high 429 rate)",
    ],
  },
  {
    anchor: "m-5-71-v711-d-dec-009-mcp-rate-limit-launch-posture-canonicality-addition",
    label: "§M.5.71 D-DEC-009 gate row",
    tokens: [
      "`mcp_rate_limit_launch_posture_canonicality`",
      "**`runtime_active`**",
      "tools/spec-lint/gates/mcp_rate_limit_launch_posture_canonicality.ts",
      "§22.13.1 MUST name the initial 30 rps / 60 burst launch target",
      "A bare 60 rps / 120 burst row with no launch-safe posture fails.",
    ],
  },
];

const APPENDIX_J_TOKENS = [
  "#### `signal_integrity_monitor_signal_class_enum`",
  "`mcp_rate_limit_confirmation_pending`",
  "D-DEC-009 MCP launch-safety signal",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, anchor: string, label: string, findings: Finding[]) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} is missing; cannot verify D-DEC-009 MCP rate-limit posture.`);
    return null;
  }
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

function requireToken(
  findings: Finding[],
  doc: SpecDoc,
  text: string,
  line: number,
  label: string,
  token: string,
) {
  if (!text.includes(token)) {
    push(findings, doc, line, token, `${label} is missing required D-DEC-009 MCP launch-posture token: ${token}`);
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { line, text };
  }
  return null;
}

function staleSteadyStateOnlyFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (!text.includes("60 rps per Org, burst 120")) continue;

    const window = doc.lines.slice(Math.max(1, line - 8), Math.min(doc.lines.length, line + 9)).join("\n");
    const hasLaunchPosture =
      window.includes("30 rps sustained / 60 rps burst") ||
      window.includes("30 rps / 60 burst") ||
      window.includes("mcp_rate_limit_confirmation_pending");
    if (!hasLaunchPosture) {
      push(
        findings,
        doc,
        line,
        text.trim(),
        "MCP rate limits still expose the 60/120 steady-state target without the D-DEC-009 launch posture.",
      );
    }
  }
  return findings;
}

function mcpRateLimitFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of SECTION_REQUIREMENTS) {
    const section = sectionText(doc, req.anchor, req.label, findings);
    if (!section) continue;
    for (const token of req.tokens) {
      requireToken(findings, doc, section.text, section.line, req.label, token);
    }
  }

  const appendixJ = findLine(doc, (line) => line.includes("#### `signal_integrity_monitor_signal_class_enum`"));
  if (!appendixJ) {
    push(findings, doc, 0, "signal_integrity_monitor_signal_class_enum", "Appendix J SIM signal-class enum is missing.");
  } else {
    const appendixJText = doc.lines.slice(appendixJ.line, appendixJ.line + 8).join("\n");
    for (const token of APPENDIX_J_TOKENS) {
      requireToken(findings, doc, appendixJText, appendixJ.line, "Appendix J signal_integrity_monitor_signal_class_enum", token);
    }
  }

  findings.push(...staleSteadyStateOnlyFindings(doc));
  return findings;
}

export const gate: SpecLintGate = {
  id: "mcp_rate_limit_launch_posture_canonicality",
  sourcePhase: "v7.1.1 D-DEC-009",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return mcpRateLimitFindings(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
