### 48.8.3 Onboarding Surface - Minutes 0-3 {#48.8.3-onboarding-surface-minutes-0-3}

**Telemetry Events.**

- `hero_moment_completed {seller_org_id, bid_id, stage_3_population_latency_ms, stage_3_kb_draft_entry_count, capability_degradation_triggered=boolean}` (Appendix G)
- `hero_moment_latency_breached {seller_org_id, bid_id, stage_3_population_latency_ms, threshold_ms}` (Appendix G)

### 49.1.3 Stage 3: First-Pass Draft {#49.1.3-stage-3-first-pass-draft}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `hero_moment_completed` | `hero_moment_completed_at` write | `{seller_org_id, bid_id, stage_3_population_latency_ms, stage_3_kb_draft_entry_count}` |
| `hero_moment_latency_breached` | §44.1 breach | `{seller_org_id, bid_id, stage_3_population_latency_ms, threshold_ms}` |

### §48 PLG, Growth Mechanics & Network Effects - Event Additions {#appendix-g-section-48-additions}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `hero_moment_completed` | Stake reveal | `seller_org_id`, `bid_id`, `stage_3_population_latency_ms` |
| `hero_moment_latency_breached` | End-to-end p99 breach | `seller_org_id`, `bid_id`, `threshold_ms` |

## Appendix M {#appendix-m}

| Gate | Class | Runtime status | Context | Evidence | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `posthog_event_payload_single_source_per_event` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | No event name appears in two locations with different payload property sets | M02.3 |
