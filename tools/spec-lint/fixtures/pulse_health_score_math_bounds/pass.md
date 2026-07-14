# Fixture

#### 4.3.22.2 WorkspacePulseHealth (Workspace-Scoped, Buyer) {#4.3.22.2-workspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `composite_score` | Decimal(5,2) | Required; 0.00 <= value <= 100.00 | Final bounded score after null-term renormalization |
| `phase_velocity_pct` | Decimal(5,2) | Nullable; 0.00 <= value <= 100.00 | Normalized term defined in §20.3.1; higher is better |
| `component_weights_json` | JSONB | Required; keys limited to the four component names above; values sum to 1.0000 after renormalization | Snapshot |

**Acceptance criteria.**

1. `composite_score` MUST always be within [0, 100], including zero-denominator and abandoned-workspace fixtures.
2. `phase_velocity_pct` MUST be monotonic in lateness: on-time > one-day-late > two-times-slow for the same phase-duration baseline.

### 20.3.1 Health Score Calculation

| Term | Definition | Applicability |
| :---- | :---- | :---- |
| `sla_compliance_pct` | `safe_pct(requirements_within_sla, total_requirements)` | All active phases |
| `scoring_progress_pct` | `safe_pct(requirement_vendor_pairs_graded, total_requirement_vendor_pairs)` | Phase 10-11 |
| `response_rate_pct` | `safe_pct(requirements_with_vendor_response, total_requirements)` | Phase 6-11 |
| `phase_velocity_pct` | `clamp_pct(200 - ((actual_days_in_current_phase / sourcera_method_recommended_days) * 100))` | All active phases |

`safe_pct(numerator, denominator)` returns `null` when `denominator = 0`; otherwise it returns `clamp_pct((numerator / denominator) * 100)`. `clamp_pct(value)` returns `MAX(0, MIN(100, value))`. A null term is excluded from the weighted sum and the remaining non-null weights are renormalized to sum to 1.0. If every term in the selected weight set is null, the compute writes `composite_score = 0`, `color_band = red`, and `raw_inputs_json.empty_reason = no_available_terms`.

The old `Phase_velocity_ratio` term is retired. Velocity is now directionally correct. The deploy-time property test `pulse_health_velocity_monotonic_in_lateness` (§M.5) asserts the monotonicity.

#### 20.3.1.A Pulse Health Score Math Safety Contract {#20.3.1.a-pulse-health-score-math-safety-contract}

The CI gate `pulse_health_score_math_bounds` owns the formula-safety proof for §20.3.1 / §20.3.2. Persist `composite_score = clamp_pct(weighted_sum)`. The final-score clamp is mandatory. Reject any compute output that would persist `NaN`, `Infinity`, `-Infinity`.

The property-test fixture set for `pulse_health_score_math_bounds` is:

| Fixture ID | Weight set | Inputs | Expected result | Regression guarded |
| :---- | :---- | :---- | :---- | :---- |
| `all_terms_null_red_zero` | `phase_10_to_11` | All denominators `0` | `composite_score = 0`; `color_band = red`; no `NaN` / `Infinity` | Zero denominator |
| `null_term_renormalization` | `phase_6_to_9` | `sla_compliance_pct = null`; `response_rate_pct = 50`; `phase_velocity_pct = 100` | `composite_score = 66.67`; applied weights response `0.6667`, velocity `0.3333` | Null term |
| `velocity_monotonic_in_lateness` | `pre_phase_6` | Actual days `10`, `11`, `20` | `phase_velocity_pct` sequence `100`, `90`, `0`; non-increasing as lateness grows | Velocity |
| `component_and_final_clamp` | `phase_10_to_11` | Over-complete numerator fixtures | `composite_score = clamp_pct(weighted_sum)` and never exceeds `100` | Final clamp |
| `negative_or_invalid_output_blocked` | Any active weight set | Invalid arithmetic fixtures | No persisted `NaN`, `Infinity`, `-Infinity`, or score outside `0-100` | Non-finite output |

### 20.3.2 Health Score Phases

| Phase band | Weight set | Term weights before null renormalization | Notes |
| :---- | :---- | :---- | :---- |
| Before Phase 6 | `pre_phase_6` | SLA 0.5; Velocity 0.5 | Scoring and response terms excluded |
| Phase 6-9 | `phase_6_to_9` | SLA 0.4; Response 0.4; Velocity 0.2 | Scoring excluded |
| Phase 10-11 | `phase_10_to_11` | SLA 0.3; Scoring 0.3; Response 0.2; Velocity 0.2 | Full score |
| Phase 12+ | `phase_12_locked` | Latest Phase 10-11 score frozen | No mutable recompute; audit annotations append only |

| From Phase | To Phase | Trigger | Weight Set | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Phase 10-11 | Phase 12 | Phase 12 entry lock succeeds | `phase_12_locked` | Latest score is frozen; `locked_at` stamped |

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

5. Pulse Health compute MUST write exactly one current-day WorkspacePulseHealth row per Workspace / compute date, apply the §20.3.1.A final-score clamp, exclude null terms from weight normalization, preserve velocity monotonicity, and never persist NaN / Infinity.

| `pulse_health_score_math_bounds` | Phase 4.11 P1 | **`runtime_active`** | §20.3 formula parser and property-test fixture set. | Pulse Health Score computation MUST use `phase_velocity_pct`, per-term `clamp_pct`, final-score clamp, null-term exclusion with weight renormalization, and no NaN / Infinity output. | Property-test failure naming the generated input vector. | §20.3.1; §20.3.1.A; §20.3.2; §20.7 AC #5; tools/spec-lint/gates/pulse_health_score_math_bounds.ts |
