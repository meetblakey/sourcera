/**
 * Gate: `wallet_state_enum_canonicality`
 *
 * Assertion: AIWallet state references use the Appendix J `ai_wallet_state`
 * closed set and do not reintroduce retired `soft_capped_*` labels.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const CANONICAL_VALUES = [
  "active",
  "soft_warned_50",
  "soft_warned_80",
  "hard_capped_100",
  "hard_capped_auto_topup_monthly_cap",
  "payment_failed_grace",
  "suspended",
  "closed",
];

const CANONICAL_INLINE =
  "`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.3 AIWallet",
    anchor: "4.8.3-aiwallet",
    endTitle: /^4\.8\.4 OutcomeContract\b/,
    tokens: [
      "| `wallet_state` | Enum | See Appendix J `ai_wallet_state`:",
      ...CANONICAL_VALUES.map((value) => `\`${value}\``),
      "| `soft_warned_50` | `soft_warned_80` |",
      "| `soft_warned_80` | `hard_capped_100` |",
      "| `soft_warned_80` | `hard_capped_auto_topup_monthly_cap` |",
      "| `payment_failed_grace` | `suspended` |",
    ],
  },
  {
    label: "§31.8.4 Wallet Threshold and Auto-Topup Events",
    title: /^31\.8\.4 Wallet Threshold and Auto-Topup Events\b/,
    tokens: [
      "`wallet_state ∈ {active, soft_warned_50}`",
      "`new_wallet_state=soft_warned_50`",
      "`new_wallet_state` | Enum | Typically `soft_warned_80`",
      "`new_wallet_state` | Enum | `soft_warned_80` when overage headroom remains, `hard_capped_100` when overage is disabled or already at the overage ceiling, or `hard_capped_auto_topup_monthly_cap`",
      "`prior_wallet_state` | Enum | Typically `soft_warned_80`, `hard_capped_100`, or `hard_capped_auto_topup_monthly_cap`",
    ],
  },
  {
    label: "§34.10.4 Wallet State Machine",
    title: /^34\.10\.4 Wallet State Machine\b/,
    tokens: [
      ...CANONICAL_VALUES.map((value) => `\`${value}\``),
      "`hard_capped_auto_topup_monthly_cap`",
      "`billing.wallet.auto_topup_failed` with `failure_category='monthly_cap_would_be_exceeded'`",
    ],
  },
  {
    label: "Appendix J AI Wallet State",
    title: /^AI Wallet State\b/,
    tokens: [CANONICAL_INLINE],
  },
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/wallet_state_enum_canonicality.ts",
  "Appendix J `ai_wallet_state` values",
  "`soft_capped_*` labels fail",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify wallet-state enum canonicality.`,
    });
    return { text: "", line: 0 };
  }
  let endLine = section.endLine;
  if ("endTitle" in req && req.endTitle) {
    for (let i = section.startLine + 1; i < doc.lines.length; i++) {
      const match = /^(#{1,6})\s+(.*?)\s*(?:\{#([^}]+)\})?\s*$/.exec(doc.lines[i] ?? "");
      if (match && req.endTitle.test(match[2].trim())) {
        endLine = i - 1;
        break;
      }
    }
  }
  return {
    text: doc.lines.slice(section.startLine, endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing wallet-state canonical binding: ${token}`,
      });
    }
  }
  return findings;
}

function findM5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `wallet_state_enum_canonicality` |")) return { text: line, line: i };
  }
  return null;
}

function staleWalletStateFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const stalePatterns = [/soft_capped_[a-z0-9_]+/i, /\bsoft-capped\b/i, /\bsoft capped\b/i];

  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    for (const pattern of stalePatterns) {
      const match = pattern.exec(line);
      if (!match) continue;
      const lower = line.toLowerCase();
      const explicitRetirement = lower.includes("retired") && lower.includes("fail");
      if (explicitRetirement) continue;
      findings.push({
        file: doc.path,
        line: i,
        matched_text: match[0],
        message: "Retired wallet soft-cap state wording is live; use `soft_warned_50` / `soft_warned_80` warning states.",
      });
    }
  }
  return findings;
}

function appendixKGlossaryFindings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.includes("**AIWallet.**"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "**AIWallet.**",
        message: "Appendix K AIWallet glossary entry is missing.",
      },
    ];
  }
  return requireTokens(doc, doc.lines[line] ?? "", line, "Appendix K AIWallet glossary entry", [CANONICAL_INLINE]);
}

function appendixJExactSetFindings(doc: SpecDoc, text: string, line: number): Finding[] {
  const findings: Finding[] = [];
  for (const value of CANONICAL_VALUES) {
    if (!text.includes(`\`${value}\``)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: value,
        message: `Appendix J ai_wallet_state is missing canonical value \`${value}\`.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "wallet_state_enum_canonicality",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const req of SECTION_REQUIREMENTS) {
      const section = sectionText(doc, req, findings);
      findings.push(...requireTokens(doc, section.text, section.line, req.label, req.tokens));
      if (req.label === "Appendix J AI Wallet State") {
        findings.push(...appendixJExactSetFindings(doc, section.text, section.line));
      }
    }

    findings.push(...appendixKGlossaryFindings(doc));

    const m5 = findM5Row(doc);
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`wallet_state_enum_canonicality`",
        message: "Appendix M.5 wallet_state_enum_canonicality row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 wallet_state_enum_canonicality row", M5_TOKENS));
    }

    findings.push(...staleWalletStateFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
