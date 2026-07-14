import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildMarketplaceMatchProactiveGate,
  marketplaceProactiveOfferKindChannelSplitFindings,
} from "./marketplace_match_proactive_gate_helpers.js";

export const gate = buildMarketplaceMatchProactiveGate(
  "marketplace_proactive_offer_offer_kind_channel_split",
  "enum_consistency",
  marketplaceProactiveOfferKindChannelSplitFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
