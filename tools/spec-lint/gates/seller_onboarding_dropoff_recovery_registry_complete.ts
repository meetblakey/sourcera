import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerOnboardingActivationGate,
  sellerOnboardingDropoffRecoveryRegistryFindings,
} from "./seller_onboarding_activation_gate_helpers.js";

export const gate = buildSellerOnboardingActivationGate(
  "seller_onboarding_dropoff_recovery_registry_complete",
  "catalog_consistency",
  sellerOnboardingDropoffRecoveryRegistryFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
