import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildMarketplaceMatchProactiveGate,
  marketplaceProactiveOfferEntityContractFindings,
} from "./marketplace_match_proactive_gate_helpers.js";

export const gate = buildMarketplaceMatchProactiveGate(
  "marketplace_proactive_offer_entity_contract_completeness",
  "data_model_contract",
  marketplaceProactiveOfferEntityContractFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
