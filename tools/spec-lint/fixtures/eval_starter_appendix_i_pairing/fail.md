# Spec excerpt

## 13.12 What Are You Evaluating? {#13-12-intake}

Intake can return `eval_starter_write_forbidden` when a non-owner writes a
system-seeded starter. This code is referenced but missing from Appendix I below.

# Appendix I — Error Codes {#appendix-i}

| Code | HTTP | Notes |
| :-- | :-- | :-- |
| `eval_starter_slug_conflict` | 409 | Present. |
| `eval_starter_seed_size_invalid` | 422 | Present. |
| `eval_starter_seed_index_oob` | 422 | Present (but write_forbidden is absent). |
