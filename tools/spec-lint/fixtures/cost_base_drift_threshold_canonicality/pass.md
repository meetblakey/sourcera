### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

| `drift_severity` | Enum | See Appendix J `cost_base_recalc_drift_severity`: `normal` (`|drift| ≤ 7%`), `warning_7_10` (`7 < |drift| ≤ 10`), `alert_10_25` (`10 < |drift| ≤ 25`), `critical_gt_25` (`|drift| > 25`) | Drives notification routing; `warning_5_10` is retired legacy input only and MUST rewrite to `warning_7_10` before persistence |
| (init) | `auto_applied` | Recalc run with `drift_severity ∈ {normal, warning_7_10}` AND `margin_floor_breach=false` | Auto-applied; capability rate card published in next minute | |

8. **D-DEC-010 remediation — Drift floor canonicality.** The drift-severity cut points MUST be exactly: `normal` when `|drift| ≤ 7%`, `warning_7_10` when `7% < |drift| ≤ 10%`, `alert_10_25` when `10% < |drift| ≤ 25%`, and `critical_gt_25` when `|drift| > 25%`. `warning_5_10` is a retired legacy alias accepted only by migration readers and MUST NOT be emitted by new writes. CI gate `cost_base_drift_threshold_canonicality` asserts §4.8.6, §34.3.3, Appendix J, Appendix K, and §M.5 remain aligned.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Per-capability drift threshold (no notification, audit only — `normal`) | `\|drift\| ≤ 7%` | §4.8.6 `cost_base_recalc_drift_severity` enum; D-DEC-010 F-1 remediation |
| Per-capability drift threshold (Finance-aware, auto-publish — `warning_7_10`) | `7% < \|drift\| ≤ 10%` | §4.8.6 enum; `warning_5_10` is a retired legacy alias only |

**Authoritative publish-gating rule (Phase 7 V7 D-CONS-001 remediation, 2026-05-07; D-DEC-010 threshold update, 2026-07-09).** A cost-base recalc that produces `drift_severity ∈ {normal, warning_7_10}` AND `margin_floor_breach=false` **auto-publishes**.

### 34.11.3 Cost-Base Recalculation (Operational Cross-Reference)

- Drift severity bands: `normal`, `warning_7_10`, `alert_10_25`, and `critical_gt_25` per §4.8.6; `alert_10_25`, `critical_gt_25`, and margin-floor breach require Finance approval

### Cost-Base Recalc Drift Severity (§4.8.6)

`normal`, `warning_7_10`, `alert_10_25`, `critical_gt_25`

Legacy alias: `warning_5_10` is retired as of D-DEC-010 (2026-07-09). Migration readers MAY accept it from historical rows and MUST rewrite it to `warning_7_10` before any new write, webhook, analytics event, or API response.

**Drift Severity.** The categorical magnitude of the per-capability cost_base change observed by the nightly recalc job: `normal` (≤7%), `warning_7_10` (>7–10%), `alert_10_25` (>10–25%), `critical_gt_25` (>25%). `warning_5_10` is a retired legacy alias accepted only by migration readers and rewritten to `warning_7_10`; new writes MUST NOT emit it. Drives auto-apply vs explicit Ops Finance approval routing per §4.8.6 AC #2 and §34.3.3.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `cost_base_drift_threshold_canonicality` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/cost_base_drift_threshold_canonicality.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §4.8.6, §34.3.3, §34.11.3, Appendix J, and Appendix K MUST use the 7/10/25 drift-severity bands: `normal` ≤7%, `warning_7_10` >7–10%, `alert_10_25` >10–25%, `critical_gt_25` >25%; live `warning_5_10`, `≤5%`, or `5–10%` cost-base drift threshold wording fails unless marked as retired legacy migration input. | M02.3 |
