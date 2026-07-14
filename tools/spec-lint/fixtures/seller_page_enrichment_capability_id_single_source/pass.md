### 4.4.10 SellerOrgPage

The page uses `seller_page_enrichment`; legacy `page_enrichment` accepted only as an alias and rewritten to canonical at write time via CapabilityRegistryEntry.aliases. Field enrichment_cost_center_resolved MUST NOT be hardcoded.

### 4.4.11 SoftwarePage

The page uses `seller_page_enrichment`; legacy alias `page_enrichment` accepted at API boundary and rewritten at write time. Field enrichment_cost_center_resolved mirrors SellerOrgPage.

### 26.7.2 Page Enrichment via `seller_page_enrichment` Capability

The `seller_page_enrichment` capability is the canonical Appendix J `capability_id` per §21.4.2 row 1; model tier, cost center, prices, and minimum plan gate are owned by the CapabilityRegistryEntry / §34.1.2 authority chain. The legacy alias `page_enrichment` is accepted at the API boundary and rewritten to canonical form at write time. The worker reads CapabilityRegistryEntry.cost_center_default and cites §21.4.2 / §34.1.2 / §34.14.1 row-8 chain plus §34.8.5 / §34.1.2 for plan gates.

### 26.8.5 Software Pages

SoftwarePages use the same canonical `seller_page_enrichment` capability and workflow as SellerOrgPages (§26.7.2); legacy `page_enrichment` is accepted only as a CapabilityRegistryEntry alias and is rewritten at the API boundary.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_page_enrichment_capability_id_single_source` | capability_registry_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/seller_page_enrichment_capability_id_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
