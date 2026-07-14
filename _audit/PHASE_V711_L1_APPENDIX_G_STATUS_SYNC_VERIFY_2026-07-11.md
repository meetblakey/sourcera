# v7.1.1 L1 Appendix G Status-Sync Verification

**Date:** 2026-07-11  
**Defect:** D-13V-013 (P2 documentation gap)  
**Verdict:** Stale-open status synchronized.

## Evidence

The §48.2.2 L1 telemetry table and Appendix G register the same six events with matching property schemas:

- `growth_loop_l1_invite_emitted`
- `growth_loop_l1_invite_clicked`
- `growth_loop_l1_signup_attributed`
- `growth_loop_l1_first_bid_completed`
- `growth_loop_l1_kb_seeded`
- `growth_loop_l1_attribution_expired`

No event, payload, workflow, or runtime status changed. Appendix G remains the canonical event-schema source.
