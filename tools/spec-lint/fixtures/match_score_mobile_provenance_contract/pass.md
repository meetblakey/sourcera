#### 27.4.6.1 Mobile Provenance Panel {#27.4.6.1-mobile-provenance-panel}
**Authored Extension — requires human sign-off.**
At `mobile_xs` / `mobile_sm`, a tier-eligible Buyer or Seller taps **Why this match?** to open one contextual bottom sheet.
It is not a drawer, Side Peek, or generic Modal.
Free / Starter label-only views have no provenance opener and never fetch a provenance payload.
client rebucketing and client-side feature recomputation are forbidden.
If the snapshot is stale or re-fetch fails, the sheet closes and the parent surface follows §27.4.7's `insufficient_signal` fallback
On cache invalidation, plan downgrade, console switch, party-scope change, or breakpoint reflow, the client discards the open projection
Focus moves into the sheet and returns to the opener on close
match_score.provenance.opened

### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}
| Marketplace — Match Score + provenance | parity | supported | supported | §27.4.6.1 contextual bottom sheet |

## Appendix M — Surface/Engine Mapping {#appendix-m-surface-engine-mapping}
On `mobile_xs` / `mobile_sm`, the entitled panel is the §27.4.6.1 contextual bottom sheet

## Appendix G — PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}
| `match_score_provenance_opened` | Body ref `match_score.provenance.opened`; a Growth+ user opens the §27.4.6.1 mobile provenance sheet | `console`, `plan_tier` |

## Appendix M.5
| `match_score_mobile_provenance_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/match_score_mobile_provenance_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
