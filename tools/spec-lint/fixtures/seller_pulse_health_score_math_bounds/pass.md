# Fixture

### 4.4.37 SellerBidWorkspacePulseHealth (Bid-Workspace-Scoped, Seller) {#4.4.37-sellerbidworkspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `score_value` | Decimal | 0-100; required | Final bounded Seller Pulse Health Score after null-term renormalization and final clamp. |
| `locked` | Boolean | Default `false` | True once `snapshot_kind=final_lock` or terminal Bid Workspace state freezes the score. |
| `lock_reason` | Enum | Appendix J `seller_pulse_lock_reason`; nullable | Terminal reason for the lock. |

**Acceptance criteria.**

2. `score_value` MUST remain in the inclusive 0-100 range, apply the §24.4.2.A final-score clamp, exclude null terms from weight normalization, and never persist NaN / Infinity; all-null inputs MUST write `score_value=0` / `color_band=red` with `raw_inputs_json.empty_reason`.
3. Final-lock rows MUST be immutable except for retention / DSAR redaction metadata.

### 24.4.2 Seller Pulse Health Score Calculation {#24.4.2-seller-pulse-health-score-calculation}

Seller Pulse Health Score uses bounded 0-100 component terms and the same `safe_pct` / `clamp_pct` semantics as §20.3.1: `safe_pct(numerator, denominator)` returns `null` when `denominator = 0`; otherwise it returns `clamp_pct((numerator / denominator) * 100)`. `clamp_pct(value)` returns `MAX(0, MIN(100, value))`. Null terms are excluded from the weighted sum and remaining non-null weights are renormalized to 1.0. If every term in the selected weight set is null, the compute writes `score_value = 0`, `color_band = red`, and `raw_inputs_json.empty_reason = no_available_terms`.

| Term | Definition | Applicability |
| :---- | :---- | :---- |
| `response_completion_pct` | `safe_pct(submitted_response_item_count, materialized_response_item_count)` | Phase 6+ while Bid Workspace is active/submitted. |
| `on_time_submission_pct` | `safe_pct(on_time_submitted_response_item_count, submitted_response_item_count)` | Phase 6+ when at least one response has been submitted. |
| `amendment_reverification_turnaround_pct` | `safe_pct(amendment_reverification_cleared_within_target_count, amendment_reverification_required_count)` | Only after buyer amendments require seller re-verification per §25.5. |
| `kb_utilization_pct` | `safe_pct(submitted_response_items_with_verified_kb_citation_count, submitted_response_item_count)` | Phase 6+ when at least one response has been submitted. |
| `deadline_readiness_pct` | `safe_pct(non_overdue_seller_deadline_count, seller_deadline_count)` | Any active Bid Workspace phase with seller-owned deadlines. |

| Phase / state band | Weight set | Term weights before null renormalization | Notes |
| :---- | :---- | :---- | :---- |
| Before buyer Phase 6 projection | `pre_bidding` | Deadline readiness 0.5; KB utilization 0.5 | Response terms excluded until seller response items are materialized. |
| Buyer Phase 6-10 projection | `active_response` | Response completion 0.4; on-time submission 0.25; amendment turnaround 0.2; KB utilization 0.15 | Core bid-preparation window. |
| Buyer Phase 11-13 projection or Bid Workspace submitted | `post_submission` | Response completion 0.3; on-time submission 0.2; amendment turnaround 0.2; KB utilization 0.3 | Preserves post-submit learning signal. |
| Terminal Bid Workspace state | `final_lock` | Latest non-terminal score frozen | No mutable recompute; append-only audit / retention metadata only. |

#### 24.4.2.A Seller Pulse Health Score Math Safety Contract {#24.4.2.a-seller-pulse-health-score-math-safety-contract}

The CI gate `seller_pulse_health_score_math_bounds` owns the formula-safety proof for §24.4.2 / §24.4.3. Implementations MUST follow this order:

1. Compute all terms through `safe_pct`.
2. Drop every term whose computed value is `null`.
3. Renormalize the remaining non-null weights to sum to 1.0.
4. Compute `weighted_sum = SUM(clamped_term_value * normalized_weight)` over the non-null terms only.
5. Persist `score_value = clamp_pct(weighted_sum)`; the final-score clamp is mandatory even when every component term was already clamped.
6. If every selected term is `null`, persist `score_value = 0`, `color_band = red`, and `raw_inputs_json.empty_reason = no_available_terms`.
7. Reject any compute output that would persist `NaN`, `Infinity`, `-Infinity`, or a score outside `0 <= score_value <= 100`.
8. Final-lock snapshots are immutable.

The property-test fixture set for `seller_pulse_health_score_math_bounds` is:

| Fixture ID | Weight set | Inputs | Expected result | Regression guarded |
| :---- | :---- | :---- | :---- | :---- |
| `seller_all_terms_null_red_zero` | `active_response` | All denominators `0` | `score_value = 0`; `color_band = red`; no `NaN` / `Infinity` | Zero denominator |
| `seller_null_term_renormalization` | `active_response` | `response_completion_pct = null`; `on_time_submission_pct = 80`; `amendment_reverification_turnaround_pct = 100`; `kb_utilization_pct = 50` | `score_value = 79.17`; applied weights on-time `0.4167`, amendment `0.3333`, KB `0.2500` | Null term |
| `seller_component_and_final_clamp` | `post_submission` | Over-complete numerator fixtures | `score_value = clamp_pct(weighted_sum)` and never exceeds `100` | Final clamp |
| `seller_final_lock_immutable` | `final_lock` | Existing final-lock row plus changed inputs | Existing `score_value`, `color_band`, `locked_at`, and `lock_reason` are preserved; no mutable recompute row is written | Final lock |
| `seller_invalid_output_blocked` | Any active weight set | Invalid arithmetic fixtures | No persisted `NaN`, `Infinity`, `-Infinity`, or score outside `0-100` | Non-finite output |

### 24.4.5 Acceptance Criteria {#24.4.5-seller-pulse-acceptance-criteria}

2. The score computation MUST use `safe_pct`, `clamp_pct`, null-term exclusion, and final-score clamp exactly as specified in §24.4.2 / §24.4.2.A, and MUST never persist NaN / Infinity.
3. A terminal Bid Workspace state MUST write or preserve exactly one `final_lock` snapshot and reject mutable recompute after `locked=true`.

| `seller_pulse_health_score_math_bounds` | Phase 5.5 / Phase 24 P1 | **`runtime_active`** | §24.4.2 formula parser and property-test fixture set. | Seller Pulse computation MUST use `safe_pct`, per-term `clamp_pct`, final-score clamp, null-term exclusion with weight renormalization, no NaN / Infinity output, and immutable final-lock behavior. | Property-test failure naming the generated input vector. | §24.4.2; §24.4.2.A; tools/spec-lint/gates/seller_pulse_health_score_math_bounds.ts |
