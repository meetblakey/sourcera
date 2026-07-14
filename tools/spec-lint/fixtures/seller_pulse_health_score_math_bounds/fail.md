# Fixture

### 4.4.37 SellerBidWorkspacePulseHealth (Bid-Workspace-Scoped, Seller) {#4.4.37-sellerbidworkspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `score_value` | Decimal | required | Unbounded score. |

### 24.4.2 Seller Pulse Health Score Calculation {#24.4.2-seller-pulse-health-score-calculation}

Seller Pulse uses percentages. Null terms count as zero. Final lock can be recomputed.

| Term | Definition | Applicability |
| :---- | :---- | :---- |
| `response_completion_pct` | `submitted_response_item_count / materialized_response_item_count` | Phase 6+. |

| Phase / state band | Weight set | Term weights before null renormalization | Notes |
| :---- | :---- | :---- | :---- |
| Terminal Bid Workspace state | `final_lock` | Latest score frozen | Recompute allowed. |

#### 24.4.2.A Seller Pulse Health Score Math Safety Contract {#24.4.2.a-seller-pulse-health-score-math-safety-contract}

The fixture table is incomplete.

| Fixture ID | Weight set | Inputs | Expected result | Regression guarded |
| :---- | :---- | :---- | :---- | :---- |
| `seller_all_terms_null_red_zero` | `active_response` | All denominators `0` | Score 0 | Zero denominator |

### 24.4.5 Acceptance Criteria {#24.4.5-seller-pulse-acceptance-criteria}

2. The score computation should generally be bounded.

| `seller_pulse_health_score_math_bounds` | Phase 5.5 / Phase 24 P1 | `spec_binding_pending_pack_m02_3` | §24.4.2 formula parser. | Seller Pulse should be bounded. | Failure. | §24.4.2 |
