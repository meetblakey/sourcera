# 20. Inbox & Pulse {#20.-inbox-and-pulse}

Pulse Digest dispatch uses the recipient's resolved timezone and is enqueued for 09:00 local time on the configured Appendix J `pulse_digest_day`; DST is resolved at enqueue time so the wall-clock delivery target does not drift.

| Cadence | Weekly on Appendix J `pulse_digest_day`; default `monday`. |

- **Pulse-specific controls:** Weekly digest enabled / disabled, Appendix J `pulse_digest_day`, workspace-level audience inclusion, and Solo opt-in state.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

| Notification preferences patch | JSON body `{digest_enabled, pulse_digest_day, channel_preferences, notification_item_type_preferences, client_request_id}`; `pulse_digest_day` MUST resolve to Appendix J; reject SMS channel keys until that contract is authored. |

```json
{
  "pulse_digest_day": "monday"
}
```

| Notification preferences | `workspace_id`, `user_id`, `digest_enabled`, `pulse_digest_day`, `channel_preferences`, `notification_item_type_preferences`, `quiet_hours_ref`, `dnd_ref`, `updated_at` |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| `notification_preferences_updated` | §32.10.3.B preference patch commits | `changed_keys`, `pulse_digest_day`, `digest_enabled`, `channel_keys`, `actor_role` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `pulse_digest_day` (§20.4.1, §20.6.1)

`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

**Notes.** Weekly Pulse Digest dispatch day. Default is `monday`, but all seven days are supported for locale, timezone, and non-Western workweek compatibility.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_digest_day_enum_canonicality` | enum_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/pulse_digest_day_enum_canonicality.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20.4 / §20.6 and §32.10.3.B MUST use Appendix J `pulse_digest_day` with all seven day values; Mon/Wed/Fri-only drift fails. | M02.3 |
