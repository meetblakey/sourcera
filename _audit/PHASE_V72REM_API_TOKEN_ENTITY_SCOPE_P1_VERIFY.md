# Phase V72REM — ApiToken Entity + Scope Canonicalization P1 Verify

Date: 2026-06-21

Scope: D-1.1-002, D-1.1-015, D-3.3-032, D-V8.1-012, and D-V8.1-013.

Result: PASS.

Positive coverage:
- §4.2.6 defines ApiToken as the canonical Org-scoped schema home for §6.6 API-token behavior.
- §4.2.6 includes field table, indexes, scope isolation, retention, DSAR, state machine, acceptance criteria, and failure modes.
- §6.6.1 stores token hashes in §4.2.6 ApiToken.`token_hash`.
- §6.6.3 cites Appendix J `api_token_scope` as the single scope vocabulary rather than publishing a competing full list.
- Appendix J `api_token_scope` includes the live endpoint scopes `read:vendor_opt_outs`, `write:vendor_opt_outs`, `read:vendor_opt_out_authority`, `write:vendor_opt_out_authority`, `export:audit_events`, and `admin:ops_compliance`.
- Appendix J registers `api_token_revocation_reason`.
- §M.5 `appendix_j_api_token_scope_endpoint_consistency` binds endpoint-declared scopes to Appendix J, covers the internal-Ops-only exception, and rejects marketplace rate-limit classes in Auth Scope columns.
- `_audit/DEFECT_LEDGER.md` marks D-1.1-002, D-1.1-015, D-3.3-032, D-V8.1-012, and D-V8.1-013 `remediated 2026-06-21`.
- `_integration/RECONCILIATION.md` records the ApiToken Entity + Scope Canonicalization P1 Pass.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` keeps AE-3.3-006 approved and updates only its obsolete scope-count wording.

Negative coverage:
- No active D-1.1-002, D-1.1-015, D-3.3-032, D-V8.1-012, or D-V8.1-013 canonical row remains `open`.
- No active API-token scope registry text still claims the obsolete pre-correction scope count.
- No §6.6.3 full-scope list competes with Appendix J.
- No new AE row is required; this pass codifies existing §6.6 behavior and existing endpoint scopes.
