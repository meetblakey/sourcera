import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildMarketplaceMatchProactiveGate,
  marketplaceMatchScoreForwardReferenceFindings,
} from "./marketplace_match_proactive_gate_helpers.js";

export const gate = buildMarketplaceMatchProactiveGate(
  "marketplace_match_score_forward_reference_resolution",
  "content_consistency",
  marketplaceMatchScoreForwardReferenceFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
