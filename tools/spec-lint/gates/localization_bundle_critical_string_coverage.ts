/**
 * Gate: `localization_bundle_critical_string_coverage`
 *
 * Assertion: §47.3 expanded i18n is specified as active LocalizationBundle
 * rows with critical-string coverage, customer-facing coverage, ICU, RTL, and
 * Appendix I/J bindings.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "localization_bundle_critical_string_coverage";

const SECTION_47_TOKENS = [
  "#### 47.3.1.G LocalizationBundle",
  "| `locale` | BCP-47 enum (Appendix J `supported_ui_locale`) | Required | Production launch set in §37.2 |",
  "| `status` | Enum (Appendix J `localization_bundle_status`) | Required | `draft`, `qa`, `active`, `retired` |",
  "| `coverage_percent` | Decimal | 0-100 | Customer-facing string coverage |",
  "| `critical_string_coverage_percent` | Decimal | 0-100 | Billing, security, legal, error messages |",
  "| `rtl` | Boolean | Required | True for `ar-SA`, `he-IL` |",
  "`active` requires `critical_string_coverage_percent=100`, `coverage_percent >= 99.5`, ICU plural fixture pass, RTL mirror fixture pass where `rtl=true`, and Appendix I localization keys present for all active error codes.",
];

const REGISTRATION_TOKENS = [
  "| i18n | Appendix I localization keys for every active error; Appendix J `supported_ui_locale`; §M.5: `localization_bundle_critical_string_coverage`. |",
];

const ACCEPTANCE_TOKENS = [
  "The supported UI locale set in §37.2 MUST have active LocalizationBundle rows with critical-string coverage at 100%.",
];

const APPENDIX_J_TOKENS = [
  "#### `supported_ui_locale`",
  "`en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, `he-IL`",
  "#### `localization_bundle_status`",
  "`draft`, `qa`, `active`, `retired`",
];

const LOCALIZATION_TOKENS = [
  "Every Appendix I row carries an implicit `localization_key`",
  "`error.<scope>.<code>`",
  "Translated strings live in active `LocalizationBundle` rows (§47.3.1.G)",
  "RTL test fixtures MUST prove `useDirectionality()` applies `dir`, icon mirroring, number alignment, and CSS logical properties per §38.11",
];

const M5_ROW_TOKENS = [
  "spec-tree §47.3 LocalizationBundle critical-string coverage contract only",
  "translation files, ICU plural fixture execution, RTL mirror execution, and release localization QA remain product-pack evidence",
  "Appendix J `supported_ui_locale` / `localization_bundle_status` rows registered",
  "100% critical-string coverage and >=99.5% customer-facing coverage",
];

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Full-Scope Capability Remediation",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.1-full-scope-capability-contracts"), "§47.3.1 Full-Scope Capability Contracts", SECTION_47_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.2-apis-events-errors-and-gates"), "§47.3.2 APIs, Events, Errors, and Gates", REGISTRATION_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.3-production-capability-acceptance-criteria"), "§47.3.3 Acceptance Criteria", ACCEPTANCE_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"), "Appendix J", APPENDIX_J_TOKENS);
    requireTokens(findings, doc, { text: doc.text, startLine: 1 }, "Localization corpus", LOCALIZATION_TOKENS);

    const m5Row = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
    if (m5Row) {
      for (const token of M5_ROW_TOKENS) {
        if (!m5Row.text.includes(token)) push(findings, doc, m5Row.line, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
