### 4.3.5 Response (Console-Scoped, Buyer)

`draft` | `submitted` | `received` | `acknowledged`
`submitted_at` MUST be stamped when the response first becomes seller-finalized. An explicit amendment/reverification path that emits a Console Bridge event remains required.

### 4.3.6 Score (Console-Scoped, Buyer)

**Lock Finality.** `locked=true` is terminal for that Score row. There is no unlock or reversal state: every post-Phase-12 score correction requires Workspace cancellation and a new evaluation.

### 4.3.10 Evaluation Pulse Event (Console-Scoped, Buyer)

In Solo Mode, the Pulse Inbox surface is suppressed per §2.8.4, while the engine continues to create and retain every Evaluation Pulse Event. It never becomes a Seller, Marketplace, or public projection.

### 4.3.25 Approval Workflow {#4.3.25-approval-workflow}

The workflow MUST NOT unlock scores; the only score-changing path is cancellation and a new evaluation.

### L.25 Buyer Response and Score Lock State Machines {#l-25-buyer-response-and-score-lock-state-machines}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `draft` | `submitted` | Seller finalizes the corresponding Bid Response | valid | first finalization |
| `submitted` | `received` | Buyer-side bridge consumer accepts the submitted projection | valid | idempotent |
| `received` | `acknowledged` | Authorized Buyer Workspace member acknowledges | valid | a duplicate acknowledgement is idempotent and writes no second Audit Event. |

There is no unlock or reversal transition.

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `unlocked` | `locked` | Workspace enters Phase 12 | valid | terminal |
| `locked` | `locked` | Attempted append, override, soft-delete, or unlock | any | reject |

The only post-Phase-12 correction path is cancellation and a new evaluation. The tables add no enum, API, webhook, plan gate, cross-console projection, retention class, or mobile-only behavior.

## Appendix M.5

| `buyer_response_score_lock_lifecycle_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/buyer_response_score_lock_lifecycle_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
