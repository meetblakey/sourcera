# PHASE 48 FINDINGS — §48 Growth Mechanics Walk

**Audit prompt.** Walk §48; for each numbered growth mechanic M1–M17, verify the 7-point checklist (name+description+target loop; trigger; plan-tier; rate limits; anti-spam; instrumentation; north-star KPI). File defects per `Audit_Prompts.md → Defect Ledger Format`; P1 `growth_mechanic_gap` for any silent mechanic.

**Source pass.** Read §48.1–§48.8 end-to-end (lines 33983–38795) plus §51.1.1–§51.1.6 (event-family governance), §51.1.5 cross-reference table, and Appendix G §48.6 / §48.7 additions blocks (lines 44450–44640) for instrumentation cross-validation.

---

## Per-Mechanic Walk

Legend: ✅ explicit; ⚠ partial / implicit; ❌ silent.

| # | Mechanic | §48 Anchor | (1) Name + Desc + **Target Loop (A/A/R/R/R)** | (2) Trigger | (3) Plan-Tier | (4) **Rate Limit** | (5) Anti-Spam | (6) Instrumentation (§51 + App. G) | (7) **North-Star KPI** |
|---|---|---|---|---|---|---|---|---|---|
| M1 | Stakeholder Read-Only Invite | §48.5.1 | ✅ name+desc / ❌ AARRR not stated | ✅ phase ≥ 8 + specific surfaces | ✅ all tiers; per-Workspace ceiling 25 | ✅ 10/user/24h | ✅ 6 controls; cross-link §48.4 | ✅ 11 events cited, App.G registered | ❌ |
| M2 | Public Selection Report | §48.5.2 | ✅ / ❌ | ✅ phase ≥ 12 + approved | ✅ all tiers; 100/Org ceiling | ✅ 5 password attempts/IP/10min | ✅ 10 controls | ✅ App.G registered | ❌ |
| M3 | Evaluation Certificate | §48.5.3 | ✅ / ❌ | ✅ phase=13 + approved | ✅ all tiers (buyer + seller) | ⚠ enumeration cap 100/IP/24h; no issuance cap (UNIQUE workspace) | ✅ 8 controls | ✅ App.G registered | ❌ |
| M4 | Kick Off Next Evaluation | §48.5.4 | ✅ / ❌ | ✅ phase=13 + approved | ✅ all tiers | ❌ **silent** — only "one row per source workspace" UNIQUE | ✅ minimal | ✅ App.G registered | ❌ |
| M5 | Buyer-Pull Vendor Invite | §48.5.5 | ✅ / ❌ (L1-driver named, AARRR not) | ✅ phase ∈ {4,5,6} | ✅ all tiers | ✅ 20/user/30d; 5 distinct Orgs/domain/30d | ✅ 11 controls | ✅ L1 + M5 events; App.G registered | ❌ |
| M6 | Domain Auto-Join | §48.5.6 | ✅ / ❌ | ✅ SSO domain match | ✅ all tiers (buyer + seller) | ❌ **silent on claim-creation cap** — only 90d re-claim cooldown + SIM | ✅ 10 controls | ✅ App.G registered | ❌ |
| M7 | Suggested Team Discovery | §48.5.7 | ✅ / ❌ | ✅ three contexts; k≥5 | ✅ all tiers | ⚠ "20 card-fetches/h" buried in failure-mode #3, not in Anti-Abuse §; explicit dashboard 1/7d in §48.5.7 | ✅ 9 controls | ✅ App.G registered | ❌ |
| M8 | Org Intelligence Value Curve | §48.5.8 | ✅ / ❌ | ✅ phase=13 closure + ≥1 closed eval | ✅ Buyer Growth+ (locked tile below) | ⚠ no customer rate-limit (read-only); 10/h Ops force-recompute | ✅ 7 controls | ✅ App.G registered | ❌ |
| M9 | CategoryPage | §48.6.5 | ✅ / ❌ | ✅ bootstrap / 90d cadence / opt-out resweep | ✅ Sourcera-owned; platform_marketing | ❌ **mechanic-level cap silent** — only reviewer cap 8/24h (Ops-staff, not mechanic) | ✅ 8 controls | ✅ App.G §48.6 registered | ❌ |
| M10 | GuidePage | §48.6.6 | ✅ / ❌ | ✅ bootstrap +2w lag / 180d cadence / force | ✅ platform_marketing | ❌ same as M9 — reviewer 4/24h is staff cap, not mechanic | ✅ 9 controls (incl. cadence thrash detect) | ✅ App.G §48.6 registered | ❌ |
| M11 | ComparisonPage | §48.6.7 | ✅ / ❌ | ✅ bootstrap completion / 45d cadence / top-5 entry / force | ✅ platform_marketing | ❌ same as M9 — reviewer 6/24h is staff cap | ✅ 10 controls (incl. anti-collusion) | ✅ App.G §48.6 registered | ❌ |
| M12 | MarketIntelligenceReport | §48.6.8 | ✅ / ❌ | ✅ quarterly cron + Ops force | ✅ platform_marketing | ❌ same as M9 — reviewer 2/24h per leg is staff cap | ✅ 11 controls (incl. dual-signoff) | ✅ App.G §48.6 registered | ❌ |
| M13 | HeatMap (cells + Aggregation Cards) | §48.6.9 | ✅ / ❌ | ✅ 14d cron (cells auto-publish); cards = manual + cron suggest | ✅ platform_marketing | ❌ cells: no cap; cards: reviewer 12/24h is staff cap, not mechanic | ✅ cells: 4 controls; cards: 8 | ✅ App.G §48.6 registered | ❌ |
| M14 | Bid Success Share | §48.7.1 | ✅ / ❌ | ✅ phase=13 + awarded + plan ∈ {Starter+} | ⚠ **see numeric-singleton defect** | ✅ 10/Org/30d (configurable) | ✅ 6 controls incl. NER opt-out scan | ⚠ dot-notation in §48.7.1, snake_case in App.G; normalized only in App.G | ❌ |
| M15 | Ghost-Bid Importer | §48.7.2 | ✅ / ❌ | ✅ no phase-gating; available from Seller-Org create | ✅ all seller tiers; first import free | ✅ 5/Org/24h | ✅ 6 controls | ⚠ same dot-notation drift as M14 | ❌ |
| M16 | Buyer Referral Credit | §48.7.3 | ✅ / ❌ (this IS a referral mechanic but not tagged AARRR) | ✅ Settings>Referrals click | ✅ Scale ($100) / Enterprise ($200) only | ✅ 5/24h is velocity-spike threshold | ✅ 9 controls; cross-ref §48.4.6 | ⚠ same dot-notation drift | ❌ |
| M17 | Buyer-Funded Pro Trial Seat | §48.7.4 | ✅ / ❌ | ✅ "Invite with Pro Trial" click on vendor flow | ✅ Scale (5/mo), Enterprise (15/mo) | ✅ pool itself is the cap | ✅ 7 controls; cross-ref §34.13.5 | ⚠ same dot-notation drift | ❌ |

---

## Cross-Cutting Findings (promoted to ledger)

### F-1 — Universal silence on AARRR target-loop classification (P1, all 17)

Prompt check (1) requires per-mechanic target-loop classification ∈ {acquisition, activation, retention, referral, revenue}. **None** of M1–M17 carries an AARRR tag. §48 uses its own taxonomy (`platform-amplifier`, `L1-driver`, `supersedes retired-L3`, `platform-amplifier with no direct Loop assignment`) per §48.5 / §48.6 / §48.7 preambles. PostHog analytics dashboards (§48.3.3) and Ops Growth Console (§43.1) reference loops by number (L1–L10), not by funnel-stage class. The audit-prompt-required classification cannot be derived without an authoring pass.

Per the audit prompt: "P1 growth_mechanic_gap for any silent mechanic." Filed as D-48-001 (one row covering all 17 mechanics for ledger compactness).

### F-2 — Universal silence on per-mechanic north-star KPI (P1, all 17)

Prompt check (7) requires every mechanic to name its north-star KPI. §48 has neither a per-mechanic "North-Star KPI" block nor a cross-cutting KPI table. §48.1.6 introduces the Seller Activation Metric + 8 leading indicators (scoped to onboarding generally, not per-mechanic). §48.3.2 lists 9 Network Effect signals (`m14_bid_success_share_rate_per_winning_bid`, `m16_referral_signup_to_activation_time_p50`, `m16_referral_org_retention_rate_90d`) — partial, mechanic-specific, but not exhaustive (M1–M13, M15, M17 not named there). The 13-block per-mechanic layout (Purpose / Trigger / Actor / Workflow / UX / Data / Anti-Abuse / Plan Gating / Telemetry / Notifications / Webhooks / API / Acceptance) has no "Metric" slot.

Filed as D-48-002.

### F-3 — Rate limits silent for platform-orchestrated mechanics (P1)

Prompt check (4) requires explicit rate limits. **M4 / M6 / M9 / M10 / M11 / M12 / M13** are silent at the mechanic level. M9–M13 surface reviewer-side caps (8/4/6/2/12 approvals per Ops-staff user per 24h) which are Ops-staff rate-limits, not mechanic-level caps that prevent generation thrash. M4 has only a UNIQUE-per-source-workspace constraint. M6 has only a 90-day same-Org re-claim cooldown + SIM velocity-anomaly (a detector, not a cap). M7 has a hard 20-fetch/hour API rate-limit but it appears only in failure-mode #3 prose, not in the "Anti-Abuse Controls" section. Filed as D-48-003.

### F-4 — M14 velocity cap conflicts with plan-tier "Unlimited" (P1 numerical_singleton)

§48.7.1 anti-spam control #3 declares: "A seller Org may publish ≤ 10 BidSuccessShares per 30-day rolling window (configurable in Ops Console). Exceeding the limit returns HTTP 429 `m14_bid_success_share_velocity_exceeded`." The §48.7.1 Plan Gating table simultaneously declares Seller Scale and Seller Enterprise = "Unlimited." A Scale seller hitting share #11 in 30 days returns HTTP 429 against the plan-tier promise of unlimited. The anti-spam cap (10/30d) and the plan-tier ceiling (unlimited) are colliding numerical singletons.

Even worse: the §48.7.1 Plan Gating table claims **Starter = "Up to 3/month"** and **Growth = "Up to 10/month"** — these are plan-tier ceilings. But §34.1.2 is the authoritative home for plan tier numerical limits per CLAUDE.md §2 source-of-truth. Inline plan-tier limits in §48.7.1 are also a numerical-singleton drift unless cited to §34.1.2.

Filed as D-48-004.

### F-5 — §48.7 PostHog event-name format violates §51.1.3 (P2 instrumentation_gap)

§51.1.3 declares: "Event names follow the convention `<family_prefix>_<domain>_<verb>` in snake_case." §48.5 (M1–M8) and §48.6 (M9–M13) PostHog-event tables conform: `m1_invite_issued`, `m9_category_page_published`. §48.7 (M14–M17) PostHog-event tables use **dot-separated** form: `m14.bid_success_share.initiated`, `m16.referral.created`, `m17.pro_trial_seat.grant_issued`. The Appendix G normalization disclaimer (line 44492) declares that emitters MUST emit the underscore form and that the §48.7 tables "are to be read as abbreviated notation" — but this resolution lives 6,700+ lines after §48.7 and is not cross-linked from the §48.7 tables themselves. A junior engineer building against §48.7 will emit dot-notation, which fails §51.2 envelope validation.

Filed as D-48-005.

### F-6 — §51.1.5 cross-reference event-family table is stale (P2 consistency_drift)

§51.1.5 (line 42504–42505) carries an Appendix-G cross-reference table whose §48 row reads:

> M9–M17 Growth Mechanics | `m9_template_*`, `m11_seller_profile_*`, `m14_ghost_bid_*`, `m15_*`, `m16_referral_*`, `m17_pro_trial_seat_*`

This is stale on three counts: (a) M9 = CategoryPage (not "template"); M11 = ComparisonPage (not "seller_profile"); M14 = BidSuccessShare (not "ghost_bid" — that is M15). (b) The §48 corpus actually splits into three Appendix-G subsections per §48.5.10 / §48.6.11 / §48.7.5: M1–M8 (55 events), M9–M13 (47 events + 6 cross-mechanic), M14–M17 (42 events). §51.1.5 collapses these into two rows. (c) M10 / M12 / M13 are entirely missing from the §51.1.5 row mapping despite each contributing events to Appendix G.

Filed as D-48-006.

### F-7 — M14 webhook namespace inconsistent with §48.5 pattern (P3 consistency_drift)

§48.5 mechanics emit webhooks under the `growth.<mechanic>.<event>` namespace: `growth.m1.invite.issued`, `growth.m2.link.published`, `growth.m3.certificate.issued`, `growth.m4.workspace_created`, `growth.m5.invite.sent`, `growth.m6.claim.verified`, `growth.m7.invite.sent`, `growth.m8.checkpoint_computed`. §48.6 mechanics use `marketplace_content.m9.category_page.*` etc. §48.7 mechanics drop both prefixes: `bid_success_share.published` (M14), `ghost_bid_import.published` (M15), `referral.credit_issued` (M16), `pro_trial_seat.provisioned` (M17). The Appendix C registration of these as belonging to the `growth_domain` event class is implied but the event-type strings themselves don't carry the `growth.` prefix that §48.5 established as convention.

Filed as D-48-007.

### F-8 — M3 signed payload `buyer_org_display` under `fully_anonymous` is implicit (P2 documentation_gap)

§48.5.3 acceptance criterion #5: "Buyer anonymity choice MUST be enforced at render: if `fully_anonymous`, the verification page MUST NOT contain the buyer Org name OR any direct identifier in HTML, JSON, OR meta tags." The signed `payload_canonical_json` (line 35655) includes the field `"buyer_org_display": "BoardCo Inc." OR "SaaS company, 1001-5000 employees" OR ...`. The schema description implies the rendered value is selected per `buyer_anonymity_kind`, but no AC explicitly asserts that the SIGNED payload (whose hash is rendered as a PDF provenance footer at line 35378, and whose contents are publicly verifiable via the JWKS at `https://verify.sourcera.io/.well-known/sourcera-cert-keys.json`) carries the anonymized descriptor rather than the buyer's full name. A buyer choosing `fully_anonymous` post-issuance whose signed payload froze the full name at issuance would have their identity leak via the signature-verification path even though the rendered verification page redacts it. The signing is described as happening during auto-issuance (step 1) but `buyer_anonymity_kind` is chosen during buyer review (step 2) — temporal ordering implies the signature is computed before the anonymity choice is made.

Filed as D-48-008.

---

## Self-Challenge Pass

Re-read findings as hostile reviewer.

- **F-1 (target loop):** A hostile reviewer would say "the AARRR taxonomy isn't a Master Spec authoring convention — §48 uses L1–L10 instead, and a junior engineer can build against the L-mapping without AARRR." Counter: the audit prompt explicitly requires AARRR classification as check (1); the prompt's rule states P1 for silent mechanics. Authoring convention §4.1 doesn't require AARRR, but the audit prompt does. P1 stands per the prompt's explicit rule, but I note the spec has its own non-AARRR classification — this defect is "absent dimension" not "broken behavior."
- **F-2 (north-star KPI):** Hostile reviewer: "§48.3 Network Effects + §48.1.6 Activation Metric collectively cover the KPI surface; per-mechanic KPI is over-specification." Counter: the audit prompt explicitly requires per-mechanic KPI as check (7); per-mechanic dashboards in §48.3.3 (M-by-M conversion-rate tiles) would be unbuildable without a designated north-star metric per mechanic. P1 stands.
- **F-3 (rate limits):** Hostile reviewer: "platform-orchestrated mechanics (M4, M7, M8, M9–M13) don't need rate-limits because the platform paces them; user-side rate-limits are unnecessary." Counter accepted partially — M8 (read-only) and M4 (one-per-closure-trigger) genuinely don't need user rate-limits. Re-reading §48.5.4: M4 anti-abuse §1 IS a structural rate-limit (one-per-source-workspace). M8 anti-abuse §1 (Time-Saved Credit ledger as source) functions as a rate-limit because checkpoint generation is bounded by closure cadence. **Narrowed scope:** M6 / M7 / M9 / M10 / M11 / M12 / M13 are the genuinely-silent mechanics. M4 and M8 retain ⚠ but de-escalate from defect. Defect text updated below.
- **F-4 (M14 velocity vs unlimited):** Hostile reviewer: "the configurable 10/30d is an Ops-Console kill-switch lever, not a plan promise." Counter: §48.7.1 anti-spam #3 explicitly names HTTP 429 returns at 10/30d. A Scale seller marketing-pushing 12 wins/month gets a 429 against an unlimited plan. P1 numerical singleton stands.
- **F-5 (event-name format):** Hostile reviewer: "Appendix G normalizes — case closed." Counter: §48.7 telemetry tables are the build-against artifact for engineering; Appendix G is the registry. A spec where the build-against artifact contradicts the canonical convention is a documentation defect by §51.1.3 strict reading. P2 stands.
- **F-6, F-7 (cross-ref drift):** P2/P3 stand.
- **F-8 (M3 signed payload):** Hostile reviewer: "AC #5 covers rendering; signing-time payload obviously reflects the resolved anonymity choice." Counter: a junior engineer implementing M3 step 1 auto-issuance at phase=13 BEFORE the buyer chooses anonymity (step 2) could reasonably freeze the full name into the signed payload. The temporal ordering is unclear. P2 documentation_gap stands.

Revisions applied below in the ledger output.

---

## Defects Promoted (8 rows)

See `DEFECT_LEDGER.md` append.

| defect_id | severity | class | scope |
|---|---|---|---|
| D-48-001 | P1 | growth_mechanic_gap | M1–M17 all silent on AARRR target-loop classification |
| D-48-002 | P1 | growth_mechanic_gap | M1–M17 all silent on per-mechanic north-star KPI |
| D-48-003 | P1 | growth_mechanic_gap | M6 / M7 / M9 / M10 / M11 / M12 / M13 silent on mechanic-level rate-limit (M4 / M8 narrowly covered by structural caps) |
| D-48-004 | P1 | numerical_singleton | M14 velocity cap 10/30d conflicts with Scale/Enterprise "Unlimited" + inline plan-tier numerics duplicate §34.1.2 |
| D-48-005 | P2 | instrumentation_gap | §48.7 dot-notation PostHog event names diverge from §51.1.3 snake_case; resolution buried in Appendix G |
| D-48-006 | P2 | consistency_drift | §51.1.5 Appendix-G cross-ref row for §48 mechanics is stale (mechanic→entity mapping wrong; subsection partition wrong) |
| D-48-007 | P3 | consistency_drift | §48.7 webhook event-type strings drop the `growth.` / `marketplace_content.` namespace prefix that §48.5 / §48.6 established |
| D-48-008 | P2 | documentation_gap | M3 signed-payload `buyer_org_display` resolution under `fully_anonymous` ordering is implicit; temporal-ordering of signing vs anonymity choice ambiguous |
