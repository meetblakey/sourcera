### 6.8.5 Audit Exemption {#6.8.5-audit-integrity-exemption}

| # | Row Class | Retention Driver | Retention Window | Redaction Treatment |
|---|---|---|---|---|
| 1 | A | audit | 7y | Pattern B |
| 2 | B | audit | 7y | Pattern B |
| 3 | C | audit | 7y | Pattern B |
| 4 | D | audit | 7y | Pattern B |
| 5 | E | audit | 7y | Pattern B |
| 6 | F | audit | 7y | Pattern B |
| 7 | G | audit | 7y | Pattern B |
| 8 | H | audit | 7y | Pattern B |
| 9 | I | audit | 7y | Pattern B |
| 10 | J | audit | 7y | Pattern B |
| 11 | K | audit | 7y | Pattern B |
| 12 | L | audit | 7y | Pattern B |
| 13 | M | audit | 7y | Pattern B |
| 14 | N | audit | 7y | body-swept |
| 15 | O | audit | 7y | Pattern B |
| 16 | P | audit | 7y | body-swept; Cohorts below floor suppress immediately |

| `audit_integrity_exemption_redaction_path_correctness` | privacy | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Local guard `tools/spec-lint/gates/audit_integrity_exemption_redaction_path_correctness.ts` and pass/fail fixtures protect the spec contract; deployed retained-row mapping validator evidence remains required. | M02.3 |
