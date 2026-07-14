### 4.4.22 SellerOnboardingSession {#4.4.22-selleronboardingsession}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `hero_moment_completed_at` | Timestamp | Nullable | **Authoritative hero-moment timestamp**. Set when all three Stage 3 surfaces render pre-touch AND `stage_3_population_latency_ms` satisfies §44.1 `Seller onboarding Stage-3 population-latency threshold`. |

- **Hero-moment completion:** `hero_moment_completed_at IS NOT NULL` iff all three Stage 3 surfaces rendered pre-touch AND `stage_3_population_latency_ms` satisfies §44.1 `Seller onboarding Stage-3 population-latency threshold`. Written by the Bid Workspace render path at first paint.

### 48.1.5 Seller Hero Moment Framework {#48.1.5-seller-hero-moment-framework-cross-reference}

**Terminal-state predicate — canonical contract.** The SINGLE canonical Hero Moment terminal predicate is the §4.4.22 `hero_moment_completed_at` write. The Post-Submission Reveal and Stake-Reveal Screen are POST-HERO-MOMENT surfaces and do NOT redefine the Hero Moment's terminal predicate. The activation metric uses `activation_metric_elapsed_seconds = first_requirement_response_at - stage_1_arrival_at`, NOT end-to-end-to-Stake-Reveal. CI gate `hero_moment_terminal_state_single_source` asserts this contract.

### 48.8.5 Post-Submission Reveal {#48.8.5-post-submission-reveal-hour-1}

**Purpose.** This is a post-Hero-Moment reinforcement surface after `hero_moment_completed_at` writes. It MUST NOT write or redefine `hero_moment_completed_at`; it renders the `reveal_moment = post_submission_reveal` surface.

### 48.8.10 Acceptance Criteria {#48.8.10-acceptance-criteria-aggregate}

The Hero Moment terminal predicate remains `hero_moment_completed_at`; Stake-Reveal measurements are post-Hero-Moment reinforcement metrics and do not redefine completion.

30. The Hero Moment p50 `activation_metric_elapsed_seconds` MUST satisfy the target.
31. The Hero Moment p90 `activation_metric_elapsed_seconds` MUST satisfy the target.

### Appendix G PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Payload |
|---|---|---|
| `hero_moment_completed` | `hero_moment_completed_at` write per §4.4.22 (single canonical terminal predicate per §48.1.5 V13 D-HM-001 remediation: Stage-3 surfaces present AND pause-adjusted latency satisfies §44.1 `Seller onboarding Stage-3 population-latency threshold`) | `{seller_org_id}` |

### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `hero_moment_terminal_state_single_source` | content_consistency | runtime_active | github_actions + post-build | tools/spec-lint/gates/hero_moment_terminal_state_single_source.ts enforces the §4.4.22 `hero_moment_completed_at` predicate across §48.1.5 / §48.8.5 / §48.8.10; Stake-Reveal remains post-Hero-Moment | M02.3 |
