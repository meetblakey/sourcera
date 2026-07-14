import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  verificationTierCriteriaSingleSourceFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "verification_tier_criteria_single_source",
  "enum_consistency",
  verificationTierCriteriaSingleSourceFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
