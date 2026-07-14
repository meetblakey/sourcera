import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  buildSellerPublicPagesGate,
  sellerPageEnrichmentCapabilityIdSingleSourceFindings,
} from "./seller_public_pages_gate_helpers.js";

export const gate = buildSellerPublicPagesGate(
  "seller_page_enrichment_capability_id_single_source",
  "catalog_consistency",
  sellerPageEnrichmentCapabilityIdSingleSourceFindings,
);

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
