## 27.4 Marketplace Match Score {#27.4-marketplace-match-score}

The current build authority is this §27.4 plus the §4.5.10 / §4.5.11 / §4.5.12 entity homes. Retired Summary / KB-spec sources are provenance only and MUST NOT be cited as current authority. KB freshness feature computation uses §22.5 KB Health Model + §22.8.4.1 `kb_retrieve_freshness` enum contract. Each materialized score writes to a MarketplaceMatchScoreSnapshot row (§4.5.12). The feature set is an Ops-managed registry (`MarketplaceMatchFeatureRegistry`, canonical entity §4.5.10). Every trained model version persists as a `MarketplaceMatchScoreModelVersion` entity (§4.5.11). Each materialized score writes to a `MarketplaceMatchScoreSnapshot` row (§4.5.12).

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `marketplace_match_score_forward_reference_resolution` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/marketplace_match_score_forward_reference_resolution.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
