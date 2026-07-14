# Fixture

### 4.4.37 SellerBidWorkspacePulseHealth (Bid-Workspace-Scoped, Seller) {#4.4.37-sellerbidworkspacepulsehealth}

SellerBidWorkspacePulseHealth is the persisted seller-side health row behind §24.4 Seller Pulse without exposing buyer-internal Workspace details for a Seller Org's Bid Workspace.

**Authored Extension -- requires human sign-off.** Registry row: AE-V72REM-PH5P55-SELLER-PULSE-01.

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Stable snapshot id. |
| `org_id` | UUID (FK) | Required | Seller Org. |
| `console` | Enum | Always `seller` | Seller-console scope; buyer-console reads return HTTP 404. |
| `bid_workspace_id` | UUID (FK) | Required | Seller bid context. |
| `source_workspace_id_hash` | String | SHA-256; required | One-way correlation hash; raw buyer `workspace_id` is not returned to seller clients. |
| `recorded_at` | Timestamp | Required; UTC | Compute timestamp. |
| `recorded_date_utc` | Date | Required | UTC date bucket. |
| `snapshot_kind` | Enum | Appendix J `seller_pulse_snapshot_kind`; required | `tick`, `daily_summary`, or `final_lock`. |
| `weight_set` | Enum | Appendix J `seller_pulse_weight_set`; required | Phase-derived weight set selected by §24.4.2. |
| `pipeline_phase` | Enum | Appendix J `pipeline_phase`; required | Projected phase. |
| `bid_workspace_status` | Enum | Appendix E Bid Workspace status | Seller state. |
| `score_value` | Decimal | 0-100; required | Score. |
| `color_band` | Enum | Appendix J `pulse_health_color_band`; required | Band. |
| `prior_color_band` | Enum | Appendix J `pulse_health_color_band`; nullable | Previous band. |
| `response_completion_pct` | Decimal | Nullable; 0-100 | Response term. |
| `on_time_submission_pct` | Decimal | Nullable; 0-100 | Deadline term. |
| `amendment_reverification_turnaround_pct` | Decimal | Nullable; 0-100 | Amendment term. |
| `kb_utilization_pct` | Decimal | Nullable; 0-100 | KB term. |
| `deadline_readiness_pct` | Decimal | Nullable; 0-100 | Readiness term. |
| `raw_inputs_json` | JSONB | Required; redacted aggregate counts only | MUST NOT store buyer-internal notes, buyer scores, response body text, Q&A post bodies, requirement text, comments, email addresses, or attachment contents. |
| `band_transition_event_id` | UUID | Nullable | Transition event. |
| `locked` | Boolean | Default `false` | True once `snapshot_kind=final_lock` or terminal Bid Workspace state freezes the score. |
| `locked_at` | Timestamp | Nullable | Lock time. |
| `lock_reason` | Enum | Appendix J `seller_pulse_lock_reason`; nullable | Reason. |
| `created_at` | Timestamp | Required | Created. |
| `updated_at` | Timestamp | Required | Updated. |
| `created_by` | UUID (FK) | System actor | Scheduler. |
| `updated_by` | UUID (FK) | System actor | Worker. |
| `deleted_at` | Timestamp | Nullable | Soft delete. |

**Scope isolation.** Reads require `(org_id, console='seller', bid_workspace_id)`. Buyer-console reads, cross-seller reads, and raw buyer Workspace lookups return HTTP 404.

**Required indexes.** `(org_id, bid_workspace_id, recorded_at DESC)`, `(org_id, bid_workspace_id, snapshot_kind, recorded_date_utc)` unique for `snapshot_kind='daily_summary'`.

**Retention, DSAR, and residency.** Retention follows the §40.2 SellerBidWorkspacePulseHealth row. DSAR pseudonymizes actor FKs; raw aggregate counts remain only when they contain no subject-identifying text. `raw_inputs_json` is aggregate-only and must pass the §6.8.4.5 body-field sweep before export. Residency follows the parent Bid Workspace (§4.4.1), which follows Seller Org residency; the buyer-side source Workspace remains in buyer residency and is represented only by `source_workspace_id_hash`.

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| (none) | `tick` | Bid Workspace tick | Active | Initial compute. |
| `tick` | `daily_summary` | Daily summarizer | Latest tick exists | Upserts one row. |
| `tick` or `daily_summary` | `final_lock` | Bid Workspace terminal state | Terminal | Freezes score. |
| `tick` | `tick` | Response, amendment, deadline, KB-citation, or phase projection event | Not locked | Recomputes. |

**Acceptance criteria.**

4. Buyer-console reads MUST return HTTP 404 for every SellerBidWorkspacePulseHealth endpoint.
5. `raw_inputs_json` MUST contain counts only.

## 24.4 Seller Pulse {#24.4-seller-pulse}

### 24.4.1 Seller Pulse Canonical Data Model

Seller Pulse persistence is canonical at §4.4.37 SellerBidWorkspacePulseHealth. §24.4 is the surface and formula contract; it MUST NOT introduce a second seller Pulse snapshot row, a raw inline JSON schema, or a buyer-readable projection. Seller Pulse reads are always seller-console-scoped and Bid-Workspace-scoped.

### 24.4.4 Solo Seller Surface Treatment

Seller Pulse still computes and persists on SellerBidWorkspacePulseHealth for every plan tier. Engine writes, final-lock behavior, and retention are unchanged by surface compression.

### 24.4.5 Acceptance Criteria

1. A Bid Workspace tick MUST recompute SellerBidWorkspacePulseHealth when any input term changes and MUST NOT create duplicate `daily_summary` rows.
4. Seller Solo / Free MUST hide the per-component breakdown, team-status widget, and trend chart while preserving the same engine-side SellerBidWorkspacePulseHealth writes.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| SellerBidWorkspacePulseHealth (§4.4.37) | Tick rows retained 30 days. Daily summary rows retained 12 months. Final-lock rows retained for Bid Workspace life + 7 years. DSAR Pattern B on actor FKs; `raw_inputs_json` is aggregate-only. Residency follows the parent Bid Workspace. |

#### `seller_pulse_snapshot_kind` (§4.4.37)

`tick`, `daily_summary`, `final_lock`

**Notes.** Records the compute cadence for SellerBidWorkspacePulseHealth.

#### `seller_pulse_weight_set` (§4.4.37, §24.4.2)

`pre_bidding`, `active_response`, `post_submission`, `final_lock`

**Notes.** Values are derived from the bound buyer Workspace phase projection.

#### `seller_pulse_lock_reason` (§4.4.37)

`bid_won`, `bid_lost`, `submitted_and_not_awarded`, `withdrawn`, `disqualified`, `workspace_closed`

**Notes.** MUST NOT expose buyer-internal selection rationale.

#### `seller_pulse_metric_id` (§24.4)

`response_completion`, `on_time_submission`, `amendment_reverification_turnaround`, `kb_utilization`, `deadline_readiness`

**Notes.** These map to the persisted SellerBidWorkspacePulseHealth term fields.

**SellerBidWorkspacePulseHealth.** Seller-console Bid-Workspace-scoped Pulse snapshot row with bounded seller-side health score, tick / daily / final-lock cadence, raw aggregate inputs, without exposing raw buyer Workspace identifiers or buyer-internal content. See §4.4.37 and §24.4.

| `seller_bid_workspace_pulse_health_entity_contract` | Phase 5.5 / Phase 24 P1 | **`runtime_active`** | §4.4.37 + §24.4 + §40.2 + Appendix J / K. | Seller Pulse MUST resolve to SellerBidWorkspacePulseHealth; seller-console scope; Bid Workspace residency; aggregate-only raw inputs; tick/daily/final-lock cadence; §40.2 retention row. | Override path: `not_permitted_seller_pulse_firewall_integrity`. | tools/spec-lint/gates/seller_bid_workspace_pulse_health_entity_contract.ts |
