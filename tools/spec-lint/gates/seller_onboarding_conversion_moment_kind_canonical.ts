import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerOnboardingActivationGate,
  sellerOnboardingConversionMomentKindCanonicalFindings,
} from "./seller_onboarding_activation_gate_helpers.js";

export const gate = buildSellerOnboardingActivationGate(
  "seller_onboarding_conversion_moment_kind_canonical",
  "enum_consistency",
  sellerOnboardingConversionMomentKindCanonicalFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
