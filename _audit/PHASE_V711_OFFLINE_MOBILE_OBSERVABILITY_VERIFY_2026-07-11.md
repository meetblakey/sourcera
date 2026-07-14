# v7.1.1 Section 3 Offline Mobile and Observability Verification

**Scope:** D-3UX-016, D-3UX-025, D-3UX-035  
**Verdict:** PASS for documentation consistency; release remains blocked on product-runtime evidence.

- §3.7.10 now defines web/mobile-web, iOS 16+, and Android API 24+ reachability sources under one 500ms App-Shell contract.
- §3.5 defers top-of-viewport ownership to the global offline window; queued writes aggregate there and only reconnect failures render inline Retry / Discard.
- Appendix G/J register `ui_offline_banner_shown`, `ui_offline_banner_dismissed`, `online_signal_source`, and `offline_banner_dismiss_reason`.
- `offline_connectivity_mobile_parity_and_telemetry` passes live and has passing and failing fixtures.
- TypeScript and full blocking spec-lint pass.
- Exact status: 0 open P0, 0 open P1, 0 blocked P1, 369 open P2, 131 open P3.
- Stamp gate: 473 rows, 303 `runtime_active`, 168 unchanged blockers (118 M11.3, 29 M21.3, 12 M02.3, 9 M24.3).

No native reachability callback, queued-write replay, event emission, outbox delivery, PostHog ingestion, or production telemetry proof is claimed.
