### 4.4.18 SellerSignal {#4.4.18-sellersignal}
| `suppressed_reason` | Enum | See Appendix J `seller_signal_suppressed_reason`: `k_anon_floor_not_met`, `tuple_distinctiveness_threshold_exceeded`; nullable | — |

### 27.9.5 Aggregation {#27.9.5-aggregation-and-k-anonymity-enforcement-pipeline}
suppressed_reason='distinctiveness_veto'

#### 27.9.5.1 State Machine {#27.9.5.1-k-anon-satisfied-state-machine}
suppressed_at_delivery_reason='distinctiveness_veto'

### 27.9.6 Delivery {#27.9.6-delivery-surfaces}
monthly digest on seller_starter, weekly on seller_growth+, real-time on seller_scale+

### 27.10.7 Webhook Catalog {#27.10.7-webhook-catalog}
delivery_audience_scope='seller'

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}
#### `webhook_delivery_audience_scope` (NEW)
| `seller` |

## Appendix M.5
| `seller_signal_enum_cadence_authority_consistency` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/seller_signal_enum_cadence_authority_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
