# Spec excerpt

## 13.12 What Are You Evaluating? {#13-12-intake}

Intake can return `eval_starter_slug_conflict`, `eval_starter_seed_size_invalid`,
`eval_starter_seed_index_oob`, and `eval_starter_write_forbidden`.

# Appendix I — Error Codes {#appendix-i}

| Code | HTTP | Notes |
| :-- | :-- | :-- |
| `eval_starter_slug_conflict` | 409 | Duplicate slug. |
| `eval_starter_seed_size_invalid` | 422 | Seed size out of range. |
| `eval_starter_seed_index_oob` | 422 | use_case_index out of bounds. |
| `eval_starter_write_forbidden` | 403 | Non-owner write to a system starter. |
