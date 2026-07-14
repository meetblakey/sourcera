# v7.1.1 Ledger Severity and Class Audit — 2026-07-12

## Result

PASS.

- Canonical rows: 1,929
- Severity distribution: 56 P0 / 952 P1 / 695 P2 / 226 P3
- Registered classes observed: 32 of 32
- Compound or unregistered canonical classes: 0
- P0 trigger assignments: 11 firewall / 6 PII-PCI / 26 regulatory-audit / 12 billing / 1 unwireable-CI
- P0 rows without trigger evidence: 0
- P1 rows without summary, evidence, recommendation, registered class, or buildability classification: 0

## Method

`tools/release/ledger_taxonomy_audit.ts` uses the same pipe-aware canonical-row/status recognition as the exact-status scanner. It checks every canonical row, not supplementary transition tables. The audit validates the registered severity vocabulary, registered single-class vocabulary, required evidence cells, P0 first-matching trigger assignment, and P1 buildability evidence contract.

The 90 former compound, parenthetical, or unregistered class cells were normalized to the most-specific existing primary class. Their prior class strings remain in `links` as taxonomy notes so secondary axes and provenance are not lost.

## Command

```bash
npx --yes tsx tools/release/ledger_taxonomy_audit.ts
```

No product-runtime status is promoted by this audit.
