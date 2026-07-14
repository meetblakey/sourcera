### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

`growth_loop_l1_first_bid_completed` carries `vendor_org_id` only.

### 49.1.5 Stage 5: In-Workspace Review {#49.1.5-stage-5-in-workspace-review}

`seller_first_requirement_response` is the canonical short form and MUST be emittable under BOTH names.

### 49.1.6 Stage 6: First Bid Submission {#49.1.6-stage-6-first-bid-submission}

`seller_first_bid_submitted` is the canonical short form.

### 51.0.3 Conversion Funnel Registry {#51.0.3-conversion-funnel-registry-per-growth-path}

| Funnel ID | Stages |
| :---- | :---- |
| `forced_vendor_signup_funnel` | `growth_loop_l1_first_bid_completed` |

### 51.1.5 Event Catalog Cross-Reference (→ Appendix G) {#51.1.5-event-catalog-cross-reference-appendix-g}

The Forced-Vendor-Signup Playbook includes `growth_loop_l1_first_bid_completed`.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `growth_loop_l1_first_bid_completed` | Bid submitted | `vendor_org_id` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_hero_moment_first_bid_handoff` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | incomplete | M02.3 |
