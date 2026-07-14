### 4.4.22 SellerOnboardingSession {#4.4.22-selleronboardingsession}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `stage_7_conversion_moment_kind` | Enum | Nullable; See Appendix J `seller_onboarding_conversion_moment_kind`: `second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach`, `none` | Missing mid-bid wall |

### 49.1.7 Stage 7: Post-Submission Debrief {#49.1.7-stage-7-post-submission-debrief}

Loss debrief may write conversion moment kind.

### Phase 12.1 Closure Cluster — Appendix J Audit, Canonicalization & Missing Enum Authoring {#appendix-j-section-phase-12-1-closure}

#### `seller_onboarding_conversion_moment_kind` (§4.4.22)

`second_concurrent_bid`, `first_eoi_attempt`, `loss_debrief_insight_gate`, `none`

Stage 7 | `completed` (with `conversion_moment_kind` populated per `seller_onboarding_conversion_moment_kind_enum`)

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_onboarding_conversion_moment_kind_canonical` | enum_consistency | spec_binding_pending_pack_m02_3 | property_test | fail | M02.3 |
