### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

`growth_loop_l1_first_bid_completed` carries `seller_org_id` and `bid_workspace_id`. `growth_loop_l1_first_bid_completed` and `seller_onboarding_first_bid_submitted` MUST represent the same logical bid submission in a PostHog Insights joined funnel.

### 48.8.4 In-Workspace Value Proof {#48.8.4-in-workspace-value-proof-minutes-3-45}

`seller_onboarding_first_requirement_response` and `seller_onboarding_first_bid_submitted` carry `session_id` and `bid_workspace_id`.

### 49.1.5 Stage 5: In-Workspace Review {#49.1.5-stage-5-in-workspace-review}

`seller_onboarding_first_requirement_response` is the only emitted event name.

### 49.1.6 Stage 6: First Bid Submission {#49.1.6-stage-6-first-bid-submission}

`seller_onboarding_first_bid_submitted` is the emitted first-bid event.

### 51.0.3 Conversion Funnel Registry {#51.0.3-conversion-funnel-registry-per-growth-path}

| Funnel ID | Stages |
| :---- | :---- |
| `forced_vendor_signup_funnel` | `growth_loop_l1_first_bid_completed` joined to `seller_onboarding_first_bid_submitted` on `(seller_org_id, bid_workspace_id)` |

### 51.1.5 Event Catalog Cross-Reference (→ Appendix G) {#51.1.5-event-catalog-cross-reference-appendix-g}

The Forced-Vendor-Signup Playbook includes `growth_loop_l1_first_bid_completed` and `seller_onboarding_first_bid_submitted` as the same logical L1-linked bid submission with a shared analytics join.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `growth_loop_l1_first_bid_completed` | Bid submitted | `seller_org_id`, `bid_workspace_id` |
| `seller_onboarding_first_bid_submitted` | First bid submitted | `seller_org_id`, `bid_workspace_id` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_hero_moment_first_bid_handoff` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/l1_hero_moment_first_bid_handoff.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | First-bid join contract. | M02.3 |
