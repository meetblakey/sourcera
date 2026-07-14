# v7.1.1 Phase 11 Override Target-Key Verification — 2026-07-11

## Scope

Closes D-11.2-010, D-11.2-014, D-11.2-015, D-11.2-018, and D-11.2-020 as specification defects and corrects the false active-runtime claim for `appendix_m_coverage_on_diff`.

## Evidence

- §M.4.4.1 now requires `concept_class::concept_name@spec_anchor`.
- The local grammar accepts the fully keyed form and rejects the prior name-only form.
- The cross-validator joins the complete triple, preventing same-name collisions across classes or anchors.
- Feature headings trigger only when their added body introduces an acceptance criterion, implementation contract, or plan-tier clause.
- Plan-gate detection covers the actual canonical feature, entitlement, constraint, privacy, seller, and Solo homes.
- Merge-time PR-description hashes are canonical and stale snapshot evidence fails closed.
- Gate audit and digest outages have durable retry, DLQ, escalation, and idempotency contracts.
- `npm --prefix tools/spec-lint run typecheck` passes.
- The focused parser / cross-validator proof passes for an `enum_value::solo@#appendix-j` target alongside a distinct `entity_field::solo@#4-3-1` target.
- Full spec-lint passes.

## Runtime evidence correction

The workflow references missing `override_parser.ts`, `cosmetic_edit_filter.ts`, and `comment_poster.ts`; the present `appendix_m_coverage_on_diff.ts` emits no detected concepts. §M.4 and §M.5 therefore correctly use `spec_binding_pending_pack_m02_3`. No functioning PR-gate runtime is claimed.
