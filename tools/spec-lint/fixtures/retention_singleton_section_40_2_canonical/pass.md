# Spec excerpt

## 40.2 Data Retention {#40-2-data-retention}

AuditEvent retention is 7 years. SpecLintRunLog is kept for 90 days after close.
These literals live in the canonical §40.2 home.

## 13.4 Some Surface {#13-4-some-surface}

Records are retained per §40.2 (7 years per §40.2) — an inline restatement that
cites the canonical row, so it is exempt.

## 17.1 SLA Windows {#17-1-sla-windows}

The SLA response window is 5 days. This is an operational service-level duration,
not a data-lifecycle literal, so it must NOT be flagged. The gate must PASS.
