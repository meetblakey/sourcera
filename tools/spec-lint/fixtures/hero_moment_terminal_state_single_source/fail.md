### 4.4.22 SellerOnboardingSession {#4.4.22-selleronboardingsession}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `hero_moment_completed_at` | Timestamp | Nullable | Set when ready. |

### 48.1.5 Seller Hero Moment Framework {#48.1.5-seller-hero-moment-framework-cross-reference}

The Hero Moment can be considered complete at Stake-Reveal.

### 48.8.5 Post-Submission Reveal {#48.8.5-post-submission-reveal-hour-1}

**Purpose.** This is where the vendor first perceives Sourcera as an asset, a moment-of-value-perception.

### 48.8.10 Acceptance Criteria {#48.8.10-acceptance-criteria-aggregate}

30. The Hero Moment p50 is measured to stake_reveal_rendered.
31. The Hero Moment p90 is measured to stake_reveal_rendered.

### Appendix G PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Payload |
|---|---|---|
| `hero_moment_completed` | Stake-Reveal render | `{seller_org_id}` |

### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `hero_moment_terminal_state_single_source` | content_consistency | spec_binding_pending_pack_m02_3 | github_actions + post-build | Stake-Reveal can close the moment | M02.3 |
