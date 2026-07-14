### 4.4.22 SellerOnboardingSession {#4.4.22-selleronboardingsession}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `stage_7_conversion_moment_kind` | Enum | Nullable; See Appendix J `seller_onboarding_conversion_moment_kind`: `mid_bid_ai_budget_wall`, `second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach`, `none` | Which Conversion Moment fired first |

### 49.1.7 Stage 7: Post-Submission Debrief {#49.1.7-stage-7-post-submission-debrief}

The loss-debrief insight gate itself is NOT a conversion-moment enum value and MUST NOT write `stage_7_conversion_moment_kind`. `seller_onboarding_conversion_moment_fired` carries moment_kind ∈ Appendix J seller_onboarding_conversion_moment_kind. Conversion telemetry uses canonical values; the loss-debrief insight gate emits only `seller_loss_debrief_insight_gate_triggered`.

### 49.1.7.A Residual Contracts: Solo, Recovery, Instrumentation, and Provider Failure {#49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure}

Stage 7 no longer treats `loss_debrief_insight_gate` as a Conversion Moment. 48. `seller_onboarding_conversion_moment_kind_canonical`: Stage 7 MUST NOT emit `moment_kind='loss_debrief_insight_gate'`; property tests assert every Conversion Moment event uses one of Appendix J `seller_onboarding_conversion_moment_kind`.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Phase 12.1 Closure Cluster — Appendix J Audit, Canonicalization & Missing Enum Authoring {#appendix-j-section-phase-12-1-closure}

#### `seller_onboarding_conversion_moment_kind` (§4.4.22)

`mid_bid_ai_budget_wall`, `second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach`, `none`

#### `seller_onboarding_conversion_moment_kind_enum` (§48.1.7)

`cm1_mid_bid_ai_budget_wall`, `cm2_second_concurrent_bid`, `cm3_first_eoi`, `cm4_kb_ceiling`

**Notes.** Legacy analytics alias for the canonical Appendix J `seller_onboarding_conversion_moment_kind`. Product writes to SellerOnboardingSession and §49.1.7 Conversion Moment telemetry MUST use the canonical values.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_onboarding_conversion_moment_kind_canonical` | enum_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/seller_onboarding_conversion_moment_kind_canonical.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
