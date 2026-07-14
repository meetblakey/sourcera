| 6–7 | Create & reply | Create & reply | Editable (both sides) |
| 8 | No new threads; read existing | Read only | Threads read-only for vendor |
| 9–12 | Read only | Read only | All read-only |

Agent Q&A Suggestion is wallet-charged per §34.3.4 (`qa_suggestion_buyer`) and entitlement-gated by §34.8.5.

| **Q&A Threads (§18)** | | | | |
| Q&A Thread (phase-gated: creatable Phases 6-7; vendor read-only Phase 8; all read-only Phases 9-12) | §18.2 | "Q&A" tab on each evaluation; locked banner when out of phase | All | Phase availability follows §18.2.1; Phase 9 is read-only, not the creation phase. Conformance posture: inherits_§37.1. |
| Agent Q&A Suggestion (buyer-side AI) | §18.4 / §21.4.1.B | "AI-suggested question" inline draft (buyer reviews before posting) | All Buyer tiers; AIOperation treatment per §34.3.4 / §34.8.5 | Capability `qa_suggestion_buyer` is wallet/commit charged; it never reads seller KB per §18.4.1.1 and §22.1. Conformance posture: inherits_§37.1. |
| **Templates (§19)** | | | | |

| `appendix_m_qa_phase_and_tier_consistency` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/appendix_m_qa_phase_and_tier_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
