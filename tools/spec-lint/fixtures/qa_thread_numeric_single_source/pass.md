# 18. Q&A Threads

- **Limit:** The per-vendor-per-Workspace question cap is sourced exclusively from §34.1.1 cell **Q&A Questions per Vendor per Workspace**.
- **Override:** Workspace Owner can grant additional slots up to the §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace** via Workspace Settings.

Q&A Post has many Q&A Mentions and zero to the §39-bounded number of Attachments.

Question throughput and additional-slot caps are sourced from §34.1.1; §18 cites those cells and does not restate per-tier numerical limits. Agent Q&A Suggestion is wallet-charged per §34.3.4 (`qa_suggestion_buyer`) and entitlement-gated by §34.8.5.

| Constraint | Canonical source | Enforcement notes |
| :---- | :---- | :---- |
| Questions per vendor per Workspace | §34.1.1 cell **Q&A Questions per Vendor per Workspace**; §39 mirror row `Q&A Thread.questions per vendor per Workspace (plan-gated)` | Count active rows. |
| Additional slots per vendor per Workspace | §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace**; §39 mirror row `Q&A Thread.additional slots per vendor per Workspace (plan-gated)` | Approved slots extend only a vendor/workspace pair. |

| **Q&A Questions per Vendor per Workspace** | 10 | 10 | 50 | 50 | 50 | 50 |
| **Q&A Additional Slots per Vendor per Workspace** | 0 | 0 | 0 | 5 | 10 | 10 |

| Entity | Field | Limit | Notes |
| :---- | :---- | :---- | :---- |
| Q&A Thread | title | 0-100 chars | Source for title bounds. |
| Q&A Thread | questions per vendor per Workspace (plan-gated) | Per §34.1.1 cell **Q&A Questions per Vendor per Workspace** | Source for §18.2.3 / §18.7.1. |
| Q&A Thread | additional slots per vendor per Workspace (plan-gated) | Per §34.1.1 cell **Q&A Additional Slots per Vendor per Workspace** | Source for §18.2.3 / §18.7.1. |
| Q&A Post | body_markdown | 1-5,000 chars | Source for body bounds. |
| Q&A Post | edit_window | 15 minutes from `created_at` | Source for edit lock. |
| Q&A Post | attachments (count) | 10 files | Source for per-post count. |
| Q&A Attachment | byte_size | 10 MB per file | Source for file size. |
| AgentQASuggestion | draft_text | 300 chars | Source for draft size. |
| QAAdditionalSlotsRequest | justification | 1-200 chars | Source for request bounds. |

| `qa_thread_numeric_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/qa_thread_numeric_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |

# 19. Templates
