/**
 * Gate: `growth_mechanic_rate_limit_coverage`
 *
 * Assertion: §48.5's mechanic-level rate-limit registry has one complete row
 * for every M1-M17 growth mechanic, including the formerly missing M4/M8
 * contract, and the new M4 error code resolves in Appendix I.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "growth_mechanic_rate_limit_coverage";
const REGISTRY_TITLE = "Mechanic-Level Rate Limits — Fill Coverage";
const MECHANICS = [
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
  "M7",
  "M8",
  "M9",
  "M10",
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
  "M16",
  "M17",
] as const;

const REQUIRED_BY_MECHANIC: Record<(typeof MECHANICS)[number], readonly string[]> = {
  M1: ["m1_inviter_rate_limit_exceeded", "10 invites / inviter / 24h"],
  M2: ["m2_password_brute_force_throttled", "5 failed password attempts"],
  M3: ["m3_certificate_enumeration_throttled", "100 distinct certificate verification URLs"],
  M4: ["m4_conversion_velocity_exceeded", "3 conversion attempts / source Workspace / prompted user / 24h"],
  M5: ["growth_loop_l1_throttle_exhausted", "§34.1.1 row **L1 Vendor Invite Throttle**"],
  M6: ["m6_domain_claim_velocity_exceeded", "1 claim/Org/24h"],
  M7: ["m7_card_fetch_rate_exceeded", "20 card-fetches/user/h"],
  M8: ["m8_recompute_rate_limit_exceeded", "10 Ops force-recompute calls / Org / h"],
  M9: ["m9_category_publish_velocity_exceeded", "1 force-publish/category/24h"],
  M10: ["m10_guide_publish_velocity_exceeded", "1 force-publish/guide/24h"],
  M11: ["m11_comparison_publish_velocity_exceeded", "1 force-publish/comparison/24h"],
  M12: ["m12_report_regeneration_velocity_exceeded", "1 force-generation/category/24h"],
  M13: ["m13_heatmap_recompute_velocity_exceeded", "1 force-recompute/heatmap/24h"],
  M14: ["m14_bid_success_share_velocity_exceeded", "§34.1.2 row **Bid Success Shares (M14)**"],
  M15: ["m15_ghost_bid_import_velocity_exceeded", "5 imports / Seller Org / 24h"],
  M16: ["m16_velocity_exceeded", "≥ 10 referrals / referrer Org / 7d"],
  M17: ["trial_seat_pool_exhausted", "one trial per buyer-vendor pair per 365d"],
};

function registryLine(doc: SpecDoc): number {
  for (let line = 1; line < doc.lines.length; line += 1) {
    if ((doc.lines[line] ?? "").includes(REGISTRY_TITLE)) return line;
  }
  return 0;
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const line = registryLine(doc);
  if (!line) {
    push(findings, doc, 0, REGISTRY_TITLE, "Mechanic-level rate-limit registry heading is missing.");
    return findings;
  }
  const section = findSectionByAnchor(doc, "48.5-m1-m8-growth-mechanics");
  const table = parseTableAt(doc, line, section?.endLine);
  const headers = table.header?.cells ?? [];
  for (const header of ["Mechanic", "Mechanic-Level Rate Limit", "Enforcement Surface", "Error Code"]) {
    if (!headers.includes(header)) push(findings, doc, table.header?.line ?? line, header, "Mechanic-level rate-limit table is missing a required header.");
  }
  for (const mechanic of MECHANICS) {
    const rows = table.rows.filter((row) => (row.cells[0] ?? "").includes(`**${mechanic}**`));
    if (rows.length !== 1) {
      push(findings, doc, line, mechanic, `Mechanic-level rate-limit registry must contain exactly one ${mechanic} row.`);
      continue;
    }
    const row = rows[0];
    const text = row.cells.join(" | ");
    for (const token of REQUIRED_BY_MECHANIC[mechanic]) {
      if (!text.includes(token)) push(findings, doc, row.line, token, `${mechanic} rate-limit row is missing required token: ${token}`);
    }
    if (!/HTTP\s+(429|403|422)/.test(text)) push(findings, doc, row.line, row.cells[3] ?? "", `${mechanic} row must name an HTTP status for the enforced limit.`);
  }
  return findings;
}

function m4BindingFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const m4 = sectionTextByAnchor(doc, "48.5.4-m4-kick-off-next-evaluation-on-close");
  if (!m4) {
    push(findings, doc, 0, "48.5.4-m4-kick-off-next-evaluation-on-close", "M4 body section is missing.");
    return findings;
  }
  for (const token of [
    "Conversion velocity guard",
    "3 attempts per `(source_workspace_id, prompted_user_id)` in any rolling 24h window",
    "HTTP 429 `m4_conversion_velocity_exceeded`",
    "M4 conversion attempts MUST enforce the 3 attempts / `(source_workspace_id, prompted_user_id)` / 24h velocity guard atomically",
  ]) {
    if (!m4.text.includes(token)) push(findings, doc, m4.startLine, token, `M4 body is missing required rate-limit binding token: ${token}`);
  }
  return findings;
}

function l1PlanTierThrottleSingletonFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const canonicalRow = "§34.1.1 row **L1 Vendor Invite Throttle**";
  const planRow = doc.lines.findIndex((line) => line.includes("| **L1 Vendor Invite Throttle**"));
  if (planRow < 1) {
    push(findings, doc, 0, "L1 Vendor Invite Throttle", "§34.1.1 is missing the canonical L1 Vendor Invite Throttle plan-tier row.");
  } else {
    const row = doc.lines[planRow] ?? "";
    for (const token of ["| 20 | 20 | 50 | 100 | 200 | Unlimited |", "AE-V13-009"]) {
      if (!row.includes(token)) push(findings, doc, planRow, token, `§34.1.1 L1 Vendor Invite Throttle row is missing required token: ${token}`);
    }
  }

  const l1 = sectionTextByAnchor(doc, "48.2.2-l1-vendor-invite-creates-account");
  if (!l1) {
    push(findings, doc, 0, "48.2.2-l1-vendor-invite-creates-account", "L1 body section is missing.");
    return findings;
  }
  const l1ThrottleLine = doc.lines.findIndex((line) => line.includes("Per-user invite throttle:"));
  if (l1ThrottleLine < 1) {
    push(findings, doc, l1.startLine, "Per-user invite throttle", "L1 per-user throttle control is missing.");
  } else {
    const line = doc.lines[l1ThrottleLine] ?? "";
    if (!line.includes(canonicalRow)) push(findings, doc, l1ThrottleLine, canonicalRow, "L1 per-user throttle must cite the §34.1.1 canonical plan-tier row.");
    if (/\b20\s+invites?\s*\/\s*user\s*\/\s*30\s*days?\b/i.test(line)) {
      push(findings, doc, l1ThrottleLine, "20 invites/user/30 days", "L1 per-user throttle must not restate plan-tier values inline.");
    }
  }

  const m5 = sectionTextByAnchor(doc, "48.5.5-m5-buyer-pull-vendor-invite");
  if (!m5) {
    push(findings, doc, 0, "48.5.5-m5-buyer-pull-vendor-invite", "M5 body section is missing.");
    return findings;
  }
  for (let line = m5.startLine; line <= m5.endLine; line += 1) {
    const text = doc.lines[line] ?? "";
    const restatesCap = /\b20\s*(?:M5\s*)?invites?\s*\/\s*(?:user|inviter)\s*\/\s*30\s*d(?:ays)?\b/i.test(text)
      || /\b20\s*\/\s*(?:user|inviter)\s*\/\s*30d\b/i.test(text);
    if (restatesCap) push(findings, doc, line, text.trim(), "M5 must not restate the L1 per-user plan-tier throttle; cite the §34.1.1 canonical row.");
    if (/per-inviter throttle/i.test(text) && !text.includes(canonicalRow)) {
      push(findings, doc, line, canonicalRow, "M5 per-inviter throttle controls must cite the §34.1.1 canonical row.");
    }
  }
  const glossaryLine = doc.lines.findIndex((line) => line.includes("**BuyerPullVendorInvite (M5).**"));
  if (glossaryLine < 1) {
    push(findings, doc, 0, "BuyerPullVendorInvite (M5)", "Appendix K BuyerPullVendorInvite glossary entry is missing.");
  } else {
    const text = doc.lines[glossaryLine] ?? "";
    if (!text.includes(canonicalRow)) push(findings, doc, glossaryLine, canonicalRow, "BuyerPullVendorInvite glossary entry must cite the §34.1.1 canonical row.");
    if (/\b20\s*\/\s*user\s*\/\s*30d\b/i.test(text)) {
      push(findings, doc, glossaryLine, "20/user/30d", "BuyerPullVendorInvite glossary entry must not restate the L1 per-user plan-tier throttle.");
    }
  }
  return findings;
}

function appendixIFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = doc.lines.findIndex((line) => line.includes("| `m4_conversion_velocity_exceeded` |"));
  if (row < 1) {
    push(findings, doc, 0, "m4_conversion_velocity_exceeded", "Appendix I row for m4_conversion_velocity_exceeded is missing.");
    return findings;
  }
  const text = doc.lines[row] ?? "";
  for (const token of ["429", "M4 POST convert", "error.growth.m4_conversion_velocity_exceeded"]) {
    if (!text.includes(token)) push(findings, doc, row, token, `Appendix I m4_conversion_velocity_exceeded row is missing token: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...registryFindings(doc),
      ...m4BindingFindings(doc),
      ...l1PlanTierThrottleSingletonFindings(doc),
      ...appendixIFindings(doc),
      ...m5RuntimeActiveFindings(doc, GATE_ID),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
