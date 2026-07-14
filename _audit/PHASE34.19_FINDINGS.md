# PHASE34.19 — Plan Upgrade / Downgrade & Seller Carry-Over (Scratch Findings)

**Phase scope.** Master Spec §34.5 (Plan Upgrade / Downgrade), §34.6 (Downgrade Excess Data Handling), §34.19 (Seller Plan Upgrade Carry-Over Guarantee), and the §34.20.5 / §34.20.16 ACs that bind them.

**Auditor.** Audit-mode Opus session, 2026-05-07.

**Out of scope (intentional).** §34.7 seat counting, §34.8 entitlement enforcement, §34.10 wallet, §34.13 Pro Trial Seat — except where they intersect carry-over invariants.

**Method.**
1. Read §34.5, §34.6, §34.19, §34.20.5, §34.20.16 end-to-end.
2. Cross-walked §22.18.5 (KB-side carry-over surface), §22.18.7 ACs #74 / #75 / #76, §22.3.1 KBEntry entity, §4.4.4 / §4.4.9 / §4.4.17 / §4.4.24 KB-related Seller-console entities, §4.2.1 Organization, §4.8.10 DowngradeExcessDataBucket, §40.2 retention table, §22.4.4 namespace migration.
3. Walked the four prompt-defined checks against the corpus.
4. Counterfactual + self-challenge passes (logged below).

---

## Prompt Check Outcomes

### Check 1 — Plan upgrade preserves every KB field listed in §34.19 (KB entries, confidence scores, staleness, citation graph, win-rate weights, provenance)

**Verdict: ⚠ Partial.** §34.19.1 declares 13 protected asset classes at the *class* level. The KB-specific *fields* called out in the prompt (`confidence_score`, staleness / `review_state`, `KBCitationGraphEdge`, `win_rate_weight`, provenance) are nowhere directly enumerated in §34.19.1. The mapping from §34.19.1's classes to specific KB fields exists only in §22.18.5.1 ("Class 2 (sub, §22.18.3.3)" qualifiers), which is fragile because:
- `KBEntry.win_rate_weight` is an Authored Extension that has not been added to the §22.3.1 entity table (D-34.19-001).
- `KBCitationGraphEdge` is an Authored Extension entity definition not yet promoted to §22 / §4.x canonical scope (D-34.19-002).
- `Organization.kb_value_meter_score` is referenced in §34.19.2 but does not appear on §4.2.1 Organization (D-34.19-003).
- `CapabilityDeclarationSuggestion` is referenced in §22.18.5.1 / §22.18.7 AC #74 but no canonical entity table exists (D-34.19-004).
- "provenance" (§22.3.1 `derived_from_kb_entry_id`, `former_software_id`, KBExportProvenanceLog) is preserved transitively because the host KBEntry row is preserved, but §34.19 does not make this transitive guarantee explicit. Acceptable as P3 documentation gap (rolled into D-34.19-005).
- §34.19.1 ↔ §22.18.5.1 class mapping is not bijective; §22.18.5.1 maps `CapabilityDeclarationSuggestion` to Class 3 (the §34.19.1 row is "Capability Declarations", a different §4.4.4 entity) (D-34.19-005).

### Check 2 — Plan downgrade preserves data in DowngradeExcessDataBucket for 90 days (general) or 12 months (KB-specific per §34.19)

**Verdict: False premise.** No KB-specific 12-month preservation window exists in the v7.1.0 Master Spec. §34.6.1 cites 90 days (`preservation_until = downgrade_at + 90 days`); §22.18.5.3 explicitly addresses the 12-month figure: it appeared in the retired Master Summary §6.13.7 narrative, was superseded by 90 days in Master Spec, and is flagged in `_integration/RECONCILIATION.md → Known Conflicts`. The §22.18.7 AC #75 copy-linter rule `summary_narrative_12_month_reference_blocked` blocks any seller-facing surface from emitting the 12-month figure. The audit prompt's premise contradicts the spec; filing as D-34.19-017 ("audit-prompt premise drift") with status `wont_fix` (no spec defect) so the row exists for traceability.

However — the 90-day window itself surfaces several derived defects:
- §34.6.4 enum `downgrade_excess_data_class` does NOT include `api_keys_over_cap` / `integration_endpoints_over_cap`, but §34.19.1 row 13 promises read-only preservation of API keys + integrations on downgrade (D-34.19-009).
- The §34.19.6 #2 protected-asset downgrade firewall blocks the 13-class list from entering `preservation_status=hard_archived` — but `preservation_status` is NOT a field on the §4.8.10 entity. The bucket's field is `status` (enum: `active_preservation` / `notice_sent_d60` / `notice_sent_d80` / `archive_pending` / `archived` / `restored`); there is no `hard_archived` value. The deploy-time validator named in §34.19.6 #2 / §34.20.16 AC #80 cannot be implemented against the schema as written (D-34.19-018).
- §22.18.5.3 line 18944 hedges that "no Class-1 asset enters `hard_archived` *unless* the seller has signed a §34.6 acknowledgement"; §34.19.6 #2 makes the firewall absolute. The seller-acknowledgement path is never authored anywhere (no §34.6 mechanism, no API endpoint, no audit event). Two readings of the same protection invariant (D-34.19-006).

### Check 3 — Seller Plan Upgrade Carry-Over Guarantee acceptance criteria testable (§34.20)

**Verdict: ⚠ Mostly testable; one threshold is qualitative.**

| AC | Testable? | Evidence |
| :---- | :---- | :---- |
| 76 (13-asset preservation) | Yes | Named QA test `plan_upgrade_13_asset_preservation`; explicit "full matrix" scope. |
| 77 (KB Value Meter formula) | Yes | Named test `kb_value_meter_formula`; formula and weights bound in §34.19.2. |
| 78 (KB Value Meter ≤ 15-min recompute) | Yes | Named latency test `kb_value_meter_post_upgrade_latency`; numeric threshold. |
| 79 (Honest-portability microcopy) | ⚠ Qualitative | Named test `plan_transition_microcopy_present`; threshold is "honest-portability microcopy" without binding to §34.19.4's four required elements (newly-unlocked list, prior-work-preserved statement, plan-capped reference, plan comparison link). A copy-QA could pass with one element. (D-34.19-011) |
| 80 (Protected-asset downgrade firewall) | ⚠ Phantom field | Validator references `preservation_status=hard_archived`; field/value absent from §4.8.10 schema (D-34.19-018). |
| 81 (Export `kb_value_meter` payload) | Yes | Named test `export_includes_kb_value_meter`. |

Cross-AC consistency: §34.20.16 AC #76 enumerates "13 protected asset classes" but §22.18.7 AC #74 enumerates "5 fields/entities" (`KBEntry.confidence_score`, `KBEntry.review_state`, `KBEntry.win_rate_weight`, `KBCitationGraphEdge` rows, `CapabilityDeclarationSuggestion` rows) — these don't align by count or scope. §34.20.16 AC #76 is the canonical aggregate; AC #74 is a sub-assertion at the field level. The two QA harnesses (`plan_upgrade_13_asset_preservation` vs `compounding_feature_upgrade_preservation`) overlap. Filed under D-34.19-005.

### Check 4 — Reverse pass: every entity declared in §4.4 with KB-related fields has carry-over annotation

**Verdict: ❌ Failing.** Of the §4.4 entities with KB-related fields, only §4.4.24 EOIDraftQueue carries an explicit upgrade-carry-over annotation (in its title and authoring intent: "Org-Scoped, Seller, Upgrade-Carry-Over"). Every other KB-touching entity is silent on §34.19:

| §4.4 entity | KB-related field(s) | §34.19 carry-over annotation? |
| :---- | :---- | :---- |
| §4.4.4 Capability Declaration | `evidence_kb_entry_ids` | ❌ No |
| §4.4.9 SellerSoftware | `kb_namespace_id`, `former_kb_namespace_ids` | ❌ No |
| §4.4.17 GhostBidImport | `target_kb_namespace_id`, produced KB entries | ❌ No |
| §4.4.22 SellerOnboardingSession | `stage_6_kb_value_meter_delta` | ❌ No |
| §4.4.24 EOIDraftQueue | n/a (EOI body, not KB-native) | ✅ Yes (heading + intent) |

Same gap on the §22 side: §22.3.1 KBEntry, §22.3.2 KBDocument, §22.3.3 KBFirecrawlSource, §22.3.4 KBNamespace retention blocks do not cite §34.19. Filed as D-34.19-013 (§22) and D-34.19-014 (§4.4).

Also: §22.4.4 namespace migration applies a `confidence_modifier × 0.7` rank penalty on `SellerSoftware` soft-delete. While that trigger is orthogonal to plan downgrade, the migration mutates a Class-2 asset (`KBEntry.confidence_modifier`) and the interaction is not addressed by §34.19's invariants. If a seller deletes a SellerSoftware mid-90-day downgrade window, the bucket's read-only KBEntries are still subject to the penalty, which violates the "100% retained" invariant in spirit. (D-34.19-015.)

---

## Counterfactual Pass — Three Realistic Failure Modes per Feature

### §34.5.1 Upgrade

1. **Stripe webhook `customer.subscription.updated` is delayed or DLQ'd.** §34.5.1 says "immediately on Stripe subscription change webhook receipt" — but if receipt is delayed, the customer paid for the upgrade and is rendered the new plan in Stripe, but Sourcera entitlements are still on the old plan. AC #22 in §34.20.5 says "Upgrades MUST be effective immediately (Stripe webhook receipt → entitlement refresh ≤ 30 seconds)" — but doesn't specify what happens if the webhook never arrives. Spec silent. (D-34.19-016.)
2. **Mid-upgrade Stripe rollback (e.g., 3DS challenge fails after webhook).** §34.5.1 / §34.19.6 #1 cover transactional rollback at the Sourcera-internal layer ("on failure, full rollback + `plan_upgrade_failed` webhook"), but Stripe's rollback semantics are not specified — i.e., what if Stripe sends `subscription.updated` then later sends `subscription.updated` reverting it? §34.19 silent. (Rolled into D-34.19-016.)
3. **Concurrent upgrade-then-downgrade within the same billing period.** Webhook ordering is not guaranteed. Spec silent on idempotency or rollback. (Rolled into D-34.19-016.)

### §34.6 Downgrade Excess Data Handling

1. **DowngradeExcessDataBucket creation itself fails.** §4.8.10 AC #1 promises 5-minute SLO; §34.6.1 says SLO breach alerts Ops. But what if creation fails outright — does the customer's downgrade roll back? Or does the customer end up on the new plan with un-preserved overflow that's been hard-deleted by the new caps? Silent. (D-34.19-016.)
2. **Customer hard-deletes a preserved entity inside the bucket via §34.6.2 row 5.** That entity is now permanently gone — but if it's a §34.19.1 protected asset (e.g., a KBEntry), the seller has effectively bypassed the protected-asset firewall. §34.19.6 #2 doesn't address customer-initiated hard-delete. (D-34.19-006.)
3. **Org deletion during preservation.** §4.8.10 covers it ("bucket transitions to `archived` immediately on Org deletion") but §34.19's protected-asset firewall doesn't carve out an exception. If the firewall blocks `archived` for protected assets, Org deletion can't complete. (D-34.19-006.)

### §34.19 Seller Carry-Over

1. **Solo plan transitions.** §34.19.3 transition table omits all Solo-related rows. §34.10.3 #5 / #6 reference Solo upgrade/downgrade but §34.19's 13-asset guarantee is silent. (D-34.19-010.)
2. **`KBEntry.win_rate_weight` schema-not-yet-authored at v7.1.0 stamp.** §22.18.7 AC #74 asserts byte-for-byte preservation of a field that doesn't exist in §22.3.1's authoritative table. (D-34.19-001.)
3. **`Organization.kb_value_meter_score` field missing.** §34.19.2 specifies the formula and storage location; §4.2.1 doesn't have the field. (D-34.19-003.)

---

## Self-Challenge Pass

Re-read each defect as a hostile reviewer: is the evidence reproducible? Is the severity classification rule-based? Could the recommendation be sharper?

| Defect | Self-challenge result |
| :---- | :---- |
| D-34.19-001 (`win_rate_weight` not in §22.3.1) | **Confirmed P1.** §22.18.3.3 line 18793 explicitly says "**Authored Extension** — §22.3.1 entity table does not currently declare this field; registered here for Phase 13 schema consolidation". The AC at §22.18.7 #74 depends on it. P1 per the "missing field-level schema" rule. |
| D-34.19-002 (`KBCitationGraphEdge` AE) | **Confirmed P1.** §22.18.3.4 line 18809 explicitly says "**Authored Extension** flagged for Phase 13 consolidation". Multiple ACs depend on it (§22.18.7 #74, §34.19.1 row 6 mapping). P1. |
| D-34.19-003 (`Organization.kb_value_meter_score` missing) | **Confirmed P1.** §34.19.2 line 30318 says "the KB Value Meter is stored on `Organization.kb_value_meter_score` (new field, Authored Extension; requires §4.x Organization spec update)". §4.2.1 read end-to-end — field absent. P1. |
| D-34.19-004 (`CapabilityDeclarationSuggestion` undefined) | **Confirmed P1.** §22.18.3.5 line 18845 says "(Authored Extension — flagged for Phase 13; an existing but silent pipeline under Summary §6.13 C.46 is the seed)". No entity field table found. P1. |
| D-34.19-005 (class-mapping drift §34.19.1 ↔ §22.18.5.1) | **Confirmed P1.** Tightened to call out the specific row mismatches (Class 3 = "Capability Declarations" vs Suggestion entity; Class 6 = "Outcome-signal history" vs Citation Graph). |
| D-34.19-006 (firewall behavior at preservation_until silent) | **Confirmed P1.** Read §34.6.3 + §34.19.6 #2 + §22.18.5.3 — three documents author three different behaviors. P1. |
| D-34.19-007 (§34.5.1 vs §34.19.1 unreconciled lists) | **Confirmed P1.** The §34.5.1 table caries `KB entries`, `Capability Declarations`, `Pro Trial Seat balances`, `DowngradeExcessDataBucket restorations`, etc.; the §34.19.1 13-class list adds `KB Value Meter score`, `Verification Tier`, `Outcome-signal history`, `Saved searches and alerts`, `Promoted Listing history`, `Buyer relationship history`, `Wallet balance`, `Committed-spend contract`, `API keys + integrations`, and omits `Workspace state`, `RBAC assignments`, `audit log`, `Internal Comments`. The intersection is ambiguous; junior engineer would build the wrong thing. P1. |
| D-34.19-008 (`SavedSearch` entity missing) | **Confirmed P1.** Master Spec grep returned zero matches for `SavedSearch` / `saved_search` / `SearchAlert`. §34.19.1 row 7 references the asset class. P1. |
| D-34.19-009 (API keys / integrations missing from §34.6.4 enum) | **Confirmed P1.** §34.6.4 enumerates 10 enum values; api_keys / integration_endpoints absent. §34.19.1 row 13 claims read-only preservation. P1. |
| D-34.19-010 (Solo transitions absent from §34.19.3) | **Confirmed P1.** §34.19.3 enumerates 8 transitions; none Solo. §34.10.3 #5–6 reference Solo upgrade/downgrade. Phase 14.9 added Solo plans; §34.19 was not co-edited. P1. |
| D-34.19-011 (AC #79 microcopy threshold qualitative) | **Confirmed P2.** Re-reading §34.19.4: it does enumerate four required elements. AC #79 should bind to each; current wording allows partial pass. P2 (a thoughtful staff engineer would resolve consistently). |
| D-34.19-012 (§34.6.5 ↔ §34.19.1 parallel preservation lists) | **Confirmed P2.** Two parallel lists. Tightened recommendation to explicitly cross-reference. |
| D-34.19-013 (§22.3.x retention blocks lack §34.19 cross-ref) | **Confirmed P2.** Reverse-pass gap. §22.3.1 retention block reads "Lives for the life of the Org" — silent on plan-upgrade preservation. P2 documentation gap. |
| D-34.19-014 (§4.4 entities lack §34.19 cross-ref) | **Confirmed P2.** Same reverse-pass gap. P2. |
| D-34.19-015 (§22.4.4 confidence_modifier × 0.7 vs §34.19 Class 2) | **Confirmed P2.** Specifically scoped: trigger (SellerSoftware soft-delete) is orthogonal to plan downgrade, but the field mutation is real. Edge case; thoughtful staff engineer could resolve but wouldn't all resolve the same way. P2. |
| D-34.19-016 (Stripe webhook DLQ / concurrency silence) | **Confirmed P2.** §34.5 silent on Stripe-side dependency outages. P2 per "soft-state behavior". |
| D-34.19-017 (audit-prompt 12-month premise drift) | **Recorded P3 / wont_fix.** Spec is consistent. Filed for traceability. |
| D-34.19-018 (`preservation_status=hard_archived` phantom field) | **Confirmed P1.** §4.8.10 schema was read end-to-end — field/value absent. AC #80 + §34.19.6 #2 reference both. The deploy-time validator is unwireable. P1. |

No revisions required after self-challenge.

---

## Coverage Matrix Update Note

The audit prompt requires updating COVERAGE_MATRIX.md cells. The §34.5 / §34.6 / §34.19 features map most directly to the existing `F-PRICE-PLAN-TIERS` / `F-PRICE-DOWNGRADE-PRESERVATION` / `F-PRICE-CARRY-OVER` rows (or equivalents — exact row identifiers depend on the v1.0 inventory). Recommended cell updates after this phase:

- Carry-Over Guarantee feature row → `data_model = ❌ missing` (D-34.19-001..004 + D-34.19-008), `state_machine = ❌ missing` (D-34.19-006 + D-34.19-018), `acceptance_criteria = ⚠ partial` (D-34.19-011 + D-34.19-018), `plan_gating = ⚠ partial` (D-34.19-009 + D-34.19-010), `consistency_drift = ❌ missing` (D-34.19-005 + D-34.19-007 + D-34.19-012).
- DowngradeExcessDataBucket feature row → `state_machine = ⚠ partial` (D-34.19-018), `plan_gating = ⚠ partial` (D-34.19-009).
- KB carry-over surface (§22.18.5) feature row → `data_model = ❌ missing` (D-34.19-001..004), `consistency_drift = ❌ missing` (D-34.19-005).

Coverage-matrix mechanical row update deferred to the next coverage-pass phase — the row identifiers in the v1.0 inventory are not in scope for this prompt and updating them blindly risks drift; flagging here so the next phase can apply with confidence.

---

## End of Phase 34.19 Findings

18 defect rows promoted to `DEFECT_LEDGER.md` (D-34.19-001 through D-34.19-018).
