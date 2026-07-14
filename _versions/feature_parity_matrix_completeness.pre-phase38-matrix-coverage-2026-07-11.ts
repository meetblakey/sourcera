/**
 * Gate: `feature_parity_matrix_completeness`
 *
 * Assertion: §38.8.2 covers the current feature-section manifest and rejects
 * duplicate or malformed mobile feature rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  sectionTableRowsByAnchor,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "feature_parity_matrix_completeness";
const VALID_STATUSES = new Set(["parity", "supported", "simplified", "not_supported"]);

const REQUIRED_SECTION_GROUPS = [
  "7",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "31",
  "32",
  "34",
  "35",
  "36",
  "37",
  "48",
  "49",
  "50",
  "51",
] as const;

const REQUIRED_FEATURES = [
  "Defense View",
  "\"What Are You Evaluating?\" Intake",
  "Buyer Hero Moment — Activation Timeline",
  "Seller Onboarding — Forced Signup / Bid Workspace Entry",
  "Seller Onboarding — KB Bootstrap Progress",
  "Seller Onboarding — Drafted Bid Review",
  "Seller Onboarding — Win/Loss Debrief",
  "AI Wallet & Usage Billing",
] as const;

const M5_TOKENS = [
  "critical feature-section coverage manifest",
  "§38.8.2 matrix duplicate detection",
  "product mobile E2E, visual regression, runtime tap-count probes, and release-branch enforcement remain product-pack evidence",
] as const;

function groupSections(label: string): string[] {
  const match = label.match(/\(§([^)]*)\)/);
  if (!match) return [];
  return [...match[1].matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0].split(".")[0]);
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "mobile_parity_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const doc = ctx.masterSpec;
    const rows = sectionTableRowsByAnchor(findings, doc, "38.8.2-mobile-feature-parity-matrix", "§38.8.2 Mobile Feature Parity Matrix");
    const featureRows = rows.filter((row) => row.cells[0] && !row.cells[0].startsWith("**"));
    const groupRows = rows.filter((row) => row.cells[0]?.startsWith("**"));

    const coveredSections = new Set<string>();
    for (const row of groupRows) {
      for (const section of groupSections(row.cells[0] ?? "")) coveredSections.add(section);
    }
    for (const section of REQUIRED_SECTION_GROUPS) {
      if (!coveredSections.has(section)) {
        push(findings, doc, rows[0]?.line ?? 0, `§${section}`, `§38.8.2 matrix is missing a feature group covering §${section}.`);
      }
    }

    const byFeature = new Map<string, Array<{ cells: string[]; line: number }>>();
    for (const row of featureRows) {
      const [feature, desktop, tablet, mobile, notes] = row.cells;
      if (!feature) continue;
      byFeature.set(feature, [...(byFeature.get(feature) ?? []), row]);
      for (const [label, value] of [
        ["Desktop", desktop],
        ["Tablet", tablet],
        ["Mobile", mobile],
      ] as const) {
        if (!VALID_STATUSES.has(value)) {
          push(findings, doc, row.line, value, `§38.8.2 ${feature} ${label} status must be a mobile_feature_parity_status value.`);
        }
      }
      if ((tablet === "simplified" || mobile === "simplified" || tablet === "not_supported" || mobile === "not_supported") && !notes) {
        push(findings, doc, row.line, feature, `§38.8.2 ${feature} requires Notes for simplified/not_supported status.`);
      }
    }

    for (const [feature, matches] of byFeature) {
      if (matches.length > 1) push(findings, doc, matches[1].line, feature, `§38.8.2 matrix has duplicate feature row: ${feature}.`);
    }
    for (const feature of REQUIRED_FEATURES) {
      if (!byFeature.has(feature)) push(findings, doc, rows[0]?.line ?? 0, feature, `§38.8.2 matrix is missing required current feature row: ${feature}.`);
    }

    const m5Row = rows.length
      ? doc.lines.findIndex((line) => line.trim().startsWith(`| \`${GATE_ID}\` |`))
      : -1;
    if (m5Row >= 0) {
      const rowText = doc.lines[m5Row] ?? "";
      for (const token of M5_TOKENS) {
        if (!rowText.includes(token)) push(findings, doc, m5Row, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    requireRuntimeActive(findings, doc, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
