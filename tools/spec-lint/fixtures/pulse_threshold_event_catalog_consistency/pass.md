#### 4.3.22.2 WorkspacePulseHealth (Workspace-Scoped, Buyer) {#4.3.22.2-workspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `band_transition_event_id` | UUID | Nullable; FK -> webhook / notification outbox event | Populated when §31.14 `pulse.health_score_threshold_breached` is emitted |

- `(band_transition_event_id)` WHERE `band_transition_event_id IS NOT NULL` - webhook correlation.

5. Color-band transitions into yellow or red MUST populate `band_transition_event_id` when the §31 webhook / notification event is emitted.

## 20.3 Pulse Health Score {#20.3-pulse-health-score}

### 20.3.4 Health Score Trend

- **Threshold events:** Color-band transitions into yellow or red emit `pulse.health_score_threshold_breached` per §31.14. WorkspacePulseHealth.`band_transition_event_id` stores the correlation pointer, and the webhook is debounced per workspace / transition.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

6. A color-band transition into yellow or red MUST emit `pulse.health_score_threshold_breached` through §31.14 exactly once per debounce window and store the correlation pointer on WorkspacePulseHealth.

## 31.14 Pulse-Domain Webhook Completeness Pack {#31.14-pulse-domain-webhook-completeness-pack}

| Event | Class | Trigger | Payload fields | Recipient / subscriber policy | Retry / debounce |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `pulse.health_score_threshold_breached` | `pulse_domain` | WorkspacePulseHealth color-band transition into `yellow` or `red` after a compute or manual refresh | `event_id`, `workspace_id`, `workspace_pulse_health_id`, `org_id`, `health_score`, `prior_health_score`, `color_band`, `prior_color_band`, `band_transition`, `weight_set`, `pipeline_phase`, `triggered_at`, `debounce_window_minutes`, `correlation_id` | Buyer Org webhook endpoints subscribed to Pulse-domain events; user-facing notifications route to Workspace Owner, Workspace Admins, and Executive Sponsor per §5.9 / §5.11. Seller and public Marketplace subscribers are not eligible. | Standard Appendix F retry; 60-minute debounce per Workspace and `band_transition`. |

`band_transition` values are Appendix J `pulse_health_band_transition`. The event is also registered in Appendix C and Appendix G.

5. Appendix C and Appendix G registrations MUST match the §31.14 event name and payload field set.

| `pulse.health_score_threshold_breached` | WorkspacePulseHealth color-band transition into yellow or red (§20.3.4 / §31.14) | Workspace Owner, Workspace Admins, Executive Sponsor, subscribed Buyer Org webhook endpoints | Yes | Yes | Immediate, debounced 60 minutes per Workspace / transition | `standard` (F.1) | Payload carries `workspace_id`, `workspace_pulse_health_id`, `health_score`, `prior_health_score`, `color_band`, `prior_color_band`, `band_transition`, `weight_set`, `pipeline_phase`, `triggered_at`, and `correlation_id`. |

| `pulse_health_score_threshold_breached` | Mirror of Appendix C `pulse.health_score_threshold_breached` | `source_webhook_event_type='pulse.health_score_threshold_breached'`, `workspace_pulse_health_id`, `health_score`, `prior_health_score`, `color_band`, `prior_color_band`, `band_transition`, `weight_set`, `pipeline_phase`, `debounce_window_minutes` |

#### `pulse_health_color_band` (§4.3.22.2, §20.3.3)

**Notes.** Render band for WorkspacePulseHealth. Color token mapping is a design-system concern; this enum only records the semantic band and drives Appendix J `pulse_health_band_transition` threshold-transition detection for `pulse.health_score_threshold_breached`.

#### `pulse_health_band_transition` (§20.3.4, §31.14)

`green_to_yellow`, `green_to_red`, `yellow_to_red`, `yellow_to_green`, `red_to_yellow`, `red_to_green`

**Notes.** Records semantic color-band transitions for WorkspacePulseHealth and the `pulse.health_score_threshold_breached` webhook. Only transitions into yellow or red emit the threshold-breached event.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_threshold_event_catalog_consistency` | webhook_catalog_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/pulse_threshold_event_catalog_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every reference to `pulse.health_score_threshold_breached` MUST resolve to §31.14, Appendix C, Appendix G, Appendix J `pulse_health_band_transition`, and the WorkspacePulseHealth transition pointer. | M02.3 |
