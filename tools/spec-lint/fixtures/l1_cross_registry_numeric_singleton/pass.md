## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| GrowthLoopExecution — attribution-window expiry | L1: 60 days; L2: 30 days; L4: 90 days; L7: 30 days; L10: 30 days. |

## 44.1 Performance Targets {#44.1-performance-targets}

| Metric | Target |
| :---- | :---- |
| PostHog Insights funnel query performance | p95 ≤ 30 seconds for PostHog Insights → Funnels. |

### 48.4.10 Signal Integrity Monitor (SIM) Cross-Reference {#48.4.10-sim-cross-reference}

#### L1 SIM threshold registry

| Signal | Threshold | Action |
| :---- | :---- | :---- |
| L1 signup-attribution rate | > 3σ below cohort baseline | SIM review. |
| L1 invite velocity | > 4× cohort 95th-percentile | `growth_loop_velocity_anomaly_detected`. |

### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

L1 applies the §40.2 row **GrowthLoopExecution — attribution-window expiry**, §44.1 row **PostHog Insights funnel query performance**, and §48.4.10 **L1 SIM threshold registry**.

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_cross_registry_numeric_singleton` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/l1_cross_registry_numeric_singleton.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | L1 attribution, funnel, and SIM numeric values resolve only through §40.2, §44.1, and §48.4.10. | M02.3 |
