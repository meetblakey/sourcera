#### 4.3.22.2 WorkspacePulseHealth (Workspace-Scoped, Buyer) {#4.3.22.2-workspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `band_transition_event_id` | UUID | Nullable | Populated when §31 `pulse.health_score_threshold_breached` is emitted |

## 20.3 Pulse Health Score {#20.3-pulse-health-score}

### 20.3.4 Health Score Trend

- **Threshold events:** Color-band transitions emit `pulse.health_score_threshold_breached` through the webhook catalog.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

6. A color-band transition into yellow or red MUST emit `pulse.health_score_threshold_breached` and store a pointer.

## 31.14 Pulse-Domain Webhook Completeness Pack {#31.14-pulse-domain-webhook-completeness-pack}

| Event | Class | Trigger | Payload fields | Recipient / subscriber policy | Retry / debounce |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `pulse.health_score_threshold_breached` | `pulse_domain` | Pulse transition | `event_id`, `workspace_id` | Buyer Org webhooks | Standard retry |

#### `pulse_health_band_transition` (§20.3.4, §31.14)

`green_to_yellow`, `green_to_red`

**Notes.** Records transitions.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_threshold_event_catalog_consistency` | webhook_catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Every reference to `pulse.health_score_threshold_breached` MUST resolve to §31.14, Appendix C, Appendix G, Appendix J `pulse_health_band_transition`, and the WorkspacePulseHealth transition pointer. | M02.3 |
