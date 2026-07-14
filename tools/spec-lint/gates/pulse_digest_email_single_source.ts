/**
 * Gate: `pulse_digest_email_single_source`
 *
 * Assertion: Pulse Digest email must delegate its template, subject, sender,
 * opt-out, deliverability, suppression, and retry contract to §41.2-§41.5.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor: string;
  label: string;
  tokens: string[];
}

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "20.4-pulse-digest-email",
    label: "§20.4 Pulse Digest Email",
    tokens: [
      "Pulse Digest is a lifecycle email delivered through §41.1 with template key `weekly_digest` in §41.2.",
      "The subject pattern, sender, Reply-To policy, opt-out class, HTML / plain-text requirement, suppression checks, unsubscribe footer, preview QA, bounce / complaint behavior, and provider retry behavior are governed by §41.2 through §41.5; §20 MUST NOT define a second email-template contract.",
      "| Delivery provider | Loops.so via §41.1; template, opt-out, compliance, and unsubscribe behavior via §41.2 through §41.5. |",
      "The `weekly_digest` template renders these sections in both HTML and plain text. The subject pattern lives only in §41.2.",
    ],
  },
  {
    anchor: "20.7-acceptance-criteria",
    label: "§20.7 Acceptance Criteria",
    tokens: [
      "7. Pulse Digest email MUST use §41.2 `weekly_digest`; subject, sender, opt-out, unsubscribe, preview QA, bounce, complaint, retry, and suppression behavior MUST come from §41, not §20.",
    ],
  },
  {
    anchor: "41.2-complete-email-type-catalog",
    label: "§41.2 Complete Email Type Catalog",
    tokens: [
      "| Email Type | Template Key | Subject Pattern | Sender | Reply-To Policy | Category | Opt-Out Class | Trigger / Appendix C Binding |",
      "| Weekly Digest | `weekly_digest` | `[Workspace Name]` Weekly Pulse - Health Score: `{score}%` (`{color_band}`) | `noreply@sourcera.io` | `noreply` | `lifecycle` | `marketing_lifecycle_opt_in` | Pulse digest; §20.4 / Appendix C |",
      "The table below is the seed registry for the original v6/v7 email family; the runtime catalog is the generated EmailTemplate registry over Appendix C and MUST include all later v7 event rows.",
    ],
  },
  {
    anchor: "m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition",
    label: "§M.5.47 pulse_digest_email_single_source row",
    tokens: [
      "| `pulse_digest_email_single_source` | spec_tree_lint | **`runtime_active`**",
      "tools/spec-lint/gates/pulse_digest_email_single_source.ts",
      "§20.4 MUST cite §41.2 `weekly_digest` for subject/template/deliverability and MUST NOT contain a second literal subject or provider contract.",
    ],
  },
];

const DUPLICATE_EMAIL_CONTRACT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /`\[Workspace Name\]` Weekly Pulse - Health Score|\[Workspace Name\] Weekly Pulse - Health Score/i,
    label: "literal Weekly Digest subject",
  },
  {
    pattern: /`?noreply@sourcera\.io`?/i,
    label: "literal sender address",
  },
  {
    pattern: /`?marketing_lifecycle_opt_in`?/i,
    label: "literal opt-out class",
  },
  {
    pattern: /\|\s*(Subject Pattern|Sender|Reply-To Policy|Opt-Out Class)\s*\|/i,
    label: "email-template contract column",
  },
  {
    pattern: /\b(RFC 8058|List-Unsubscribe|SPF|DKIM|DMARC)\b/i,
    label: "deliverability-provider detail",
  },
];

function sectionText(doc: SpecDoc, expectation: SectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, expectation.anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function requireTokens(doc: SpecDoc, expectation: SectionExpectation): Finding[] {
  const section = sectionText(doc, expectation);
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      anchor: expectation.anchor,
      message: `${expectation.label} section is missing; cannot verify Pulse Digest email single-source contract.`,
    }];
  }

  const findings: Finding[] = [];
  for (const token of expectation.tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${expectation.label} is missing required Pulse Digest email single-source binding: ${token}`,
      });
    }
  }
  return findings;
}

function duplicateEmailContractFindings(doc: SpecDoc): Finding[] {
  const section = findSectionByAnchor(doc, "20.4-pulse-digest-email");
  if (!section) return [];

  const findings: Finding[] = [];
  for (let lineNumber = section.startLine; lineNumber <= section.endLine; lineNumber++) {
    const line = doc.lines[lineNumber] ?? "";
    for (const { pattern, label } of DUPLICATE_EMAIL_CONTRACT_PATTERNS) {
      if (!pattern.test(line)) continue;
      findings.push({
        file: doc.path,
        line: lineNumber,
        anchor: anchorForLine(doc, lineNumber),
        matched_text: line.trim(),
        message: `§20.4 must not define a second ${label}; delegate the Pulse Digest email contract to §41.2-§41.5.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "pulse_digest_email_single_source",
  sourcePhase: "4.11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const expectation of SECTION_EXPECTATIONS) {
      findings.push(...requireTokens(doc, expectation));
    }
    findings.push(...duplicateEmailContractFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
