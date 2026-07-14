# v7.2.0-REM Phase 2 CI Runtime P1 Verify

**Date:** 2026-06-21
**Scope:** D-V72REM-PH2-002, D-V72REM-PH2-003, D-V72REM-PH2-004
**Verdict:** PASS for the three P1 rows in scope. D-V72REM-PH2-001 remains open and out of scope for this pass.

## Remediation Summary

| Defect | Status | Evidence |
|---|---|---|
| D-V72REM-PH2-002 | remediated 2026-06-21 | `tools/spec-lint/cross_validation.ts` scopes the internal-only attestation regex to the introducing section derived from `detectedMatch.specAnchor`; missing section ranges fail closed. Wrong-section and same-section behavioral checks passed. |
| D-V72REM-PH2-003 | remediated 2026-06-21 | `tools/spec-lint/sibling_override_cli.ts` and `tools/spec-lint/comment_templates.ts` are authored. `.github/workflows/spec-lint.yml` wires the comment-template verifier. Master Spec §M.5 registers `appendix_m5_override_path_canonicalization` and `spec_lint_comment_template_canonicality` as `runtime_active`. |
| D-V72REM-PH2-004 | remediated 2026-06-21 | `buildSpecParseTree` now parses Markdown headings, ignores fenced code blocks, records explicit heading anchors, and populates section character and line ranges keyed by bare and `#`-prefixed anchors. |

## Verification

| Check | Result |
|---|---|
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit` | PASS for all blocking gates. Advisory findings remain for pre-existing open P1/P2 hygiene: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13). |
| Cross-validator wrong-section attestation fixture | PASS: wrong-section attestation rejected / failed closed. |
| Cross-validator same-section attestation fixture | PASS: same-section attestation accepted. |
| Sibling override CLI positive fixture | PASS: valid known-gate override accepted. |
| Sibling override CLI unknown-gate negative fixture | PASS: rejected with `override_unknown_gate`. |
| Sibling override CLI not-permitted negative fixture | PASS: rejected with `ci_gate_override_not_permitted`. |
| Comment-template verifier negative fixture | PASS: missing Master Spec citation rejected. |
| Conflict-marker scan on touched files | PASS: no conflict markers found. |

## Scope Notes

This pass closes only the named Phase 2 CI runtime rows. It does not claim that every historical workflow entrypoint referenced by `.github/workflows/spec-lint.yml` exists or is runtime-ready unless that entrypoint is one of the two D-V72REM-PH2-003 subjects. Any broader workflow-entrypoint gap requires a separate defect row and closure record.
