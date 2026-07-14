import type { Finding, SpecDoc } from "../lib/types.js";
import {
  findSectionByAnchor,
  splitUnescapedPipes,
} from "../lib/spec_loader.js";

export interface NamedToken {
  token: string;
  line: number;
}

export function sectionText(doc: SpecDoc, anchor: string): string {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return "";
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

export function requireSection(doc: SpecDoc, anchor: string, label: string): Finding[] {
  return sectionText(doc, anchor)
    ? []
    : [{
        file: doc.path,
        line: 0,
        anchor,
        message: `${label} section ${anchor} is missing; cannot verify catalog completeness.`,
      }];
}

export function firstCellBacktickTokens(doc: SpecDoc, anchor: string): NamedToken[] {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return [];
  const out: NamedToken[] = [];
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const trimmed = raw.trim().replace(/^\|/, "").replace(/\|$/, "");
    const firstCell = splitUnescapedPipes(trimmed)[0]?.trim() ?? "";
    const m = /^`([^`]+)`$/.exec(firstCell);
    if (m) out.push({ token: m[1], line });
  }
  return out;
}

export function lineForToken(doc: SpecDoc, token: string): number {
  for (let i = 1; i < doc.lines.length; i++) {
    if ((doc.lines[i] ?? "").includes(token)) return i;
  }
  return 0;
}

export function dottedToUnderscore(event: string): string {
  return event.replace(/\./g, "_");
}

export function missingTokens(
  doc: SpecDoc,
  anchor: string,
  label: string,
  expected: string[],
): Finding[] {
  const findings: Finding[] = requireSection(doc, anchor, label);
  const present = new Map(firstCellBacktickTokens(doc, anchor).map((t) => [t.token, t.line]));
  for (const token of expected) {
    if (!present.has(token)) {
      findings.push({
        file: doc.path,
        line: lineForToken(doc, token),
        anchor,
        matched_text: token,
        message: `${label} is missing required catalog row ${token}.`,
      });
    }
  }
  return findings;
}

export function duplicateTokens(
  doc: SpecDoc,
  anchor: string,
  label: string,
): Finding[] {
  const seen = new Map<string, NamedToken>();
  const findings: Finding[] = [];
  for (const item of firstCellBacktickTokens(doc, anchor)) {
    const prior = seen.get(item.token);
    if (prior) {
      findings.push({
        file: doc.path,
        line: item.line,
        anchor,
        matched_text: item.token,
        message: `${label} registers ${item.token} more than once; Appendix C coverage invariant requires exactly one row per event.`,
      });
    } else {
      seen.set(item.token, item);
    }
  }
  return findings;
}

export function requireText(
  doc: SpecDoc,
  anchor: string,
  text: string,
  message: string,
): Finding[] {
  const section = sectionText(doc, anchor);
  if (!section.includes(text)) {
    return [{
      file: doc.path,
      line: lineForToken(doc, text),
      anchor,
      matched_text: text,
      message,
    }];
  }
  return [];
}

export const POLICY_INGESTION_EVENTS = [
  "policy.ingestion.queued",
  "policy.ingestion.framework_detected",
  "policy.ingestion.framework_pending_user",
  "policy.ingestion.extraction_completed",
  "policy.ingestion.extraction_partial",
  "policy.ingestion.extraction_failed",
  "policy.ingestion.dedup_completed",
  "policy.ingestion.amendments_drafted",
  "policy.ingestion.published",
  "policy.ingestion.discarded",
  "policy.ingestion.failed",
];

export const PHASE_6_EVENTS = [
  "console_bridge.dlq_entered",
  "console_bridge.reconciliation_summary",
  "vendor.disqualified.org_level",
  "seller.bid_response.amendment_needs_reverification",
  "marketplace.match_score.model_deployed",
  "marketplace.match_score.model_deprecated",
  "marketplace.match_score.model_retired",
  "marketplace.match_score.model_rolled_back",
  "marketplace.match_score.computed",
  "marketplace.match_score.cache_invalidated",
  "marketplace.match_score.drift_alert",
  "marketplace.match_score.fairness_breach",
  "marketplace.match_score.feedback_review_slo_breach",
  "marketplace.abuse_evidence_bundle.opened",
  "marketplace.abuse_evidence_bundle.investigating_claimed",
  "marketplace.abuse_evidence_bundle.consolidated_decision_pending",
  "marketplace.abuse_evidence_bundle.closed",
  "marketplace.legal_process.received",
  "marketplace.legal_process.compliance_insufficient",
  "marketplace.legal_process.complied",
  "marketplace.legal_process.challenged",
  "marketplace.legal_process.sla_breach",
  "marketplace.transparency_report.published",
  "marketplace.buyer_signal_opt_in.dsar_recompute_completed",
  "vendor.opted_out",
  "vendor.opted_in",
  "vendor_opt_out.applied",
  "vendor_opt_out.revoked",
  "promoted_listing.created",
  "promoted_listing.paused",
  "promoted_listing.exhausted",
  "promoted_listing.auction_settled",
  "promoted_listing.auction_lost",
  "verification.review_completed",
  "featured_placement.activated",
  "featured_placement.expired",
  "marketplace_discovery.frequency_cap_bypass_suspected",
  "marketplace_discovery.anonymization_threshold_breach",
];
