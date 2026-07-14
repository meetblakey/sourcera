### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

| `drift_severity` | Enum | See Appendix J `cost_base_recalc_drift_severity`: `normal` (`|drift| ≤ 5%`), `warning_5_10` (`5 < |drift| ≤ 10`), `alert_10_25` (`10 < |drift| ≤ 25`), `critical_gt_25` (`|drift| > 25`) | Drives notification routing |
| (init) | `auto_applied` | Recalc run with `drift_severity ∈ {normal, warning_5_10}` AND `margin_floor_breach=false` | Auto-applied; capability rate card published in next minute | |

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Per-capability drift threshold (no notification, audit only — `normal`) | `\|drift\| ≤ 5%` | §4.8.6 enum |
| Per-capability drift threshold (Finance-aware, auto-publish — `warning_5_10`) | `5% < \|drift\| ≤ 10%` | §4.8.6 enum |

**Authoritative publish-gating rule.** A cost-base recalc that produces `drift_severity ∈ {normal, warning_5_10}` AND `margin_floor_breach=false` auto-publishes.

### 34.11.3 Cost-Base Recalculation (Operational Cross-Reference)

- Drift severity bands: `normal`, `warning_5_10`, `alert_10_25`, and `critical_gt_25` per §4.8.6.

### Cost-Base Recalc Drift Severity (§4.8.6)

`normal`, `warning_5_10`, `alert_10_25`, `critical_gt_25`

**Drift Severity.** The categorical magnitude of the per-capability cost_base change observed by the nightly recalc job: `normal` (≤5%), `warning_5_10` (5–10%), `alert_10_25` (10–25%), `critical_gt_25` (>25%).
