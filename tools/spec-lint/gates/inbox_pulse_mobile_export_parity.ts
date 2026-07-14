/**
 * Gate: `inbox_pulse_mobile_export_parity`
 *
 * Assertion: Pulse Digest Archive CSV export is desktop/tablet only; mobile
 * attempts return the canonical Appendix I error and render the §38.8.3
 * unsupported disclosure.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionExpectation {
  anchor: string;
  label: string;
  title?: RegExp;
  tokens: string[];
}

const SECTION_EXPECTATIONS: SectionExpectation[] = [
  {
    anchor: "20.5.3-digest-archive",
    label: "§20.5.3 Digest Archive",
    title: /^20\.5\.3 Digest Archive\b/,
    tokens: [
      "- **Export:** Desktop and tablet may initiate the async CSV export through §32.10.3.B. Mobile export is not supported per §38.8.2 / §38.8.3 and returns Appendix I `pulse_digest_export_mobile_not_supported`.",
    ],
  },
  {
    anchor: "20.7-acceptance-criteria",
    label: "§20.7 Acceptance Criteria",
    tokens: [
      "12. Mobile Inbox read and mark-read parity MUST match §38.8.2; mobile bulk action simplification and mobile digest-export unsupported states MUST render the §38.8.3 disclosure pattern.",
    ],
  },
  {
    anchor: "20.8-mobile-surface",
    label: "§20.8 Mobile Surface",
    tokens: [
      "Pulse Digest Archive CSV export is not supported on mobile.",
      "Mobile attempts to initiate digest CSV export return Appendix I `pulse_digest_export_mobile_not_supported` and render the §38.8.3 `not_supported` disclosure.",
    ],
  },
  {
    anchor: "32.10.3.b-buyer-inbox-and-pulse-endpoints",
    label: "§32.10.3.B Buyer Inbox and Pulse Endpoints",
    tokens: [
      "§38.8.2 mobile parity",
      "| POST | `/v1/workspaces/{workspace_id}/pulse/digests/export` | `read:workspaces` | §5.11 Export Pulse Digest Archive CSV row and §34.1.1 Export Formats | `analytics_export` | REQUIRED |",
      "| Digest export | Creates an async export job; mobile callers return `pulse_digest_export_mobile_not_supported` before job creation. |",
      "| 422 | `pulse_digest_export_mobile_not_supported` | Mobile client attempted digest CSV export |",
      "5. Digest export initiation MUST return HTTP 422 `pulse_digest_export_mobile_not_supported` for mobile callers identified by the supported §38 device-class contract.",
    ],
  },
  {
    anchor: "38.8.2-mobile-feature-parity-matrix",
    label: "§38.8.2 Mobile Feature Parity Matrix",
    tokens: [
      "| Pulse - Digest Archive CSV Export | parity | parity | not_supported | Desktop/tablet export uses §32.10.3.B async export. Mobile renders §38.8.3 `not_supported` disclosure and API attempts return `pulse_digest_export_mobile_not_supported`. |",
    ],
  },
  {
    anchor: "38.8.3-simplification-disclosure-contract",
    label: "§38.8.3 Simplification Disclosure Contract",
    tokens: [
      "Features in `simplified` or `not_supported` state MUST disclose the limitation to the user at the point of interaction, not hide it silently.",
      "| `not_supported` (redirect permitted) | **Redirect banner** with continue/dismiss: \"[Feature] is best experienced on desktop. [Continue on Desktop] [Dismiss]\" — this is the canonical string for every §38 `not_supported` row. |",
      "| `not_supported` (hard block) | **Hard redirect** to the `/:console/mobile-unsupported` informational page with deep-link preservation; Ops Console surfaces use this. |",
    ],
  },
  {
    anchor: "appendix-i-v72rem-phase-4-11-inbox-pulse",
    label: "Appendix I Phase 4.11 Inbox / Pulse Errors",
    tokens: [
      "| `pulse_digest_export_mobile_not_supported` | 422 | `permanent` | §20.5.3 / §38.8.2 / §32.10.3.B mobile attempt to initiate digest CSV export. | `error.pulse.pulse_digest_export_mobile_not_supported` |",
    ],
  },
  {
    anchor: "m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition",
    label: "§M.5.47 inbox_pulse_mobile_export_parity row",
    tokens: [
      "| `inbox_pulse_mobile_export_parity` | mobile_parity_consistency | **`runtime_active`**",
      "tools/spec-lint/gates/inbox_pulse_mobile_export_parity.ts",
      "§20.5.3 and §38.8.2 MUST both mark Pulse Digest CSV export unsupported on mobile",
      "§32.10.3.B MUST reject mobile export initiation before job creation.",
    ],
  },
];

const CONTRADICTORY_EXPORT_RE =
  /\b(mobile|phone)\b.{0,80}\b(initiate|starts?|creates?|queues?|supports?|supported|available|allowed)\b.{0,80}\b(pulse digest|digest csv|csv export|export job)\b/i;
const NEGATIVE_EXPORT_RE = /not supported|unsupported|not_supported|reject|before job creation|disclosure/i;

function sectionText(doc: SpecDoc, expectation: SectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, expectation.anchor) ?? (expectation.title ? findSectionByTitle(doc, expectation.title) : null);
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
      message: `${expectation.label} section is missing; cannot verify Pulse mobile export parity.`,
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
        message: `${expectation.label} is missing required Pulse mobile export binding: ${token}`,
      });
    }
  }
  return findings;
}

function contradictoryExportFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (!CONTRADICTORY_EXPORT_RE.test(line)) continue;
    if (NEGATIVE_EXPORT_RE.test(line)) continue;
    findings.push({
      file: doc.path,
      line: i + 1,
      anchor: anchorForLine(doc, i),
      matched_text: line.trim(),
      message:
        "Pulse Digest CSV export must remain unsupported on mobile and return `pulse_digest_export_mobile_not_supported` before job creation.",
    });
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "inbox_pulse_mobile_export_parity",
  sourcePhase: "4.11",
  rowClass: "mobile_parity_consistency",
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
    findings.push(...contradictoryExportFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
