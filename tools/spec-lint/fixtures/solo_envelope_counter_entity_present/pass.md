### 4.8.14 SoloEnvelopeCounter (Org-Scoped, Per-Console, Engine-Internal) {#4.8.14-soloenvelopecounter-org-scoped-per-console-engine-internal}

**Authored Extension — requires human sign-off.** Ratification row: AE-V72REM-PHCONS-PRICING-CORE-P1-01.

**Authoring Intent.** SoloEnvelopeCounter is the internal accounting record for Solo-tier absorbed AI usage.

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID (FK) | FK → Organization; required | Owning Org |
| `console` | Enum | `buyer`, `seller`; required | Solo envelopes are per console |
| `plan_tier` | Enum | `buyer_solo` or `seller_solo`; required | Must match `console` |
| `billing_mode` | Enum | See Appendix J `solo_envelope_counter_billing_mode`: `solo_subscription`, `solo_per_eval`, `solo_per_bid` | Identifies the Stripe charge family that funds the envelope |
| `absorption_cap_value_dollars` | Integer | > `envelope_value_dollars`; computed at row creation from §44.6.3.A | Internal hard ceiling |
| `throttling_state` | Enum | See Appendix J `solo_envelope_counter_state`: `healthy`, `throttling_eligible`, `throttled`, `exhausted`, `absorption_cap_reached`, `closed` | See state machine below |

**Indexes.** `(org_id, console)` UNIQUE WHERE `closed_at IS NULL`.

**Scope Isolation.**
- **Customer reads:** Forbidden.

**State Machine.**
| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `healthy` | `throttling_eligible` | Threshold | | |
| `throttling_eligible` | `throttled` | Suppression | | |
| `healthy` / `throttling_eligible` / `throttled` | `exhausted` | Envelope ceiling | | |
| `healthy` / `throttling_eligible` / `throttled` / `exhausted` | `absorption_cap_reached` | Cap ceiling | | |
| Any active state | `closed` | Plan change | | |

**Failure Modes Addressed.**

**Acceptance Criteria.**
1. Exactly one non-closed SoloEnvelopeCounter row MAY exist per `(org_id, console)`.
2. SoloEnvelopeCounter MUST NOT be returned by any customer-facing wallet, billing-ledger, pricing, webhook, PostHog customer mirror, or export endpoint.

**Retention.** Org-life + 7 years for financial audit. Data residency follows the owning Org per §40.4.

### 34.10.3 Solo Co-Resident Pool Rule

Buyer Solo + Seller Solo means Two engine-side envelopes run independently; engine writes per-console envelope counters separately. Solo's envelope stays engine-side.

## 44.6 Solo-Tier Surface Treatment {#44.6-solo-tier-surface-treatment}

At SoloEnvelopeCounter creation, the engine computes the cap. The cap is stored on §4.8.14 `SoloEnvelopeCounter.absorption_cap_value_dollars`. §4.8.14 transitions to `absorption_cap_reached`. Once `SoloEnvelopeCounter.throttling_state='absorption_cap_reached'`, new work fails closed or degrades.

### Solo Envelope Counter Billing Mode (§4.8.14)

`solo_subscription`, `solo_per_eval`, `solo_per_bid`

### Solo Envelope Counter State (§4.8.14)

`healthy`, `throttling_eligible`, `throttled`, `exhausted`, `absorption_cap_reached`, `closed`

`organization`, `org_membership`, `solo_envelope_counter`

**SoloEnvelopeCounter.** The engine-internal per-Org-per-console counter for Solo absorbed-envelope usage. It powers §44.6 throttling and margin monitoring without rendering wallet balance, rate card, per-operation costs, envelope value, or remaining headroom to Solo customers. State machine includes `absorption_cap_reached`. See §4.8.14.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `solo_envelope_counter_entity_present` | data_model_contract | **runtime_active** (promoted 2026-07-07; detector `tools/spec-lint/gates/solo_envelope_counter_entity_present.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §4.8 MUST define `SoloEnvelopeCounter` with field table, scope, indexes, retention/DSAR/residency treatment, state machine, Appendix J enums, Appendix K term, and audit entity registration whenever §34.10.3 or §44.6 references Solo envelope throttling. | M02.3 |
