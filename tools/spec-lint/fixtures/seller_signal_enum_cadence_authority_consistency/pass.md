### 4.4.18 SellerSignal {#4.4.18-sellersignal}
| `suppressed_reason` | Enum | See Appendix J `seller_signal_suppressed_reason`: `k_anon_floor_not_met`, `buyer_opt_out`, `residency_mismatch`, `vendor_opt_out`, `expired`, `distinctiveness_exceeds_threshold`; nullable | — |
| `suppressed_at_delivery_reason` | Enum | See Appendix J `seller_signal_delivery_suppressed_reason`; nullable | — |
suppressed_reason=distinctiveness_exceeds_threshold

### 27.9.5 Aggregation {#27.9.5-aggregation-and-k-anonymity-enforcement-pipeline}
suppressed_reason='distinctiveness_exceeds_threshold'
suppressed_at_delivery_reason='recompute_deadline_exceeded'
seller_signal_delivery_suppressed_reason

#### 27.9.5.1 State Machine {#27.9.5.1-k-anon-satisfied-state-machine}
suppressed_reason='distinctiveness_exceeds_threshold'
suppressed_at_delivery_reason='distinctiveness_exceeds_threshold'

### 27.9.6 Delivery {#27.9.6-delivery-surfaces}
§34.1.2 cell **Seller Signals** does not restate plan-tier cadence values

### 27.9.12 Acceptance Criteria {#27.9.12-acceptance-criteria}
suppressed_reason='distinctiveness_exceeds_threshold'
suppressed_at_delivery_reason='recompute_deadline_exceeded'

### 27.10.7 Webhook Catalog {#27.10.7-webhook-catalog}
Seller Org recipient description only.

## 26.2 Verification Tiers {#26.2-verification-tiers}
§4.4.21 is the canonical source

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}
### `seller_signal_suppressed_reason` (Seller Signal Suppressed Reason)
`k_anon_floor_not_met`, `buyer_opt_out`, `residency_mismatch`, `vendor_opt_out`, `expired`, `distinctiveness_exceeds_threshold`
### `seller_signal_delivery_suppressed_reason` (Seller Signal Delivery Suppressed Reason)
`k_anon_floor_not_met`, `distinctiveness_exceeds_threshold`, `vendor_opt_out`, `recompute_deadline_exceeded`
#### `webhook_delivery_audience_scope` (NEW)
| `subject` |
| `reporter` |
| `ops` |
`seller` and `buyer` are recipient descriptions in domain catalogs, not `webhook_delivery_audience_scope` values.

## Appendix M.5
| `seller_signal_enum_cadence_authority_consistency` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/seller_signal_enum_cadence_authority_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
