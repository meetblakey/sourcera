# Phase SS — UI Surface State Coverage Audit

**Phase mnemonic.** `D-SS-` (Surface States).
**Date.** 2026-05-10.
**Scope.** Every `feature_class = surface` row in `FEATURE_INVENTORY.md` (≈95 rows). For each surface, confirm presence of eight required state definitions:

1. Loading state (with skeleton or spinner spec)
2. Empty state (first-time + returning user variants)
3. Error state (with retry CTA, error code surfacing, support-link affordance)
4. Retry state
5. Partial-completion state
6. Permission-denied state
7. Plan-gated upgrade-CTA state
8. Solo Mode suppression where applicable

**Output protocol.** P1 defect filed for any surface missing **more than two** required states. P2 / P3 findings recorded but not promoted to the ledger unless they meet a separate severity rule (e.g., explicit firewall or plan-gating gap).

**Authoritative inheritance lattice.** Master Spec §3.7 (Loading / Empty / Error State Catalog) defines six page-type taxonomies — `dashboard`, `matrix`, `detail`, `settings`, `ops_console`, `knowledge_base` — and the per-surface catalog rows in §3.7.6.1–§3.7.6.6 establish default treatments for those six classes. The §3.7 contract is *implicitly* available to any surface that maps to one of those classes, but **per-surface inheritance must be explicit** to count toward state coverage. A surface that does not cite §3.7.6.x (or does not name its `page_surface_kind`) is treated as silent on the inherited state, per the Audit-Prompts edge-case-discipline rule "Where the spec is silent on an applicable dimension, FILE A DEFECT. Do not paper over silence by inferring intent."

The §44.6 Solo-Tier Surface Treatment establishes the §44.6.1 Surface Hide List — the canonical Solo-suppression contract. Surfaces that should be Solo-suppressed but are not registered in §44.6.1 are flagged as `solo_suppression_gap`.

**§3.7 ambient inheritance — explicit binding score.** Out of the 95 `feature_class = surface` rows, the count of sections that explicitly bind to a §3.7.6.x catalog by citing `page_surface_kind` or by emitting `ui_page_state_changed` instrumentation per §3.7.1: **6** (the §3.7.6.x catalog rows themselves; §13.11 Defense View states "renders the §3.7 generation-error state"; §50.14 Internal Analytics Dashboards states "follows §3.7.6.5 Ops Console Surfaces" — see §50.14.8 SLOs). Every other surface inherits implicitly at best.

---

## Methodology

For each surface in scope:

1. Read the primary section anchor end-to-end.
2. Walk all eight state dimensions; classify each as `defined`, `partial`, `missing`, or `n/a`.
3. For implicit §3.7.6.x inheritance: classify as `partial` (the global catalog applies in principle but the section does not bind). Two adjacent partials = one missing for severity calculus, because two implementations may diverge.
4. Tally `missing + partial` count per surface; surfaces with `> 2` missing-equivalent states roll up to a P1 defect.
5. Surfaces with explicit binding to §3.7.6.x or with rich per-section state spec (e.g., §13.11 Defense View) are passed.
6. Component-level surfaces in `UX_Design_of_Sourcera.md` (Button, Input, Modal, etc.) are deferred to the existing Phase 3 / Phase 14.10 UX walks; their state catalogs live in UX-Design and are out of scope for the Master Spec coverage matrix.

`n/a` justification rules:

- A persistent-overlay primitive (banner, toast, presence avatar, cursor pointer) MAY have `n/a` for `partial-completion`, `permission-denied`, `plan-gated upgrade-CTA` and `Solo Mode suppression` if the primitive is universally rendered or scope-orthogonal. The justification is required.
- A platform-internal surface (Ops Console pages) has `n/a` for `plan-gated upgrade-CTA` and `Solo Mode suppression` because Ops surfaces are role-gated, not plan-gated.
- A public marketing surface (Seller Org Page, Software Page) has `n/a` for `Solo Mode suppression` (public surface) and for `permission-denied` (anonymous read).

---

## Findings — P1 (surfaces missing > 2 states)

For brevity, each P1 entry below summarizes the gap; full ledger rows appear in `DEFECT_LEDGER.md` under the **Phase SS** section.

### P1-grade surfaces

#### F-393 Seller Inbox (§24.3) — 8 of 8 states missing
The §24.3 prose lists the feed contents (six bullet points) and a sort rule but does not define any of the eight states. No skeleton spec, no empty-state copy, no error contract, no retry behavior, no partial-load handling, no permission-denied treatment (for non-Bid-Workspace-Owner roles), no plan-gated upgrade-CTA (Free vs paid tiers differ on §24 access), no Solo Mode suppression (Solo seller has a single operator and no team — the inbox should compress accordingly). Inheritance from §3.7.6.1 dashboard or §3.7.6.5 ops_console class is implicit at best. Defect: **D-SS-001 (P1)**.

#### F-394 Seller Pulse (§24.4) — 8 of 8 states missing
§24.4 lists six health widgets in prose. No skeleton spec, no empty-state, no error-state, no retry, no partial-load, no permission-denied, no plan-gating row (Pulse is not entirely plan-orthogonal — Solo's Pulse necessarily collapses team-status widgets per §44.6.1). Same drift as F-393. Defect: **D-SS-002 (P1)**.

#### F-395 Seller Analytics (§24.5) — 8 of 8 states missing
§24.5 lists five metric panels in prose. Same drift as F-393 / F-394. The five metrics imply a dashboard surface but the section does not bind to §3.7.6.1, register a `page_surface_kind`, or define error/retry/partial behavior. Solo seller analytics behavior (e.g., suppressing the Team Breakdown panel) is silent — partial overlap with §44.6.1 but no explicit rule. Defect: **D-SS-003 (P1)**.

#### F-308 / F-309 Inbox & Pulse (Buyer; §20.1 / §20.2) — 6 of 8 states missing
§20.1 and §20.2 author Inbox structure (tabs, item kinds) but the only state-adjacent text is the Pulse health-score render. Loading skeleton, error contract, retry, partial-load, permission-denied (Member vs Admin), and Solo suppression for Pulse are all implicit at best. Empty-state catalog (no notifications across all tabs, vs filtered) is unspecified. Defect: **D-SS-004 (P1)**.

#### F-312 In-App Pulse Widget (§20.5) — 7 of 8 states missing
§20.5 names the persistent widget but does not define what the widget renders during loading (skeleton vs spinner), when the widget is empty (Pulse never returns a score), error, retry, partial-completion (some health inputs available, others not), permission-denied (Pulse should hide for non-eligible roles), or Solo Mode (per §44.6.1, Pulse is engine-on / surface-off on Solo — but §20.5 does not bind to §44.6.1). Defect: **D-SS-005 (P1)**.

#### F-302 / F-305 Template Library / Template Library UI (§19.1 / §19.4) — 6 of 8 states missing
§19.1 / §19.4 author the library structure and the browsing surface. Empty-state for "no custom templates yet" is implicit; loading skeleton is silent; error / retry / partial / permission-denied (Template Author vs Reader) / plan-gated upgrade-CTA (Custom Templates are a paid-tier feature per §34.1 / §5.11) are all unspecified at the section level. Defect: **D-SS-006 (P1)**.

#### F-191 Buyer-Side Triage Queue (§8.3.1) — 6 of 8 states missing
§8.3.1 names the queue states (`new / in_review / ready_for_scoring / assigned / resolved / archived`) but does not author the surface state catalog. Loading, empty (queue is clear), error, retry, partial, plan-gating, Solo (the queue degenerates on Solo where the operator IS the assignee) are silent. Defect: **D-SS-007 (P1)**.

#### F-192 Seller-Side Triage Queue (§8.3.2) — 6 of 8 states missing
Mirror of F-191 on the seller side. Defect: **D-SS-008 (P1)**.

#### F-224 Summary Scoring Report (§10.11) — 5 of 8 states missing
§10.11 authors the report content (vendor summary scores, requirement breakdown, consensus metrics) and the export targets (PDF, CSV) but is silent on the report-render surface itself: loading, empty (Phase < 10 — no scoring complete yet; what does the surface show?), error during generation, retry semantics for export failures, and partial-load (some vendors scored, others not). Permission-denied is partially covered via §5 RBAC; plan-gating partial via §10 Phase guard. Solo Mode suppression: not addressed — Solo's Summary Report should still render. Defect: **D-SS-009 (P1)**.

#### F-261 Defense View (§13.11) — 3 of 8 states missing/partial
§13.11.12 covers extensive failure modes including §3.7 generation-error inheritance (#1), 429 throttle (#4), Anthropic outage (#5), and DSAR-redaction abort (#8). §13.11.4 covers plan-gating + upgrade CTA. §13.11.13.5 covers permission-denied via the existing-leak 404. **Missing/partial:** (a) Empty state when `Phase < 12` and Defense View is opened from a deep link — no explicit treatment; (b) Partial-completion (one of the four sections fails to populate while others succeed) — not addressed; (c) Solo Mode behavior — Solo gets the full surface per §13.11.4 but the surface lacks a Solo-specific affordance for the absent leadership-meeting countdown (§13.11.3 Header); the section should explicitly state that Solo renders the same surface modulo the missing countdown. Defect: **D-SS-010 (P1, borderline; promote because §13.11 is v7.1.0 and a junior engineer would build divergent partial-completion handling)**.

#### F-269 Scenario Comparison View (§14.5) — 5 of 8 states missing
§14.5 authors the comparison surface in prose (side-by-side rankings, deltas, impacts) but does not bind to §3.7.6.x. Loading, empty (no scenarios authored yet), error, retry, partial-completion (one scenario computes, the other fails), Solo (Solo workspace has at most one scenario by default — surface compression?) are silent. Defect: **D-SS-011 (P1)**.

#### F-277 TCO Modeling & Editing UI (§15.5) — 5 of 8 states missing
§15.5 authors the TCO inputs and projection outputs but the surface-state catalog is silent. Loading skeleton (TCO has expensive computations), empty (no inputs yet), error (compute failure), retry, partial (TCO has multiple projection facets), Solo Mode (TCO is plan-gated) — all unspecified at the section level. Defect: **D-SS-012 (P1)**.

#### F-376 KB Value Meter — Seller Panel (§22.18.4) — 4 of 8 states missing
§22.18.4 explicitly defines the first-run empty state ("Your KB is empty…") and the plan-gated chip rendering for Free. **Missing:** loading state (nightly recompute lag — what renders during recompute window?), error (compute failure), retry, partial (one of five values fails to compute). Solo Mode: the panel renders identically across Free / Solo / paid tiers per §22.18.4.1 — **acceptable**, but the section should explicitly note Solo non-suppression to prevent §44.6.1 misalignment. Defect: **D-SS-013 (P1)**.

#### F-379 Post-Close Outcome Debrief Overlay (§22.18.6.2) — 5 of 8 states missing
§22.18.6.2 authors the overlay copy and trigger condition (per-bid-close, once-per-user) but does not define the overlay's loading skeleton (the debrief is generated on bid close — there is a generation window), error (the §22.10 agent fails), retry semantics, partial (won/lost label resolved but cited entries fail to render), permission-denied (which seller-console roles see this?), or Solo Mode behavior. Defect: **D-SS-014 (P1)**.

#### F-380 Seller Compressed Surface Mapping (§22.19) — 4 of 8 states missing
§22.19 authors the four-step compression rules and engine binding. **Missing:** loading skeleton for the four-step bar itself (what renders during initial mount?), empty (a Bid Workspace exists with `status=draft` — the Receive step is current and other steps are pending; is the rendering "empty" for the future steps or always rendered with chevron states?), partial-completion (Console Bridge fails to read `pipeline_stage_id` — what does the bar render?), error state (full bar render failure), retry. Permission-denied, plan-gating, Solo are addressed (the surface always compresses on Seller). Defect: **D-SS-015 (P1)**.

#### F-384 Match Score Three-Label Compression (§22.20.4) — 4 of 8 states missing
§22.20.4 authors the surface compression rule (Strong / Likely / Weak labels). **Missing:** loading (Match Score recompute lag), empty (no buyer evaluations to match against), error (snapshot read fails), retry, partial-completion. Solo + Free are explicitly covered. Defect: **D-SS-016 (P1)**.

#### F-386 Magic-Link Hero Moment Surface Polish (§22.20.6) — 4 of 8 states missing
§22.20.6 authors the polish details (bootstrap progress narrative, fourth counter line, citation hover staleness, KB-gap empty state, stake-reveal copy). **Missing:** explicit loading/skeleton spec for the bootstrap-progress storytelling itself (the canonical state during bootstrap), error (bootstrap fails — Firecrawl outage, AI failure), retry, partial (S1 succeeds but S2 fails), permission-denied (n/a — magic link is single-user). Solo Mode is the canonical persona. Defect: **D-SS-017 (P1)**.

#### F-400 Cross-Console Dual-Surface Failure Visibility (§25.2.3) — 4 of 8 states missing
§25.2.3 authors three visibility surfaces (buyer Bridge Health panel, seller Sync Health panel, Ops Cross-Workspace Bridge Dashboard). The three panels are dashboard-class but do not bind to §3.7.6.1 or §3.7.6.5. **Missing:** loading skeleton, empty (Bridge Health is healthy — the panel becomes a green "all good" state, but copy is not specified), error (the health-rollup query fails), retry, partial (one bridge healthy, one degraded — explicit partial behavior?). Solo: the buyer Bridge Health panel should be hidden on Solo unless an active seller bridge exists — not specified. Defect: **D-SS-018 (P1)**.

#### F-419 Seller Organization Page (§26.7) — 4 of 8 states missing
§26.7 authors the public sourcera.com/sellers/:slug page. Public surfaces normally `n/a` permission-denied (anonymous read) and Solo (public surface). **Missing:** loading skeleton, empty (org has no published profile content yet — the page should show an empty hero), error (storefront generation fails), retry, partial (hero loads but capability summary fails). Defect: **D-SS-019 (P1)**.

#### F-423 SellerSoftware & Software Pages (§26.8) — 4 of 8 states missing
Mirror of F-419 for product-detail pages. Defect: **D-SS-020 (P1)**.

#### F-474 Sourcera Support Widget (§29.9) — 4 of 8 states missing
§29.9 authors the Zendesk-backed support entry point on paid tiers and the Free-tier mailto fallback. **Missing:** loading (Zendesk widget initialization), empty (no prior tickets — the in-widget recent-tickets panel), error (Zendesk outage; mailto fallback escalation behavior), retry. Plan-gated upgrade-CTA partial — Free shows mailto, but no explicit "Upgrade for live chat" prompt is specified. Solo: §44.6.1 lists the support widget as engine-on / surface-off only for paid-Maya features. Solo retains support widget access. Defect: **D-SS-021 (P1)**.

#### F-476 Full-Screen Incident Surface (§29.11) — 4 of 8 states missing
§29.11 authors the escalation surface (correlation ID, page-on-call CTA, PostHog emission). **Missing:** loading (the surface is itself an error escalation — but its mount may carry data; is there a render delay?), empty (n/a — never empty), retry (paging the on-call is single-shot — is there a retry on paging failure?), partial (correlation ID retrievable but on-call paging fails), permission-denied (which roles can page on-call?), Solo (n/a — Solo cannot page Sourcera on-call from Free; Solo paid tiers can). Defect: **D-SS-022 (P1)**.

#### F-560 Progress Storytelling Bootstrap UI (§35.2.3) — 4 of 8 states missing
§35.2.3 authors the storytelling status lines and the never-fabricate rule. **Missing:** loading state for the storytelling itself (the surface mounts before the first status arrives — what renders?), empty (n/a — always animates), error (Domain Bootstrap fails / Firecrawl outage / Anthropic outage; the §22.10 agent failure path), retry (re-attempt bootstrap), partial-completion (S1 succeeds, S2 fails — the workspace is technically usable but the storytelling has no closing line). Permission-denied n/a (magic-link single-user), Plan-gating n/a (Hero Moment is Free-tier-equivalent), Solo n/a (Solo IS the persona). Defect: **D-SS-023 (P1)**.

#### F-561 Stake-Reveal Screen (§35.2.6) — 4 of 8 states missing
§35.2.6 authors the post-submit screen copy and the strict AP1/AP2 anti-CTA discipline. **Missing:** loading (computation lag for KB count and value), empty (zero KB entries built — should the screen still render? §35.2 does not address this), error (KB stat compute fails), retry, partial (entry count resolves but value calc fails). Solo IS the persona. Defect: **D-SS-024 (P1)**.

#### F-562 Outcome Debrief Surface (§35.2.7) — 4 of 8 states missing
§35.2.7 authors the win/loss debrief copy. **Missing:** loading (debrief generation window), empty (n/a — triggered surface), error (agent generation fails), retry, partial (won/lost classification resolves but gap analysis fails), permission-denied (which seller roles see this?), Solo (Solo is canonical). Plan-gating is partial via the upgrade CTA in the loss copy. Defect: **D-SS-025 (P1)**.

#### F-618 Solo Single-Card Billing Surface (§44.6.2) — 4 of 8 states missing
§44.6.2 authors the canonical Solo billing card and the Stripe customer-portal link. **Missing:** loading (Stripe customer-portal link generation lag), empty (n/a — Solo has an active subscription or per-eval/per-bid), error (Stripe API failure on portal-link request), retry (on Stripe failure), partial (price renders but renews-on date fails). Permission-denied n/a (single-operator), plan-gating n/a (this IS the Solo billing surface), Solo IS the canonical persona — but the upgrade CTA path to plan-change surface is mentioned, not specified. Defect: **D-SS-026 (P1)**.

#### F-655 / F-656 / F-657 Network Effects / Growth Loop / Anti-Spam Dashboards (§48.3.3) — 4 of 8 states missing each
The three §48.3.3 dashboards inherit the §3.7.6.5 ops_console class implicitly but do not bind. **Missing:** loading skeleton, empty (no signals yet — Anti-Spam in particular is healthy = empty), error, retry, partial. Permission-denied is covered via Ops role gating; plan-gating and Solo are n/a (Ops surfaces). Defect: **D-SS-027 (P1, single defect covering three surfaces with identical drift)**.

#### F-715 / F-716 / F-717 / F-718 / F-719 / F-720 Taxonomy CMS Surfaces (§50.10) — 4 of 8 states missing each
§50.10 authors nine screens with first-load p95 budgets and capability envelopes. The implicit ops_console class catalog applies. **Missing:** loading skeleton (only p95 budget; no skeleton spec), empty (e.g., dimension with zero nodes), error, retry, partial (cascade-impact preview fails while other tabs succeed). Plan-gating and Solo n/a (Ops). Defect: **D-SS-028 (P1, single defect covering six surfaces with identical drift)**.

#### F-725 Pricing Admin Surface (§50.12) — 4 of 8 states missing
§50.12 authors the versioned pricing-table editor, simulation, customer-comms-plan, two-approver publish flow, and rate-card editor. The surface lacks explicit loading, empty (first run — no pricing tables yet), error, retry, partial (rate-card editor saves but simulation fails) treatments. Permission-denied is covered via Ops capability matrix. Defect: **D-SS-029 (P1)**.

#### F-731 Baseline Assumption Manager (§50.13) — 4 of 8 states missing
§50.13 authors the time-saved conversion-factor manager. State coverage gap mirrors F-725. Defect: **D-SS-030 (P1)**.

#### F-734 / F-735 / F-736 / F-737 / F-738 / F-739 Internal Analytics Dashboards (§50.14.3–§50.14.7) — 4 of 8 states missing each
§50.14.3–§50.14.7 author five role-specific dashboards (Growth PM, GTM Lead, Support, Fraud Analyst, Finance) with widgets, breach alerts, and dashboard-level SLOs. §50.14.8 specifies Page first-load p95 (1.5 s), Widget render p95 (2.0 s), but does not author per-surface skeleton, empty-state, error, retry, or partial-completion (one widget fresh, another stale beyond freshness SLO) handling. The implicit §3.7.6.5 ops_console class applies but is not bound. Permission-denied is partially covered via the per-role capability gating. Plan-gating and Solo n/a (Ops). Defect: **D-SS-031 (P1, single defect covering five surfaces with identical drift)**.

#### F-741 Signal Integrity Monitor (§50.15) — 4 of 8 states missing
§50.15 authors the SIMSignal / SIMCase entities, detector catalog, kill-switch mechanics, APIs, and webhook events extensively. The surface itself (review queue, case detail, kill-switch UI) is described but explicit per-state skeleton / empty / error / retry / partial spec is silent. Permission-denied is covered. Defect: **D-SS-032 (P1)**.

#### F-746 / F-747 Fraud Analyst Surface / Review Queue (§50.16) — 4 of 8 states missing each
§50.16 mirrors §50.15 in style — entity-and-API rich, surface-state poor. Defect: **D-SS-033 (P1, single defect covering both surfaces)**.

#### F-750 Paging Runbook Surface (§50.17.5) — 4 of 8 states missing
§50.17.5 authors the runbook surface for §50 PagerDuty alerts (SIM and fraud-analyst paging contracts). Surface-state catalog absent. Defect: **D-SS-034 (P1)**.

#### F-760 Org-Level Usage Dashboard (§51.3) — 4 of 8 states missing
§51.3 authors the dashboard, snapshot model, panel catalog, APIs, and AC list. AC #7 covers the snapshot-not-ready state ("Preparing your report…"), but skeleton spec, error retry, partial-completion (snapshot ready but live-query augmentation fails), and Solo behavior (Solo is single-user — Panel 4 Top Consumers degenerates) are silent. Permission-denied covered via §51.3.1 access table. Plan-gating covered via §51.3.6. Defect: **D-SS-035 (P1)**.

#### F-762 User-Level Usage Dashboard (§51.4) — 4 of 8 states missing
§51.4 mirrors §51.3 with thinner state spec. Defect: **D-SS-036 (P1)**.

#### F-764 / F-765 / F-766 Per-Bid / KB Utilization / Win-Rate Correlation Panels (§51.5.2 / §51.5.3 / §51.5.4) — 4 of 8 states missing each
§51.5 authors the seller dashboard parity panels. Same drift class as F-760 / F-762. Defect: **D-SS-037 (P1, single defect covering three panels)**.

#### F-768 Time-Saved Customer-Visible Panel (§51.6.3) — 4 of 8 states missing
§51.6.3 authors the time-saved panel and methodology disclosure footnote. Same drift. Defect: **D-SS-038 (P1)**.

#### F-AE-005 Notification Surface Subsections (§29.7–§29.11) — 5 of 8 states missing
The Authored Extension covers notification failure audit, preference inheritance, support widget, frequency override, and full-screen incident surface. State coverage of the underlying surfaces is inconsistent (failure audit and preference inheritance are policy artifacts, not page surfaces). The full-screen incident surface (§29.11) is filed separately as F-476 / D-SS-022. Defect: **D-SS-039 (P1)** (covers the §29.7–§29.10 policy + UI rollup specifically; the §29.11 surface is covered by D-SS-022).

#### F-AE-030 / F-AE-031 PipelineSurface / Pipeline Step Tokens (UX §5.2.19) — 4 of 8 states missing
The component composition (PipelineSurface owns bar/ribbon; PhaseAdvancer owns advancement modal) is well-defined, but the four-step bar's surface-state catalog is silent on loading (Console Bridge tick latency on initial mount), error (bridge read fails), retry, partial (some steps known, others pending). Defect: **D-SS-040 (P1, single defect)**.

#### F-AE-065 Solo Notification Suppression Rule (§29.3) — 3 of 8 states missing
The AE specifies UI suppression for the four §44.6.5 envelope events on Solo. State coverage of the underlying notification banners on Solo (e.g., what renders when a suppressed event fires? Should an Ops-visible audit trace surface anywhere?) is silent. Loading / empty / partial states for the affected banners (`bid.status_changed`, `kb.crawl_completed`, etc.) on the Solo surface are not explicitly enumerated. Defect: **D-SS-041 (P1)**.

---

## Findings — Pass

The following surfaces have explicit per-section state coverage that meets the eight-dimension contract or have a justifiable `n/a` for ≥ 6 of the eight states:

- **F-031 Sidebar Navigation Pattern** (§3.2 / §11.2) — overlay primitive; states defined via §3.2 + §3.5 optimistic-mutation + Cmd+Shift+J behavior. Missing: explicit empty (no nav items configured) and partial-completion. Below P1 threshold.
- **F-032 / F-477 Command Palette** (§3.2 / §30.1) — overlay primitive; §30.1 covers MRU, debounce, error states. Missing: partial-completion (some command index loaded, others not) and Solo (the Command Palette is plan-orthogonal but Solo's Cmd+K should suppress team-only commands — implicit). Below P1 threshold.
- **F-048 Connectivity / Offline Banner** (§3.7.10) — itself a state primitive; n/a applies for most dimensions.
- **F-050 Side Peek** (§3.8) — overlay; §3.8 covers prev/next, deep-link, persistence. Loading (skeleton inherits §3.7.6.3 detail-class), empty (nothing to show), error, retry: covered or n/a.
- **F-053 Cursor Presence Visualization** (§3.9) — overlay; §3.9.3 idle-fade and §3.9.4 off-screen indicators define the lifecycle states.
- **F-056 Off-Screen Viewport Indicators** (§3.9.4) — overlay primitive; states defined.
- **F-057 Bulk Action Toolbar** (§3.10) — overlay; §3.10.2 selection persistence + §3.10.5 destructive confirmation + §3.10.6 streaming progress define the lifecycle states.
- **F-067 / F-068 Workspace Header Avatar Stack / Thread Viewer Indicator** (§3.12.2) — overlay primitives; §3.12.2 covers the rendering rules.
- **F-069 / F-070 / F-071 Global Bell Badge / Mention Dot Overlay / Scrollback Unread Divider** (§3.12.3) — overlay primitives; §3.12.3 covers the rendering rules.
- **F-143 Billing Admin Audit View** (§5.2.1.4) — settings-class; §3.7.6.4 settings catalog inherits implicitly but the section explicitly defers RBAC + retention + audit visibility. Below P1 threshold (only loading + Solo are silent).
- **F-240 / F-241 / F-242 / F-243 Buyer Console Navigation Shell, Sidebar, Layout Regions, Persistent UI Elements** (§11) — chrome; §11.4 covers persistent UI elements, the Pulse widget (F-312) is filed separately.
- **F-333 KB Health Dashboard** (§22.5.3) — dashboard-class; §22.5.3 explicitly authors entry-status counts + dismiss histogram + plan-gated visibility. Loading / empty / error inherit §3.7.6.1 implicitly. Below P1 threshold (only retry + partial are silent).
- **F-393 / F-394 / F-395** are filed above (P1).
- **F-467 In-App Toast Notifications** (§29.2) — overlay primitive; §29.2 specifies position, max stack, dismissal.
- **F-495 CRM Sync Review Queue** (§31.9.9) — matrix-class; §31.9.9 explicitly authors the auto-pause behavior at 1000-row saturation. Loading + empty + error inherit §3.7.6.2 implicitly. Below P1 threshold.
- **F-567 / F-568 User Settings / Workspace Settings** (§36.1 / §36.3) — settings-class; §3.7.6.4 settings catalog inheritance implicit; below P1 threshold.
- **F-590 Presence Avatar Stack Component** (§38.12) — overlay primitive.
- **F-608 Admin Dashboard** (§43.1) — Ops dashboard; §43.1 / §43.2 author the entity tables; below P1 threshold (Solo n/a, plan-gating n/a; loading and partial are silent but ops_console class catalog applies).
- **F-696 Sourcera Ops Console** (§50) — chrome; not a single surface.
- **F-710 Customer-Visible Projection (OpsSession)** (§50.4.8) — surface defined in pseudonymization rules; states partial but below P1 threshold.
- **F-712 Ops Cross-Reference View** (§50.6.1) — Ops timeline; partial state coverage.
- **F-865–F-880 UX Design components** — Component-level surfaces in `UX_Design_of_Sourcera.md` are out of Master-Spec scope; defects on those components are filed in Phase 3.x and Phase 14.10 UX walks. NOT promoted here.
- **F-880 Console-Firewall Visual Treatment** (UX §Patterns.ConsoleFirewall) — pattern, not a page surface.

---

## Counterfactual Pass

Three realistic failure modes per audited surface; spot-checks below.

| Surface | Failure mode 1 | Failure mode 2 | Failure mode 3 | Spec addressed? |
|---|---|---|---|---|
| F-393 Seller Inbox | Inbox query times out | Permission revoked mid-session | Bell badge count diverges from inbox panel | None addressed |
| F-394 Seller Pulse | KB-health rollup fails | Submission deadlines time out (wrong TZ) | Single team's status fails | None addressed |
| F-308 Buyer Inbox | Stripe sync delay shows wrong AI-budget | Mention extracts fail to render | Tab counts diverge from per-tab content | None addressed |
| F-261 Defense View | One of the 4 sections fails to render | Cmd+P invokes during regeneration | Operator's tier downgrades mid-render | (1) not addressed; (2)/(3) addressed via §13.11.12 #4/#7 |
| F-560 Progress Storytelling | S1 succeeds, S2 fails | Anthropic streams partial content | Operator navigates away mid-flow | None addressed |
| F-618 Solo Billing Card | Stripe portal link 5xx | Subscription mid-renewal | Currency change at write time | None addressed |
| F-735 Growth PM Dashboard | One widget freshness > SLO, others fresh | Cohort filter returns zero rows | Customer-API endpoint times out | (1) addressed via §50.14.2 invariant #4 partial; (2)/(3) not addressed |
| F-715 Taxonomy CMS Node Editor | Cascade preview times out | Concurrent edit by another Ops user | Translation pipeline fails for one locale | None addressed |
| F-741 SIM Surface | Detector emits unbounded signals | Kill-switch hits race-condition | Case detail page 5xx | (1) covered via §50.15.5; (2)/(3) not addressed |

Each unaddressed counterfactual reinforces the corresponding P1 defect in the ledger.

---

## Self-Challenge Pass

I re-read every P1 defect above as a hostile reviewer. Tightened evidence and revised four severity calls in place:

- **F-261 Defense View — D-SS-010.** Borderline P1; §13.11 has rich state coverage and §3.7 inheritance is explicit (§13.11.12 #1, #5). The defect remains P1 only because partial-completion (one of four sections fails to populate) is a junior-engineer divergence risk. A junior engineer might render three sections + one error chip (option A) or roll the entire surface back to error (option B). The spec must pick one. **P1 retained.**
- **F-376 KB Value Meter — D-SS-013.** §22.18.4.1 explicitly defines the first-run empty state. Initial classification was 5 of 8 missing; on re-read, empty is `defined`. Recount: loading + error + retry + partial = 4 missing. **P1 retained.**
- **F-AE-005 Notification Subsections — D-SS-039.** The AE spans §29.7–§29.11 of which §29.11 (full-screen incident surface) is filed separately as F-476 / D-SS-022. To avoid double-counting, D-SS-039 explicitly calls out §29.7–§29.10 only. **Severity P1 retained, scope tightened.**
- **F-AE-065 Solo Notification Suppression — D-SS-041.** The AE rule (suppress four §44.6.5 envelope events on Solo UI) is itself the contract; the Solo surface state catalog for those banners is silent. Severity P1 if a junior engineer would build divergent suppression treatments. **P1 retained.**

No new P0 surfaced; no defect downgraded below P2 on re-read.

---

## Severity Roll-Up

| Severity | Count | Notes |
|---|---|---|
| **P0** | 0 | None of the surface-state gaps blocks production deployment per §0 severity rules; all fall under "feature unbuildable as written" rather than firewall / regulatory / billing-leakage criteria. |
| **P1** | 41 | One P1 row per identified surface or surface cluster. |
| **P2** | 0 | Per the prompt, P2 surface-state findings (1–2 missing states) are not promoted to the ledger in this sweep; deferred to v7.1.1 hygiene pass. |
| **P3** | 0 | None. |

**Halt-rule evaluation.** The Phase SS sweep does not halt program advancement because (a) no P0 surfaced and (b) the P1 cluster is bound to a single remediation pattern: bind every page-surface section to the §3.7.6.x catalog by `page_surface_kind` and add four explicit states (loading, error, retry, partial) where the implicit catalog inheritance is insufficient; add Solo Mode treatment per §44.6.1 for any buyer/seller console surface that is silent. The remediation is mechanical and ratifiable in a single Phase SSR (Surface-State Remediation) pass.

---

## Recommendations

1. **Bind every page-surface section to a `page_surface_kind`.** Adopt the convention: every surface-class entry in §11–§51 cites its `page_surface_kind` in the section preamble (e.g., "page_surface_kind: dashboard — inherits §3.7.6.1"). This converts implicit catalog inheritance into explicit binding and closes ~30 of the 41 defects via a one-line addition per section.
2. **Author a per-feature Solo Mode disposition note.** Every buyer/seller console surface includes a one-line statement: "Solo behavior: rendered identically | suppressed per §44.6.1 row #N | renders compressed variant per §22.20.x | n/a (Ops or public surface)."
3. **Enrich §3.7 catalog with retry + partial-completion treatments per `page_surface_kind`.** §3.7.6.1–§3.7.6.6 currently cover loading + empty + error well, but retry semantics (auto-retry once vs explicit Retry CTA) and partial-completion (panel-by-panel vs row-by-row vs all-or-nothing) vary by class. Authoring per-class retry + partial defaults closes the remaining 11 defects via the catalog rather than per-section.
4. **Add a CI gate `surface_state_binding_explicit`.** Walk every Master-Spec section whose Appendix M row has a `page_surface_kind`-eligible class; assert presence of the binding clause and a Solo-disposition note; fail build on miss. The gate sits beside §M.4 / §M.5 in Appendix M and runs as part of the existing Appendix M coverage gate.
5. **Defer the seven UX-Design-component-class rows** (Button, Input, Modal, etc., F-865–F-880) to the Phase 14.10 UX-design walk; the component-level state catalog already lives in `UX_Design_of_Sourcera.md` and Master Spec coverage is by reference.

---

## Ledger Promotion

41 P1 defects (D-SS-001 through D-SS-041) are appended to `DEFECT_LEDGER.md` under a new "Phase SS — Surface State Coverage Audit (2026-05-10)" section. Each row carries a one-line summary, the affected `feature_id`(s), the missing state count, the convention violated (Master-Spec authoring convention §3.7 + §44.6.1 + §M.4 binding rule), the recommended remediation (per §Recommendations above), and `phase_owner = Phase SS`.

`COVERAGE_MATRIX.md` cells for `loading_state`, `empty_state`, `error_state`, `retry_idempotency` (proxy for retry-state), and `surface_engine_mapping` (proxy for partial / Solo binding) are tightened on each affected feature row. Aggregate counters update is deferred to the next V-pass per the matrix's incremental-tightening convention.

---

## Cross-References

- `Sourcera_Master_Spec.md` §3.7 (canonical state catalog), §3.7.6.x (per-class catalog), §3.14 (pipeline surface compression), §22.18.4 / §22.18.6 / §22.19 / §22.20 (Seller Maya surface compression), §35.2 (Hero Moment), §44.6 (Solo-Tier Surface Treatment, §44.6.1 surface hide list, §44.6.2 single-card billing), §50.14 (Internal Analytics Dashboards), §51.3 / §51.4 (Usage Dashboards).
- `_audit/FEATURE_INVENTORY.md` (95 `feature_class = surface` rows; D-SS- defect rows reference `feature_id`).
- `_audit/DEFECT_LEDGER.md` (Phase SS section appended).
- `_audit/COVERAGE_MATRIX.md` (cell tightening forwarded; aggregate counters re-derived in next V-pass).
- `Audit_Prompts.md` Defect Ledger Format (rows authored to spec).
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (no new AE rows opened by this sweep; the recommended `surface_state_binding_explicit` CI gate is a §M.5 candidate registered for the v7.1.1 backlog rather than authored here).

---

## Pre-edit Backup

This phase is non-destructive (audit-mode); no Master Spec edits performed. No pre-edit backup required.
