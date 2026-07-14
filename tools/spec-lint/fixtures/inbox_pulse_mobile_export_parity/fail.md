### 20.5.3 Digest Archive {#20.5.3-digest-archive}

- **Export:** Desktop, tablet, and mobile may initiate the async CSV export through §32.10.3.B.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

12. Mobile Inbox read and mark-read parity MUST match §38.8.2.

## 20.8 Mobile Surface {#20.8-mobile-surface}

Pulse Digest Archive CSV export is available on mobile.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

**Purpose.** Bind §20 Inbox, Pulse Health, Pulse Digest Archive, and Notification Preferences workflows to public API routes.

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| POST | `/v1/workspaces/{workspace_id}/pulse/digests/export` | `read:workspaces` | §5.11 Export Pulse Digest Archive CSV row | `analytics_export` | REQUIRED |

| Endpoint | Side effects |
| :---- | :---- |
| Digest export | Creates an async export job for desktop, tablet, and mobile callers. |

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 422 | `export_not_ready` | Export still processing |

5. Digest export initiation MAY create a job for mobile callers.

### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}

| Feature / workflow | Desktop | Tablet | Mobile | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Pulse - Digest Archive CSV Export | parity | parity | supported | Mobile starts the export job directly. |

### 38.8.3 Simplification Disclosure Contract {#38.8.3-simplification-disclosure-contract}

Features in `simplified` or `not_supported` state MAY hide the limitation until the user taps export.

### v7.2.0-REM Phase 4.11 Additions (2026-06-22) - Inbox and Pulse API / Notification P1 {#appendix-i-v72rem-phase-4-11-inbox-pulse}

| Code | HTTP | Retryable | Used by / meaning | Localization Key |
|---|---|---|---|---|
| `export_not_ready` | 409 | `transient` | Export not yet ready. | `error.export.not_ready` |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition (D-4.11-006, D-4.11-008 through D-4.11-016 closure) {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `inbox_pulse_mobile_export_parity` | mobile_parity_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Mobile can export Pulse Digest CSV. | M02.3 |
