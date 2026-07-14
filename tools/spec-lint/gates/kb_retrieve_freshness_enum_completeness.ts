/**
 * Gate: `kb_retrieve_freshness_enum_completeness`
 *
 * Assertion: `kb_retrieve.hits[].freshness` uses Appendix J
 * `kb_retrieve_freshness` and stale-classifier overrides do not down-cast stale
 * states.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "kb_retrieve_freshness_enum_completeness";
const SOURCE_PHASE = "v7.2.0-REM Phase 5.2";

const SECTION_TOKENS = [
  "\"freshness\": { \"type\": \"string\", \"enum\": [\"fresh\", \"review_due\", \"review_overdue\", \"flagged_stale\"], \"description\": \"Canonical Appendix J kb_retrieve_freshness value. review_overdue and flagged_stale are excluded from ordinary results unless exclude_review_states is overridden by the kb_staleness_classifier.\" }",
  "**Freshness classification contract.** Ordinary callers receive only `fresh` and `review_due` hits because `exclude_review_states` defaults to `[\"review_overdue\", \"flagged_stale\"]`. The `kb_staleness_classifier` override path (§21.4.1 #17; §22.17 AC #49) is the only path permitted to pass `exclude_review_states=[]`, and when it does, the returned `freshness` field MUST carry the actual Appendix J `kb_retrieve_freshness` value (`review_overdue` or `flagged_stale`) instead of down-casting to `review_due`.",
] as const;

const APPENDIX_J_TOKENS = [
  "### KB Retrieve Freshness (§22.8.4.1) (new)",
  "`fresh`, `review_due`, `review_overdue`, `flagged_stale`",
  "- Response enum for `kb_retrieve.hits[].freshness`; it mirrors the retrieval-relevant subset of `kb_entry_status`.",
  "- Ordinary callers receive only `fresh` and `review_due` because `exclude_review_states` defaults to `[\"review_overdue\", \"flagged_stale\"]`.",
  "- `review_overdue` and `flagged_stale` may appear only on the `kb_staleness_classifier` override path (§21.4.1 #17; §22.17 AC #49). Those values MUST NOT be down-cast to `review_due`.",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "22.8.4.1-kb_retrieve", "§22.8.4.1 kb_retrieve freshness contract", SECTION_TOKENS);
    requireDocTokens(findings, ctx.masterSpec, "Appendix J KB Retrieve Freshness", APPENDIX_J_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
