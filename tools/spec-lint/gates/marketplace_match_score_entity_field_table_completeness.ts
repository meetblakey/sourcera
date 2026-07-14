import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildMarketplaceMatchProactiveGate,
  marketplaceMatchScoreEntityFieldTableFindings,
} from "./marketplace_match_proactive_gate_helpers.js";

export const gate = buildMarketplaceMatchProactiveGate(
  "marketplace_match_score_entity_field_table_completeness",
  "data_model_contract",
  marketplaceMatchScoreEntityFieldTableFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
