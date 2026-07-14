import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerOnboardingActivationGate,
  sellerOnboardingActivationEventsEnvelopeFindings,
} from "./seller_onboarding_activation_gate_helpers.js";

export const gate = buildSellerOnboardingActivationGate(
  "seller_onboarding_activation_events_use_51_envelope",
  "catalog_consistency",
  sellerOnboardingActivationEventsEnvelopeFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
