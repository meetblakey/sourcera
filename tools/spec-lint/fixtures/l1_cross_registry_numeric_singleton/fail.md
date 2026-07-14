## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| GrowthLoopExecution — attribution-window expiry | L1: 60 days. |

## 44.1 Performance Targets {#44.1-performance-targets}

| Metric | Target |
| :---- | :---- |
| PostHog Insights funnel query performance | p95 ≤ 30 seconds for PostHog Insights → Funnels. |

### 48.4.10 Signal Integrity Monitor (SIM) Cross-Reference {#48.4.10-sim-cross-reference}

#### L1 SIM threshold registry

| Signal | Threshold | Action |
| :---- | :---- | :---- |
| L1 signup-attribution rate | review | none |

### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

The 60-day window and p95 ≤ 30 seconds remain inline, while invite velocity is > 4× cohort 95th-percentile.

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_cross_registry_numeric_singleton` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | incomplete | M02.3 |
