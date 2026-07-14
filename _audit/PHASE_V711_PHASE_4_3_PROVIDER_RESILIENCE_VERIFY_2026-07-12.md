# v7.1.1 Phase 4.3 Provider Resilience and Voyage Authority Verification — 2026-07-12

## Scope

Remediates D-4.3-019 and D-4.3-020 under the existing pending AE-V711-PH12-POLICY-RESILIENCE-SAFETY-01.

## Authority resolution

| Conflict | Resolution |
| :---- | :---- |
| D-4.3-019 cited §49 for generic provider outages | §49 is Seller Onboarding. §42.6 / §42.15 are the provider-health authority. |
| §4.3.35 / §22 used Voyage while §1.5 omitted it | §1.5 now names Voyage AI and §12.5.1 names the same model/provider. |
| Dedup had no provider-specific recovery surface | §12.8.3-§12.8.4, §32.10.3.C, Appendix I/G/J/L define the constrained same-job dedup retry. |
| §42.2 named Pinecone despite §22 pgvector | The SLO now names the pgvector vector index. |

## Contract proof

- Anthropic governs framework detection, extraction, and traceability; Voyage AI governs dedup embedding.
- The only customer-settlement parent remains `policy_parsing`; a dedup retry writes zero-charge child attribution only.
- Convex failure cannot commit a partial create transaction; Stripe follows the existing wallet path; Loops defers EmailSend without changing workflow state.
- Provider and error registries include `voyage_ai`, degraded subkind, `policy_ingestion_dedup_failed`, and `policy_ingestion_dedup_retry_not_available`.

## Runtime boundary

The source contract does not prove provider clients, detector deployment, migrations, handlers, transactional writes, client rendering, cost imports, notification dispatch, mobile behavior, or outage and concurrency tests. The pending AE remains a release blocker.

## Verification

| Command | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run typecheck` | PASS. |
| `policy_ingestion_resilience_input_safety_contract` against live Master Spec and pass/fail fixtures | PASS / PASS / expected FAIL. |
| `cost_base_recalc_sample_window_canonicality` against live Master Spec and pass/fail fixtures | PASS / PASS / expected FAIL; detector v1.1.0 recognizes provider-assigned cost inputs. |
| Full spec-lint | PASS. |
| Exact status | 1,979 rows; 0 open P0; 0 open P1; 202 open P2; 76 open P3. `_audit/_tmp/v711_exact_status_phase43_complete_2026-07-12.json`. |
| Stamp gate | RED: 501 runtime rows; 330 active; 190 blockers. `_audit/_tmp/v711_stamp_gate_phase43_complete_2026-07-12.json`. |
| Blocker inventory | Regenerated: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 21 human-ratification blockers. |
