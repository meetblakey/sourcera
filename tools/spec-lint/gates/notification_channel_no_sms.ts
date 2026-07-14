/**
 * Gate: `notification_channel_no_sms`
 *
 * Assertion: §20 notification preferences do not render or document SMS as a
 * supported channel until the full provider/API/compliance/catalog contract is
 * authored.
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
    anchor: "20.6-notification-preferences-and-settings",
    label: "§20.6 Notification Preferences & Settings",
    tokens: [
      "- **SMS:** Unsupported in v7.1.0a.",
      "No SMS option may render for §20 until provider registration, templates, API contracts, §5.11 plan gates, §34 pricing, §41-equivalent compliance, and Appendix C/G/I/J entries are authored.",
    ],
  },
  {
    anchor: "20.7-acceptance-criteria",
    label: "§20.7 Acceptance Criteria",
    tokens: [
      "13. Notification preferences MUST delegate quiet hours, DND, per-event preferences, entity mute, and channel toggles to §29.3; §20 may only layer Pulse-specific fields on top.",
      "14. §20 MUST NOT render SMS controls. Slack controls are current and governed by §29.4.",
      "16. Appendix C, Appendix G, Appendix I, Appendix J, and Appendix M MUST contain matching registrations for every webhook, event, error code, enum, and gate named by §20.",
    ],
  },
  {
    anchor: "32.10.3.b-buyer-inbox-and-pulse-endpoints",
    label: "§32.10.3.B Buyer Inbox and Pulse Endpoints",
    tokens: [
      "Preference patch | Updates the §29.3 preference record and emits Appendix G `notification_preferences_updated`.",
      "notification_preference_scope_mismatch",
      "6. Preference patch MUST delegate quiet hours, DND, and entity mute semantics to §29.3 and reject SMS channel keys until the SMS contract is authored.",
    ],
  },
  {
    anchor: "m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition",
    label: "§M.5.47 notification_channel_no_sms row",
    tokens: [
      "| `notification_channel_no_sms` | spec_tree_lint | **`runtime_active`**",
      "tools/spec-lint/gates/notification_channel_no_sms.ts",
      "§20 notification preferences MUST NOT render or document SMS as supported",
      "§32.10.3.B preference PATCH rejects SMS channel keys until that contract is authored.",
    ],
  },
];

const SMS_REFERENCE_RE = /\bSMS\b|`sms`|\bsms\b|\btext messages?\b/i;
const NEGATIVE_SMS_RE =
  /\b(unsupported|not supported|no sms|must not|reject sms|rejects sms|blocked|disallowed|explicitly blocked|until .* authored|no .* option may render|not render sms|sms .* not supported)\b/i;

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
      message: `${expectation.label} section is missing; cannot verify SMS unsupported contract.`,
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
        message: `${expectation.label} is missing required SMS unsupported binding: ${token}`,
      });
    }
  }
  return findings;
}

function smsSupportFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (!SMS_REFERENCE_RE.test(line)) continue;
    if (NEGATIVE_SMS_RE.test(line)) continue;
    findings.push({
      file: doc.path,
      line: i + 1,
      anchor: anchorForLine(doc, i),
      matched_text: line.trim(),
      message:
        "SMS may only appear as explicitly unsupported / blocked until provider, API, compliance, and Appendix C/G/I/J contracts are authored.",
    });
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "notification_channel_no_sms",
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
    findings.push(...smsSupportFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
