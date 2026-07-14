import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  capabilityDeclarationSection26NoShadowSchemaFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "capability_declaration_section_26_no_shadow_schema",
  "data_model_contract",
  capabilityDeclarationSection26NoShadowSchemaFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
