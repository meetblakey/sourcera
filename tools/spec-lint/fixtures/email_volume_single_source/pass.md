# Email Volume Singleton Pass Fixture

| **Outbound Email Volume (24h)** | 1,000 | 1,000 | 5,000 | 10,000 | 25,000 | 100,000 | canonical source |

| Entity | Object | Limit | Notes |
| :---- | :---- | :---- | :---- |
| EmailSend | outbound sends per Org per 24h (plan-gated) | Per §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** | Source only. |

### 41.4.1 Plan and Rate Gates {#41.4.1-plan-and-rate-gates}

Per-Org outbound email volume is authoritative in §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** and mirrored by §39. §48.4.1 owns anti-spam dedupe and the Loops.so account-level cap.

### 48.4.1 Email Throttling {#48.4.1-email-throttling}

Per-Org outbound email volume is enforced at the Loops.so adapter layer (§41.1) against the canonical §34.1.1 / §34.1.2 cell **Outbound Email Volume (24h)** and mirrored by §39. §48.4.1 MUST NOT restate per-tier volume literals.

| `email_volume_single_source` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/email_volume_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | assertion | M02.3 |
