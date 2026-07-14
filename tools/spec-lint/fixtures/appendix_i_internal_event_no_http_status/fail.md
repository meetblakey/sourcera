# Appendix I — Error Codes {#appendix-i}

#### Internal Integrity Events {#i-internal-integrity-events}

| Event | HTTP | Notes |
| :-- | :-- | :-- |
| `chain_break_detected` | 409 | Carries an HTTP status — MUST FAIL (D-V8.4-011). |

#### Polling Payload Flags {#i-polling-payload-flags}

| Flag | Shape | Notes |
| :-- | :-- | :-- |
| `kb_index_stale` | 403 | Bare HTTP status token in a non-HTTP sub-section — MUST FAIL. |
