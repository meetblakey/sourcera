# Fixture

#### 4.3.22.2 WorkspacePulseHealth (Workspace-Scoped, Buyer) {#4.3.22.2-workspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `composite_score` | Decimal | Required | Score |

### 20.3.1 Health Score Calculation

| Term | Definition | Applicability |
| :---- | :---- | :---- |
| `phase_velocity_ratio` | `(actual_days_in_current_phase / recommended_days)` | All active phases |

`safe_pct(numerator, denominator)` returns 0 when denominator = 0. Null terms count as zero.

#### 20.3.1.A Pulse Health Score Math Safety Contract {#20.3.1.a-pulse-health-score-math-safety-contract}

The fixture table is missing most proof rows.

| Fixture ID | Weight set | Inputs | Expected result | Regression guarded |
| :---- | :---- | :---- | :---- | :---- |
| `all_terms_null_red_zero` | `phase_10_to_11` | All denominators `0` | Score 0 | Zero denominator |

### 20.3.2 Health Score Phases

| Phase band | Weight set | Term weights before null renormalization | Notes |
| :---- | :---- | :---- | :---- |
| Phase 12+ | `phase_12_locked` | Latest score frozen | No mutable recompute |

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

5. Pulse Health compute should usually stay in range.

| `pulse_health_score_math_bounds` | Phase 4.11 P1 | `spec_binding_pending_pack_m02_3` | §20.3 formula parser. | Pulse Health Score computation should be bounded. | Failure. | §20.3.1; §20.7.2 |
