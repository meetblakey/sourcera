## 3.5 Optimistic Mutation Rollback Behavior {#3.5-optimistic-mutation-rollback-behavior}

§3.7.10 is the sole top-of-viewport offline owner. A per-mutation top banner MUST NOT render. Reconnect failures render Retry / Discard inline.

### 3.7.10 Connectivity and Offline Signaling {#3.7.10-connectivity-offline-signaling}

Web uses navigator.onLine. Native uses NWPathMonitor on iOS 16+ and ConnectivityManager.NetworkCallback on Android API 24+. The banner renders within 500ms. The one global offline window says N pending changes — will sync when you reconnect and emits ui_offline_banner_shown then ui_offline_banner_dismissed.

### §3 UX Token & State Catalog — Event Additions {#appendix-g-section-3-ux-additions}

| `ui_offline_banner_shown` | shown | `online_signal_source ∈ online_signal_source`, `pending_changes_count`, `time_since_last_online_ms` |
| `ui_offline_banner_dismissed` | dismissed | `offline_duration_ms`, `dismiss_reason ∈ offline_banner_dismiss_reason` |

### §3 UX Token & State Catalog Enum Cluster {#appendix-j-section-3-ux-additions}

#### `online_signal_source` (§3.7.10)

`browser_online_event`, `ios_nwpath`, `android_connectivity_callback`

#### `offline_banner_dismiss_reason` (§3.7.10)

`online_event`, `manual_user_dismiss`

| `offline_connectivity_mobile_parity_and_telemetry` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/offline_connectivity_mobile_parity_and_telemetry.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
