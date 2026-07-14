### 48.8.3 Onboarding Surface - Minutes 0-3 {#48.8.3-onboarding-surface-minutes-0-3}

**Telemetry Events.**

- `hero_moment_completed` - emit per Appendix G canonical row; payload schema MUST NOT be restated here.
- `hero_moment_latency_breached` - emit per Appendix G canonical row; trigger is pause-adjusted §44.1 Stage-3 threshold breach with `provider_health_state(firecrawl) = healthy`; payload schema MUST NOT be restated here.

The `hero_moment_latency_breached` event (per §48.8.3 Failure Mode #3) does NOT fire under provider-outage pause.

### 49.1.3 Stage 3: First-Pass Draft {#49.1.3-stage-3-first-pass-draft}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `hero_moment_completed` | `hero_moment_completed_at` write | Appendix G canonical schema only; §49.1 MUST NOT restate payload properties (prevents drift from §48.8.3 / Appendix G). |
| `hero_moment_latency_breached` | Pause-adjusted §44.1 `Seller onboarding Stage-3 population-latency threshold` breach | Appendix G canonical schema only; trigger excludes Firecrawl-outage pause windows via §48.8.3 Failure Mode #6(c); §49.1 MUST NOT restate payload properties. |

### §48 PLG, Growth Mechanics & Network Effects - Event Additions {#appendix-g-section-48-additions}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `hero_moment_completed` | `hero_moment_completed_at` write per §4.4.22 (single canonical terminal predicate: Stage-3 surfaces present AND pause-adjusted latency satisfies §44.1 `Seller onboarding Stage-3 population-latency threshold`) | `seller_org_id`, `bid_id`, `session_id`, `stage_3_population_latency_ms`, `stage_3_firecrawl_outage_pause_ms`, `stage_3_kb_draft_entry_count`, `stage_3_first_pass_response_requirement_count`, `stage_3_first_pass_response_cited_count`, `capability_degradation_triggered=boolean` *(emitters MUST emit only the canonical fields above)* |
| `hero_moment_latency_breached` | Pause-adjusted `stage_3_population_latency_ms` breaches §44.1 AND `provider_health_state(firecrawl) = healthy`; Firecrawl-outage pause window is excluded per §48.8.3 Failure Mode #6(c) | `seller_org_id`, `bid_id`, `session_id`, `stage_3_population_latency_ms`, `stage_3_firecrawl_outage_pause_ms`, `threshold_ms` sourced from §44.1 *(prior bottleneck-phase variant is retired at v7.1.0)* |

## Appendix M {#appendix-m}

| Gate | Class | Runtime status | Context | Evidence | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `posthog_event_payload_single_source_per_event` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/posthog_event_payload_single_source_per_event.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree event-payload canonicality only; PostHog production emission, generated schemas, analytics delivery, deploy validators, and runtime event payload correctness remain product-pack evidence) | post-build | Appendix G is the single payload-schema source for `hero_moment_completed` and `hero_moment_latency_breached`; §48.8.3 and §49.1 consume it without restating payload properties; stale payload variants lacking `session_id` / `stage_3_firecrawl_outage_pause_ms` are rejected; closes D-HM-003 + D-HM-004 documentation gap | M02.3 |
