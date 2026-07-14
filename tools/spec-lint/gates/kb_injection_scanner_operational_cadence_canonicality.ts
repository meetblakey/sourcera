/**
 * Gate: `kb_injection_scanner_operational_cadence_canonicality`
 *
 * Assertion: §22.16.7 carries the D-DEC-011 KB injection scanner FPR target,
 * pattern-library version pinning, monthly review cadence, Trust & Safety
 * dashboard, Appendix G/J payloads, §42 runbook binding, and §M.5 row.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    anchor: "22.16.7-security-firewall-residency",
    label: "§22.16.7 Security, Firewall & Residency Enforcement",
    tokens: [
      "`kb_injection_pattern_library_version`",
      "rolling 30-day false-positive rate MUST stay <= 1% of legitimate KB entries flagged",
      "FPR > 1% opens Trust & Safety review",
      "`RB-TNS-001` / `kb_injection_scanner_monthly_review`",
      "`kb_injection_scanner_fpr_dashboard`",
    ],
  },
  {
    anchor: "22.17-acceptance-criteria",
    label: "§22.17 Acceptance Criteria",
    tokens: [
      "`kb_injection_pattern_library_version`",
      "rolling 30-day FPR stays <= 1% of legitimate KB entries flagged",
      "`RB-TNS-001`",
      "`kb_injection_scanner_fpr_dashboard`",
      "`kb_injection_pattern_version_pinned`",
    ],
  },
  {
    anchor: "42.2.3-alarm-rules-v12-rewrite",
    label: "§42.2.3 Alarm Rules",
    tokens: [
      "`kb_injection_scanner_fpr_dashboard` reports FPR breach of the §22.16.7 target",
      "freeze new `kb_injection_pattern_library_version` promotion",
      "`RB-TNS-001`",
    ],
  },
  {
    anchor: "42.5.1-runbook-inventory",
    label: "§42.5.1 Runbook Inventory",
    tokens: [
      "RB-TNS-001",
      "`kb_injection_scanner_monthly_review`",
      "new injection techniques, prior-month false positives, and Submission Gate near-misses",
    ],
  },
  {
    anchor: "50.14.6-fraud-analyst-dashboard",
    label: "§50.14.6 Fraud Analyst Dashboard",
    tokens: [
      "`kb_injection_scanner_fpr_dashboard`",
      "rolling 30-day false-positive rate by `kb_injection_pattern_library_version`",
      "Trust & Safety operational view",
      "`RB-TNS-001` monthly-review status",
    ],
  },
  {
    anchor: "50.14.10-appendix-extensions",
    label: "§50.14.10 Appendix Extensions",
    tokens: [
      "`ops_analytics_dashboard_kind`: `growth_pm`, `gtm_lead`, `support`, `fraud_analyst`, `finance`, `kb_injection_scanner_fpr_dashboard`",
    ],
  },
  {
    anchor: "m-5-72-v711-d-dec-011-kb-injection-scanner-operational-cadence-canonicality-addition",
    label: "§M.5.72 D-DEC-011 gate row",
    tokens: [
      "`kb_injection_scanner_operational_cadence_canonicality`",
      "**`runtime_active`**",
      "tools/spec-lint/gates/kb_injection_scanner_operational_cadence_canonicality.ts",
      "§22.16.7 MUST name the <= 1% rolling-30-day FPR target",
      "Starter-pattern-only text with no FPR/version/review discipline fails.",
    ],
  },
];

const APPENDIX_G_TOKENS = [
  "`kb_injection_suspected`",
  "`kb_injection_pattern_library_version`",
  "`scanner_decision`",
  "`review_outcome`",
];

const APPENDIX_J_ENUM_TOKENS = [
  "### KB Injection Pattern Library Version (`kb_injection_pattern_library_version`, §22.16.7) (new)",
  "`kb_injection_patterns_v1`",
  "Every `kb_injection_scanner` result MUST pin `kb_injection_pattern_library_version`.",
  "Future values are append-only as `kb_injection_patterns_v{n}`",
];

const APPENDIX_J_AUDIT_TOKENS = [
  "`kb_injection_suspected` payload:",
  "`kb_injection_pattern_library_version`",
  "`scanner_decision`",
  "`review_outcome`",
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
    push(findings, doc, 0, anchor, `${label} is missing; cannot verify D-DEC-011 KB scanner cadence.`);
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
    push(findings, doc, line, token, `${label} is missing required D-DEC-011 KB scanner token: ${token}`);
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { line, text };
  }
  return null;
}

function requireWindowTokens(
  findings: Finding[],
  doc: SpecDoc,
  startLine: number,
  span: number,
  label: string,
  tokens: string[],
) {
  const text = doc.lines.slice(startLine, Math.min(doc.lines.length, startLine + span)).join("\n");
  for (const token of tokens) {
    requireToken(findings, doc, text, startLine, label, token);
  }
}

function staleStarterOnlyFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (!text.includes("At KB bootstrap/ingestion time, entries are scanned for injection patterns")) continue;

    const window = doc.lines.slice(Math.max(1, line - 2), Math.min(doc.lines.length, line + 8)).join("\n");
    const hasOperationalCadence =
      window.includes("kb_injection_pattern_library_version") &&
      window.includes("<= 1%") &&
      window.includes("kb_injection_scanner_monthly_review") &&
      window.includes("kb_injection_scanner_fpr_dashboard");
    if (!hasOperationalCadence) {
      push(
        findings,
        doc,
        line,
        text.trim(),
        "KB injection scanner starter-pattern text lacks D-DEC-011 FPR, version, monthly-review, or dashboard discipline.",
      );
    }
  }
  return findings;
}

function kbInjectionScannerFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of SECTION_REQUIREMENTS) {
    const section = sectionText(doc, req.anchor, req.label, findings);
    if (!section) continue;
    for (const token of req.tokens) {
      requireToken(findings, doc, section.text, section.line, req.label, token);
    }
  }

  const appendixG = findLine(doc, (line) => line.includes("| `kb_injection_suspected` |"));
  if (!appendixG) {
    push(findings, doc, 0, "kb_injection_suspected", "Appendix G kb_injection_suspected row is missing.");
  } else {
    requireWindowTokens(findings, doc, appendixG.line, 3, "Appendix G kb_injection_suspected row", APPENDIX_G_TOKENS);
  }

  const appendixJEnum = findLine(doc, (line) => line.includes("KB Injection Pattern Library Version (`kb_injection_pattern_library_version`"));
  if (!appendixJEnum) {
    push(findings, doc, 0, "kb_injection_pattern_library_version", "Appendix J kb_injection_pattern_library_version enum is missing.");
  } else {
    requireWindowTokens(findings, doc, appendixJEnum.line, 12, "Appendix J kb_injection_pattern_library_version", APPENDIX_J_ENUM_TOKENS);
  }

  const auditPayload = findLine(doc, (line) => line.includes("- `kb_injection_suspected` payload:"));
  if (!auditPayload) {
    push(findings, doc, 0, "kb_injection_suspected payload", "Appendix J audit-event payload row is missing for kb_injection_suspected.");
  } else {
    requireWindowTokens(findings, doc, auditPayload.line, 2, "Appendix J kb_injection_suspected audit payload", APPENDIX_J_AUDIT_TOKENS);
  }

  findings.push(...staleStarterOnlyFindings(doc));
  return findings;
}

export const gate: SpecLintGate = {
  id: "kb_injection_scanner_operational_cadence_canonicality",
  sourcePhase: "v7.1.1 D-DEC-011",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return kbInjectionScannerFindings(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
