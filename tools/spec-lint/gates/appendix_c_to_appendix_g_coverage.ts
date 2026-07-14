/**
 * Gate: `appendix_c_to_appendix_g_coverage`
 * Source phase: v7.2.0-REM Phase 6 (§M.5.18)
 *
 * Assertion: every Phase 6, Phase 10, and Marketplace Signals Appendix C
 * webhook has the underscore-form Appendix G mirror required by §31.8 AC #16.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  PHASE_6_EVENTS,
  POLICY_INGESTION_EVENTS,
  dottedToUnderscore,
  lineForToken,
  requireSection,
  sectionText,
} from "./catalog_gate_helpers.js";

const MARKETPLACE_SIGNALS_EVENTS = [
  "marketplace.seller_signal.cohort_published",
  "marketplace.seller_signal.cohort_refreshed",
  "marketplace.seller_signal.cohort_suppressed",
  "marketplace.seller_signal.digest_ready",
  "marketplace.seller_signal.direct_invite.offered",
  "marketplace.seller_signal.direct_invite.accepted",
  "marketplace.seller_signal.direct_invite.declined",
  "marketplace.seller_signal.direct_invite.expired",
  "marketplace.seller_signal.de_anonymization_recorded",
  "marketplace.buyer_signal_opt_in.changed",
  "marketplace.buyer_signal_opt_in.ops_paused",
  "marketplace.buyer_signal_opt_in.dsar_recompute_completed",
  "marketplace.seller_signal.digest_skipped_empty",
];

const MARKETPLACE_SIGNALS_LEGACY_ALIASES = [
  "marketplace.seller_signal.delivered",
  "marketplace.seller_signal.suppressed",
  "marketplace.seller_signal.cohort_fell_below_floor",
  "marketplace.seller_signal.de_anonymized",
  "marketplace.direct_invite.offer_created",
  "marketplace.direct_invite.buyer_accepted",
  "marketplace.direct_invite.buyer_declined",
  "marketplace.direct_invite.expired",
];

function mirrorFindings(
  docPath: string,
  text: string,
  anchor: string,
  events: string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const event of events) {
    const mirror = dottedToUnderscore(event);
    if (!text.includes(mirror)) {
      findings.push({
        file: docPath,
        line: 0,
        anchor,
        matched_text: mirror,
        message: `Appendix G ${anchor} is missing underscore mirror ${mirror} for Appendix C event ${event}.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "appendix_c_to_appendix_g_coverage",
  sourcePhase: "v7.2.0-REM Phase 6",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const phase10 = sectionText(doc, "appendix-g-v72rem-phase-10");
    const phase6 = sectionText(doc, "appendix-g-v72rem-phase-6");
    const marketplaceSignals = sectionText(doc, "appendix-g-marketplace-signals-domain-events");
    const sellerSignalWebhookCatalog = sectionText(doc, "27.9.9-webhook-catalog");
    const findings: Finding[] = [
      ...requireSection(doc, "appendix-g-v72rem-phase-10", "Appendix G Phase 10 Policy Ingestion mirrors"),
      ...requireSection(doc, "appendix-g-v72rem-phase-6", "Appendix G Phase 6 webhook mirrors"),
      ...requireSection(doc, "appendix-g-marketplace-signals-domain-events", "Appendix G Marketplace Signals mirrors"),
      ...mirrorFindings(doc.path, phase10, "appendix-g-v72rem-phase-10", POLICY_INGESTION_EVENTS),
      ...mirrorFindings(doc.path, phase6, "appendix-g-v72rem-phase-6", PHASE_6_EVENTS.filter((event) => event !== "marketplace.buyer_signal_opt_in.dsar_recompute_completed")),
      ...mirrorFindings(doc.path, marketplaceSignals, "appendix-g-marketplace-signals-domain-events", MARKETPLACE_SIGNALS_EVENTS),
    ];
    for (const event of MARKETPLACE_SIGNALS_EVENTS) {
      if (!sellerSignalWebhookCatalog.includes(event)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, "27.9.9 Webhook Catalog"),
          matched_text: event,
          message: `§27.9.9 must use canonical Appendix C Marketplace Signals event ${event}.`,
        });
      }
    }
    for (const alias of MARKETPLACE_SIGNALS_LEGACY_ALIASES) {
      if (sellerSignalWebhookCatalog.includes(alias)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, alias),
          matched_text: alias,
          message: `§27.9.9 must not emit retired Marketplace Signals alias ${alias}.`,
        });
      }
    }
    if (!doc.text.includes("§31.8 AC #16 `.` → `_` transliteration")) {
      findings.push({
        file: doc.path,
        line: lineForToken(doc, "§31.8 AC #16"),
        matched_text: "§31.8 AC #16",
        message: "Appendix G must retain the §31.8 dot-to-underscore mirror rule.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
