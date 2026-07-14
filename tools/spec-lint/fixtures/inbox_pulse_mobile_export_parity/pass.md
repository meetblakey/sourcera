### 20.5.3 Digest Archive {#20.5.3-digest-archive}

- **Export:** Desktop and tablet may initiate the async CSV export through §32.10.3.B. Mobile export is not supported per §38.8.2 / §38.8.3 and returns Appendix I `pulse_digest_export_mobile_not_supported`.

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

12. Mobile Inbox read and mark-read parity MUST match §38.8.2; mobile bulk action simplification and mobile digest-export unsupported states MUST render the §38.8.3 disclosure pattern.

## 20.8 Mobile Surface {#20.8-mobile-surface}

Pulse Digest Archive CSV export is not supported on mobile. Mobile attempts to initiate digest CSV export return Appendix I `pulse_digest_export_mobile_not_supported` and render the §38.8.3 `not_supported` disclosure.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

**Purpose.** Bind §20 Inbox, Pulse Health, Pulse Digest Archive, and Notification Preferences workflows to public API routes while preserving Buyer-console scope, §5.11 role gates, §34.8.5 plan gates, Solo compression, §29 preference authority, and §38.8.2 mobile parity.

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| POST | `/v1/workspaces/{workspace_id}/pulse/digests/export` | `read:workspaces` | §5.11 Export Pulse Digest Archive CSV row and §34.1.1 Export Formats | `analytics_export` | REQUIRED |

| Endpoint | Side effects |
| :---- | :---- |
| Digest export | Creates an async export job; mobile callers return `pulse_digest_export_mobile_not_supported` before job creation. |

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 422 | `pulse_digest_export_mobile_not_supported` | Mobile client attempted digest CSV export |

5. Digest export initiation MUST return HTTP 422 `pulse_digest_export_mobile_not_supported` for mobile callers identified by the supported §38 device-class contract.

### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}

| Feature / workflow | Desktop | Tablet | Mobile | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Pulse - Digest Archive CSV Export | parity | parity | not_supported | Desktop/tablet export uses §32.10.3.B async export. Mobile renders §38.8.3 `not_supported` disclosure and API attempts return `pulse_digest_export_mobile_not_supported`. |

### 38.8.3 Simplification Disclosure Contract {#38.8.3-simplification-disclosure-contract}

Features in `simplified` or `not_supported` state MUST disclose the limitation to the user at the point of interaction, not hide it silently.

| Status | Disclosure Pattern |
| :---- | :---- |
| `not_supported` (redirect permitted) | **Redirect banner** with continue/dismiss: "[Feature] is best experienced on desktop. [Continue on Desktop] [Dismiss]" — this is the canonical string for every §38 `not_supported` row. |
| `not_supported` (hard block) | **Hard redirect** to the `/:console/mobile-unsupported` informational page with deep-link preservation; Ops Console surfaces use this. |

### v7.2.0-REM Phase 4.11 Additions (2026-06-22) - Inbox and Pulse API / Notification P1 {#appendix-i-v72rem-phase-4-11-inbox-pulse}

| Code | HTTP | Retryable | Used by / meaning | Localization Key |
|---|---|---|---|---|
| `pulse_digest_export_mobile_not_supported` | 422 | `permanent` | §20.5.3 / §38.8.2 / §32.10.3.B mobile attempt to initiate digest CSV export. | `error.pulse.pulse_digest_export_mobile_not_supported` |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition (D-4.11-006, D-4.11-008 through D-4.11-016 closure) {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `inbox_pulse_mobile_export_parity` | mobile_parity_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/inbox_pulse_mobile_export_parity.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20.5.3 and §38.8.2 MUST both mark Pulse Digest CSV export unsupported on mobile and resolve to Appendix I `pulse_digest_export_mobile_not_supported`; §32.10.3.B MUST reject mobile export initiation before job creation. | M02.3 |
