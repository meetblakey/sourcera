/**
 * Gate: `solo_microcopy_template_parity`
 *
 * Assertion: Solo / Free seller and Solo billing microcopy uses the current
 * §37.2 / Appendix J production locale set and stable localization key groups.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SUPPORTED_LOCALES = [
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "ja-JP",
  "ar-SA",
  "he-IL",
] as const;

const SOLO_KEY_GROUPS = [
  "billing.plan_transition.solo.surface_entering",
  "billing.plan_transition.solo.surface_exiting",
  "billing.plan_transition.solo.envelope_entering",
  "billing.plan_transition.solo.wallet_exiting",
  "billing.plan_transition.solo.per_eval_mode_change",
  "billing.solo_card.subscription",
  "billing.solo_card.per_eval",
  "billing.solo_card.per_bid",
  "billing.solo_envelope.throttling_paused",
  "pipeline.surface.step.solo_buyer",
  "pipeline.surface.step.solo_seller",
  "seller_hero_moment.counter_card",
  "seller_hero_moment.stake_reveal",
] as const;

function sectionByAnchor(doc: SpecDoc, anchor: string, label: string, findings: Finding[]) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor,
      message: `${label} section is missing.`,
    });
    return { text: "", line: 0, anchor };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? anchor,
  };
}

function sectionByTitle(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    });
    return { text: "", line: 0, anchor: label };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function requireTokens(
  doc: SpecDoc,
  section: { text: string; line: number; anchor?: string },
  label: string,
  tokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing required Solo microcopy localization binding: ${token}`,
      });
    }
  }
  return findings;
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function stalePostureFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const staleLocaleList = /\ben,\s*fr,\s*es,\s*de,\s*pt,\s*ja,\s*zh\b/i;
  const staleTranslationCarveout = /translation availability is not required for v7\.1\.x/i;
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (staleLocaleList.test(line) || staleTranslationCarveout.test(line)) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: line.trim(),
        message:
          "Solo microcopy localization still uses a stale shorthand locale list or English-only v7.1.x carve-out; use Appendix J supported_ui_locale.",
      });
    }
  }
  return findings;
}

function m5RowFindings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `solo_microcopy_template_parity` |"]);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`solo_microcopy_template_parity`",
      message: "Appendix M.5 solo_microcopy_template_parity row is missing.",
    }];
  }

  return requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 solo_microcopy_template_parity row", [
    "**`runtime_active`**",
    "tools/spec-lint/gates/solo_microcopy_template_parity.ts",
    "§37.2.1 localization-key manifest",
    ...SUPPORTED_LOCALES.map((locale) => `\`${locale}\``),
    "Stale shorthand locale lists and English-only v7.1.x carve-outs fail",
  ]);
}

function localizationManifestFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const i18n = sectionByAnchor(doc, "37.2-internationalization-(i18n)", "§37.2 Internationalization", findings);
  findings.push(...requireTokens(doc, i18n, "§37.2 Internationalization", [
    "v7.1.1 is not English-only",
    "§47.3.1.G",
    "Appendix J `supported_ui_locale`",
    ...SUPPORTED_LOCALES.map((locale) => `\`${locale}\``),
    "### 37.2.1 Solo / Free Microcopy Localization Manifest",
    "`solo_microcopy_template_parity`",
    "English fallback is forbidden for these key groups in production",
    "ICU variables MUST remain stable across locales",
  ]));

  for (const keyGroup of SOLO_KEY_GROUPS) {
    findings.push(...requireTokens(doc, i18n, "§37.2.1 Solo / Free Microcopy Localization Manifest", [`${keyGroup}`]));
  }

  const ac = sectionByAnchor(doc, "37.6-acceptance-criteria", "§37.6 Acceptance Criteria", findings);
  findings.push(...requireTokens(doc, ac, "§37.6 Acceptance Criteria", [
    "production translation availability is required through active LocalizationBundle rows for every Appendix J `supported_ui_locale` value before the v7.1.1 stamp",
  ]));

  const bundle = sectionByAnchor(doc, "47.3.1.g-localizationbundle", "§47.3.1.G LocalizationBundle", findings);
  findings.push(...requireTokens(doc, bundle, "§47.3.1.G LocalizationBundle", [
    "Appendix J `supported_ui_locale`",
    "Production launch set in §37.2",
    "`active` requires `critical_string_coverage_percent=100`, `coverage_percent >= 99.5`, ICU plural fixture pass, RTL mirror fixture pass where `rtl=true`, and Appendix I localization keys present for all active error codes.",
  ]));

  return findings;
}

function soloTransitionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionByTitle(doc, /^34\.19\.4\.A Solo-Bordering Transition Microcopy\b/, "§34.19.4.A Solo-Bordering Transition Microcopy", findings);
  findings.push(...requireTokens(doc, section, "§34.19.4.A Solo-Bordering Transition Microcopy", [
    "Surface-onset acknowledgement",
    "Envelope-vs-wallet semantic difference",
    "Per-eval / per-bid charge-mode change acknowledgement",
    "Loops.so email templates and in-app confirmation modals BOTH render the 7-element microcopy verbatim",
    "`solo_microcopy_template_parity`",
  ]));
  return findings;
}

function uxFindings(ux: SpecDoc | undefined, masterPath: string): Finding[] {
  if (!ux) {
    return [{
      file: masterPath,
      line: 0,
      matched_text: "UX_Design_of_Sourcera.md",
      message: "UX spec is required for solo_microcopy_template_parity.",
    }];
  }
  const findings: Finding[] = [];
  const pipeline = sectionByTitle(ux, /^5\.2\.19 PipelineSurface\b/, "UX §5.2.19 PipelineSurface", findings);
  findings.push(...requireTokens(ux, pipeline, "UX §5.2.19 PipelineSurface", [
    "Master Spec §37.2.1 key group `pipeline.surface.step.solo_buyer`",
    "`pipeline.surface.step.solo_seller`",
    "Component code MUST consume localization keys, not inline English strings.",
  ]));

  const billing = sectionByTitle(ux, /^8\.1\.2 Solo-Tier Billing Surface\b/, "UX §8.1.2 Solo-Tier Billing Surface", findings);
  findings.push(...requireTokens(ux, billing, "UX §8.1.2 Solo-Tier Billing Surface", [
    "Master Spec §37.2.1 key groups `billing.solo_card.subscription`, `billing.solo_card.per_eval`, `billing.solo_card.per_bid`, and `billing.solo_envelope.throttling_paused`",
    "Component code MUST consume localization keys, not inline English strings",
  ]));
  return findings;
}

export const gate: SpecLintGate = {
  id: "solo_microcopy_template_parity",
  sourcePhase: "V11 (D-11.3-002 remediation)",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...stalePostureFindings(doc),
      ...localizationManifestFindings(doc),
      ...soloTransitionFindings(doc),
      ...uxFindings(ctx.uxSpec, doc.path),
      ...m5RowFindings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
