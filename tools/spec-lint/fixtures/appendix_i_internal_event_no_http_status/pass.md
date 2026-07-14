# Appendix I — Error Codes {#appendix-i}

#### Internal Integrity Events {#i-internal-integrity-events}

| Event | Shape | Notes |
| :-- | :-- | :-- |
| `chain_break_detected` | integrity_signal | Internal only; no HTTP status. |
| `hash_mismatch_detected` | integrity_signal | Emitted to Ops; non-HTTP shape. |

#### Polling Payload Flags {#i-polling-payload-flags}

| Flag | Shape | Notes |
| :-- | :-- | :-- |
| `kb_index_stale` | poll_flag | Boolean payload flag; no HTTP status. |
