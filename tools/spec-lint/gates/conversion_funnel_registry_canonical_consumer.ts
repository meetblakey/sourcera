/**
 * Gate: `conversion_funnel_registry_canonical_consumer`
 *
 * Assertion: §51.0.3 is the closed spec-tree registry for customer-facing
 * conversion funnels. This proves registry / catalog / consumer wording only;
 * PostHog API auto-generation remains external runtime evidence.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./enterprise_security_gate_helpers.js";

type Funnel = {
  id: string;
  label: string;
  stages: string[];
  surfaceToken: string;
  alertToken: string;
};

const FUNNELS: Funnel[] = [
  {
    id: "buyer_conversion_funnel",
    label: "buyer_conversion_funnel",
    stages: ["user_signed_in", "workspace_created", "phase_advanced", "procurement_completed"],
    surfaceToken: '§51.3 Org-Level Dashboard "Procurement Funnel" panel',
    alertToken: "Stage-level conversion regression > 15% → P3",
  },
  {
    id: "seller_conversion_funnel",
    label: "seller_conversion_funnel",
    stages: [
      "seller_onboarding_landing_rendered",
      "seller_sso_completed",
      "seller_onboarding_first_requirement_response",
      "seller_onboarding_first_bid_submitted",
      "seller_bid_workspace_closed",
    ],
    surfaceToken: '§51.5 Seller Parity Dashboard "Onboarding Funnel" panel',
    alertToken: "Stage-level conversion regression > 15% → P3",
  },
  {
    id: "forced_vendor_signup_funnel",
    label: "forced_vendor_signup_funnel",
    stages: [
      "growth_loop_l1_invite_emitted",
      "growth_loop_l1_invite_clicked",
      "growth_loop_l1_signup_attributed",
      "seller_onboarding_first_requirement_response",
      "growth_loop_l1_first_bid_completed",
      "seller_bid_workspace_closed",
    ],
    surfaceToken: '§51.5 Seller Parity Dashboard "Forced-Signup Funnel" panel',
    alertToken: "Stage-level conversion regression > 20% → P2",
  },
  {
    id: "hero_moment_funnel",
    label: "hero_moment_funnel_seller",
    stages: [
      "seller_onboarding_landing_rendered",
      "seller_sso_completed",
      "seller_hero_moment_displayed",
      "hero_moment_completed",
      "seller_onboarding_first_requirement_response",
    ],
    surfaceToken: '§51.5 Seller Parity Dashboard "Hero Moment Funnel" panel',
    alertToken: "Stage-level regression > 10%",
  },
  {
    id: "hero_moment_funnel",
    label: "hero_moment_funnel_buyer",
    stages: [
      "buyer_hero_moment_eval_starter_intake_started",
      "buyer_hero_moment_eval_starter_intake_submitted",
      "buyer_hero_moment_materialization_completed",
      "buyer_hero_moment_completed",
      "buyer_first_requirement_edit",
    ],
    surfaceToken: '§51.3 Org-Level Dashboard "Buyer Hero Moment Funnel" panel',
    alertToken: "Stage-level regression > 10%",
  },
  {
    id: "conversion_moment_funnel",
    label: "conversion_moment_funnel_cm1",
    stages: ["seller_onboarding_conversion_moment_fired", "seller_onboarding_conversion_moment_clicked", "upgrade_completed"],
    surfaceToken: '§51.5 Seller Parity Dashboard "Conversion Moment Funnel" panel',
    alertToken: "Per-CM trailing-90-day click-through-to-upgrade < 5% → P3",
  },
  {
    id: "pro_trial_seat_funnel",
    label: "pro_trial_seat_funnel",
    stages: ["m17_pro_trial_seat_grant_issued", "pro_trial_seat_grant_activated", "pro_trial_seat_grant_converted_to_paid"],
    surfaceToken: '§51.5 Seller Parity Dashboard "Pro Trial Seat Funnel" panel',
    alertToken: "< 30% activation OR < 20% conversion → P3",
  },
  {
    id: "buyer_referral_funnel",
    label: "buyer_referral_funnel",
    stages: [
      "m16_referral_created",
      "m16_referral_link_shared",
      "m16_referral_referee_signed_up",
      "m16_referral_referee_activated",
      "m16_referral_credit_issued",
      "m16_referral_credit_applied",
      "m16_referral_credit_fully_redeemed",
    ],
    surfaceToken: '§51.3 Org-Level Dashboard "Referral Funnel" panel',
    alertToken: "Stage-level regression > 15% → P3",
  },
];

const REQUIRED_5103_TOKENS = [
  "The conversion funnel registry is the closed list of customer-facing PLG funnels.",
  "Every funnel binds to (a) ordered stage list",
  "Appendix G",
  "CI gate `conversion_funnel_registry_canonical_consumer`",
  "no inline funnel-stage definition exists outside §51.0.3",
  "PostHog Insights → Funnels backing store auto-generates the funnel queries from §51.0.3",
];

const REQUIRED_CONSUMER_TOKENS = [
  {
    anchor: "51.3.3-panels-kpis",
    label: "§51.3.3 Panels & KPIs",
    tokens: [
      "Procurement Funnel",
      "Buyer Hero Moment Funnel",
      "Referral Funnel",
      "generated from §51.0.3",
    ],
  },
  {
    anchor: "51.5.6-acceptance-criteria-51-5",
    label: "§51.5.6 Acceptance Criteria",
    tokens: [
      "Onboarding Funnel",
      "Forced-Signup Funnel",
      "Hero Moment Funnel",
      "Conversion Moment Funnel",
      "Pro Trial Seat Funnel",
      "generated from §51.0.3",
    ],
  },
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

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number; endLine: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    endLine: section.endLine,
  };
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing conversion-funnel registry token: ${token}`);
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, "51.0.3-conversion-funnel-registry-per-growth-path");
  if (!section) {
    push(findings, doc, 0, "51.0.3-conversion-funnel-registry-per-growth-path", "§51.0.3 Conversion Funnel Registry section is missing.");
    return findings;
  }

  for (const token of REQUIRED_5103_TOKENS) requireToken(findings, doc, section.text, section.line, "§51.0.3", token);

  const table = parseTableAt(doc, section.line, section.endLine);
  const rowsById = new Map<string, string[]>();
  for (const row of table.rows) {
    const idCell = row.cells[0] ?? "";
    for (const funnel of FUNNELS) {
      if (idCell.includes(`\`${funnel.id}\``)) {
        const bucket = rowsById.get(funnel.id) ?? [];
        bucket.push(row.cells.join(" | "));
        rowsById.set(funnel.id, bucket);
      }
    }
  }

  for (const funnel of FUNNELS) {
    const candidates = rowsById.get(funnel.id) ?? [];
    const rowText = candidates.find((candidate) => funnel.stages.every((stage) => candidate.includes(stage)));
    if (!rowText) {
      push(findings, doc, section.line, funnel.label, `§51.0.3 is missing a complete ${funnel.label} row.`);
      continue;
    }
    for (const stage of funnel.stages) requireToken(findings, doc, rowText, section.line, `§51.0.3 ${funnel.label} row`, stage);
    requireToken(findings, doc, rowText, section.line, `§51.0.3 ${funnel.label} row`, funnel.surfaceToken);
    requireToken(findings, doc, rowText, section.line, `§51.0.3 ${funnel.label} row`, funnel.alertToken);
  }

  return findings;
}

function appendixJFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  let line = 0;
  for (let i = 1; i < doc.lines.length; i += 1) {
    if ((doc.lines[i] ?? "").includes("**`conversion_funnel_id_kind`**")) {
      line = i;
      break;
    }
  }
  if (!line) {
    push(findings, doc, 0, "conversion_funnel_id_kind", "Appendix J `conversion_funnel_id_kind` section is missing.");
    return findings;
  }
  const text = doc.lines.slice(line, line + 12).join("\n");
  const required = [
    "buyer_conversion_funnel",
    "seller_conversion_funnel",
    "forced_vendor_signup_funnel",
    "hero_moment_funnel_seller",
    "hero_moment_funnel_buyer",
    "conversion_moment_funnel_cm1",
    "conversion_moment_funnel_cm2",
    "conversion_moment_funnel_cm3",
    "conversion_moment_funnel_cm4",
    "pro_trial_seat_funnel",
    "buyer_referral_funnel",
  ];
  for (const token of required) requireToken(findings, doc, text, line, "Appendix J `conversion_funnel_id_kind`", token);
  return findings;
}

function appendixGFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, "appendix-g-posthog-event-taxonomy");
  if (!section) {
    push(findings, doc, 0, "Appendix G", "Appendix G PostHog Event Taxonomy section is missing.");
    return findings;
  }
  const stages = new Set(FUNNELS.flatMap((funnel) => funnel.stages));
  for (const stage of stages) {
    if (!section.text.includes(`\`${stage}\``) && !section.text.includes(stage)) {
      push(findings, doc, section.line, stage, `Appendix G is missing conversion-funnel stage event: ${stage}`);
    }
  }
  return findings;
}

function consumerFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const item of REQUIRED_CONSUMER_TOKENS) {
    const section = sectionText(doc, item.anchor);
    if (!section) {
      push(findings, doc, 0, item.anchor, `${item.label} is missing.`);
      continue;
    }
    for (const token of item.tokens) requireToken(findings, doc, section.text, section.line, item.label, token);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "conversion_funnel_registry_canonical_consumer",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...registryFindings(doc),
      ...appendixJFindings(doc),
      ...appendixGFindings(doc),
      ...consumerFindings(doc),
      ...m5RuntimeActiveFindings(doc, "conversion_funnel_registry_canonical_consumer"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
