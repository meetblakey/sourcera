import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  sellerProfilePublicFieldContractFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "seller_profile_public_field_contract_completeness",
  "data_model_contract",
  sellerProfilePublicFieldContractFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
