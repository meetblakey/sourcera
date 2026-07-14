# Phase CONS — §34.3 / §34.10 / §34.11 AI Consumption / Wallet / Outcome Resolver — Findings Log

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Scratch log for the §34.3 / §34.10 / §34.11 walk per the `Audit_Prompts.md` AI Consumption Pricing prompt.

**Defect-id mnemonic.** `D-CONS-NNN`. Sequential within this prompt.

**Scope read.** Read end-to-end: §34.3 (28848–28933), §34.10 (29341–29453), §34.11 (29454–29521); plus entity-layer cross-walks §4.8.1 AIOperation, §4.8.2 CapabilityRegistryEntry, §4.8.3 AIWallet, §4.8.4 OutcomeContract, §4.8.5 ContestRecord, §4.8.6 CostBaseRecalculationLog, §4.8.7 FreeAllowanceCounter; Appendix C / J / K / L referenced for enum / state-machine / glossary checks; §31.8 webhook block (25670–25775) checked for wallet / contest / cost-base webhook contract registration; §32 endpoint conventions referenced for the three "endpoint pending" markers.

**Halt-rule guidance from prompt.** "P0 for any settlement-immutability gap or FX-locking ambiguity." Two P0s filed (D-CONS-001 publish-gating ambiguity; D-CONS-002 settlement-freeze contradiction). FX-locking found internally consistent for AIOperations (Solo per-charge FX-lock-time gap was filed earlier as D-PT-005 and is not re-filed in this prompt).

---

## 1. Walk Summary by Sub-Section

### 1.1 §34.3.1 Pricing Formula

- ✅ Formula declared with `MAX(min, cost_base × multiplier)` floor pattern.
- ✅ Floor enforcement at price-update time inside cost-base recalc job (line 28864).
- ❌ Formula contradicts §4.8.2 entity definition (per-capability multipliers) — D-CONS-003 (P1).
- ⚠ Margin-floor-breach webhook reference at line 28864 cites `§34.11.3` which is a section, not a webhook catalog — D-CONS-007 (P1).

### 1.2 §34.3.2 Customer-Visible Surfaces

- ✅ Three surface modes (Included / Wallet Overage / Committed Spend) with Per-op price visibility partition.
- ❌ Wallet Overage row references a "Billing Ledger" endpoint that's marked "endpoint pending" — D-CONS-011 (P1).

### 1.3 §34.3.3 Cost-Base Recalculation (Operational Policy)

- ✅ Recalc cadence + drift bands declared in tabular form.
- ❌ Auto-publish-block threshold contradiction: row says ≥ 25%; same section's prose says "high or critical require approval"; §4.8.6 AC #2 says ≥ 10% — D-CONS-001 (P0).
- ❌ Cron time mismatch: §34.3.3 says 02:30 UTC; §4.8.6 AC #1 says 03:00 UTC — D-CONS-004 (P1).
- ❌ Sample window mismatch: §34.3.3 says prior 24h; §34.17.1 says 30-day; §4.8.6 entity has timestamps without canonical duration — D-CONS-005 (P1).
- ❌ §34.11.3 uses different drift band names (`low/medium/high/critical`) than §4.8.6 enum (`normal/warning_5_10/alert_10_25/critical_gt_25`) — folded into D-CONS-001.

### 1.4 §34.3.4 Per-Capability Rate Card

- ✅ Illustrative subset at 20-row size; full catalog deferred to `CapabilityRegistryEntry × billing_mode=customer_billed` join + PricingTableVersion publication.
- ❌ Public Pricing API endpoint `GET /v1/pricing` referenced as "endpoint pending" — D-CONS-011 (P1).

### 1.5 §34.3.5 Sourcera-Owned and Platform-Marketing Capabilities

- ✅ Three billing-mode partition (`customer_billed`, `sourcera_owned`, `platform_marketing`).
- ✅ Cost-center rules + customer-wallet exclusion documented.

### 1.6 §34.10.1 Wallet Counters

- ✅ Three-counter model (Included Budget, Overage Balance, Committed Spend) with burn priority.
- ✅ Integer USD cents; FX presentation only (line 29355).

### 1.7 §34.10.2 Wallet Configuration

- ✅ Defaults documented (overage off, auto-topup off).
- ❌ Daily/Weekly/Monthly caps row declares all three but entity (§4.8.3) has only monthly — D-CONS-013 (P1).
- ❌ No per-period frequency cap on top-up attempts — D-CONS-015 (P2).

### 1.8 §34.10.3 Pooled Budget Across Consoles

- ✅ Org-scoped pooling rule canonical at line 29371 (entity-level enforced by absence of `console` column).
- ✅ Solo-co-resident rule documented in 6 sub-rules (29392–29399).
- ❌ Solo engine-absorbed envelope counter referenced multiple times but no entity defines per-(org_id, console) envelope state — D-CONS-010 (P1).
- ⚠ Free + Free / Free + Paid pool-collapse rules flagged as Authored Extensions (already in AE Ledger; no new defect).

### 1.9 §34.10.4 Wallet State Machine (Reference)

- ✅ Policy summary cross-references §4.8.3.
- ❌ Wallet state names in §31.8 webhook payloads use `soft_capped_*` instead of canonical `soft_warned_*`; `soft_capped_100` not registered in canonical enum — D-CONS-006 (P1).

### 1.10 §34.10.5 Stripe Metering

- ✅ 14 Stripe meter events catalogued including 8 Solo additions (Phase 14.9).
- ✅ FX-rate locking field present on each event payload.
- ⚠ Solo per-charge fx_rate_locked timing already filed as D-PT-005 (Phase PT); not re-filed.

### 1.11 §34.10.6 Wallet Downgrade Behavior

- ✅ Plan-downgrade behavior on `budget_value_dollars` reset documented.
- ✅ Enterprise→non-Enterprise commit shortfall policy documented.
- ❌ Pre-downgrade validation for in-flight `pending` AIOperations (with active wallet holds) undefined — D-CONS-017 (P2).

### 1.12 §34.10.7 Failure Modes Addressed (Operational Layer)

- ✅ Five failure modes addressed: cap-set below burn, auto-topup webhook race, mid-period overage disable, Free-side downgrade pool collapse, plan-transition window operation.
- ⚠ Counterfactual pass found three additional unaddressed failure modes (D-CONS-013, D-CONS-015, D-CONS-017).

### 1.13 §34.11.1 Outcome Contract Registry

- ✅ 20-row representative table with full registry pointer to §21.4.5 + §4.8.4.
- ✅ Default-on-timeout = `rejected`; `auto_accepted` distinct settlement state.
- ✅ Partial-surface pointer at line 29460 points engineering to §21.4.5 / §4.8.4 as authoritative.

### 1.14 §34.11.2 Contest Window

- ✅ 14-day default + per-capability override (≤ 90).
- ✅ Routing / approval / reversal / restoration / auto-file mechanics documented.
- ❌ Filing path `POST /v1/billing/operations/:id/contest` marked "endpoint pending" — D-CONS-011 (P1).
- ❌ Six customer notification webhook events listed but not authored per §31 conventions or registered in Appendix C — D-CONS-012 (P1).
- ❌ DB-level enforcement of 14-day window absent; API-only — D-CONS-008 (P1).

### 1.15 §34.11.3 Cost-Base Recalculation (Cross-Reference)

- ⚠ Drift band naming drift (folded into D-CONS-001).
- ❌ Margin-floor-breach webhook nomenclature drift — D-CONS-007 (P1).

### 1.16 §34.11.4 Outcome Resolver Acceptance Criteria

- ✅ 5 ACs covering settlement deadline, late-signal contest, contract version freeze, contest SLA, contest credit latency.
- ❌ Free-allowance settlement path absent from ACs — D-CONS-016 (P2).
- ❌ Resolver liveness / backlog / degraded-state handling absent — D-CONS-019 (P2).

---

## 2. Defect Detail (Cross-Reference)

Each `§2.N` heading below is the in-prompt scratch reference cited from the corresponding DEFECT_LEDGER.md row. The DEFECT_LEDGER.md row is the canonical home for evidence + recommendation; this scratch log captures the in-prompt analysis path that produced the defect.

### 2.1 D-CONS-001 (P0) — Cost-base publish-gating threshold ambiguity

Walked the §34.3.3 row + prose + §4.8.6 AC #2 + §34.11.3. Filed P0 because: (a) prompt rule explicitly fires P0 on "billing surface ambiguous in a way that allows revenue leakage / unapproved price changes"; (b) a 12% drift would auto-publish per the §34.3.3 row but require approval per §4.8.6 AC #2 — different production behavior on same input; (c) §4.8.9 30-day-notice contract is downstream-dependent on the gating threshold, so a wrong gate breaches a customer contract.

### 2.2 D-CONS-002 (P0) — Settlement-freeze vs Ops emergency-reversal contradiction

Walked §4.8.1 AC #3 + Settlement Freeze block + state-machine row at line 8166. Filed P0 because: (a) prompt rule explicitly fires P0 on "settlement-immutability gap"; (b) the contradiction is internal to a single section (§4.8.1) and a junior engineer cannot pick a side without architectural authority; (c) the consequence of either reading is production-blocking — strict AC #3 breaks Ops emergency reversal, permissive state-machine row breaks settlement-immutability.

### 2.3 D-CONS-003 (P1) — Pricing-formula multiplier discrepancy

Walked §34.3.1 formula + §4.8.2 fields `value_multiplier`/`cost_multiplier` + §4.8.2 AC #5. P1 stands because the override is rare in practice (default 10.000 / 1.050) but is documented as customer-visible AND triggers PricingTableVersion publish, so engineering must implement the per-capability lookup.

### 2.4 D-CONS-004 (P1) — Cron-time singleton drift (02:30 vs 03:00 UTC)

Walked §34.3.3 row, §34.17.1 row 3, §4.8.6 AC #1. Two-of-three locations agree on 02:30 UTC; §4.8.6 is the outlier. Recommendation: 02:30 (matches BPS §11 / SPS §9 source authority).

### 2.5 D-CONS-005 (P1) — Cost-base sample-window indeterminate (24h vs 30d)

Walked §34.3.3 "Recalc inputs" row + §34.17.1 reference + §4.8.6 entity fields. Recommendation: 30-day rolling window (gives statistical sample for low-volume capabilities; matches §34.17.1 engineering-requirement reading).

### 2.6 D-CONS-006 (P1) — Wallet state enum drift

Walked §31.8 four webhook payload tables + §4.8.3 enum + Appendix J + Appendix K. Five inline references in §31.8 use `soft_capped_*`; canonical is `soft_warned_*`. `soft_capped_100` is not in canonical enum at all. The fix may require introducing a `soft_warned_100` enum value to disambiguate cross-100% with overage-still-available state vs `hard_capped_100`.

### 2.7 D-CONS-007 (P1) — Margin-floor-breach event nomenclature drift (3 names, 0 webhook contracts)

Walked §34.3.1 + §34.18.5/§34.18.6 + §38 + Appendix C registration in §34.17. Three identifiers; one is referenced as a webhook but never declared per §31 conventions. The §38 error code is a separate concept (admin-side proposal rejection) and stays.

### 2.8 D-CONS-008 (P1) — Contest 14-day window: API only, no DB enforcement

Walked §4.8.1 AC #6 + §4.8.5 Failure Mode #1 + §34.11.2 Filing window. The "database transaction commit time as the comparison clock" phrase is application-level, not DB-layer. Static CHECK constraint not feasible (per-capability variable window); BEFORE INSERT trigger is the right primitive.

### 2.9 D-CONS-009 (P1) — FreeAllowanceCounter vs plan-tier entitlement reconciliation undefined

Walked §4.8.7 + §4.8.2 `free_allowance_quantity_default` + §34.1.2 KB Bootstrap row + §34.10.3 burn priority. Two competing free-op accounting mechanisms. Recommendation includes capability-by-capability seed table to resolve.

### 2.10 D-CONS-010 (P1) — Solo engine-absorbed envelope counter entity undefined

Walked §34.10.3 Solo-co-resident rule (lines 29392–29402) + §4.8.2 config fields + §4.8.3 (no Solo envelope on AIWallet). Engineering needs an O(1) counter read for §44.6.4 throttling; AIOperation aggregation isn't sufficient. Proposed §4.8.14 "SoloEnvelopeCounter" entity.

### 2.11 D-CONS-011 (P1) — Three core endpoints "pending"

Walked §34.3.2 / §34.3.4 / §34.11.2 / §34.12.4 / §34.20.9 AC #42. Endpoints `GET /v1/pricing`, `GET /v1/billing/operations`, `POST /v1/billing/operations/:id/contest` are referenced but not authored per §32 conventions. Fix: author each per §32 fidelity (method, path, auth scope, rate-limit class, pagination, request/response schema, error codes, idempotency, examples).

### 2.12 D-CONS-012 (P1) — Six contest webhooks "pending"

Walked §34.11.2 Customer notifications row + §31.8 (no contest events) + Appendix C. Plus `contest.abandoned` from §4.8.5 state machine. Two namespaces in use (`contest.X` and `billing.contest.X`); recommendation picks `billing.contest.X` to match §31.8 dotted-namespace pattern.

### 2.13 D-CONS-013 (P1) — Auto-topup daily/weekly cap fields missing

Walked §34.10.2 row + §4.8.3 entity fields. Policy declares three caps; entity has only monthly. Engineering cannot enforce daily cap without entity field.

### 2.14 D-CONS-014 (P2) — Appendix L claims AIOperation but doesn't include it

Walked Appendix L preamble (line 179), Appendix L body, §4.8.1 inline state machine, §12.x reference to L.8. Two missing sub-sections from a self-described consolidator. P2 because engineering CAN find the inline state machine via cross-reference; just less efficient.

### 2.15 D-CONS-015 (P2) — Auto-topup per-period frequency cap missing

Walked §4.8.3.A top-up state machine + §34.10.4 wallet-state-policy summary. No per-period frequency cap on top-up triggers. Defense-in-depth gap; doesn't break billing math but creates runaway-agent failure mode.

### 2.16 D-CONS-016 (P2) — §34 silent on FreeAllowanceCounter / Outcome Resolver settlement interaction

Walked §34.11.4 ACs + §4.8.3 Free Allowance Interaction + §34.11.2 contest reversal table. ACs do not address whether `rejected` free-allowance operations consume a unit or whether contest approval refunds the unit.

### 2.17 D-CONS-017 (P2) — Pre-downgrade validation for in-flight AIOperations missing

Walked §34.5.3 + §34.10.6 + §4.8.1 Failure Mode #1. Implementation contract from Failure Mode #1 (wallet hold guarantees settlement) is not surfaced through the downgrade transition.

### 2.18 D-CONS-018 (P2) — Solo per-charge contest mechanics undefined

Walked §34.2.5 + §34.11. Solo $199 is BillingEvent; AIOperation contest is 14-day; refund is 7-day; these don't reconcile.

### 2.19 D-CONS-019 (P2) — Outcome Resolver outage / pending-backlog handling unspecified

Walked §34.11 preamble + §34.11.4. Resolver liveness, polling cadence, SLO, customer-visible degraded-state UI all absent.

---

## 3. Self-Challenge Pass

Reproduced in DEFECT_LEDGER.md "Phase CONS Self-Challenge Pass" section. Five candidate findings re-read as a hostile reviewer:

1. **D-CONS-001** — "Could a thoughtful staff engineer reconcile the row vs AC #2?" Reviewed; both clauses are publication-gates with different threshold values. P0 stands.
2. **D-CONS-002** — "Could AC #3 'all writes' implicitly carve out Ops emergency?" The Settlement Freeze block at line 8168 explicitly enumerates DSAR-only as the carve-out. P0 stands.
3. **D-CONS-009** — "Could free-allowance/plan-tier reconciliation be inferred from §34.10.3 burn priority?" Burn priority establishes order but not whether counters are same/separate. P1 stands.
4. **D-CONS-010** — "Is Solo envelope counter implicit in AIOperation aggregation?" Theoretically yes but throttling needs O(1) read. P1 stands.
5. **D-CONS-014** — Originally drafted as P1; lowered to P2 on self-challenge (engineering can find the inline state machine via cross-ref). Severity revision logged.

No findings withdrawn during self-challenge; one severity revision (D-CONS-014 P1→P2).

---

## 4. Counterfactual Pass

Three failure modes per audited surface enumerated in DEFECT_LEDGER.md "Phase CONS Counterfactual Pass". Summary:

- §34.3 cost-base recalc: 3 of 3 known failure modes addressed in spec; 2 NEW failure modes filed (D-CONS-005, D-CONS-007).
- §34.10 AI Wallet: 3 of 3 known failure modes addressed; 3 NEW failure modes filed (D-CONS-013, D-CONS-015, D-CONS-017).
- §34.11 Outcome Resolver: 3 of 3 known failure modes addressed; 3 NEW failure modes filed (D-CONS-016, D-CONS-018, D-CONS-019).

Total NEW failure modes from counterfactual: 8. All filed as defects in this prompt.

---

## 5. Out-of-Scope Findings (Bookmarked for Later Phases)

- §32 endpoint authoring for the three "endpoint pending" entries (D-CONS-011) is in scope here for filing; the actual authoring of §32 sub-sections is a Phase 8 (API + Webhook) follow-on task.
- Solo per-charge fx_rate_locked timing (D-PT-005) was filed in Phase PT — NOT re-filed.
- Solo subscription / Enterprise contract collapse interaction (already filed as D-PT-009 / D-PT-010) — NOT re-filed.
- §34.18 financial scorecard cross-walks were sampled only on the margin-floor-breach reference (D-CONS-007); a full §34.18 walk is a separate prompt.

---

## 6. Sign-Off

- Defects promoted: 19 (2 P0, 11 P1, 6 P2, 0 P3).
- Halt-rule: HALTED on D-CONS-001 + D-CONS-002 P0s per the prompt's settlement-immutability rule.
- v7.1.1 stamp gate: 7 defects MUST close before stamp (D-CONS-001, -002, -003, -006, -007, -011, -012).
- Findings log complete; cross-references written to DEFECT_LEDGER.md "Phase CONS Cross-References" section.
