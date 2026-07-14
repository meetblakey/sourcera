## 2.4 Vendor Shortlisting Strategy {#2.4-vendor-shortlisting-strategy}

Seller explicitly declines to bid (`TargetAccount.solicited → disqualified`). Sourcera does not infer a `vendor_interest_signal` from email latency, calendar availability, or another opaque behavior, and §8.4 Team SLA timers do not apply to invited sellers. `TargetAccount.solicited` records the invite, `solicited → bidding` records accepted bid participation, and §10.5 / §10.6 provide aggregate no-confirmation / no-response gate evidence. A Workspace Owner uses the existing `buyer_discretion` disqualification path and note. The four-term §20.3 Pulse Health Score remains unchanged. An action MUST NOT be labeled an inferred `vendor_interest_signal`.

## 20.3 Pulse Health Score {#20.3-pulse-health-score}

Vendor engagement is not a fifth Pulse Health Score term. This does not introduce a seller SLA, response-latency classifier, demo-availability classifier, or inferred seller-interest metric.

## Appendix L

### L.6 Target Account State Machine {#l.6-target-account-state-machine}

| `solicited` | `bidding` | Seller accepts the invitation / begins bid response | Seller-side Bid Workspace status transitions to `active` | Emits Appendix C webhook `target_account.bidding_started`; state synced via Console Bridge Event. |

## Appendix M.5

| `vendor_shortlisting_engagement_evidence_consistency` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/vendor_shortlisting_engagement_evidence_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
