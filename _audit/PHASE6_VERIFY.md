# Phase 6 / Prompt V6 — Cross-Console & Marketplace Verification

**Audit baseline.** Master Spec v7.1.0 (2026-04-28). Prompt V6 is the adversarial verification of Phase 6 per `Audit_Prompts.md` lines 1708–1727.

**Audit posture.** Non-destructive. Phase 6.1 walked §25 + §4.7; Phase 6.2 walked §27. V6 confirms structural completeness, runs three adversarial scenarios specified by the prompt, files net-new defects discovered during the verification pass, and renders a sign-off determination against the prompt's two halt-rules: zero P0 `firewall_leakage`; zero P0 `vendor_opt_out` leak.

**Defect-id mnemonic for this prompt.** `D-V6-NNN`. Sequential within this verification sweep.

---

## 1. Structural Completeness — §25 + §27 Audited

### 1.1 Phase 6.1 (§25 + §4.7) audit completeness

`PHASE6.1_FINDINGS.md` walked the full §25 surface end-to-end with cross-references to §4.7 Cross-Console Bridge Entities:

- §25.1 Data Flow via Console Bridge (incl. §25.1.1 Directional Surface Inventory, §25.1.2 Entity-Level Redaction Rules, §25.1.3 Allow-List Evolution).
- §25.2 Sync Behavior, Bounded-Lag SLO & Retry (§25.2.1–§25.2.6 incl. Kill-Switch Notification Suppression).
- §25.3 Disqualification (Gap 25.2) — §25.3.1–§25.3.16.
- §25.4 §25 Acceptance Criteria.
- §25.5 Materialization Protocol (Buyer Requirement → Seller Bid Response) — §25.5.1–§25.5.10.
- §25.6 Console Bridge Observability — §25.6.1–§25.6.6.
- §25.7 Internal Comments — sampled (firewall-NEVER-CARRIED invariant only) per Phase 6.1 scope rule.
- §4.7.1 Console Bridge Event (incl. §4.7.1.1 Retention & DSAR Cascade).
- §4.7.2 Vendor Disqualification Record.
- External cross-walks to §1.3 / §1.4 / §6.8 / §31 / §32.8 / §40.2 / §42 / §50 / §51 / Appendices C / F / G / I / J / K / L / M.

23 defects promoted to `DEFECT_LEDGER.md` (1 P0, 12 P1, 7 P2, 3 P3). Self-Challenge Pass and Counterfactual Pass both executed and logged in `PHASE6.1_FINDINGS.md` §4 / §5. Per Audit_Prompts.md halt-rule for high-risk surfaces, the P0 (D-6.1-001 fanout cardinality side-channel) was flagged as halting Phase 6.2 advancement; Phase 6.2 nevertheless ran in parallel under the project's compressed audit cadence — the halt rule is enforced here at V6 sign-off.

### 1.2 Phase 6.2 (§27) audit completeness

`PHASE6.2_FINDINGS.md` walked the full §27 surface end-to-end:

- §27.1 Purpose, §27.2 Availability, §27.3 Marketplace Search & Filtering.
- §27.4 Marketplace Match Score (§27.4.1–§27.4.12).
- §27.5 Expression of Interest (EOI).
- §27.6 Marketplace Tags & Controlled Vocabulary (§27.6.1–§27.6.11).
- §27.7 Acceptance Criteria.
- §27.8 Marketplace Abuse & Takedown (§27.8.1–§27.8.14).
- §27.9 Seller Signals (§27.9.1–§27.9.15).
- §27.10 Vendor Opt-Out Global Registry (§27.10.1–§27.10.11).
- §27.11 Marketplace Discovery Pricing (§27.11.1–§27.11.10).
- External cross-walks to §1.3 / §7.2 / §22.5 / §22.20 / §26.1–§26.3 / §31 / §32 / §34.1.1 / §34.1.2 / §34.10.3 / §34.16 / §40.1 / §40.2 / §42.3.1 / §44.6 / §45.1–§45.3 / §48.2.11 / §48.4 / §48.6 / Appendices C / F / G / I / J / K / L / M.

25 defects promoted (0 P0, 11 P1, 10 P2, 4 P3). Self-Challenge Pass and Counterfactual Pass logged in `PHASE6.2_FINDINGS.md` §4 / §5. Two candidate findings withdrawn during self-challenge (logged inline).

### 1.3 Aggregate Phase 6 defect count (pre-V6)

| Phase | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| 6.1 | 1 | 12 | 7 | 3 | 23 |
| 6.2 | 0 | 11 | 10 | 4 | 25 |
| **Subtotal** | **1** | **23** | **17** | **7** | **48** |

V6 will append net-new defects discovered during adversarial verification to this count.

### 1.4 Structural-coverage verdict

Phase 6.1 + Phase 6.2 walked every authored sub-section of §25 + §27 + §4.7 end-to-end. The 14-point convention checklist was applied per sub-section; defect promotion was reproducible against line-numbered evidence. Coverage matrix updates were issued in `PHASE6.1_FINDINGS.md` §7 and `PHASE6.2_FINDINGS.md` §6. V6 inherits these updates and amends them with V6-discovered cells.

**Gap.** §25.7 Internal Comments was sampled-only in Phase 6.1 (firewall-NEVER-CARRIED invariant only), with a Phase 6 follow-on prompt deferred. The deferral is documented in `PHASE6.1_FINDINGS.md` §1 but no follow-on prompt has run. V6 surfaces this as a known structural-coverage gap (see §5 Sign-Off — Caveats).

---

## 2. Adversarial Check 1 — Hypothetical Bridge Event Payload, K-Anonymity Floor Re-Identification

### 2.1 Scenario construction

Buyer Org `ACME` runs a Phase-3 evaluation for "Cloud SIEM" with a Target Account list of 5 sellers: `vend_A`, `vend_B`, `vend_C`, `vend_D`, `vend_E`. The Buyer Workspace Owner posts an Amendment to Requirement `req_47` ("must support OCSF 1.3"). The bridge fans out one Console Bridge Event (`event_kind=amendment_broadcast`) per recipient seller — 5 rows total, all sharing one `fanout_group_id`. Per §4.7.1 redaction matrix line 7840, the `payload_json` for `amendment_broadcast` carries:

```json
{
  "amendment_id": "amend_01HZQR...",
  "diff_summary": "Added OCSF 1.3 minimum-version requirement to req_47",
  "affected_requirement_ids": ["req_47"],
  "amended_at": "2026-05-04T16:07:31.842Z",
  "broadcast_to_vendor_count": 5
}
```

Per §4.7.1 row-level seller projection, every other row-level field is opaque-handled, null'd, or pseudonymized for the seller. `vend_A` receives one row; `vend_B` receives a separate row; etc. Per the row-level table at line 7793, `fanout_group_id` is `null` (multi-seller fan-out). All five sellers see the same `payload_json` with `broadcast_to_vendor_count = 5`.

### 2.2 Re-identification analysis

The §25.1.2 Target Account row (line 19702) is unambiguous: *"A seller CANNOT learn which other sellers are in the buyer's Target Account list, **their order, their status, or their count**."* The §25.1.2 Never-Carry Invariant #3 (line 19716) reinforces: *"No Target Account list membership, order, status, or count for any seller other than the target itself appears in the target's seller-bound payload."*

The `broadcast_to_vendor_count = 5` value, by direct identity, IS the Target Account list count. Each receiving seller learns:

1. **Buyer-internal vendor cardinality on this evaluation = 5.** Seller `vend_A` knows that buyer `ACME` shortlisted 5 vendors total for "Cloud SIEM", which is a count.
2. **Repeated observation enables temporal inference.** If a subsequent `amendment_broadcast` carries `broadcast_to_vendor_count = 4`, the seller infers a competitor was disqualified or withdrew between the two amendments. The Phase 6.1 D-6.1-001 finding (fanout_group_id binary signal) is one bit of cardinality leakage; this finding is exact-integer cardinality leakage on every amendment.
3. **Cross-seller inference (collusion-resilient).** Even without seller collusion, the field directly discloses the cardinality. If sellers DO collude (out-of-band), the count value can be cross-confirmed across sellers receiving the same amendment, building a richer competitor map.

The §1.3.2 Console-Scoped Entities firewall and the §25.1.2 NEVER-CARRIED invariant both classify this disclosure as a firewall breach. The `redaction_verification_hash` validator at §4.7.1 line 7826 cannot catch this leak — `broadcast_to_vendor_count` is in the CARRIED whitelist for `amendment_broadcast` per the §4.7.1 line 7840 table; the validator passes by design.

**Per the prompt's halt rule for `firewall_leakage`, this is a P0 finding.**

### 2.3 Net-new defect

**D-V6-001 — `broadcast_to_vendor_count` directly carries Target Account list cardinality to every receiving seller (P0).** See §6 Defect Promotions below.

### 2.4 Adjacent vectors (lower severity)

The `affected_requirement_ids[]` array length leaks the count of requirements amended in this broadcast. This is buyer-internal scope information — analogous to D-6.1-015 (`source_entity_version` count) but at the requirement-collection level. Severity P2 (incremental information leakage, not unique re-identification of buyer-internal list cardinality). Filed as **D-V6-004** below.

The `slo_bounded_lag_ms` and `slo_breach_flag` fields are carried full to seller per the row-level projection (line 7812). A seller could correlate bounded-lag values across many events to fingerprint buyer-side Convex region health — a low-yield timing-correlation channel. The §25.6.1 metrics catalog explicitly classifies these as "firewall-safe latency telemetry." Severity assessment: P3 (cosmetic / not exploitable as written; Convex region health is platform-level, not buyer-specific). Not filed.

The `payload_schema_version` field is carried full. Schema versions identify platform-shared contract evolution; not buyer-specific. Not a leak.

The `nda_executed` event kind explicitly carries `signatory_email_buyer_public` (buyer User PII). This is by-design — NDA execution requires both signatories to know each other. The §25.1.2 Never-Carry Invariant #4 ("No buyer user-identity PII") is intentionally violated under the §25.1.2 NDA Record row's "by definition cross-console" rationale. Not a defect; the contract is documented.

The `superseded_by_event_id` cross-fanout-group inference vector was filed and self-challenge-withdrawn in Phase 6.1 (folded into D-6.1-001 — same root cause). Confirmed not a separate finding.

### 2.5 Adversarial Check 1 — Verdict

**The §4.7.1 + §25.1.2 redaction model contains a P0 firewall-leakage defect not caught by Phase 6.1.** Phase 6.1 found D-6.1-001 (`fanout_group_id` binary cardinality side-channel) but did not detect D-V6-001 (`broadcast_to_vendor_count` exact cardinality disclosure). Both are §25.1.2 Target Account count violations; the second is more severe because it discloses an exact integer rather than a binary signal. **Halt-rule fails on this scenario.**

---

## 3. Adversarial Check 2 — Marketplace Search Trace, Opted-Out Vendor Surfacing

### 3.1 Scenario construction

Seller `vend_X` (a SOC 2-Certified seller in marketplace category `siem_vendor`) commits a global opt-out at `T0 = 2026-05-04T19:00:00.000Z` via `POST /api/v1/opt-outs` with `scope_kind=global`. The opt-out is `auto_honored` per §27.10.6.1 side-effects. Per §27.10.4 stage decomposition: S1 ≤ 2s, S2 ≤ 10s, S3 ≤ 20s, S4 ≤ 15s, S5 ≤ 10s slack.

Three buyer search attempts trace through the §27.10.3 17-surface allowlist:

**Trace A — buyer searches at T0 + 2s** (during S1/S2 propagation).
- Surface 8 (Marketplace Search §27.3): live registry probe at S5 acquires snapshot. Per §27.10.4 stage S2 budget (10s), the new opt-out row may not yet be replicated to the buyer's region. Per §27.10.4 #6 fail-closed: "On any failure in S1–S5 (registry unavailable, replication lag > 10s, edge-purge ack timeout, search index sync failure, snapshot fetch timeout), the render path MUST default to the most conservative behavior: suppress." Inside the 10s window, replication is in-progress, not "failed" — the snapshot returned to the render is the pre-T0 view. **`vend_X` may surface in this trace.** Per §27.10.4 line 24011: "the invariant is 'no surface rendering AFTER t_commit + 60s emits the un-redacted identity.'" Renders BEFORE t_commit + 60s are explicitly within the SLO budget.

This is by-design. The 60s SLO is the upper bound, not an instantaneous redaction guarantee. The §27.10.4 stages co-index the budget at 60s end-to-end. The acceptance test at §27.10.9 AC #14 enforces "after 60s post-commit." Pre-60s renders are documented as in-budget by the SLO model. **Not a defect.**

**Trace B — buyer searches at T0 + 90s** (well after the 60s SLO).
- Surface 8: live registry probe acquires a snapshot ≤ 60s old. The hot-registry has the opt-out row replicated since T0+10s. Snapshot returns `vend_X = opted-out`. Render suppresses `vend_X` from search results. ✓
- Surface 9 (Marketplace Listing): on-demand render with live probe — `410 Gone` for `vend_X`. ✓
- Surface 11 (Public JSON `/api/public/*`): row omitted. ✓
- Surface 12 (Schema.org JSON-LD): omitted. ✓
- Surface 13 (Sitemap): regenerated within 60s. ✓
- Surface 14 (RSS/Atom): filtered. ✓

**Trace C — buyer pulls Match Score via §27.4.12 Programmatic API at T0 + 90s.**
- §27.4.4 hard gate: `vendor_opt_out_effective_flag = 1 ⇒ score = NULL`. Score is suppressed.
- §27.4.7 cache TTL 60s + `marketplace.match_score.cache_invalidated` on `vendor_opt_out.applied`. Cache is invalidated.
- §27.10.3 Surface allowlist: **the §27.4.12 Programmatic API path is NOT explicitly enumerated as a surface row** — Surface 11 covers `/api/public/*` collection endpoints; the Match Score Programmatic API (`/api/v1/marketplace/match-scores/...` per §27.4.12) is at `/api/v1/`, not `/api/public/`. Whether Surface 11 covers it depends on path-prefix interpretation.
- Per §27.4.4, the score is NULL; per §27.10.3 Surface 12 (Schema.org JSON-LD), audit receipts for opted-out sellers are omitted.
- Net effect: the score is NULL, the audit-receipt is suppressed, but the API response could echo back the buyer-supplied query (e.g., the seller's `seller_software_id` reference) in error or metadata fields.

The §27.10.9 AC #14 / AC #26 surface allowlist invariant CI test (`vendor_opt_out_surface_allowlist_invariant`) is the gate that asserts every render path emitting Seller identity is in the §27.10.3 table. If the §27.4.12 Programmatic API path is interpreted as Surface 11 (Public JSON endpoints), the invariant holds. If it is interpreted as a separate path family, **the §27.10.3 table is silent and the CI gate cannot bind**. This is a P2 documentation gap: **the §27.10.3 enforcement allowlist needs an explicit row for Match Score Programmatic API and Match Score audit-receipt endpoints to disambiguate the §27.10.9 AC #14 binding scope.** Filed as **D-V6-005** below.

**Trace D — buyer's pre-existing private Intelligence Brief (§16) referencing `vend_X`.**
Per §27.10.5 line 24040 #1, buyer-private artifacts referencing the opted-out seller are NOT suppressed; opt-out is a public-visibility preference, not a platform-wide muzzle. The buyer can continue viewing and updating their own Intelligence Brief naming `vend_X`. Documented intent. **Not a defect.**

**Trace E — public Selection Report link (M2) generated by another Buyer Org at T0-30d, hit at T0 + 90s.**
Per §27.10.5 line 24041 #2, the M2 Public Link render path checks the registry on every GET; the buyer's share URL remains valid but serves the redacted projection. Within 60s of opt-out commit, the live render returns the redacted projection. ✓

**Trace F — CRM Sync outbound to `vend_X` at T0 + 90s** (per §27.10.3 Surface #16).
The seller's own CRM sync is private to the seller; opt-out does NOT suspend CRM Sync to `vend_X`. The §27.10.3 Surface #16 row covers CRM Sync outbound to OTHER sellers (i.e., when the opted-out vendor is the SUBJECT of an outbound payload). Outbound to `vend_X`'s own CRM about their own deal pipeline is unaffected per §27.10.5 line 24043 #4 (Seller Signals to the Seller themselves are unaffected — "An opt-out does NOT suspend Seller Signal delivery to the Seller itself"; analogous reasoning for CRM Sync). ✓

### 3.2 Adversarial Check 2 — Verdict

The §27.10.3 17-surface allowlist + §27.10.4 60-second budget + §27.10.5 retroactive scope contract collectively yield a defensible cascade. Pre-60s renders are explicitly within the SLO budget by design and are not leaks. Buyer-private artifacts and seller-self CRM are by-design exclusions from the suppression scope.

**One P2 documentation gap surfaced (D-V6-005):** the §27.10.3 enforcement allowlist needs explicit rows for Match Score Programmatic API endpoints (§27.4.12) to bind the §27.10.9 AC #14 CI invariant unambiguously. The leak vector is hypothetical — the §27.4.4 hard gate already suppresses the score itself — but the allowlist invariant test cannot deterministically resolve whether the §27.4.12 path is in scope.

**Zero P0 vendor_opt_out leaks discovered. Halt-rule for vendor_opt_out passes this scenario.**

---

## 4. Adversarial Check 3 — Promoted Listing Auction Tie-Break Determinism

### 4.1 Scenario construction

Category `endpoint_protection` runs the weekly Promoted Listing auction. Bid window opens Sunday 12:00 UTC, closes Monday 00:00 UTC. Three sellers submit:

- `vend_P`: bid `$2,500`, `PromotedListing.created_at = 2026-04-30T14:30:00.000Z` (created 4 days before auction close).
- `vend_Q`: bid `$2,500`, `PromotedListing.created_at = 2026-05-03T22:11:42.314Z` (created Sunday during the bid window).
- `vend_R`: bid `$2,000`, `PromotedListing.created_at = 2026-05-03T23:59:59.999Z`.

Per §34.16.1 line 29917: *"ties are broken by `PromotedListing.created_at` ASC (earliest bid wins tiebreaker)."*

Bids sorted descending: `vend_P` and `vend_Q` tied at `$2,500`; `vend_R` at `$2,000`. Tiebreak by `created_at` ASC: `vend_P` (2026-04-30) earlier than `vend_Q` (2026-05-03) ⇒ `vend_P` wins rank 1; `vend_Q` rank 2; `vend_R` rank 3. Winner pays second-highest = `$2,500` per §34.16.1 #4 and §34.16.8 AC #2.

### 4.2 Determinism failure modes

**Failure mode 1 — `created_at` semantic ambiguity.** The spec is silent on what `PromotedListing.created_at` represents in the context of the per-week auction:

- **Reading A:** `created_at` is the entity-creation time (when the seller first drafted the PromotedListing row). Under this reading, a seller who created a PromotedListing 6 months ago and re-bids each week beats a seller who created theirs the same Sunday. This rewards "tenure" — first-mover advantage that compounds week-over-week.
- **Reading B:** `created_at` is the per-week-bid-submission timestamp (a new PromotedListing row is created for each weekly bid; `created_at` is the bid-submission instant). Under this reading, the tiebreak is "first to submit this week's bid wins" — i.e., bid-submission promptness wins.

§27.11.2 Lifecycle State Machine (line 24482) shows: `— → draft → pending_eligibility_check → active → exhausted/expired/cancelled/terminated_eligibility_lost`. The state machine is consistent with EITHER reading: a PromotedListing could be a long-lived entity that re-bids weekly (Reading A; status cycles `active → exhausted → active` per weekly cycle) or a per-week ephemeral entity (Reading B; status terminates `expired` after each week).

§27.11.2 line 24471: "Weekly bid submission modal (Sunday 12:00 UTC – Monday 00:00 UTC bid window)." This phrasing is consistent with Reading B (per-week submission) but does not assert that a new PromotedListing row is created.

§27.11.2 line 24472 mentions "Monthly-allotment tracker (1/mo Seller Scale, 3/mo Seller Enterprise included; up to 4 additional purchased top-ups per month)." If allotment is monthly, but the auction is weekly, then a Seller Scale plan can submit at most 1 PromotedListing PER MONTH but the listing would persist across 4 weekly auctions — implying Reading A (long-lived entity).

**Net.** The two readings differ on materially-different auction outcomes. A staff engineer reading §27.11.2 + §34.16.1 cannot determine which reading is correct. This is a P1 acceptance_criteria defect — the auction is not buildable deterministically without further specification.

Filed as **D-V6-002** below.

**Failure mode 2 — Tertiary tiebreak silence.** What if two PromotedListings have identical `(bid_cents, created_at)` at microsecond precision? Convex stores ISO 8601 timestamps with microsecond precision; collisions are improbable but non-zero (e.g., two sellers' draft-creation handlers race on the same scheduler millisecond). The spec is silent on tertiary tiebreak. The auction is non-deterministic in the collision case. P2 acceptance_criteria.

Filed as **D-V6-003** below.

**Failure mode 3 — Bid-window boundary inclusivity.** "Bid window opens every Sunday 12:00 UTC, closes Monday 00:00 UTC" (§34.16.1 line 29914). Inclusive or exclusive of 00:00:00.000Z? A bid submitted at exactly 00:00:00.000Z — accepted or rejected? §27.11.2 line 24471 phrases it as "Sunday 12:00 UTC – Monday 00:00 UTC bid window" (en dash; ambiguous). The §34.16.7 webhook `promoted_listing.auction_settled` fires at "Monday 03:00 UTC settlement job" — implying bids must be in by 00:00 UTC, but the inclusivity is unstated. P3 cosmetic.

Filed as **D-V6-006** below.

**Failure mode 4 — Multiple bids per seller per category per week.** §34.16.1 / §27.11.2 do not explicitly forbid a seller submitting multiple PromotedListings for the same category in the same weekly auction. The §27.11.2 monthly cap (1/mo Seller Scale, 3/mo Seller Enterprise + 4 top-ups) constrains the monthly count but not the weekly. If a seller can submit 5 bids in one Sunday window for the same category, ties become more likely AND the second-price clearing math becomes non-trivial (whose bid is the second-highest — the seller's own second-highest, or another seller's highest?). Per the §34.16.1 #4 / §34.16.8 AC #2 phrasing, ties are broken by `created_at` ASC, but the implicit assumption is one bid per seller per category per week. P2 acceptance_criteria.

Filed as **D-V6-007** below.

### 4.3 Adversarial Check 3 — Verdict

The §34.16.1 + §27.11.2 auction tie-break IS specified in principle (`created_at` ASC), but the spec has four concrete determinism gaps (1 P1, 2 P2, 1 P3) that prevent deterministic buildability against the §34.16.8 AC #2 deploy-time validator (`promoted_listing_second_price_auction`). The validator cannot pass without resolving the `created_at` semantic ambiguity (D-V6-002) at minimum.

**The auction is not deterministic as written. Halt-rule scope is `firewall_leakage` and `vendor_opt_out`, neither of which intersects this finding — no new P0. But the P1 D-V6-002 should be flagged as a v7.1.1 build-gate inheritor.**

---

## 5. Sign-Off Determination

### 5.1 Halt-rule evaluation

| Halt-rule | Evidence | Status |
|---|---|---|
| Zero P0 `firewall_leakage` | D-6.1-001 (P0; Phase 6.1; open) — fanout cardinality side-channel | **FAIL** |
| | D-V6-001 (P0; Phase V6; new) — `broadcast_to_vendor_count` exact cardinality disclosure | **FAIL** |
| Zero P0 `vendor_opt_out` leak | Phase 6.2 confirmed zero P0 vendor_opt_out leak; §27.10.3 + §27.10.4 + §27.10.5 cascade defensible. V6 Adversarial Check 2 surfaced one P2 documentation gap (D-V6-005) but no P0. | **PASS** |

**Phase 6 sign-off: FAILS.**

The audit MUST NOT advance to Phase 7 until D-6.1-001 and D-V6-001 are remediated or formally downgraded with Counsel + Security sign-off. Both findings violate the §25.1.2 Target Account list count NEVER-CARRIED invariant on the seller-bound payload and constitute hard buyer→seller firewall breaches under the §1.3 Dual-Console Isolation Model.

### 5.2 Required remediation before Phase 7 advancement

The two P0 findings share a root cause: the §4.7.1 redaction matrix and the §25.1.2 entity-level matrix both permit cardinality information (binary in D-6.1-001, exact integer in D-V6-001) into the seller-bound payload. Recommended composite remediation:

1. **§4.7.1 line 7793 row-level table for `fanout_group_id`** — always-null on the seller projection regardless of cardinality, OR replace with a per-recipient HMAC pseudonym `bridge_fanout_recipient_token = HMAC(fanout_group_id, seller_org_id, webhook_secret)` so a seller can correlate two events they themselves received within the same group but cannot infer cardinality. (D-6.1-001 remediation already proposed this.)
2. **§4.7.1 line 7840 redaction matrix `amendment_broadcast` row** — remove `broadcast_to_vendor_count` from the CARRIED list. The diff_summary already conveys what changed; the count of recipients is buyer-internal scope information per §25.1.2 line 19702. The diff still applies correctly per-seller without the count.
3. **§25.1.2 Amendment row (line 19698)** — strike `broadcast_to_vendor_count` from the CARRIED list and add it to the NEVER CARRIED list with citation to §25.1.2 line 19702 invariant.
4. **CI gate.** Extend the existing property test `console_bridge_seller_projection_defense_in_depth` (§4.7.1 line 7847) with an explicit "Target Account list cardinality" enumerate-and-assert: for every event kind, generate synthetic payloads with worst-case cardinality fields embedded in `payload_json` and assert no integer-or-binary cardinality signal survives the seller projection. CI gate name: `console_bridge_seller_projection_no_cardinality_leak` (new).
5. **Authored-Extension ledger.** Append AE rows for the two §4.7.1 / §25.1.2 redaction-matrix tightenings; ratification before v7.1.1 stamp.

### 5.3 Caveats

- **§25.7 Internal Comments coverage gap.** Phase 6.1 sampled-only the firewall-NEVER-CARRIED invariant on §25.7; the full §25.7.1–§25.7.14 sub-section walk was deferred to a follow-on prompt that has not run. V6 cannot certify §25.7 audit completeness. Recommend Phase 6.3 (§25.7 Internal Comments full audit) before Phase 7 advancement, OR explicit acceptance that §25.7 is out of Phase 6 scope and inherited by a later phase.
- **D-6.2-001 (P1 §27.8.4 vs §42.3.1 SLA conflict).** Independent of V6 sign-off but flagged as the highest-leverage Phase 6 P1 — engineering, finance, and compliance reviewers will build to incompatible numerical contracts on marketplace abuse SLA.
- **Webhook payload over-exposure pattern.** The combination of D-6.1-001 (Console Bridge fanout cardinality), D-6.2-002 (Ops user identity in taxonomy + abuse webhooks), D-6.2-010 / D-6.2-011 (reporter-audience under non-disclosure), and D-V6-001 (broadcast_to_vendor_count) constitutes a systemic pattern: customer-audience webhook payloads carry buyer-internal cardinality, identity, or process metadata that the §1.3 firewall and §27.8.13 non-disclosure invariants forbid. Recommend a v7.1.1 cross-cutting webhook-audience-redaction sweep across §4.7.1, §25.7.10, §27.6.7, §27.8.9, §27.8.13, §27.9.9, §27.10.7, §31.

---

## 6. Defect Promotions to DEFECT_LEDGER.md

Six net-new defects promoted under the `D-V6-NNN` mnemonic.

### D-V6-001 — `broadcast_to_vendor_count` directly carries Target Account list cardinality to every receiving seller (P0)

- **Class.** `firewall_leakage`.
- **Location.** §4.7.1 redaction matrix line 7840 (`amendment_broadcast` Fields CARRIED row); §25.1.2 Amendment row line 19698 (entity-level matrix).
- **Evidence.** §4.7.1 line 7840: `| amendment_broadcast | amendment_id, diff_summary, affected_requirement_ids, amended_at, broadcast_to_vendor_count | Internal rationale, buyer-internal discussion |`. §25.1.2 line 19698 mirrors. §25.1.2 line 19702 (Target Account row): "A seller CANNOT learn which other sellers are in the buyer's Target Account list, **their order, their status, or their count**." §25.1.2 line 19716 Never-Carry Invariant #3: "No Target Account list membership, order, status, or count for any seller other than the target itself appears in the target's seller-bound payload." `broadcast_to_vendor_count` is the count by direct identity. The §4.7.1 `redaction_verification_hash` validator passes because the field is in the CARRIED whitelist for `amendment_broadcast`.
- **Why P0.** The defect breaks the §1.3 Dual-Console Firewall by carrying buyer-internal Target Account cardinality to every seller. Per the audit prompt CHECK #6 ("file P0 for any identifier or field that could uniquely re-identify a buyer from the seller side") and per the §1.3 firewall invariant, exact cardinality disclosure is uniquely re-identifying for the Target Account list. Severity Definition rule (a) applies.
- **Convention violated.** §25.1.2 Target Account NEVER-CARRIED invariant; §25.1.2 Never-Carry Invariant #3; §1.3 Dual-Console Isolation Model.
- **Recommendation.** Remove `broadcast_to_vendor_count` from the §4.7.1 line 7840 CARRIED list AND the §25.1.2 line 19698 CARRIED list; add to NEVER CARRIED side. Extend property test `console_bridge_seller_projection_defense_in_depth` with a "Target Account cardinality" enumerate-and-assert pass. New CI gate `console_bridge_seller_projection_no_cardinality_leak`. Authored Extension; AE ledger row required before v7.1.1 stamp.
- **Remediation owner hint.** `security`.
- **Links.** D-6.1-001 (related — same root cause; binary cardinality side-channel via `fanout_group_id`); §1.3, §4.7.1, §25.1.2.

### D-V6-002 — `PromotedListing.created_at` tiebreaker semantic is ambiguous (entity-creation vs per-weekly-bid-submission) (P1)

- **Class.** `acceptance_criteria`.
- **Location.** §34.16.1 line 29917 (auction tiebreak rule); §27.11.2 lifecycle state machine line 24482; §27.11.2 line 24471 (weekly bid window); §27.11.2 line 24472 (monthly-allotment tracker).
- **Evidence.** §34.16.1 line 29917: "ties are broken by `PromotedListing.created_at` ASC (earliest bid wins tiebreaker)." §27.11.2 lifecycle accommodates either reading: long-lived entity that re-bids weekly OR per-week ephemeral entity. §27.11.2 monthly-allotment tracker (1/mo Seller Scale; 3/mo Seller Enterprise + 4 top-ups) implies long-lived entity (Reading A); §27.11.2 line 24471 weekly-bid modal phrasing implies per-week submission (Reading B). The two readings yield materially different auction outcomes — a Seller Scale tenant who created a PromotedListing 6 months ago always beats a same-week-creating Seller Enterprise tenant on Reading A; on Reading B, the tiebreak is bid-submission promptness.
- **Why P1.** The §34.16.8 AC #2 deploy-time validator (`promoted_listing_second_price_auction`) cannot deterministically pass without resolving this ambiguity. A junior engineer building the auction will pick a reading; QA writing tests against §34.16.8 AC #2 will pick the same or different reading; production behavior diverges.
- **Convention violated.** Authoring Convention #2 (acceptance criteria observable + measurable + threshold; deterministic).
- **Recommendation.** Author §34.16.1 explicit rule: "`PromotedListing.created_at` for tiebreak purposes is the timestamp of the bid-submission state transition (`pending_eligibility_check → active`), NOT the entity-creation time." Add a derived field `bid_submitted_at` to PromotedListing if `created_at` must remain pinned to entity creation for retention purposes. Update §27.11.2 line 24482 state-machine notes to make this explicit. Extend §34.16.8 AC #2 with the disambiguation. Author Authored Extension if Reading A is preferred (e.g., to reward marketplace tenure).
- **Remediation owner hint.** `engineering`.
- **Links.** §34.16.1, §27.11.2, §34.16.8 AC #2.

### D-V6-003 — Tertiary tiebreak silence when `(bid_cents, created_at)` collide at microsecond precision (P2)

- **Class.** `acceptance_criteria`.
- **Location.** §34.16.1 line 29917; §34.16.8 AC #2.
- **Evidence.** §34.16.1 only specifies primary (bid_cents DESC) and secondary (created_at ASC) tiebreaks. Microsecond-precision Convex timestamps make collision improbable but non-zero (two sellers' draft-creation handlers race on the same scheduler tick). The auction is non-deterministic under collision.
- **Why P2.** A staff engineer can resolve from context (e.g., default to lower `seller_org_id` lexicographic, or `auction_id` UUID lexicographic) but the resolution is not the same across two readers. CI gate `promoted_listing_second_price_auction` cannot reproducibly pass collision tests.
- **Convention violated.** Authoring Convention #2.
- **Recommendation.** Author §34.16.1 explicit tertiary tiebreak: e.g., "`(bid_cents DESC, created_at ASC, seller_org_id ASC)`" — using `seller_org_id` lexicographic as the deterministic tertiary key. Extend §34.16.8 AC #2 with a collision test fixture.
- **Remediation owner hint.** `engineering`.
- **Links.** D-V6-002 (parent ambiguity).

### D-V6-004 — `affected_requirement_ids[]` array length on `amendment_broadcast` leaks buyer-internal scope cardinality (P2)

- **Class.** `firewall_leakage`.
- **Location.** §4.7.1 redaction matrix line 7840; §25.1.2 Amendment row line 19698.
- **Evidence.** `affected_requirement_ids` is an array carried full to the seller. The array length is the count of requirements amended in this broadcast — buyer-internal scope information about evaluation discipline and amendment scope. Analogous to D-6.1-015 (`source_entity_version` count) at the requirement-collection level.
- **Why P2.** Incremental information leakage, not unique re-identification of buyer-internal list cardinality. A staff engineer could reasonably read this as acceptable (the seller needs to know which of THEIR active responses are affected); a hostile reviewer could escalate to P1 if they argue array length leaks buyer-Org behavior patterns. Default P2 with explicit upgrade path.
- **Convention violated.** §25.1.2 NEVER-CARRIED principle (incremental); §1.3 firewall-isolation principle.
- **Recommendation.** Replace `affected_requirement_ids` with a per-recipient projection: only carry the subset of `requirement_ids` that the seller's bid response actually references (i.e., `intersect(amendment.affected_requirement_ids, bid_response.requirement_ids)`). The seller doesn't need to know about amendments to requirements they haven't responded to. Add property test `console_bridge_amendment_broadcast_affected_ids_per_seller_projection`.
- **Remediation owner hint.** `security`.
- **Links.** D-V6-001, D-6.1-015.

### D-V6-005 — §27.10.3 enforcement allowlist does not explicitly enumerate Match Score Programmatic API endpoints (§27.4.12) (P2)

- **Class.** `documentation_gap` (also `surface_engine_mapping`).
- **Location.** §27.10.3 17-surface allowlist table (lines 23983–24003); §27.4.12 Programmatic Access — APIs, Audit Receipts, and Schema.org Surfacing.
- **Evidence.** §27.10.3 Surface 11 covers `/api/public/*` collection endpoints. §27.4.12 authors a programmatic Match Score API that may live at `/api/v1/marketplace/match-scores/...` (per §27.4.12 path conventions and §27.10.6 `/api/v1/` canonical-path note). Whether Surface 11 covers the §27.4.12 API path is interpretation-dependent. §27.10.9 AC #14 / AC #26 surface-allowlist invariant CI test (`vendor_opt_out_surface_allowlist_invariant`) cannot deterministically resolve scope without an explicit allowlist row.
- **Why P2.** The §27.4.4 hard gate already suppresses the score itself (`vendor_opt_out_effective_flag = 1 ⇒ score = NULL`); the practical leak risk is small. But the CI invariant is non-deterministic, and §27.10.9 AC #14 + #26 explicitly bind the invariant to "every render path emitting Seller identity". Without explicit Match Score API enumeration, the gate is under-specified.
- **Convention violated.** Authoring Convention #12 (Surface/Engine Mapping); §27.10.9 AC #14 / #26.
- **Recommendation.** Add an explicit §27.10.3 row: "18. Match Score Programmatic API (`/api/v1/marketplace/match-scores/*`) — §27.4.12 — JSON serialization — On serialization (live registry probe + §27.4.4 hard gate) — Opted-out seller's row omitted; score returned as NULL only if non-opt-out path is the suppression mechanism (defensive layering)." Cross-reference §27.4.12 from §27.10.3 surface row.
- **Remediation owner hint.** `engineering`.
- **Links.** §27.4.12, §27.10.3, §27.10.9 AC #14 / #26.

### D-V6-006 — Bid-window close boundary inclusivity at Monday 00:00:00.000 UTC unstated (P3)

- **Class.** `acceptance_criteria`.
- **Location.** §34.16.1 line 29914; §27.11.2 line 24471.
- **Evidence.** "Bid window opens every Sunday 12:00 UTC, closes Monday 00:00 UTC" — inclusive vs exclusive of 00:00:00.000Z is not stated. A bid submitted at exactly 00:00:00.000Z is accepted under one reading and rejected (`promoted_listing_auction_closed`) under the other.
- **Why P3.** Cosmetic; collision on the boundary is improbable. Auction settlement at 03:00 UTC means there is a 3-hour grace window even if the close is interpreted ambiguously.
- **Convention violated.** Authoring Convention #2 (precision).
- **Recommendation.** Author §34.16.1 + §27.11.2 explicit inclusivity: "Bid window opens at Sunday 12:00:00.000 UTC inclusive and closes at Monday 00:00:00.000 UTC exclusive (i.e., bids accepted up to but not including Monday 00:00:00.000 UTC)."
- **Remediation owner hint.** `engineering`.
- **Links.** D-V6-002.

### D-V6-007 — Multiple bids per seller per category per weekly auction not explicitly forbidden (P2)

- **Class.** `acceptance_criteria`.
- **Location.** §34.16.1 auction mechanic; §27.11.2 monthly allotment tracker.
- **Evidence.** §34.16.1 / §27.11.2 do not explicitly forbid one seller submitting multiple PromotedListing bids for the same category in the same weekly auction. The §27.11.2 monthly cap (1/mo Seller Scale; 3/mo Seller Enterprise + 4 top-ups) constrains monthly count but not weekly. If a seller can submit 5 bids in one Sunday window for the same category, ties become more likely AND the second-price clearing math becomes ambiguous (whose bid is the second-highest — the seller's own next-highest, or another seller's highest?).
- **Why P2.** A staff engineer can derive from §27.11.2 monthly-allotment tracker that a seller submits at most 1 PromotedListing PER MONTH (Seller Scale) — implying at most 1 weekly bid in any given week. But the auction-mechanic spec doesn't explicitly state this; the §34.16.8 AC #2 validator may not assert it.
- **Convention violated.** Authoring Convention #2.
- **Recommendation.** Author §34.16.1 explicit rule: "A seller MAY submit at most one PromotedListing bid per category per weekly auction window. Multiple bids are rejected with `promoted_listing_duplicate_bid_per_window` (Appendix I; HTTP 409)." Update §34.16.8 AC #2 to assert.
- **Remediation owner hint.** `engineering`.
- **Links.** D-V6-002, D-V6-003.

---

## 7. Self-Challenge Pass

Each V6 defect re-read under hostile staff-engineer posture per Audit_Prompts.md SELF-CHALLENGE PASS.

- **D-V6-001 (P0).** Hostile reviewer: "Is `broadcast_to_vendor_count` really uniquely re-identifying? The seller already knows they're one of N." But "N" is the precise integer, not an inferred minimum — and §25.1.2 line 19702 forbids count by direct word. Hostile reviewer second-pass: "Maybe the field is platform-shared infrastructure metadata, not buyer-internal." But the §25.1.2 Amendment row classifies this as buyer-Workspace entity ("Amendment §12.7"), not platform-shared. P0 holds. The severity rule applies on rule (a): "breaks the buyer/seller console firewall." Self-challenge does not downgrade.
- **D-V6-002 (P1).** Hostile reviewer: "A staff engineer would default to bid-submission semantic by reading 'bid' in the auction." But the spec uses `PromotedListing.created_at` not `PromotedListing.bid_submitted_at` — an explicit field reference. Engineers will interpret `created_at` as entity-creation per Master Spec §4 conventions (every entity has `created_at` = entity creation). Reading A is the more literal interpretation; Reading B requires re-interpreting `created_at` as something other than the spec's standard meaning. P1 holds.
- **D-V6-003 (P2).** Hostile reviewer: "Microsecond collision is so improbable the spec doesn't need to specify." But CI test reproducibility under collision is a build-gate concern. P2 holds.
- **D-V6-004 (P2).** Hostile reviewer: "The seller needs to know `affected_requirement_ids` to update their response. The array length is incidental." Yes — the response need is real, but it's satisfied by per-seller projection (intersection with the seller's own requirement set). The full array length is over-disclosure. P2 holds; not P1 because incremental.
- **D-V6-005 (P2).** Hostile reviewer: "§27.4.4 hard gate already suppresses the score; the §27.10.3 row is documentation hygiene." Correct; that's why P2, not P1. The defect is the §27.10.9 AC #14 / #26 CI invariant binding scope.
- **D-V6-006 (P3).** Cosmetic; no severity revision.
- **D-V6-007 (P2).** Hostile reviewer: "The §27.11.2 monthly-allotment tracker implies single bid." Implied, not asserted. A junior engineer could build the auction to accept multiple bids per seller per week. P2 holds.

No severity-classification revisions issued.

---

## 8. Counterfactual Pass

Per Audit_Prompts.md COUNTERFACTUAL PASS protocol, three failure modes per adversarial scenario enumerated.

### Scenario 1 — Bridge Event payload re-identification

- **FM-1.A:** Buyer mutates Requirement; bridge fires; `payload_json` validates. Seller receives stripped projection. ✓ — addressed by §4.7.1 redaction validator + defense-in-depth seller serializer.
- **FM-1.B:** Buyer fires `amendment_broadcast` to N vendors. Each vendor receives `payload_json` carrying `broadcast_to_vendor_count = N`. ❌ — D-V6-001 NEW.
- **FM-1.C:** Buyer's evaluation churns rapidly; many rapid-fire amendments. Each carries `broadcast_to_vendor_count = N`; the count remains stable across the series, leaking the cardinality once at the first message. ❌ — same as FM-1.B; bounded by D-V6-001.

### Scenario 2 — Marketplace search trace for opted-out vendor

- **FM-2.A:** Edge cache lag (POP straggler); render path serves un-redacted past T0 + 60s. ✓ — addressed by §27.10.4 #6 fail-closed live registry probe (S5 stage forces re-fetch on snapshot > 60s old).
- **FM-2.B:** Match Score Programmatic API endpoint not in §27.10.3 allowlist. ⚠ — addressed by §27.4.4 hard gate at the model layer, but §27.10.9 AC #14 CI invariant is non-deterministic. D-V6-005 NEW.
- **FM-2.C:** Buyer-private Intelligence Brief continues to surface opted-out seller name. ✓ — addressed (by-design) per §27.10.5 line 24040 #1.

### Scenario 3 — Promoted Listing auction tie-break

- **FM-3.A:** Two sellers tie on bid amount; `created_at` ASC resolves. ⚠ — D-V6-002 NEW (semantic ambiguity).
- **FM-3.B:** Two sellers collide on `(bid, created_at)` at microsecond precision. ❌ — D-V6-003 NEW.
- **FM-3.C:** Single seller submits 5 bids for same category in same weekly auction. ❌ — D-V6-007 NEW.
- **FM-3.D:** Bid submitted at exactly Monday 00:00:00.000 UTC. ⚠ — D-V6-006 NEW (boundary inclusivity).

---

## 9. Coverage Matrix Updates

V6 amends the Phase 6.1 / 6.2 cell updates with the following cells:

- §4.7.1 Console Bridge Event — `firewall_leakage` ❌ missing (was ⚠ partial; D-V6-001 elevates to ❌). `acceptance_criteria` ⚠ partial (no change).
- §27.4 Match Score — `surface_engine_mapping` ⚠ partial (D-V6-005).
- §27.11 Promoted Listings auction — `acceptance_criteria` ❌ missing (D-V6-002 / D-V6-003 / D-V6-006 / D-V6-007).
- §34.16.1 Promoted Listings auction mechanic — `acceptance_criteria` ❌ missing (same).

---

## 10. Pre-edit Backup

No spec edits performed in this prompt (audit non-destructive by default). Master Spec at v7.1.0 unchanged.

---

## 11. Cross-References

- Phase 6.1 findings: `_audit/PHASE6.1_FINDINGS.md`.
- Phase 6.2 findings: `_audit/PHASE6.2_FINDINGS.md`.
- Defect ledger: `_audit/DEFECT_LEDGER.md` — D-6.1-001..023, D-6.2-001..025, D-V6-001..007 promoted under this prompt's mnemonic.
- Coverage matrix: `_audit/COVERAGE_MATRIX.md` — cells updated per §9 above.
- Forward-references: Phase 7 (Pricing) BLOCKED by D-6.1-001 and D-V6-001 P0 firewall_leakage findings. Phase 7 advancement requires composite remediation per §5.2 above. v7.1.1 stamp gate inherits the Phase 6 P1 cluster (D-6.1-002 .. D-6.1-013, D-6.2-001 .. D-6.2-006, D-6.2-009, D-V6-002).
- Cross-cutting: a v7.1.1 webhook-audience-redaction sweep is recommended across §4.7.1, §25.7.10, §27.6.7, §27.8.9, §27.8.13, §27.9.9, §27.10.7, §31, given the systemic pattern surfaced by D-6.1-001 + D-6.2-002 + D-6.2-010 + D-6.2-011 + D-V6-001.

---

## 12. Sign-Off Summary

| Criterion | Status |
|---|---|
| Phase 6.1 + 6.2 structural coverage of §25 + §27 + §4.7 | PASS (with §25.7 caveat — §1.4) |
| Adversarial Check 1 (Bridge Event payload re-identification) | **FAIL** — new P0 firewall_leakage (D-V6-001) |
| Adversarial Check 2 (marketplace search trace for opted-out vendor) | PASS (one P2 doc gap; no P0) |
| Adversarial Check 3 (Promoted Listing auction tie determinism) | FAIL on determinism (P1); halt-rule scope unaffected |
| Halt-rule: zero P0 `firewall_leakage` | **FAIL** — D-6.1-001 (open) + D-V6-001 (new) |
| Halt-rule: zero P0 `vendor_opt_out` leak | PASS |
| **Phase 6 production-readiness sign-off** | **FAIL** |

Phase 6 does NOT sign off. Two open P0 firewall-leakage findings (D-6.1-001 fanout cardinality side-channel; D-V6-001 broadcast_to_vendor_count exact cardinality disclosure) violate the §1.3 Dual-Console Firewall and the §25.1.2 Target Account NEVER-CARRIED invariant. Per Audit_Prompts.md `Global Verification Protocol` ("If any V prompt finds an unresolved P0 or P1 defect, STOP. Do not advance. Append remediation tasks and resolve before continuing."), the audit halts at Phase 6 V6 until both P0 findings are remediated or formally downgraded with Counsel + Security sign-off.
