# P2 + P3 Cluster Inventory (open defects only)


## Pre-flight counts
P2 open: 605
P3 open: 189
Phases: 72
Clusters: 355 (P2 phase×class) + 24 (P3 class roll-up)

## P2 — Per-phase clusters

### Phase 8 (38 defects, 15 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH8-HOOK | 8 | D-8.2-018, D-8.2-025, D-8.2-026, + 5 | webhook | §31, §31.1, §31.2, §31.4, §31.6… | Reverse pass: TargetAccount workflow transitions `prospect → qualified`, `qualified → solicited`, `bidding → shortlisted`, `shortlisted → f… | Author optional `target_account.qualified`, `.solicited`, `.bidding_started`, `.shortlisted`, `.finalist_added`, `.finalist_removed`, `.sup… | engineering | M02.3 | M |
| BL-P2-PH8-OBS | 5 | D-8.2-031, D-V8.3-011, D-V8.3-014, + 2 | observability | Appendix C, §31.6, §48.5 | Failure-notification SLA "Failed webhook notifications sent within 1 hour of final failure" is unmeasurable: no instrumentation point named… | Bind the SLA to a concrete metric: `webhook_dlq_notification_dispatch_latency_p95_seconds_threshold = 3600`; emit per-failure observability… | engineering | M21.3 | M |
| BL-P2-PH8-API | 4 | D-8.2-034, D-V8.1-019, D-V8.1-027, + 1 | api | §31, §32.2, §32.6, §32.8 | Several realistic failure modes are silent in §32.8 / §32.9 sub-sections: (a) §32.8.10 manual top-up Stripe-side timeout (vs decline) — ret… | Author "Failure Modes" sub-blocks per endpoint covering at minimum: third-party 5xx, async-job mid-run failure, role/permission concurrent… | engineering | M02.3 | M |
| BL-P2-PH8-DOC | 3 | D-V8.1-007, D-V8.3-012, D-V8.3-015 | documentation_gap | Appendix C, §22.8.3.1, §41.3 | KB MCP token issuance is internal-only (Anthropic vault flow per §22.8.3) but the spec does not declare this — a reverse-pass auditor expec… | Add a single-paragraph §22.8.3.1 amendment: "MCPSessionTokenRecord rows are minted by the Anthropic vault flow per §22.8.3; not exposed via… | engineering | — | S |
| BL-P2-PH8-NUM | 3 | D-8.2-021, D-8.2-035, D-V8.1-032 | numerical_singleton | Appendix F, §31.5, §32.4 | §32.4 inline numerical limits — 5,000/h soft, 10,000/h hard, 100/min burst, 10 concurrent per-user, 60s queue timeout, plus per-IP `public_… | Add a §39 row block "API Rate-Limit Numerical Singletons" with per-class rows (`per_org_authenticated`, `public_pricing_unauth`, `billing_m… | engineering | — | S |
| BL-P2-PH8-AC | 2 | D-8.2-030, D-V8.1-017 | acceptance_criteria | §31.7, §32.7 | §32.7 carries 7 acceptance criteria, several aspirational and non-testable: "All endpoints documented with curl examples in API reference"… | Rewrite §32.7 ACs to be observable and measurable: (a) "Every §32 endpoint has a §32.5 catalog entry AND a per-endpoint detail sub-section… | engineering | — | S |
| BL-P2-PH8-DRIFT | 2 | D-V8.1-018, D-V8.3-027 | consistency_drift | Appendix C, §32.8.18 | §32.8.18 GET /v1/orgs/{org_id}/downgrade-buckets uses `cursor` + `page_size`; canonical singleton per §32.3 is `cursor` + `limit`. Drift cr… | Rename `page_size` → `limit` in §32.8.18 query parameter table. Add deploy-time validator `pagination_param_canonical` to Appendix M.5 asse… | engineering | — | S |
| BL-P2-PH8-CIGATE | 2 | D-8.2-032, D-V8.1-030 | ci_gate | §31.6.1, §32.6.1 | §32.6.1 declares CI gate `api_multistatus_schema_registration` ("(new; Authored Extension — v7.0.0) asserts every endpoint returning 207 ha… | Append `api_multistatus_schema_registration` to Appendix M.5 with implementation-pack assignment. Tighten §32.6.1 declaration to cite the A… | engineering | M02.3 | S |
| BL-P2-PH8-GATE | 2 | D-8.2-022, D-V8.1-031 | plan_gating | §31.5, §32.4 | §32.4 per-plan monthly API-call quota table uses bare names `Free`, `Starter`, `Growth`, `Scale`, `Enterprise`. §34.1 canonicalizes plan ti… | Rewrite §32.4 quota table to enumerate buyer-side rows and seller-side rows separately using canonical Appendix J `buyer_plan_tier` / `sell… | engineering + pricing | M11.3 | S |
| BL-P2-PH8-NOTIF | 2 | D-8.2-024, D-V8.3-010 | notification | §31.6, §41.2 | DLQ admin-notification recipient is ambiguous. §31.6 says "Admin receives email notification"; Org Admin (§5.x), Billing Admin (§5.2), Org… | Specify in §31.6: "DLQ failure notification recipient resolution: per-event-class default — Billing Admin + Org Owner for `billing_domain`;… | engineering + design | — | S |
| BL-P2-PH8-ENUM | 1 | D-V8.1-029 | enum | §32.6.1 | §32.6.1 Multi-Status registers `vendor_disqualification_cascade_action` enum in Appendix J for the disqualification-cascade `cascade_action… | Author Appendix J entry: `### \`vendor_disqualification_reversal_cascade_action\` (§25.3.10a, §32.6.1)\n\n`target_account_status_reversion`… | engineering | M02.3 | S |
| BL-P2-PH8-DATA | 1 | D-8.2-023 | data_model | §31.6 | Dead Letter Queue is referenced as "Settings → Integrations → Failed Webhooks (30-day retention)" but no entity definition exists. No `Webh… | Author `WebhookDeliveryFailureRow` (or `DeadLetterEntry`) entity in §4.x with full field table, scope isolation (Org-scoped), index `(org_i… | engineering | M02.3 | S |
| BL-P2-PH8-SM | 1 | D-8.2-040 | state_machine | §4.8.3 | AIWallet implicitly carries a 6-state state machine (`active`, `soft_capped_80`, `soft_capped_100`, `hard_capped_100`, `suspended`, `closed… | Author Appendix L.8 "AIWallet State Machine" with full transition table covering: (none)→active; active→soft_capped_80; soft_capped_80→soft… | engineering | M02.3 | S |
| BL-P2-PH8-DSAR | 1 | D-V8.3-021 | dsar | §6.8 | Appendix C does not state DSAR cascade behavior for in-app notification rows or pending email-dispatch rows. When a recipient's user record… | Add §6.8 cascade clauses for: (a) InAppNotification rows — redact PII fields within 30 days, retain shape; (b) Loops.so pending dispatches… | security + engineering | M11.3 | S |
| BL-P2-PH8-MOB | 1 | D-V8.3-022 | mobile_divergence | Appendix C | Appendix C row schema covers `In-App | Add `Push` column to all Appendix C row schemas; default value `n/a (mobile push deferred to vNext)`. Add Appendix C preamble note "Push no… | engineering + design | — | S |

### Phase 2 (23 defects, 11 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH2-AC | 6 | D-2-003, D-2-006, D-2-007, + 3 | acceptance_criteria | §2.2.3, §2.3.1, §2.3.2, §2.4.2, §2.6.2… | §2.2 has guidance ("3–8 use cases", "50–200 requirements", "exactly one scorable outcome per requirement") but no numbered, testable accept… | Add §2.2.4 ACs (decomposition rejection on compound requirements, count enforcement, per-Use-Case requirement minimum). | engineering | — | M |
| BL-P2-PH2-EDGE | 5 | D-2-020, D-2-021, D-2-023, + 2 | edge_case_silence | §2.1, §2.6.1, §2.7, §2.8.1 | Cohort auto-assignment heuristic-misfire path is partially specified ("Workspace Owner can re-assign at any time"), but the SLA, audit-even… | Author audit-event action `workspace_membership_cohort_overridden` and Pulse component "Cohort Reassignment Rate" for ops. | engineering | — | M |
| BL-P2-PH2-DRIFT | 3 | D-2-010, D-2-016, D-2-022 | consistency_drift | §2.4.1, §2.7.1, §44.6.1 | §2.4.1 introduces "Phase 1: Initial Screening (Weeks 0–1)" / "Phase 2: Deep Evaluation (Weeks 2–6)" — *shortlisting phases* that collide te… | Rename to "Stage 1: Initial Screening (RFI)" / "Stage 2: Deep Evaluation (RFP)". Cite §10.5 / §10.6 / §10.7. | documentation | — | S |
| BL-P2-PH2-OBS | 2 | D-2-008, D-2-012 | observability | §2.3.2, §2.4.2 | §2.3.2 says "Conduct calibration session" but no engine signal, Pulse trigger, or phase-gate asserts a calibration session ran. | Add Pulse Health Score component "Calibration Session Recorded" before Phase 10 entry. | analytics | M21.3 | S |
| BL-P2-PH2-SM | 1 | D-2-018 | state_machine | §2.6.3 | §2.6.3 escalation has implicit states (Pending Discussion → Pending Functional Lead Tiebreaker → Pending Vendor Clarification → Resolved) b… | Author state machine table in §2.6.3 or Appendix L; bind audit-event action namespace. | engineering | M02.3 | S |
| BL-P2-PH2-HOOK | 1 | D-2-029 | webhook | §2.8 | phase_advanced_with_unmet_gates` and `workspace_evaluation_owner_mode_changed` are described as Audit Events; unspecified whether they are… | Disambiguate audit-only vs webhook-subscribable. If webhook, register HMAC, retry curve, DLQ in §31 / Appendix C / Appendix G. | engineering | M02.3 | S |
| BL-P2-PH2-RET | 1 | D-2-030 | retention | §2.8.3 | Unmet-gate banner ("{N} setup items were skipped") and `phase_advanced_with_unmet_gates.metadata.unmet_gates[]` retention unspecified in §2… | Author retention rule for soft-gate banner (e.g., "persists until each unmet gate addressed OR 90 days post-`solo → team`, whichever earlie… | engineering | M11.3 | S |
| BL-P2-PH2-DSAR | 1 | D-2-031 | dsar | §2.8 | DSAR cascade for `phase_advanced_with_unmet_gates.metadata.unmet_gates[]` (which may carry user_ids) unspecified in §2.8. | Author §2.8.x "DSAR & Privacy" — confirm `metadata.unmet_gates[].user_id` entries subject to §6.8 redaction within 30 days. | security | M11.3 | S |
| BL-P2-PH2-MAP | 1 | D-2-032 | surface_engine_mapping | §2.8.7 | §2.8.7 AC #11 says "Appendix M MUST contain a tightened, surface-bound row for Single-Operator Mode." Appendix M.1 has no row whose Engine… | Add a tightened, surface-bound row "Single-Operator Mode (§2.8)" to Appendix M.1 summarizing the Solo experience and citing all distributed… | documentation | release-orchestration | S |
| BL-P2-PH2-CIGATE | 1 | D-2-039 | ci_gate | §2.8.7 | §2.8.7 AC #5 references CI gate `solo_deadline_countdown_renders_in_user_timezone` "(§M.5 — to be added)". Forward-referenced, runtime-unwi… | Add CI gate row to §M.5, OR formally defer to v7.1.1 backlog with citation per CLAUDE.md §16. | engineering | M02.3 | S |
| BL-P2-PH2-AE | 1 | D-2-043 | authored_extension | — | 22 Solo-Mode Authored Extensions remain `pending` (AE-14.4-01..06, AE-14.6-01..04, AE-14.9-01..12) against v7.1.1 ratification gate. | Schedule ratification of all 22 rows before v7.1.1 stamp; track in Phase 14.4 / 14.6 / 14.9 sections of the AE ledger. | product | release-orchestration | S |

### Phase 4.5 (0 defects, 0 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| PH45 | 0 | D-4.5-001 through D-4.5-034 | all classes | §14 Scenario Modeling | Closed by the 2026-06-23 and 2026-07-09 Scenario passes; no canonical Phase 4.5 row remains open. | Retain the ledger and Phase 4.5 verification records as regression evidence. | engineering + design + analytics | closed | — |

### Phase S17 (18 defects, 8 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHS17-NUM | 4 | D-S17-007, D-S17-011, D-S17-021, + 1 | numerical_singleton | §17.2.2, §17.3.3, §17.4.1, §17.4.2 | Empty State Messaging cites UX literals inline: `Light gray background, padlock icon, message text (14px, light gray)`. Should cite §3.6 (f… | Replace literals with `--text-muted` / `--surface-muted` / `--text-body-sm` token references; cite §3.6 / §3.11. | engineering | — | M |
| BL-P2-PHS17-DOC | 4 | D-S17-023, D-S17-026, D-S17-027, + 1 | documentation_gap | §17, §17.1, §17.4.1, §17.6.1 | §17 silent on console scope. Implicit Buyer-only is enforced via §25.1.2 firewall but §17 itself does not declare. | Add a one-line scope statement in §17.1: "Workspace Analytics is Buyer console only; Seller console parallels in §22.20 / §27.9 (Seller Sig… | engineering | — | M |
| BL-P2-PHS17-AC | 3 | D-S17-008, D-S17-018, D-S17-022 | acceptance_criteria | §17.4.2, §17.8 | §17.8 ACs are observable but lack measurable thresholds and source-of-truth citations. e.g., 17.8.6 "Latency <1 second" duplicates §44 inst… | Rewrite §17.8 mirroring §13.10 fidelity; cite §44 for latency thresholds, §34.1.1 for plan-gating thresholds, §40.2 for retention, §6.8 for… | engineering | — | S |
| BL-P2-PHS17-FW | 2 | D-S17-014, D-S17-030 | firewall_leakage | §17.3.3, §17.3.7 | "Comparison: Show org-wide average for same phase" and "Comparison: Show org-wide average velocity for reference" — cross-Org aggregations… | Add k≥5 floor; partition by `residency_region`; suppress when cohort < k; add opt-in / opt-out posture; bind to §51.7.3 DSAR redaction sent… | security | M11.3 | S |
| BL-P2-PHS17-A11Y | 2 | D-S17-020, D-S17-025 | accessibility | §17.3.4, §17.7.1 | "Visual indicator: Small pulse icon next to metric value when updating" — pulse animation; spec silent on `prefers-reduced-motion` complian… | Bind pulse animation to `prefers-reduced-motion: reduce` → static dot indicator with `aria-live=polite` text update. | design | — | S |
| BL-P2-PHS17-MAP | 1 | D-S17-009a | surface_engine_mapping | Appendix M | Three §17 surfaces have Appendix M rows. Missing rows: §17.4 Filtering & Aggregation, §17.5 Export & Reporting (CSV / PDF), §17.5.1 Schedul… | Author seven additional Appendix M.1 rows under "Intelligence & Analytics (§16, §17)". | engineering | release-orchestration | S |
| BL-P2-PHS17-INST | 1 | D-S17-013 | instrumentation_gap | §17.7.1 | "Real-time via Convex subscriptions" but no §44.1 "Convex Reactive Query Commit-to-Render SLO" citation despite §44.1 explicitly listing "n… | Cite `§44.1 Convex Reactive Query Commit-to-Render SLO (general scope)` from §17.7.1. | engineering | M21.3 | S |
| BL-P2-PHS17-MOB | 1 | D-S17-017 | mobile_divergence | §17 | §38.x parity matrix declares "Workspace Analytics — Dashboard / parity / supported" and "Workspace Analytics — Export / parity / not_suppor… | Add §17.x sub-section "Mobile Divergence" citing §38.x rows; specify export-CTA hidden state with informative tooltip per §3.7 disabled-sta… | design | — | S |

### Phase 4 (18 defects, 11 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH4-NUM | 3 | D-4.12-002, D-4.12-009, D-4.12-031 | numerical_singleton | §21.3, §21.4.2, §21.6 | §21.3 inlines a 5-row hardcoded confidence-threshold table (`KB suggestions 70%`, `Policy deduplication 90%`, `Evidence parsing 60%`, `Pre-… | After D-4.12-001 lands the schema field, retire §21.3's inline 5-row table; replace with a section pointer to the `confidence_threshold_def… | engineering | — | S |
| BL-P2-PH4-DRIFT | 2 | D-4.12-014, D-4.12-039 | consistency_drift | §21.4.4, §21.4.5 | §21.4.4 condition #3 reads "Either the Org's `FreeAllowanceCounter` for the capability has remaining units, OR the wallet has sufficient `b… | Restate §21.4.4 condition #3 as a state machine: "FreeAllowance counter consulted FIRST; if non-zero, atomic decrement and write `billed_ag… | engineering | — | S |
| BL-P2-PH4-SM | 2 | D-4.12-016, D-4.12-024 | state_machine | Appendix L, §21 | §21.4.5 row `seller_page_enrichment` accept signal: "Seller publishes enriched content (Seller Page state transitions to `published`)". The… | Author SellerPage state machine in Appendix L (or cite the originating §4.4.10–§4.4.16 if already authored there). Cross-reference from §21… | engineering | M02.3 | S |
| BL-P2-PH4-AC | 2 | D-4.12-020, D-4.12-021 | acceptance_criteria | §21.4, §21.9 | §21.4 has dense behavior content (registry seed, extended capabilities, platform-owned, free-plan rules, outcome signals) but ZERO numbered… | Author §21.4.6 "Capability Registry Acceptance Criteria" (registry-seed completeness, alias hygiene, extended-capability sign-off gate, fre… | engineering | — | S |
| BL-P2-PH4-OBS | 2 | D-4.12-026, D-4.12-040 | observability | §21.3, §21.6 | §21.3 surfaces "Was this helpful?" thumbs-up/down and "This is wrong" hallucination report link to support form. Neither has: (a) a §29 not… | Author `agent_feedback_recorded` PostHog event in Appendix G with property schema (`org_id`, `capability_id`, `ai_operation_id`, `feedback_… | engineering, analytics | M21.3 | S |
| BL-P2-PH4-RET | 2 | D-4.12-028, D-4.12-037 | retention | §21 | §21 introduces or implies several data classes without retention: (a) per-Org confidence-threshold customizations (§21.3 "Settings → Agent"… | Org-life + 7 years (after D-4.12-018 lands the entity)`. | engineering, security | M11.3 | S |
| BL-P2-PH4-GATE | 1 | D-4.12-027 | plan_gating | §21.8 | §21.8 introduces a Team-level configuration surface (Custom Agent Instructions) but declares no plan gate. Per the §5.11 Feature Access Mat… | Add a §5.11 row "Custom Agent Instructions (§21.8)" with plan-tier mapping (recommended: `buyer_growth+`, `seller_growth+`, both consoles d… | engineering, pricing | M11.3 | S |
| BL-P2-PH4-RES | 1 | D-4.12-030 | residency | §21 | §21 nowhere addresses data-residency routing for AI invocations. An EU-residency Org calling a `customer_billed` capability — does the LLM… | Add a §21.10 "Data Residency for AI Invocation" sub-section: state that Sourcera invokes Anthropic via `claude-{model}` API endpoints deter… | engineering, security | M11.3 | S |
| BL-P2-PH4-MAP | 1 | D-4.12-033 | surface_engine_mapping | §21 | §21 surfaces invoked from in-app: (a) `[AI-Generated]` label rendering; (b) confidence-score inline display; (c) "Was this helpful?" thumbs… | Add Appendix M.1 rows for the 9 listed §21 surfaces, with engine binding (`AIOperation` for label/confidence/feedback; `OrgAgentCapabilityC… | engineering, design | release-orchestration | S |
| BL-P2-PH4-FW | 1 | D-4.12-034 | firewall_leakage | §21.4.1 | (a) §21.4.1 row 19 (`pulse_digest_weekly`) and row 21 (`comment_thread_summary`) declare console = "buyer, seller" — but §21.2 firewall rul… | Add a §21.4.1.B "Cross-Console Capability Invocation Rule": for capabilities with `console_applicability=[buyer, seller]`, AIOperation rows… | engineering, security | M11.3 | S |
| BL-P2-PH4-MOB | 1 | D-4.12-036 | mobile_divergence | §21 | §21 has zero mobile-parity declarations. Per §38 Mobile Parity, every UI surface needs a parity status (`parity` / `simplified` / `not_supp… | Add a §21.12 "Mobile Surface" sub-section citing §38 and §38.8.2 mobile parity matrix entries; author rows for each §21 surface in §38.8.2. | design, engineering | — | S |

### Phase 24 (17 defects, 12 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH24-GATE | 4 | D-24-009, D-24-013, D-24-021, + 1 | plan_gating | §24.2, §24.3, §24.4, §24.5 | §24.3 makes no plan-tier reference. Whether `seller_free` users get the Inbox at all, whether `seller_solo` collapses the Inbox into the §4… | Add §24.3 plan-gating block citing §5.11 rows: Inbox available all tiers; webhook delivery `seller_growth+`; Slack delivery `seller_starter… | pricing | M11.3 | M |
| BL-P2-PH24-DRIFT | 2 | D-24-003, D-24-007 | consistency_drift | §24.1, §24.3 | §24.1 says "Q&A threads are read-only once Phase 8 begins (Q&A Closed)." §18.2.1 says Phase 8 has "no new threads; read existing" for vendo… | Replace §24.1 "Q&A threads are read-only once Phase 8 begins" with "Q&A behavior on the seller side mirrors §18.2.1 — Phase 8 prohibits new… | engineering | — | S |
| BL-P2-PH24-AC | 2 | D-24-004, D-24-026 | acceptance_criteria | §24.1, §24.6 | §24.1 ("Vendor cannot post questions to themselves") omits the §18.2.3 50-question/vendor/workspace cap and its workflow (additional-slot r… | Replace §24.1's vendor-cannot-self-post sentence with a §18.2.3 reference: "Seller-side enforcement of the §18.2.3 50-question per Workspac… | engineering | — | S |
| BL-P2-PH24-NOTIF | 1 | D-24-020 | notification | §24.2 | NDA notification coverage is sparse. §29.1 has only `nda_signature_requested` (line 25019). Missing: `nda_executed_by_seller`, `nda_changes… | Add §29.1 / Appendix C / Appendix G rows for `nda_executed` (buyer-side: `Vendor signed your NDA`), `nda_changes_requested`, `nda_version_s… | engineering | — | S |
| BL-P2-PH24-MOB | 1 | D-24-024 | mobile_divergence | §38 | §38 Mobile Parity Matrix has rows for NDA Execution, Seller Inbox, Seller Pulse but no row for §24.5 Seller Analytics. The matrix is incomp… | Add §38 row "Seller Analytics" (§24.5) with `mobile_xs / mobile_sm / tablet` parity statuses (`parity / parity / supported` with chart refl… | design | — | S |
| BL-P2-PH24-OBS | 1 | D-24-025 | observability | §24.5 | §24.5 metrics ("Average response time (median hours)", "Amendment re-verification time (median hours)") reference no data source (which aud… | Author §24.5.x observability block: data sources (Bid Response `submitted_at`, requirement `created_at`, amendment `applied_at`, Reverifica… | engineering | M21.3 | S |
| BL-P2-PH24-RET | 1 | D-24-027 | retention | §24.3 | §24 silent on retention for Seller Inbox items, Seller Pulse snapshots, Seller Analytics aggregates. NDA Record §4.5.3 silent on retention… | Add §40.2 rows: `nda_record_class` (`workspace_lifetime + 7 years` per audit-integrity parity with `bridge_event_financial_class`), `seller… | engineering | M11.3 | S |
| BL-P2-PH24-RES | 1 | D-24-029 | residency | §24 | §24 silent on data residency for Inbox / Pulse / Analytics. NDA Record §4.5.3 silent on residency; cross-org evaluations spanning US / EU b… | Add §4.5.3 `data_residency_region` field (Appendix J `data_residency_region`); declare placement contract: when buyer Org and seller Org re… | security | M11.3 | S |
| BL-P2-PH24-FW | 1 | D-24-030 | firewall_leakage | §24 | §24 doesn't articulate console firewall behavior. Q&A posts cross via §25.1.2 `qa_thread_post_appended`. NDA via `nda_executed`. But §24's… | Add §24.x firewall articulation block citing §25.1.2 NDA Record row, citing §25.1.2 Q&A Thread row, classifying Seller Inbox items as selle… | security | M11.3 | S |
| BL-P2-PH24-A11Y | 1 | D-24-031 | accessibility | §24 | §24 contains no `aria` / `keyboard` / `focus` / `reduced-motion` clause across any of its 5 surfaces. §37 not cross-referenced. | Add §24.x a11y blocks: NDA review modal focus-trapped, "Accept" button is `aria-pressed`; Inbox feed `role="region" aria-label="Seller Inbo… | design | — | S |
| BL-P2-PH24-ERRS | 1 | D-24-032 | error_state | §24 | §24 silent on empty / loading / error / retry states. First-time Bid Owner with empty Inbox; Phase-5 Pulse with no responses; Phase-13 Anal… | Author per-surface state enumerations: Inbox empty (first-time Bid Owner, no items); Inbox loading (initial fetch); Inbox error (API 5xx, w… | design | — | S |
| BL-P2-PH24-MAP | 1 | D-24-035 | surface_engine_mapping | Appendix M | Appendix M.1 has 3 rows for §24 (Seller Q&A, NDA Module, Seller Inbox/Pulse/Analytics collapsed). The collapsed row provides no per-surface… | Split line 48075 into 3 rows (Seller Inbox / Seller Pulse / Seller Analytics) with engine columns and Solo-Mode `Hidden from tier(s)` annot… | engineering | release-orchestration | S |

### Phase 5.1 (16 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH51-AC | 8 | D-5.1-025, D-5.1-026, D-5.1-028, + 5 | acceptance_criteria | §9.1.3.3, §9.2.4.1, §9.3.3.1, §9.3.3.2, §9.3.3.4… | §9.1.3.3 says "ties broken per §8.3.3.6"; §9.2.4.1 declares the four-rung tiebreaker enum (`kb_category` exact match → historical_acceptanc… | Update §8.3.3.6 to add the four-rung lexicographic team_id final tiebreaker matching §9.2.4.1. Cite §9.2.4.1 from §8.3.3.6 by anchor. Recon… | engineering | — | M |
| BL-P2-PH51-DATA | 3 | D-5.1-027, D-5.1-030, D-5.1-033 | data_model | §9.2.4.4, §9.3.2, §9.4.3.1 | §9.3.2 field table has no `visibility` field; §4.4.4 has no `visibility` field either. The behavior described in prose has no schema afford… | Add `visibility` enum field to §4.4.4 with values `team_private`, `org_shared` and default `org_shared`. Register in Appendix J as `capabil… | engineering | M02.3 | S |
| BL-P2-PH51-OBS | 2 | D-5.1-038, D-5.1-039 | observability | §9.3.3.2, §9.4.3.3 | Not registered in Appendix M.5 (37-gate catalog) nor §M.4 CI gate spec. Per Phase 14.18 enforcement (CLAUDE.md §16), CI gates must be enrol… | Register `ai_response_generation_billing_consistency` in Appendix M.5 with: scope (every successful AI generation has a corresponding billa… | engineering | M21.3 | S |
| BL-P2-PH51-RET | 1 | D-5.1-029 | retention | §9.3.3.2 | §4.4.4 line 4730 declares "soft-deleted rows retained 180 days for Ops audit then hard-purged unless linked to an unsettled OutcomeContract… | Reconcile to §4.4.4's 180-day retention as canonical (the 180 days is tied to OutcomeContract settlement which §4.4.4 governs). Update §9.3… | engineering + legal | M11.3 | S |
| BL-P2-PH51-A11Y | 1 | D-5.1-035 | accessibility | §9.4.1 | No reference to UX_Design_of_Sourcera.md tokens or §3.7 state catalog. No keyboard navigation, focus order, ARIA attributes, or screen-read… | Author §9.4.x sub-block "Accessibility & State Catalog": declare WCAG 2.1 AA conformance per §37; specify ARIA live-region for AI generatio… | design | — | S |
| BL-P2-PH51-MOB | 1 | D-5.1-036 | mobile_divergence | §9 | §9 makes no mobile-divergence statements for Triage Queue, Vendor Response Drafting, AI Approval modal, or Capability Declaration drag/drop… | Author §38.x parity rows for §9 surfaces: Triage Queue (recommend desktop=parity, tablet=simplified, phone=hidden); Vendor Response Draftin… | design + engineering | — | S |

### Phase 4 (Prompt 4.11) (14 defects, 12 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH4P411)-AC | 2 | D-4.11-017, D-4.11-019 | acceptance_criteria | §20.2.5, §20.7 | §20.7.1–§20.7.5 acceptance criteria are checkbox-prose ("- [ ] Unified feed displays all notification types..."; "- [ ] Daily calculation a… | Rewrite §20.7 as numbered AC blocks. Each AC declares trigger, expected behavior, observable assertion (event, DOM state, API response shap… | engineering, design | — | S |
| BL-P2-PH4P411)-DATA | 2 | D-4.11-020, D-4.11-026 | data_model | §20.3.1, §20.4.1 | §20.4.1 says "configurable to Wednesday or Friday"; §20.6.1 says "select day (Monday/Wednesday/Friday)". Why only 3 of 7 days? §29.3 (Quiet… | Either (a) author the 7-day enum `pulse_digest_day` (`monday`, `tuesday`, ..., `sunday`) in Appendix J, with default `monday`; expand §20.4… | product, engineering | M02.3 | S |
| BL-P2-PH4P411)-NUM | 1 | D-4.11-018 | numerical_singleton | §20.2 | Inline numerical literals without §39 / §44 / Appendix J authoritative homes: title ≤100 chars / description ≤200 chars (§20.2.2); 20-per-l… | Add §39 rows: `inbox_item.title` (max 100 chars), `inbox_item.description` (max 200 chars), `inbox.lazy_load_page_size` (20), `inbox.archiv… | engineering | — | S |
| BL-P2-PH4P411)-RES | 1 | D-4.11-021 | residency | §20.3.4 | §20.3.4 says "Health Score calculated daily at 9am UTC" — fixed UTC computation regardless of customer residency. §20.4.1 says "Every Monda… | Add a §20.0.1 "Timing & Residency" sub-section: (a) Pulse compute runs in the residency-local Convex region per §40.4 at 09:00 UTC for `dat… | engineering, security | M11.3 | S |
| BL-P2-PH4P411)-RBAC | 1 | D-4.11-022 | rbac | §20.4.1 | §20.4.1 recipient list is "Workspace Owner, plus any team members opted in (Notification Settings)". Org Owner, Org Admin, Executive Sponso… | Author the §20.4.1 recipient set explicitly: default audience = Workspace Owner, Workspace Members with `workspace_admin` role, Executive S… | engineering, design | M11.3 | S |
| BL-P2-PH4P411)-RET | 1 | D-4.11-023 | retention | §20.5.3 | §20.5.3 says "List of past 12 weekly digests" with CSV export — but §40.2 has no `WorkspacePulseHealth` / `PulseDigest` retention row, no D… | Add §40.2 rows: `WorkspacePulseHealth` (12-week sliding window for live trend + indefinite cold-archive for audit, per Workspace lifecycle)… | engineering, security, legal | M11.3 | S |
| BL-P2-PH4P411)-DRIFT | 1 | D-4.11-024 | consistency_drift | §20.6.1 | §20.6.1 inlines Quiet Hours and DND controls ("Quiet hours: Set time range (e.g., 6pm–9am) when notifications not sent"; "Do Not Disturb: G… | Resolve in §29.3 (the canonical Notification Preferences home). Replace §20.6.1 inline controls with citation: "Quiet hours, DND, per-event… | engineering, design | — | S |
| BL-P2-PH4P411)-FW | 1 | D-4.11-025 | firewall_leakage | §20.4.3 | §20.4.3 AI summary "Tone: Professional, actionable, specific (mentions vendors/use cases by name)". When §24.4 (Seller Pulse) mirrors this… | Author a §20.4.3.1 "Firewall-Aware Summary Construction" sub-section: (a) the Sonnet prompt template MUST exclude any seller_org_id outside… | engineering, security | M11.3 | S |
| BL-P2-PH4P411)-DOC | 1 | D-4.11-027 | documentation_gap | §20 | §51.3 (Org-Level AI Usage Dashboard, line 40638) and §51.4 (Per-User AI Usage Dashboard, line 40808) explicitly disambiguate themselves fro… | Add a §20.1.2 "Related Surfaces" sub-section: "§20 surfaces procurement activity (notifications, workspace health, action items). For AI-sp… | engineering, design | — | S |
| BL-P2-PH4P411)-MAP | 1 | D-4.11-028 | surface_engine_mapping | §20 | Appendix M.1 (lines 47855–47861) authors 6 §20 rows (Pulse Inbox + Inbox Item Group, Pulse Health Score, Pulse Digest Email, In-App Pulse W… | Add an Authored-Extension citation block at the top of §20 (post-§20.1) listing the 6 Appendix M.1 row anchors and the §M.5 CI gates that g… | engineering, design | release-orchestration | S |
| BL-P2-PH4P411)-API | 1 | D-4.11-029 | api | §20.2.3 | §20.2.3 "Mark all as read" / "Mark as read" / "Dismiss" actions — concurrent-write semantics, idempotency keys, partial-failure rollback, a… | Specify in the §20 endpoint set authored by D-4.11-011: `POST /v1/orgs/{org_id}/inbox/{item_id}/read` is idempotent; second identical write… | engineering | M02.3 | S |
| BL-P2-PH4P411)-OBS | 1 | D-4.11-030 | observability | §20 | §20 features depend on Convex (Pulse compute, Inbox writes), Loops.so (Pulse Digest dispatch), Anthropic (Sonnet AI summary). §49 outage ru… | Add §49.x rows for `pulse_compute_anthropic_outage` (skip AI summary; dispatch digest without summary; surface "AI summary unavailable toda… | engineering, ops | M21.3 | S |

### Phase 38 (14 defects, 11 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH38-MOB | 3 | D-38-007, D-38-018, D-38-025 | mobile_divergence | §38.1, §38.2, §38.6 | Tablet-floor disagreement across three sections. §38.1 says tablet = 640–1024 px (puts 640–768 in tablet). §38.6.1 says tablet = 768–1024 (… | Replace the §38.1 narrative table with a one-paragraph pointer to §38.6.1 ("Coarse three-tier story: phones / tablets / desktops; the engin… | engineering | — | S |
| BL-P2-PH38-DRIFT | 2 | D-38-017, D-38-027 | consistency_drift | §38.4, §38.7.6 | Two authoring contracts on reduced-motion. §38.7.6 AC #11 + §38.7.3 author per-section reduced-motion behavior ("transitions render instant… | Reconcile by making §38.10 the authoritative home for the universal contract and rewriting §38.7.3 / §38.7.6 to cite §38.10 + §3.9 motion c… | engineering | — | S |
| BL-P2-PH38-AC | 1 | D-38-010 | acceptance_criteria | §38.8.2 | §38.8.2 matrix incomplete against v7.1.0. Missing rows for: Defense View (§13.11), Buyer Maya intake / "What Are You Evaluating?" (§13.12 E… | Append ~15 rows to §38.8.2 covering each missing v7.1.0 feature; declare per-row mobile parity status; populate Notes column for every `sim… | engineering + design | — | S |
| BL-P2-PH38-DATA | 1 | D-38-011 | data_model | §38.6.3 | UserUIPreference field table omits `created_by` and `updated_by` per Master Spec authoring Convention #1 (every entity declares created_by/… | Add `created_by` (UUID FK → User, nullable for system-emitted writes) and `updated_by` (UUID FK → User, nullable) rows to the §38.6.3 table… | engineering | M02.3 | S |
| BL-P2-PH38-RET | 1 | D-38-012 | retention | §38.6.3 | UserUIPreference is not registered in §40.2 Retention Per Data Class. §38.6.3 line 31526 says "Follows User lifecycle (§40.2 User row); no… | Add a §40.2 row for UserUIPreference: retention = User lifecycle (cascade with parent); residency = User residency; DSAR class per D-38-013… | engineering | M11.3 | S |
| BL-P2-PH38-DSAR | 1 | D-38-013 | dsar | §38.6.3 | UserUIPreference is not registered at §6.8.4.3 DSAR Cascade Class Coverage Registry. §38.6.3 says "DSAR exported under the User's identity… | Add a §6.8.4.3 row for UserUIPreference with Pattern A (hard delete on User right-to-erasure — UI preferences are not aggregate-load-bearin… | engineering | M11.3 | S |
| BL-P2-PH38-SM | 1 | D-38-014 | state_machine | §38.6.4 | Two state machines author state transitions in prose form only: (a) `responsive_breakpoint_tier` transitions (§38.6.4 — eight conditions in… | Author Appendix L row `responsive_breakpoint_tier_transitions` with the eight §38.6.4 conditions reformatted as state-machine rows. Author… | engineering | M02.3 | S |
| BL-P2-PH38-GATE | 1 | D-38-015 | plan_gating | §38.6.2 | §38 introduces tier-bound visibility rules (Ops Console mobile redirects per §38.6.2 / §38.8.2 / §38.8.5; mobile bottom-sheet palette repla… | Append rows to §5.11 Feature Access Matrix for the responsive surfaces: "Ops Console write access (mobile)" — `not_available`; "Mobile Sear… | engineering | M11.3 | S |
| BL-P2-PH38-OBS | 1 | D-38-016 | observability | §38.6 | ui_responsive_breakpoint_crossed` declared to fire on every tier transition (debounced 150ms) but no `sampling_rate` declared. With slow wi… | Declare `sampling_rate=0.1` for `ui_responsive_breakpoint_crossed` (high-volume client-emitted event) and `sampling_rate=1.0` for the merge… | engineering + analytics | M21.3 | S |
| BL-P2-PH38-RETRY | 1 | D-38-019 | retry_idempotency | §38.6.6 | UserUIPreference offline-queued tier updates have no idempotency contract. AC #5 says "Updated within 500ms of a tier transition (network p… | Author §38.6.6 AC #5 amendment: "Offline-queued tier-update writes MUST carry a `client_observed_at` timestamp; on flush, the server applie… | engineering | — | S |
| BL-P2-PH38-DOWN | 1 | D-38-021 | downgrade_path | §38.6.3 | §38 silent on UserUIPreference behavior when a User is removed from one console (e.g., loses seller-side access via Org membership change o… | Author §38.6.3.x "Lifecycle on Console Removal" sub-block: on User removal from a console, cleared fields = the contralateral `last_observe… | engineering | — | S |

### Phase 4.4 (0 defects, 0 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH44-AC | 0 | D-4.4-018, D-4.4-020, D-4.4-023, D-4.4-030, D-4.4-031, D-4.4-032 | acceptance_criteria | §13.4, §13.6, §13.10 | Closed 2026-07-12: current source covers Lead finality, EX approvals, N-reviewer rendering, and collaboration degradation. | AE-V711-PH44-SCORING-RESILIENCE-01 remains pending human sign-off and runtime evidence. | engineering | M02.3 | M |
| BL-P2-PH44-DOC | 0 | D-4.4-025 | documentation_gap | §13.11.5, §13.11.7 | Closed 2026-07-12: percent-to-fraction conversion is explicit and fraction storage is enforced. | No residual. | engineering | — | S |
| BL-P2-PH44-NUM | 0 | D-4.4-019, D-4.4-021 | numerical_singleton | §13.5.2, §13.12.4 | Closed 2026-07-12: UX/§39/§4.5.9 own the remaining values. | No residual. | engineering + design | — | S |
| BL-P2-PH44-MOB | 0 | D-4.4-024 | mobile_divergence | §13.6.4 / §38.8.2 | Closed 2026-07-12: desktop parity, tablet read/comment, phone independent-only, disclosure, refetch, and no-bypass rules are source-defined. | Runtime device and accessibility evidence remains pending AE-V711-PH44-SCORING-RESILIENCE-01. | engineering + design | M21.3 | S |

### Phase 4.6 (13 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH46-AC | 8 | D-4.6-015, D-4.6-016, D-4.6-018, + 5 | acceptance_criteria | §15.2.2, §15.2.3, §15.3.3, §15.3.4, §15.4.2… | Vendor missing required pricing-response handling unspecified. §15.2.2 schema includes `response_required: boolean` but §15.3.3 algebra (`y… | Author §15.X sub-rule: when a vendor has not submitted a `response_required=true` pricing response, the vendor is excluded from TCO ranking… | engineering | — | M |
| BL-P2-PH46-NUM | 1 | D-4.6-017 | numerical_singleton | §15.5.2 | "Recalculation: Automatic, <2s latency" inline — no §44.1 row. §44.1 is the canonical performance-targets home (cf. line 31745 EvalStarter… | p95 < 2s per §15.5.2. Source authority: §44.1.`. Replace §15.5.2 inline value with anchored citation. | engineering | — | S |
| BL-P2-PH46-SM | 1 | D-4.6-021 | state_machine | §15.5.1 | Concurrency on TCO Configuration unspecified. Two Use Case Leads simultaneously editing `projection_years` (Lead A: 3→5; Lead B: 3→7) — las… | Add `version` field to TCOConfiguration entity (post-D-4.6-003 remediation); declare optimistic-lock conflict resolution returning HTTP 409… | engineering | M02.3 | S |
| BL-P2-PH46-MOB | 1 | D-4.6-023 | mobile_divergence | §15 | §38 Mobile Feature Parity Matrix declares 3 TCO mobile rows (TCO Configuration `not_supported`, TCO Results `supported` read-only, TCO Pric… | Author §15.X "Mobile Behavior" sub-section citing §38 by anchor; specify which §15 surfaces are accessible on mobile (read-only TCO Breakdo… | engineering + design | — | S |
| BL-P2-PH46-GLOSS | 1 | D-4.6-024 | glossary | §15 | Multi-section terms used in §15 / §13.7.3 / §13.8.2 / §28916–§28921 / §41967–§41970 / §47834–§47838 with no Appendix K entry: `Total Cost o… | Add 9 entries to Appendix K with §15 / §13.7.3 cross-references. Bind to D-4.5-033 Appendix-K glossary sweep pattern (Original Scoring / Si… | engineering | — | S |
| BL-P2-PH46-DOC | 1 | D-4.6-029 | documentation_gap | §15 | §34.2.5 declares Solo per-evaluation $199 charge fires on Selection Report PDF export; §40.1 / §33586 confirm the Selection Report PDF embe… | Author §15.X "Selection Report Coupling" sub-paragraph: cite §34.2.5 Solo per-evaluation $199 charge trigger; assert TCO algebra determinis… | engineering + pricing | — | S |

### Phase 4 (Prompt 4.10) (13 defects, 11 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH4P410)-SM | 2 | D-4.10-010, D-4.10-022 | state_machine | §19.2.2 | §19.2.2 (Template Versioning) and §19.4.3 (Template Update Flow) describe state behavior in bullet-prose; no `From / To / Trigger / Conditi… | Replace prose with a state-machine table for `template_version_status` (e.g., `seeded → outdated → update_available → applied / superseded… | engineering | M02.3 | S |
| BL-P2-PH4P410)-DATA | 2 | D-4.10-017, D-4.10-023 | data_model | §19.2.1, §19.3.3 | §19.3.3 permits Edit/Delete by Creator + Org Admin; §19.5.2 says template-derived workspaces have requirements in ACTIVE state independentl… | Specify that derived workspaces snapshot the template content at creation time; template deletion does not cascade. Add a nullable, retain-… | engineering | M02.3 | S |
| BL-P2-PH4P410)-AC | 1 | D-4.10-009 | acceptance_criteria | §19.7 | §19.7 acceptance criteria are checkbox-prose ("- [ ] Sorting: creation date, name, category"; "- [ ] Card displays: icon, name, description… | Rewrite §19.7 as a numbered AC block following §20.7 form. Each AC declares trigger, expected behavior, observable assertion (event emissio… | engineering, design | — | S |
| BL-P2-PH4P410)-GLOSS | 1 | D-4.10-012 | glossary | §19 | Multi-section terms used across §19 / §25 / §32 / §48 with no Appendix K entry: "Workspace Template", "Custom Template", "Sourcera-Provided… | Author Appendix K glossary entries: **Workspace Template** (§19, buyer-console-scoped, Use Cases + Requirements, Org-scoped); **Custom Temp… | design, engineering | — | S |
| BL-P2-PH4P410)-NUM | 1 | D-4.10-014 | numerical_singleton | §19.3.1 | §19.3.1 inlines `Template name (≤100 chars)` and `Description (≤300 chars, Markdown supported)` as character limits without a §39 row. Conv… | Add `workspace_template.name` (max 100 chars) and `workspace_template.description` (max 300 chars; Markdown allowed) rows to §39. Rewrite §… | engineering | — | S |
| BL-P2-PH4P410)-MOB | 1 | D-4.10-018 | mobile_divergence | §19 | §38.4 row group "Template Library (§19)" declares `Template Author/Edit | Add a §19.4.5 "Mobile Surface" sub-section citing §38.4. Render a mobile-only error state when authoring is attempted on mobile: error code… | design, engineering | — | S |
| BL-P2-PH4P410)-RBAC | 1 | D-4.10-024 | rbac | §19.3.3 | §19.3.3 enumerates `Org Admin` / `Workspace Owner` / `Creator` but is silent on Workspace Guest interaction with templates: do `guest_full_… | Author the per-role visibility matrix as part of the §5.11 Template Library row group (per D-4.10-002). Specify guest-role scoping: guests… | engineering, design | M11.3 | S |
| BL-P2-PH4P410)-OBS | 1 | D-4.10-025 | observability | §19 | §19 features depend on Convex (storage), Loops.so (notification of "Template Update Available" — implied), and Anthropic (any future AI-ass… | Specify that "Template Update Available" badge state is computed server-side from `latest_sourcera_version_seen vs latest_sourcera_version_… | engineering | M21.3 | S |
| BL-P2-PH4P410)-MAP | 1 | D-4.10-026 | surface_engine_mapping | §19 | Appendix M.1 (lines 47852–47854) has only two §19 rows: `Template Library (Sourcera-provided + custom)` and `Template-to-Workspace Flow`. M… | Author Appendix M.1 rows for each missing surface. Each row declares: surface name, §19 anchor, surface phrasing (user-facing label), plan-… | engineering, design | release-orchestration | S |
| BL-P2-PH4P410)-GATE | 1 | D-4.10-028 | plan_gating | §19.6.1 | §19.6.1 says Free tier is "Read-only access" for custom templates. If an Org downgrades from Starter (Unlimited author + share) to Free, wh… | Specify in §19.6 that on plan downgrade to Free, custom templates remain in the org with `state = active, plan_capability = read_only`; fur… | pricing, engineering | M11.3 | S |
| BL-P2-PH4P410)-FW | 1 | D-4.10-029 | firewall_leakage | §19 | §25 Console Bridge non-carry registry declares "Template Library Entry (buyer-authored) | Add a §19.1.1 "Console Scoping" sub-section: "Workspace Templates are buyer-console-scoped per §1.3 console firewall. Seller-console users… | engineering, security | M11.3 | S |

### Phase 23 (13 defects, 12 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH23-ENUM | 2 | D-23-014, D-23-015 | enum | §23.3 | §23.3 declares the response lifecycle as `pending → draft → ready_for_review → submitted → (optionally needs_reverification if buyer amends… | Resolve to: §4.4.2 / Appendix J owns the status enum; Appendix D owns lifecycle states (treating `pending`, `needs_reverification`, `locked… | engineering | M02.3 | S |
| BL-P2-PH23-NUM | 1 | D-23-012 | numerical_singleton | §23.2 | §23 inlines numerous numerical limits with no §39 / §44 citation: 600 s lock, 540 s warning, 60 s expiry warning, 300 s lock-extension, 50,… | Add §39 rows: `bid_response_editor_lock_duration_seconds=600`, `bid_response_editor_lock_warning_seconds=60`, `bid_response_editor_lock_ext… | engineering | — | S |
| BL-P2-PH23-AC | 1 | D-23-017 | acceptance_criteria | §23.5 | All eight §23.5 acceptance criteria lack test type, observable input/output decomposition, integration-test coverage, property-test coverag… | test class". Cover at minimum: bid workspace materialization, lock acquire/release, force-release notification to victim, bulk-submit trans… | engineering | — | S |
| BL-P2-PH23-API | 1 | D-23-018 | api | §23.3 | "Submit All" bulk submission specifies partial-success ("4 responses submitted. 2 responses failed: ...") but does not register an HTTP 207… | Author `POST /v1/bid-workspaces/{bid_workspace_id}/responses/bulk-submit` with `Idempotency-Key`, request body `{response_ids: [UUID]}`, HT… | engineering | M02.3 | S |
| BL-P2-PH23-RET | 1 | D-23-022 | retention | §23.4 | §23.4 says "All withdrawn responses are archived but retained for audit trail. Seller can export withdrawn responses to KB if desired." No… | Cite §40.2 retention class; declare DSAR pseudonymization for the withdrawing user's `withdrawal_reason` field; declare cascade-from-Bid-Wo… | engineering | M11.3 | S |
| BL-P2-PH23-FW | 1 | D-23-023 | firewall_leakage | §23 | §23 does not test the buyer/seller console firewall anywhere. The "Agent suggests from KB" surface MUST be asserted to read only the seller… | Add §23.5 AC asserting Agent KB suggestion reads exclusively `seller_org_id` KB scope; add §25.1.2 row for the new bid-withdrawal event kin… | security | M11.3 | S |
| BL-P2-PH23-MOB | 1 | D-23-024 | mobile_divergence | §23 | §23 specifies no mobile/desktop divergence. The 10-minute editor lock, force-release, bulk submit, evidence file upload (10 × 50 MB), and K… | Add §23.x mobile-parity paragraphs: Bid Workspace home (parity desktop+mobile); response form editor (mobile read+write per response_type —… | design | — | S |
| BL-P2-PH23-A11Y | 1 | D-23-025 | accessibility | §23 | §23 contains no accessibility detail: no `role="region"` on banners, no `aria-live` on lock-warning toasts, no focus-visible / reduced-moti… | Add a11y block: editor-lock warning is `role="alert" aria-live="polite"`; lock-held indicator is `aria-describedby` the body; bulk-submit p… | design | — | S |
| BL-P2-PH23-OBS | 1 | D-23-026 | observability | §23 | §23 emits no observability surface. No OTel spans for response submission, lock acquire/release, bulk submit, or withdrawal cascade. No Pos… | Author §23.x observability block: OTel spans `bid_response.lock.acquire`, `bid_response.lock.extend`, `bid_response.lock.force_release`, `b… | engineering | M21.3 | S |
| BL-P2-PH23-ERRS | 1 | D-23-027 | error_state | §23 | §23 does not author empty / loading / error / retry states for the Bid Workspace home, response form, KB suggestion list, evidence-uploader… | Author per-surface state enumerations (Bid Workspace home empty when no requirements yet; response form empty/loading/error when KB suggest… | design | — | S |
| BL-P2-PH23-RETRY | 1 | D-23-028 | retry_idempotency | §23.4 | Withdrawal and bulk-submit are both implicitly multi-write cascades but no idempotency contract is declared (Idempotency-Key header, replay… | Per D-23-003 and D-23-018, require `Idempotency-Key` (1–128 chars; 24h window). Replay returns HTTP 200 with `X-Idempotent-Replay: true`. B… | engineering | — | S |
| BL-P2-PH23-EDGE | 1 | D-23-029 | edge_case | §23.4 | §23.4 declares "Withdrawal is permanent and irreversible within the same Workspace" but the Bid Workspace owner can disqualify with a 72h r… | Either (a) author a 24h vendor-side withdrawal-reversal window symmetric with disqualification's 72h, OR (b) state explicitly why withdrawa… | product | — | S |

### Phase 13V (13 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH13V-NUM | 3 | D-13V-007, D-13V-012, D-13V-014 | numerical_singleton | §48.2.2, §48.7.3 | M16 step 9 declares `credit_expires_at = credit_issued_at + 365 days` inline. The 365-day duration is a numerical singleton with no canonic… | Author a row in §40.2 or §34.10 for the 365-day Stripe Credit Note expiry; replace the inline literal with a citation. | engineering + pricing | — | S |
| BL-P2-PH13V-AC | 3 | D-13V-018, D-13V-020, D-13V-021 | acceptance_criteria | §48.2.2 | L1's `growth_loop_l1_kb_seeded` event fires "when `kb_bootstrap` AIOperation reaches `settlement_state=accepted` (≥ 60% of proposed entries… | Author a `growth_loop_l1_kb_seed_failed` event for the <60% acceptance path; document the loop-status enum transition. Closes via Prompt 13… | engineering | — | S |
| BL-P2-PH13V-DOC | 2 | D-13V-003, D-13V-013 | documentation_gap | §48.1.1, §48.2.2 | §48.1.1 Buyer Console Paid Path, §48.1.2 Seller Console Paid Path, §48.1.3 PLG Funnel Configurability, §48.1.4 Acceptance Criteria, §48.1.8… | Author Prompt 13.6 — §48.1 Framing + Acceptance Criteria Walk per PHASE13V_FINDINGS.md §8.3. Target output: ≈ 5–10 defects. Run before Phas… | analytics | — | S |
| BL-P2-PH13V-MAP | 2 | D-13V-005, D-13V-017 | surface_engine_mapping | §48.2.2, §48.7.3 | The §48.7.3 M16 UX Surfaces block (line 38043) introduces a "Referral Link Landing Page" as a Custom Sourcera signup surface with referral… | Verify Appendix M.1 carries a row for "M16 Referral Link Landing Page" surface; if absent, author the row with the canonical surface mappin… | engineering | release-orchestration | S |
| BL-P2-PH13V-ENUM | 1 | D-13V-015 | enum | §48.2.2 | L1 AC #3 declares "the response MUST include `Retry-After` seconds AND a JSON body with `throttle_kind ∈ {per_user, per_target_domain}` and… | Verify `throttle_kind` enum is registered in Appendix J with values `{per_user, per_target_domain}`; if absent, author the enum row. Closes… | engineering | M02.3 | S |
| BL-P2-PH13V-RET | 1 | D-13V-016 | retention | §48.2.2 | The L1 walk at §48.2.2 does not cross-reference the §48.2.12 GrowthLoopExecution entity's retention, DSAR, or residency contracts. A reader… | Author a §48.2.2 closing paragraph: "Retention / DSAR / residency: see §48.2.12 GrowthLoopExecution Entity for the canonical contract." Sam… | engineering | M11.3 | S |
| BL-P2-PH13V-INST | 1 | D-13V-019 | instrumentation_gap | §48.2.2 | L1's `growth_loop_l1_first_bid_completed` event is the upstream signal that should funnel into the Hero Moment §48.8.4 `seller_onboarding_f… | Author a §48.2.2 AC #9: "`growth_loop_l1_first_bid_completed` and `seller_onboarding_first_bid_submitted` MUST share the same `(seller_org_… | engineering + analytics | M21.3 | S |

### Phase 4.2 (12 defects, 10 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH42-ENUM | 2 | D-4.2-026, D-4.2-032 | enum | §10.10, §10.12 | §10.10 declares "all their scores submitted in Phase 10-11 are marked `withdrawn`". `withdrawn` is a Score `status` enum value referenced i… | Register `score_status` enum in Appendix J with values `submitted`, `revised`, `withdrawn`, `finalized`. Cite §10.10 from Appendix J. Updat… | engineering | M02.3 | S |
| BL-P2-PH42-AC | 2 | D-4.2-033, D-4.2-038 | acceptance_criteria | §10.10, §10.6 | §10.6 Amendment Restrictions block declares: "Amendments that materially change Requirement scope must include minimum 3 calendar days noti… | Add §10.6 acceptance criterion: "Material amendments (`amendment_kind=material_scope_change`) MUST set `effective_date ≥ created_at + 3 cal… | engineering | — | S |
| BL-P2-PH42-NOTIF | 1 | D-4.2-025 | notification | §10.11 | §10.11 step 2 declares: "Request justification from outlier scorer (async request, Team Member responds with email)". Email-as-response is… | Replace the "responds with email" prose with an Internal Comment thread anchored on the Score row, with an @mention notification to the out… | engineering + design | — | S |
| BL-P2-PH42-NUM | 1 | D-4.2-027 | numerical_singleton | §10.10 | §10.10 step 2 declares "Each Requirement assigned to minimum 1, maximum 5 Team Members for consensus scoring". The numerical bounds are inl… | Add §39 row "ScoreAssignmentsPerRequirement: min 1, max 5 (Phase 10 consensus scoring per §10.10)". Update §10.10 to cite §39. Note: Solo-m… | engineering | — | S |
| BL-P2-PH42-DATA | 1 | D-4.2-028 | data_model | §10.10 | §10.10 step 1 declares "Scale may be customized per Workspace (numeric scale, A-F grade, pass/fail)". The customization is referenced but h… | Move scoring-scale customization to §13 with a §4-style `ScoringRubric` entity (workspace-scoped; fields `scale_kind enum`, `bounds`, `labe… | engineering | M02.3 | S |
| BL-P2-PH42-EMPTY | 1 | D-4.2-029 | empty_state | §10.2 | §10 phase narratives are silent on empty / loading / error / partial-completion UI states. §3.7.3 (empty-state pattern) and §3.7.4 (Failure… | Add a §10.18 "Phase UI States" subsection (or per-phase state catalogs in each §10.N) that enumerates empty / loading / error / partial sta… | design + engineering | — | S |
| BL-P2-PH42-MOB | 1 | D-4.2-030 | mobile_divergence | §10 | §10 makes zero mobile-parity declarations. §38 Mobile Translation is the canonical home for desktop-vs-mobile behavior; §10 should declare… | Add per-phase mobile-parity declarations citing §38 patterns. The Phase 10 scoring matrix and Phase 6 Q&A surface are the highest-risk mobi… | design | — | S |
| BL-P2-PH42-I18N | 1 | D-4.2-031 | i18n | §10.6 | Phase 6 "minimum 7 calendar days", Phase 7 "minimum 5 business days", Phase 8 "minimum 3 business days", Phase 9 "1-3 business days" refere… | Author §10.1.3 "Time-Zone and Business-Calendar Semantics for Phase Durations" declaring: calendar days computed in `Workspace.data_residen… | engineering | — | S |
| BL-P2-PH42-DRIFT | 1 | D-4.2-034 | consistency_drift | §10.7 | §10.7 heading: "Phase 7: Vendor Response Refinement (1-2 weeks combined with Phase 8)". §10.8 heading: "Phase 8: Buyer Due Diligence & Demo… | Replace "combined with Phase X" with explicit duration semantics. Recommended: declare Phases 7 and 8 sequential (matching §10.16's one-dir… | engineering + design | — | S |
| BL-P2-PH42-EDGE | 1 | D-4.2-040 | edge_case | §10 | §10 is silent on Workspace transfer, archive, restore, and Workspace-Owner reassignment impacts on the pipeline phase. Specifically: (a) Wo… | Author §10.19 "Workspace Transfer / Archive / Restore Semantics" with: (a) transfer is forbidden mid-evaluation (Workspace must be at Phase… | engineering | — | S |

### Phase 45 (12 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH45-DOC | 5 | D-45-006, D-45-007, D-45-012, + 2 | documentation_gap | §22.10, §45.1, §45.2 | §45.1 is silent on the platform's k-anonymity contracts: CategoryPage k=5 (§4.4.12), GuidePage / ComparisonPage / SoftwarePage cohort signa… | Author a §45.1 paragraph "Aggregate Query k-Anonymity Floors. Every cross-Org aggregate publication enforces a per-content-type k-anonymity… | engineering | — | M |
| BL-P2-PH45-OBS | 3 | D-45-011, D-45-014, D-45-017 | observability | §45.1, §45.2, §45.3 | §45.1 asserts "Aggregated anonymized metrics sent to PostHog for product analytics ... No PII in analytics events" — operational definition… | Replace §45.1 line 32590 with: "Aggregated metrics routed to PostHog per the §51 / Appendix G taxonomy with the §6.8.x PII-redaction policy… | engineering + analytics | M21.3 | S |
| BL-P2-PH45-RET | 1 | D-45-013 | retention | §45.1 | §45.1 says "Subprocessor List: Published at sourcera.io/compliance/subprocessors. Updated quarterly." Quarterly cadence does not satisfy th… | Author §45.1 sub-section "Subprocessor Change Notification": (a) ≥ 30-day advance notice via Loops.so to customer billing contact + DPO con… | legal + engineering | M11.3 | S |
| BL-P2-PH45-RES | 1 | D-45-016 | residency | §45.1 | §45 — the canonical Privacy section — has no statement of data-residency for: (a) Marketplace Abuse Report records (`subject_snapshot_json`… | Author §45.1 sub-section "Data Residency" with explicit per-data-class residency contracts: AbuseReport (Marketplace-domain, region of subj… | engineering + security | M11.3 | S |
| BL-P2-PH45-AC | 1 | D-45-019 | acceptance_criteria | §45.4 | §45.4 AC bullet #1 "All customer data retention policies documented and enforced" is unfalsifiable: no deterministic predicate, no §40.2 re… | Replace AC #1 with: "Every entity in the Master Spec data model carries a §40.2 retention TTL row; deploy-time validator `retention_table_p… | engineering | — | S |
| BL-P2-PH45-FW | 1 | D-45-022 | firewall_leakage | §45.3 | §45 does not state cross-console firewall integrity for privacy and abuse data. The reporter-identity firewall ("reporter identity NEVER re… | Author at §45.3 step 4: "Reporter-identity firewall. The reporter's `reporter_user_id` / `reporter_ip_hash` is NEVER revealed to the subjec… | engineering + security | M11.3 | S |

### Phase 3 (Audit, Second Pass) (12 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH3-DRIFT | 5 | D-3UX-023, D-3UX-032, D-3UX-033, + 2 | consistency_drift | §3.10.1, §3.7.10, §3.7.4, §3.7.6.2, §3.8.1 | §3.7.6.2 empty-state copy says "Vendor curation begins in Phase 3" with predicate `(if Phase ≥ 3)`. Per §10.4 Phase 3 is "Use Case Definiti… | Same PR as D-3UX-008 remediation: (1) replace gating predicate with canonical step boundary `(if step ≥ Define)` (Buyer Solo) / `(if Phase… | engineering + design | — | M |
| BL-P2-PH3-OBS | 2 | D-3UX-024, D-3UX-025 | observability | §3.7.1, §3.7.10 | §3 Observability subsections name events that drift from Appendix G's canonical registry. §3.7.1 names `ui_page_state_changed`; Appendix G… | Mechanical reconciliation pass: (1) audit every §3.6 → §3.12 Observability subsection against Appendix G; (2) prefer Appendix G names (cano… | engineering | M21.3 | S |
| BL-P2-PH3-NUM | 1 | D-3UX-026 | numerical_singleton | §3.12.2 | §3.12.2 Workspace Header Avatar Stack max ("Up to 5 overlapping avatars + '+N more' chip") conflicts with §3.12.6 Performance Budgets ("≤ 8… | Resolve to one canonical rule. Likely intent: 5 = visible overlapping avatars in header chip strip; 20 = max popover roster on click. Updat… | engineering + design | — | S |
| BL-P2-PH3-GATE | 1 | D-3UX-027 | plan_gating | §3.10.4 | §3.10.4 Bulk Action Catalog Plan-Gated column inlines tier-name shorthand "Scale+", "Enterprise" — same `solo_role_grid_inclusion` / Princi… | Replace each cell with §34.1 cell-citation: "Export (per §34.1.1 cell **Bulk Export**)", "AI Summary (per §34.1.1 cell **AI Bulk Summary**)… | engineering + pricing | M11.3 | S |
| BL-P2-PH3-SM | 1 | D-3UX-029 | state_machine | §3.7.1 | §3.7.1 page-state state machine rendered as ASCII art inside a fenced code block, not as `From | Notes` table covering all 20 transitions (5 states × 4 destinations). Resolve the `loading → empty` ambiguity in the table. Cross-reference… | engineering | M02.3 | S |
| BL-P2-PH3-MOB | 1 | D-3UX-030 | mobile_divergence | §3.14.3 | §3.14.3 #5 mobile-rendering step-initial labels reuse the same character within one console. Buyer steps Setup → Define → Score → Decide be… | Choose one: (1) two-letter disambiguating initials e.g. Buyer "St / Df / Sc / Dc" / Seller "Rc / Df / Rv / Sb"; (2) drop initials on `mobil… | design + engineering | — | S |
| BL-P2-PH3-AC | 1 | D-3UX-031 | acceptance_criteria | §3.8.1 | §3.8.8 AC #2 says "Width is clamped to [360, 640]; attempts beyond either bound snap to the nearest bound and emit a single toast." But §3.… | Update AC #2 to: "Width is clamped to `[360, tier_max]` where `tier_max = 640` on `responsive_breakpoint_tier=desktop` and `tier_max = 720`… | engineering | — | S |

### Phase 5.3 (12 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH53-AE | 3 | D-5.3-009, D-5.3-010, D-5.3-011 | authored_extension | §22.12.4, §22.12.5, §22.12.6 | Master Spec §22.12.4 lists 5 compliance frameworks (SOC 2, ISO 27001, GDPR, HIPAA, PCI); KB Spec §8.4 listed 4 (no PCI). The PCI addition i… | Add a §22.12.4 note: "Authored Extension — PCI added to KB Spec §8.4's four frameworks; `kb_document_category` enum already carries `pci` (… | engineering | release-orchestration | S |
| BL-P2-PH53-DRIFT | 2 | D-5.3-016, D-5.3-018 | consistency_drift | §22.16.4, §22.20.5 | Audit-event mapping inconsistency between §22.16.4 and §22.15.1. §22.16.4 says "`emit_structured_draft` → `ai_draft_emitted`" — but §22.15.… | Reconcile the two tables. Either (a) extend §22.15.1 row "agent.custom_tool_use(emit_structured_draft)" to add "Emit `ai_draft_emitted` aud… | engineering | — | S |
| BL-P2-PH53-API | 2 | D-5.3-019, D-5.3-024 | api | §22.16.7, §22.20.5 | §22.16.7 references `kb_injection_scanner` capability "(capability seed in §21.4.3 — Authored Extension flagged in RECONCILIATION)". Withou… | Verify §21.4.3 includes `kb_injection_scanner` capability with full Capability Registry row (cost base, model tier, OutcomeContract, plan g… | engineering | M02.3 | S |
| BL-P2-PH53-DOC | 2 | D-5.3-023, D-5.3-025 | documentation_gap | §22.20.4, §22.9 | Inline citations to bare `KB_Engineering_Spec.md` in eight §22 sub-section preambles. Per CLAUDE.md §10, the file is retired and now lives… | Normalize all `KB_Engineering_Spec.md` cites in §22.9–§22.16 to `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md §X`. Optionally use a… | engineering | — | S |
| BL-P2-PH53-ENUM | 1 | D-5.3-013 | enum | §22.20.4 | Three engine buckets referenced inline in the §22.20.4 three-label compression mapping table (`strong_match`, `moderate_match`, `weak_match… | Confirm Appendix J registration of `marketplace_match_engine_bucket_enum` (or equivalent name in §27.4). If absent, register the four value… | engineering | M02.3 | S |
| BL-P2-PH53-DATA | 1 | D-5.3-014 | data_model | §22.18.4.1 | Estimated Value formula `entries × blended_draft_time_saved_min/entry × blended_seller_hourly_rate_cents / 6000` is seller-configurable but… | Add a render-time clamp to the formula (e.g., cap at $250K/yr per Seller Org per render; values exceeding the clamp render as "$250K+ /yr s… | engineering | M02.3 | S |
| BL-P2-PH53-NUM | 1 | D-5.3-015 | numerical_singleton | §22.16.3 | §22.16.3 Pre-Release Gate "Cost per accepted draft within 110% of baseline (§4.8.6 drift band: `low ≤ 5%`, `medium ≤ 10%`, `high ≤ 25%`, `c… | Replace inline enumeration with: "Cost per accepted draft within 110% of baseline (drift bands per §4.8.6 nightly recalc)." Verify §4.8.6 c… | engineering | — | S |

### Phase 5.6 (12 defects, 10 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH56-API | 2 | D-5.6-014, D-5.6-018 | api | §26, §26.7.6 | §26 introduces multiple API surfaces — preview-token issuance (§26.7.6), preview-token revocation (§26.7.6), product-transfer-request CRUD… | Author §32.x endpoint group `Marketplace Authoring API` with: (a) `POST /v1/seller-org-pages/{id}/preview-tokens` (issuance), `DELETE /v1/s… | engineering | M02.3 | S |
| BL-P2-PH56-DATA | 2 | D-5.6-017, D-5.6-019 | data_model | §26.7.3, §26.8.7 | "Synthetic opt-out record" creation on domain-verification loss is under-specified. §26.7.3 says: "the system MUST cascade `domain_ownershi… | Author §26.7.3.x "Synthetic Opt-Out Write Contract" subsection with: (a) `created_by` = `system_domain_verification_worker` (a synthetic sy… | engineering + ops | M02.3 | S |
| BL-P2-PH56-DOC | 1 | D-5.6-010 | documentation_gap | §26.4 | §26.4 narratively describes the KB-to-capability flow but does NOT cite §21.4.1 row 18 (`kb_to_capability_suggestion` capability registry e… | Rewrite §26.4 with explicit citations: (a) "Agent (Haiku)" → "the `kb_to_capability_suggestion` capability registered at §21.4.1 row 18 (Ha… | engineering | — | S |
| BL-P2-PH56-NUM | 1 | D-5.6-011 | numerical_singleton | §26.7.6 | §26.7.6 inlines numerous numerical singletons that should cite canonical homes: `60-second snapshot TTL`, `600s / 86400s edge cache TTL`, `… | Move all rate limits to §39 Object Size Constraints (or §32.4 rate-limit class catalog). Move all SLOs to §42.x (CDN / cache layer). Move r… | engineering | — | S |
| BL-P2-PH56-AC | 1 | D-5.6-013 | acceptance_criteria | §26.6 | Five §26.6 ACs are bullet-prose, not numbered, and only one (`<3-second editor-load latency for KB-to-Capability suggestions`) is observabl… | Rewrite §26.6 as numbered AC block with measurable assertions: (1) "Creating a Capability Declaration with `capability_type=taxonomy_declar… | engineering + design | — | S |
| BL-P2-PH56-HOOK | 1 | D-5.6-015 | webhook | §26.10 | Webhook events are referenced in §26.10 ACs and §4.4 entity audit-event blocks but are not registered with full §31 contracts (HMAC-SHA256… | Audit Appendix C and Appendix G for the 9 §26 webhook events listed. For each missing event, author a §31-conformant entry (signed, idempot… | engineering + analytics | M02.3 | S |
| BL-P2-PH56-MAP | 1 | D-5.6-016 | surface_engine_mapping | §26 | Several §26-introduced surfaces lack explicit Appendix M.1 rows: (a) §26.7.2 split-pane enrichment review pane (the seller-facing UI for ac… | Confidence annotations per section render as quiet badges; section-type enum never named." | design + engineering | release-orchestration | S |
| BL-P2-PH56-RET | 1 | D-5.6-022 | retention | §26.6 | The AC names "Convex Storage" (a platform primitive) without citing §4.6.2 Attachment entity (the canonical file-upload primitive) or §6.7… | Rewrite §26.6 AC #2 to: "Capability Declaration evidence files MUST persist to §4.6.2 Attachment with `owner_entity_type=capability_declara… | engineering | M11.3 | S |
| BL-P2-PH56-FW | 1 | D-5.6-023 | firewall_leakage | §26.3 | When a Seller Org has a `global` Vendor Opt-Out Record (§4.4.8), the SellerOrgPage transitions to `suppressed_by_opt_out` and the Marketpla… | Add `capability_declaration` to §4.5.6 redaction-target table with rule: "When the parent Seller Org has an active `global` opt-out, all of… | engineering | M11.3 | S |
| BL-P2-PH56-OBS | 1 | D-5.6-025 | observability | §26.7.3 | §26.10 AC #5 says "Domain verification loss MUST cascade to page suppression within 15 minutes (measured via the `vendor_opt_out.applied` w… | Author §26.7.3.x "Cascade Webhook Contract" — synthetic opt-out rows fire `vendor_opt_out.applied` with `synthetic=true` boolean payload pr… | engineering + analytics | M21.3 | S |

### Phase 14.4 (12 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH144-DRIFT | 12 | D-14.4-001, D-14.4-002, D-14.4-003, + 9 | consistency_drift | §11.6, §2.2, §5.2.11, §5.2.12, §5.2.13… | UX v2 component specs reference typography roles `Heading 3` and `Heading 4` that are not defined in UX §2.1 Typography (which enumerates o… | Either (a) extend UX §2.1 Typography + Master Spec §38.1 with new rows for Heading 3 (e.g., 17px / 600 / 1.35 / 0 — proposed) and Heading 4… | design + engineering | — | L |

### Phase 6.2 (11 defects, 8 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH62-ENUM | 3 | D-6.2-013, D-6.2-014, D-6.2-017 | enum | §27.8.9, §27.9.5, §27.9.5.1 | recompute_deadline_exceeded` introduced in §27.9.5 as a new enum value but Appendix J extension never landed. Authored Extension flagged in… | Add `recompute_deadline_exceeded` to `seller_signal_suppressed_reason` enum in Appendix J in the same edit closing D-6.2-005. | engineering | M02.3 | S |
| BL-P2-PH62-DATA | 2 | D-6.2-015, D-6.2-020 | data_model | §27.11.8, §27.9.8 | MarketplaceProactiveOffer` referenced in §27.9.8 as an "existing sub-resource from §27.3 Vendor Discovery — reused" but §27.3 does NOT auth… | Author `MarketplaceProactiveOffer` as a §4.5.x entity with full field table (incl. `offer_kind`, `source_seller_signal_id`, lifecycle state… | engineering | M02.3 | S |
| BL-P2-PH62-SM | 1 | D-6.2-007 | state_machine | §27 | Appendix L preamble (line 47641) requires every status enum lifecycle to have an APX-L table or explicit cross-reference. Ten §27 state mac… | Add per-state-machine cross-reference rows to APX-L pointing to originating §27 sub-sections (faster path); for high-traffic state machines… | engineering | M02.3 | S |
| BL-P2-PH62-DRIFT | 1 | D-6.2-012 | consistency_drift | §4.4.18 | Two names for the same enum value: §4.4.18 enum registration (D-1.3-001 remediation, 2026-05-01) uses canonical `tuple_distinctiveness_thre… | Update §27.9.5 / §27.9.5.1 / §27.9.6 / §27.9.12 / §27.9.13 to use `tuple_distinctiveness_threshold_exceeded` per the D-1.3-001 closure. Sin… | engineering | — | S |
| BL-P2-PH62-NUM | 1 | D-6.2-016 | numerical_singleton | §27.9.6.2 | §27.9.6.2 inline-restates per-tier digest cadence ("monthly digest on seller_starter, weekly on seller_growth+, real-time on seller_scale+"… | Replace inline cadence list with citation: "per §34.1.2 cell **Seller Signals**". Add deploy-time validator `seller_signal_cadence_single_s… | engineering | — | S |
| BL-P2-PH62-MOB | 1 | D-6.2-018 | mobile_divergence | §27.4.6 | §27.11.8 AC #37 covers Promoted/Featured 360px parity; §27.4.6 / §27.4.12 Match Score provenance panel mobile rendering rules are silent. D… | Add §27.4.6 mobile-rendering subsection or §27.4.10 AC #6 mandating mobile parity for the qualitative label and a sheet-style provenance pa… | design | — | S |
| BL-P2-PH62-NOTIF | 1 | D-6.2-019 | notification | §27.11.2 | marketplace_discovery.frequency_cap_bypass_suspected` Ops-only webhook event is named in §27.11.2 failure mode #4 but absent from §27.11.7… | Add `marketplace_discovery.frequency_cap_bypass_suspected` to §27.11.7 webhook catalog with payload shape; register in Appendix C as Ops-on… | engineering | — | S |
| BL-P2-PH62-AC | 1 | D-6.2-021 | acceptance_criteria | §27.5 | §27.5 has no AC block; one-click EOI acceptance audit-trail invariants (every accept click writes a `marketplace.eoi.accepted` event AND an… | Add §27.5 numbered acceptance-criteria block asserting one-click acceptance audit-trail invariants: (a) atomic write of `marketplace.eoi.ac… | engineering | — | S |

### Phase 1.2 (10 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH12-DATA | 5 | D-1.2-010, D-1.2-013, D-1.2-017, + 2 | data_model | §19, §4.3.1, §4.3.16, §4.3.2, §4.3.7 | Multiple §4.3 entities lack `updated_by` UUID FK → User. Authoring Convention §4 requires `created_by` and `updated_by` paired. Without `up… | Add `updated_by UUID FK → User Last mutator` to all 10 entities. For event-log-style entities (§4.3.10 Evaluation Pulse Event, §4.3.18 Usag… | engineering | M02.3 | M |
| BL-P2-PH12-SM | 1 | D-1.2-011 | state_machine | §4.3.5 | Two §4.3 entities have lifecycle states encoded as enums (Response.status: `draft \ | Author Appendix L state-machine subsections for Response (§4.3.5) and Score (§4.3.6) with From/To/Trigger/Conditions/Notes tables. Sample f… | engineering | M02.3 | S |
| BL-P2-PH12-RET | 1 | D-1.2-012 | retention | §40.2 | §40.2 retention table lacks explicit rows for 11 §4.3 entities: Use Case (§4.3.3), Requirement (§4.3.4), Response (§4.3.5), Score (§4.3.6),… | Author 11 explicit retention rows in §40.2: Use Case / Requirement / Response / Score → "Life of parent Workspace; cascade soft-delete + 30… | engineering + legal | M11.3 | S |
| BL-P2-PH12-DOC | 1 | D-1.2-014 | documentation_gap | §4.3.10 | §4.3.10 Evaluation Pulse Event lacks an annotation noting Solo-mode surface suppression per §2.8.4 / §44.6.1: "engine continues to write Pu… | Add Authoring Intent paragraph to §4.3.10 Evaluation Pulse Event: "When the parent Workspace is in `evaluation_owner_mode = solo`, the Puls… | engineering | — | S |
| BL-P2-PH12-AE | 1 | D-1.2-015 | authored_extension | §4.3.11 | Multiple §4.3 entity Authored Extensions are flagged in their Authoring Intent paragraphs ("flagged in RECONCILIATION.md under Authored Ext… | Author 7 new AE rows in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` covering: AE-D1.2-01 §4.3.11/12/13 anchor polymorphism + post normaliz… | engineering + ops | release-orchestration | S |
| BL-P2-PH12-API | 1 | D-1.2-016 | api | §32.2 | §32.2 / §32.5 baseline endpoint contract omits `Idempotency-Key` header semantics. Individual feature endpoints (Defense View regenerate at… | Author §32.2.1 "Idempotency-Key Header (Global Contract)" with: header is `Idempotency-Key` (1–128 chars, ASCII printable); REQUIRED on all… | engineering | M02.3 | S |

### Phase 2.2 (10 defects, 5 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH22-DATA | 0 | D-2.2-039, D-2.2-049, D-2.2-053, + 3 | data_model | §4.4.1, §4.4.16, §4.4.18, §4.4.4 | Closed 2026-07-12. §4.4.16 now has system/authorized-Ops audit actors and the reserved `system_agent_heat_map_refresh_worker`; §4.4.18.1 and §4.4.4 already provide the remaining current source contracts. | Source closure is complete. Pending AE ratification and absent product migrations, writers, serializers, DSAR workers, and concurrency evidence remain stamp-gate work. | engineering | M02.3 | Closed |
| BL-P2-PH22-RBAC | 1 | D-2.2-040 | rbac | §4.4.8 | §4.4.8 entity declares `created_by` write-role gate as "seller_billing_admin or seller_org_admin." §27.10.6 POST /api/v1/opt-outs API endpo… | Reconcile both citations. Most likely `seller_org_owner` is implicitly admitted (Owner inherits Admin); make implicit explicit on the entit… | engineering | M11.3 | S |
| BL-P2-PH22-DSAR | 1 | D-2.2-051 | dsar | §4.4.22 | Pre-Stage-2 SellerOnboardingSession rows have `org_id = NULL` and `user_id = NULL`. Tenant isolation depends on `recipient_email_hash` (SHA… | Author DSAR rule for pre-Stage-2 rows: subject's email hash + plaintext domain are scope keys; DSAR cascade matches on `(SHA-256(subject_em… | engineering + privacy | M11.3 | S |
| BL-P2-PH22-SM | 1 | D-2.2-054 | state_machine | §4.4.4 | §22.20.2 declares a NEW state-machine transition `(none) → published` directly via `pending_review_reason = 'solo_free_auto_publish'` (Solo… | Add row 7a to the §4.4.4 state machine table with the new transition. Update Appendix L registration. | engineering | M02.3 | S |
| BL-P2-PH22-RET | 1 | D-2.2-057 | retention | §4.4.9 | §4.4.9 retention covers Seller Org *delete* (90-day soft-delete then hard-purge with KB namespace migration to "orphan" namespace). The "pa… | Author rule: "On Seller Org pause (§50.3.2 + §4.4.25), SellerSoftware KB namespaces transition to write-locked + read-active; existing kb_n… | engineering | M11.3 | S |

### Phase 3.3 (10 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH33-DOC | 5 | D-3.3-021, D-3.3-027, D-3.3-031, + 2 | documentation_gap | §6.3.1, §6.4, §6.5, §6.6, §6.6.4 | §6.3.1 line 9421 declares the cross-tab sign-out implementation: "All tabs/windows are signed out immediately (via SharedWorker or localSto… | Replace line 9421 with: "Sign-out is propagated to all tabs / windows of the same browser within 100 ms (cross-tab) and to all devices of t… | engineering | — | M |
| BL-P2-PH33-AC | 3 | D-3.3-004, D-3.3-014, D-3.3-026 | acceptance_criteria | §6.1, §6.2, §6.4 | §6.1 has no numbered acceptance criteria. The §13.10 / §14.9 / §17.8 / §20.7 convention requires observable / measurable / scope-bound crit… | Author 5–8 numbered ACs covering: (1) successful SSO callback returns OIDC token within p95 ≤ 1 s; (2) failed SSO callback emits `auth.sso_… | engineering | — | S |
| BL-P2-PH33-GLOSS | 1 | D-3.3-005 | glossary | §6.1 | Appendix K does not define `SSO`, `SAML`, `SCIM`, `WorkOS`, `OIDC` / `OpenID Connect`, `magic link`, `Bearer token`, `WebAuthn`, `FIDO2`, `… | Author Appendix K entries for the 11 terms in a single batch under a §6 cluster heading. Each entry: 1–2 sentence canonical definition with… | documentation | — | S |
| BL-P2-PH33-RET | 1 | D-3.3-013 | retention | §6.2 | §6.2 silent on retention of MfaEnrollment records and recovery codes. §6.8.4 line 9642 lists "MFA factors, recovery codes" in the "Pure-PII… | Author §6.2.6 "MFA Retention" sub-section: (1) MfaEnrollment row retained for the duration of `users.deleted_at IS NULL`; hard-deleted on u… | engineering + security | M11.3 | S |

### Phase 3.5 (10 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH35-DSAR | 7 | D-3.5-025, D-3.5-026, D-3.5-027, + 4 | dsar | §6.8, §6.8.1, §6.8.2, §6.8.4, §6.8.5… | GDPR Art. 22 grants subjects the right not to be subject to a decision based solely on automated processing, including profiling. Sourcera… | Author §6.8.11 Automated-Decision Rights: subject may request human re-review of any AI-derived score / classification / flag pertaining to… | engineering | M11.3 | M |
| BL-P2-PH35-GLOSS | 1 | D-3.5-030 | glossary | §6.8.6 | §6.8.6 AC #3 introduces the role "Privacy Officer on-call" with no preceding definition. The Master Spec uses "DPO" (Data Protection Office… | Replace "Privacy Officer on-call" with "DPO on-call" per spec convention; add "DPO (Data Protection Officer)" to Appendix K Glossary if abs… | engineering + legal | — | S |
| BL-P2-PH35-OBS | 1 | D-3.5-036 | observability | §6.8.4 | The §6.8 acceptance criteria reference five CI gates / property tests / PostHog events — `dsar_cascade_audit_completeness`, `audit_integrit… | Add the five gates to Appendix M.5 with full matcher / scope / trigger / failure-mode / override-path / authority-anchor; runtime-wiring de… | engineering | M21.3 | S |
| BL-P2-PH35-RET | 1 | D-3.5-037 | retention | §40.2 | §40.2 row "GDPR deletion request | per §6.8.6 fulfillment SLA; cascade per §6.8.4". Folded into D-3.5-009 as part of the inline-restatement sweep, but elevated as a discrete… | engineering | M11.3 | S |

### Phase 41 (10 defects, 9 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH41-DOC | 2 | D-41-018, D-41-020 | documentation_gap | §41, §41.2 | Email body / subject-line i18n / locale / recipient-TZ unspec'd. Examples from §41.2: subject "⚠️ \[Requirement Title\] due in 24 hours" —… | Author §41.2.2 "Email Localization Contract" stating: (a) recipient locale = User.preferred_locale fallback Org default; (b) timezone = Use… | engineering | — | S |
| BL-P2-PH41-ENUM | 1 | D-41-009 | enum | §41.2 | §41 introduces or consumes four enums not registered in Appendix J (and one registered under a misleading name): (a) `email_category` — val… | Add four registrations to Appendix J: `email_category` (transactional / lifecycle / marketing); `email_opt_out_class` (transactional / tran… | engineering | M02.3 | S |
| BL-P2-PH41-GLOSS | 1 | D-41-010 | glossary | §41.4 | Multi-section terms used by §41 and elsewhere are absent from Appendix K Glossary: (a) `Transactional-Critical` — coined in §41.4; reused a… | Add seven entries to Appendix K with corpus-specific definitions and cross-references to §41 / §31.8 / §48.4.2 / §29.2. | engineering | — | S |
| BL-P2-PH41-SM | 1 | D-41-011 | state_machine | §41 | EmailSend lifecycle is implicit prose: queued → sending → sent → delivered → bounced/complained/failed/suppressed. Per Authoring Convention… | Author Appendix L.x "EmailSend Lifecycle State Machine" with transition table covering all 8 states from D-41-009; cross-link from §41 (new… | engineering | M02.3 | S |
| BL-P2-PH41-OBS | 1 | D-41-013 | observability | §42.2 | §42.2 registers a `loops_dispatch_failure_burst` alert (Loops 5xx + DLQ rate > 5% over 15-minute window) that transitions to `loops_degrade… | Author §41.1.3 "Loops.so Outage Behavior Contract": (a) queue-depth ceiling per `email_category` (Transactional ∞, Lifecycle 24h, Marketing… | engineering + ops | M21.3 | S |
| BL-P2-PH41-DRIFT | 1 | D-41-016 | consistency_drift | — | Inbound `per §41` SPF/DKIM/DMARC citations are broken. Line 20055: "`Sender. noreply@sourcera.io (transactional). SPF/DKIM/DMARC-aligned pe… | After D-41-001 lands the §41.3.1 SPF/DKIM/DMARC sub-section, retarget all four inbound citations (20055, 25243, 33993, 35581) to cite `§41.… | engineering | — | S |
| BL-P2-PH41-HOOK | 1 | D-41-017 | webhook | §41.1 | Loops.so → Sourcera bounce / complaint / delivered / opened / clicked webhook ingestion is unspec'd. §48.4.2 line 33643 references "rolling… | Author §41.1.4 "Loops.so → Sourcera Webhook Ingestion": (a) HMAC-SHA256 signing-key contract with rotation cadence; (b) idempotency via Loo… | engineering | M02.3 | S |
| BL-P2-PH41-FW | 1 | D-41-019 | firewall_leakage | §41.2 | Multiple §41.2 emails route buyer-Console data to seller-Console recipients (or vice versa) without §4.7 carried-vs-redacted enumeration. V… | Author §41.2.3 "Cross-Console Email Field-Carry Registry": one row per cross-console email kind enumerating fields carried (e.g., Vendor In… | engineering + security | M11.3 | S |
| BL-P2-PH41-DSAR | 1 | D-41-021 | dsar | §41 | Open-tracking pixel + click-tracking redirect — privacy implications and DSAR right-to-erasure compatibility unspec'd. Loops.so supports op… | Author §41.3.5 "Open / Click Tracking Privacy Posture": (a) tracking off by default for Transactional; (b) tracking on by default for Marke… | engineering + legal | M11.3 | S |

### Phase 3 (Audit) (10 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH3-GATE | 3 | D-3UX-005, D-3UX-006, D-3UX-007 | plan_gating | §3.10.4, §3.7.6.6, §3.7.8 | Recovery CTA Rules `contact_support` row inlines tier list "Starter, Growth, Scale, Enterprise" without naming Buyer Solo / Seller Solo eli… | Replace with citation: "Opens §29.9 Support Widget (available on every paid tier per §34.1 cell **Support**); on Free, opens a mailto with… | engineering | M11.3 | S |
| BL-P2-PH3-DRIFT | 2 | D-3UX-003, D-3UX-012 | consistency_drift | §3.10, §3.8.1 | Side Peek default-width drift: Master Spec authoritative 480px vs UX Design v2 §3.1 still 420px. Master Spec §3.8.1 acknowledges drift in i… | Update UX_Design_of_Sourcera.md §3.1 block diagram (lines 287–293) and prose (line 299) to 480px; cross-reference Master Spec §3.8.1; queue… | design | — | S |
| BL-P2-PH3-MAP | 2 | D-3UX-004, D-3UX-008 | surface_engine_mapping | Appendix M, §3.7.6.2 | Eight §3 UX surfaces / engine concepts lack explicit Appendix M.1 rows: Side Peek (§3.8), Bulk Action Toolbar (§3.10), Dark Mode / `theme_m… | Author 8 new Appendix M.1 rows (one per item) under existing "Architecture & Console Routing" or a new "UX Standards (§3)" thematic banner.… | engineering + design | release-orchestration | S |
| BL-P2-PH3-DOC | 1 | D-3UX-001 | documentation_gap | §3.13 | §3.13 contains literal `§X` placeholder for the First-30-Seconds Test home; should resolve to UX_Design_of_Sourcera.md §1.4. Two occurrence… | Replace `§X` with `§1.4` in both locations. | engineering | — | S |
| BL-P2-PH3-NUM | 1 | D-3UX-009 | numerical_singleton | §3.12.5 | DSAR right-to-erasure timing for Unread Marker hard-delete is documented as both "30 days" and "72 hours" within §3.12; values not reconcil… | Resolve §6.8.3 target (likely 72 hours for high-priority hard-delete; 30-day GDPR Art. 17 maximum for marker-class objects). Normalize §3.1… | security + engineering | — | S |
| BL-P2-PH3-MOB | 1 | D-3UX-016 | mobile_divergence | §3.7.10 | Offline-banner detection assumes browser `navigator.onLine`; native iOS / Android equivalents (NWPathMonitor, ConnectivityManager) unspecif… | Append to §3.7.10: "Native mobile apps use the platform reachability API (NWPathMonitor on iOS 16+, ConnectivityManager.NetworkCallback on… | engineering | — | S |

### Phase 5.2 (10 defects, 5 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH52-DRIFT | 4 | D-5.2-006, D-5.2-010, D-5.2-013, + 1 | consistency_drift | §22.8, §22.8.3, §22.8.4.7, §22.8.4.8 | §22.8 preamble claims "the content of §22.8 is reproduced from `KB_Engineering_Spec.md §3` in full" — misleading. KB Spec §3.4 defines 7 to… | Amend §22.8 preamble: "reproduced from `_baselines/retired-sources/KB_Engineering_Spec_retired_2026-04-26.md §3` and extended with §22.8.4.8 `kb_entry_draft… | engineering | — | M |
| BL-P2-PH52-ERR | 2 | D-5.2-008, D-5.2-012 | error_code | §22.8.4.1, §22.8.4.3 | Four MCP tools do not enumerate per-tool error codes. §22.8.6 holds the global error envelope, but per-tool codes are not tabulated as they… | Add a "Errors" sub-block to §22.8.4.3, §22.8.4.5, §22.8.4.6, §22.8.4.7 enumerating the codes per the §22.8.4.8 pattern (HTTP code, identifi… | engineering | — | S |
| BL-P2-PH52-DATA | 2 | D-5.2-014, D-5.2-016 | data_model | §22.3.1, §22.5.1 | KBEntry `embedding` declared as `Vector(1536)` with "Voyage-3-large default." Voyage-3-large default dimensionality (per Voyage AI document… | Verify against Voyage AI documentation for `voyage-3-large`. If 1024 is correct, fix `Vector(1536)` to `Vector(1024)`. If the embedding col… | engineering | M02.3 | S |
| BL-P2-PH52-API | 1 | D-5.2-007 | api | §22.8.4.3 | Four MCP tools lack concrete request/response examples. §22.8.4.1 (`kb_retrieve`), §22.8.4.2 (`kb_get_entry`), §22.8.4.8 (`kb_entry_draft_c… | Add one request and one response example per tool. For `cite_verify`, include both the `valid=true` and the `valid=false (entry_modified_af… | engineering | M02.3 | S |
| BL-P2-PH52-DOC | 1 | D-5.2-011 | documentation_gap | §22.3 | §22.3 "Ingestion Channels" enumerates 4 KBEntry channels (manual, bid response import, Firecrawl, Ghost-Bid Importer) but does not enumerat… | Either (a) qualify the §22.3 heading to "KBEntry Ingestion Channels" and add a §22.3.5 "KBDocument Upload Channel" stub pointing to §22.7;… | engineering | — | S |

### Phase MD (10 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHMD-DOC | 5 | D-MD-008, D-MD-010, D-MD-011, + 2 | documentation_gap | §34.16.1, §34.16.4, §34.16.5 | §34.16.4 enumerates 5 buyer guardrails (labeling, paid/organic separation, opt-out, k=5 anonymization, no retargeting). The audit prompt's… | Add §34.16.4 #6 "Verified/Certified badges are label-only — they surface earned tiers (per §27.11.3 / §34.16.2), not purchased SKUs; seller… | design + engineering | — | M |
| BL-P2-PHMD-PH | 1 | D-MD-009 | posthog_event | §34.16.1 | PostHog event-name conflict for the same surface signal. §34.16.1 line 29949: "Promoted listing click-throughs MUST be tracked in PostHog w… | Pick one canonical name; recommend `marketplace_promoted_clicked` (matches the parallel `marketplace_organic_clicked` and is already cited… | engineering + analytics | M21.3 | S |
| BL-P2-PHMD-ERR | 1 | D-MD-013 | error_code | §34.16.7 | Two parallel HTTP 409 codes for the seller monthly-cap-exceeded condition: (a) §34.16.7 `promoted_listing_category_locked` ("Seller already… | Pick one canonical name per condition. Recommended: keep entity-level `promoted_listing_*` family (mirroring `promoted_listing_plan_tier_be… | engineering + ops | — | S |
| BL-P2-PHMD-FW | 1 | D-MD-016 | firewall_leakage | §34.16 | §34.16 has zero references to §43 marketplace-domain partitioning. §27.11.1 design principle 8: "No cross-marketplace-domain leakage. Marke… | Add §34.16.1 *Scope* preamble: "Promoted Listings are marketplace-domain-scoped per §43; auction window, monthly cap, and category cap are… | security + engineering | M11.3 | S |
| BL-P2-PHMD-RET | 1 | D-MD-018 | retention | §34.16.4 | §34.16.6 retention/residency/DSAR table includes only PromotedListing, FeaturedPlacement, VerificationReviewRecord, MarketplaceDiscoveryRev… | DSAR pseudonymizes `buyer_user_id` and `buyer_org_id` per §6.8; aggregates retained per §45.1 platform-integrity exemption". Update §40.2 t… | engineering + privacy | M11.3 | S |
| BL-P2-PHMD-NUM | 1 | D-MD-020 | numerical_singleton | §34.16.1 | k-anonymity floor numerical-singleton conflict. §34.16 / §27.11 author **k=5** (≥5 distinct bidders/Orgs) at multiple locations: §34.16.1 *… | Reconcile by authoring TWO distinct floors with rationalized purposes (defensible reading): (i) **`k_anonymity_cohort_floor_render = 5`** —… | engineering + privacy | — | S |

### Phase 9.1 (10 defects, 5 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH91-INST | 5 | D-9.1-002, D-9.1-003, D-9.1-011, + 2 | instrumentation_gap | §10, §13.11, §13.11.12, §34.16.4, — | defense_view.generation_failed_third_party_outage` declared a PostHog event on Anthropic-outage; never registered in Appendix G. | Add to the same Defense-View block created in D-9.1-001's remediation; carry `defense_view_id` (nullable; null if generation aborted before… | analytics | M21.3 | M |
| BL-P2-PH91-OBS | 2 | D-9.1-017, D-9.1-018 | observability | Appendix G, — | Per-event property contract registers property NAMES only — no types, no nullability, no descriptions. Every other Appendix G block (Billin… | Notes`. Cross-reference Appendix J for enum-bounded properties. Promote `weight`, `response_type`, `grade`, `framework_type`, `pricing_stru… | engineering | M21.3 | S |
| BL-P2-PH91-ENUM | 1 | D-9.1-009 | enum | §49.1 | Preamble registers `plan_tier_buyer` AND `plan_tier_seller` with mutual nullability rules. Several event blocks use bare `plan_tier` (KB Va… | Rename bare `plan_tier` to either `plan_tier_buyer` or `plan_tier_seller` based on console scope (KB Value Capture and §49.1 are seller-sid… | engineering | M02.3 | S |
| BL-P2-PH91-PRIV | 1 | D-9.1-021 | privacy | §31.8 | Mirror contract is silent on whether free-text webhook payload fields (`reviewer_notes_text`, `denial_reason_text`, `revocation_reason_text… | Author a §31.8 AC #16-paired clause (and a parallel Appendix G preamble paragraph) declaring: "Free-text webhook payload fields (any proper… | security | — | S |
| BL-P2-PH91-RES | 1 | D-9.1R-023 | residency / retention | §40.2 | Most §40.2 rows omit explicit `data_residency_region` partitioning. Only the recently-added rows (UsageDashboardSnapshot daily/monthly, `us… | Add a `Residency` column to the §40.2 table (or sub-row) for every entity. Default rule: row's storage partition follows owner Org's `data_… | engineering / privacy | M11.3 | S |

### Phase 37 (10 defects, 3 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH37-A11Y | 5 | D-37-010, D-37-011, D-37-012, + 2 | accessibility | §3.6, §3.6.4, §37, §37.1 | §37.1 authors text contrast (≥ 4.5:1 normal / ≥ 3:1 large) and color-not-sole-means but is silent on WCAG 1.4.11 Non-text Contrast (3:1 for… | Replace §37.1 Color Contrast row with: "Text contrast meets WCAG 2.1 AA per §3.11.3 (≥ 4.5:1 normal, ≥ 3:1 large). Non-text contrast (UI co… | engineering + design | — | M |
| BL-P2-PH37-I18N | 3 | D-37-014, D-37-017, D-37-018 | i18n | §37, §37.2 | §37.2 silent on (a) locale-resolution chain (URL `?lang=` param vs `User.locale` vs `Organization.default_locale` vs `Accept-Language` head… | Author §37.2.x "Locale Resolution Chain" sub-section: precedence `URL ?lang=` > `User.locale` > `Organization.default_locale` > `Accept-Lan… | engineering | — | S |
| BL-P2-PH37-CIGATE | 2 | D-37-016, D-37-019 | ci_gate | §37.4, §37.5 | §37.4 references "Automated accessibility audits (Axe DevTools) on every UI change (CI/CD gated)" but does not name the gate ID, runtime wi… | Name the gates explicitly: `axe_core_violation_gate` (merge-blocks on `critical` / `serious`), `wcag_aa_route_coverage_gate` (asserts every… | engineering | M02.3 | S |

### Phase 4.7 (9 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH47-AC | 2 | D-4.7-007, D-4.7-015 | acceptance_criteria | §16.10, §16.6.1 | §16.6.1 declares Predictive Suggestions output based on "Team preference patterns (org-wide)" — meaningless for a single-user Org or a Solo… | Author §16.6.X "Single-Operator Edge Cases" sub-rule: when sole Workspace member is the operator, render "your historical preferences" inst… | engineering + design | — | S |
| BL-P2-PH47-SM | 2 | D-4.7-019, D-4.7-021 | state_machine | §16.2.2, §16.8.2 | §16.8.2 declares Briefing Document `generated → archived` transition as prose only ("After 30 days: Briefing marked archived (read-only, gr… | Author Appendix L sub-table `briefing_lifecycle` with rows: `pending → generated` (Trigger: regenerate request fulfilled; Conditions: cache… | engineering | M02.3 | S |
| BL-P2-PH47-RES | 1 | D-4.7-009 | residency | §16.2.3 | §16.2.3 Perplexity Degradation Contract (added Phase 13 fix F-7.1) addresses outage but not residency-of-call. Perplexity is US-headquarter… | Extend §16.2.3 with "Residency-of-Call" sub-clause: declare per-residency Perplexity routing rule (recommend (b) for EU — suppress Perplexi… | engineering + legal | M11.3 | S |
| BL-P2-PH47-ENUM | 1 | D-4.7-017 | enum | §6.7 | §16.2.2 declares "User can regenerate briefing at any time" — implies an audit event. §16.5.3 declares "Mark Resolved" and "Escalate to Org… | Add 9 action-type enum values to Appendix J `audit_event_action_type`: `intelligence_briefing_generated`, `intelligence_briefing_regenerate… | engineering | M02.3 | S |
| BL-P2-PH47-FW | 1 | D-4.7-018 | firewall_leakage | §16.6.3 | §16.6.3 line 14280 declares "Vendor C is already contracted. Suggest excluding from this evaluation to avoid bias." The data source for "al… | Author §16.6.X "Data Source Scope" sub-section: enumerate authoritative source for each Predictive Suggestion signal (recommend Org-interna… | engineering + security | M11.3 | S |
| BL-P2-PH47-DRIFT | 1 | D-4.7-020 | consistency_drift | §34.1.1 | Appendix M.1 row line 47729: `Hidden from tier(s)` cell reads "F, St (Vendor History only on St; Full on Gr+)" — the syntax implies Free ha… | Replace Appendix M.1 line 47729 cell with "F (none), Solo (none), St (Vendor History only), Gr+ (Full) per §34.1.1" matching the line 47840… | engineering | — | S |
| BL-P2-PH47-GATE | 1 | D-4.7-022 | plan_gating | §16.2.1 | Org downgrades Enterprise → Growth (Predictive Suggestions removed). Cache "persists indefinitely" per §16.2.1. Three reads: (a) cache purg… | Author §16.X "Plan-Change Behavior" sub-section: declare cache retention rule on downgrade (recommend (b) — cache rows retained, query resu… | engineering + pricing | M11.3 | S |

### Phase 33 (9 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH33-DOC | 3 | D-33-001, D-33-002, D-33-006 | documentation_gap | §33.1, §33.5 | SOC 2 Type II named as `Targeted within 12 months of launch` with no Trust Services Criteria (CC1.x–CC9.x) control map to engineering surfa… | evidence_kind`. Promote scattered control citations (§4.6.1.1, §6.7.1, §6.8.5) to cite §33.5.A by anchor. Add `soc2_control_map_completenes… | security + engineering | — | S |
| BL-P2-PH33-AC | 2 | D-33-003, D-33-013 | acceptance_criteria | §33.6, §33.9 | §33.9 declares `Annual penetration testing by independent security firm` — cadence stated, but scope (network / web app / API / cloud / red… | Author a §33.6.A "Security Testing Cadence" sub-section enumerating: full-scope annual third-party pentest (cite scope: external network, w… | security + engineering | — | S |
| BL-P2-PH33-DRIFT | 1 | D-33-005 | consistency_drift | §33.5 | The audit-prompt check explicitly requires `Subprocessor list maintained (cite §6.8)`. A subprocessor list IS authored — but at §45.1 line… | (1) Add a §33.5.C "Subprocessor Disclosure" sub-section that cites §45.1 line 32593 as the canonical home; (2) author the DPA Appendix as a… | security + legal + engineering | — | S |
| BL-P2-PH33-NUM | 1 | D-33-010 | numerical_singleton | §33.4 | Inline `30-day response window` restated without citing §6.8.6, in violation of the explicit CI-gate contract in §6.8.6 line 10394: `Every… | Replace `30-day response window` with `30-day response window per §6.8.6 (DSAR Operational SLA — authoritative)`. Confirm `dsar_sla_single_… | engineering | — | S |
| BL-P2-PH33-MAP | 1 | D-33-012 | surface_engine_mapping | §33 | Five engine concepts in §33 lack Appendix M.1 mapping rows: IP Allowlisting (engine + UI surface at "Settings → Security"), SBOM provisioni… | Author five Appendix M.1 rows: `IP Allowlisting`, `SBOM Distribution`, `SIEM Integration`, `Customer-Managed Encryption Keys (Phase 2)`, `A… | engineering | release-orchestration | S |
| BL-P2-PH33-DATA | 1 | D-33-014 | data_model | §33.6 | IP Allowlisting introduced as a feature without a §4 entity schema, §32 API endpoint, audit-event class, Appendix C webhook, Appendix I err… | Author the IP Allowlist feature end-to-end: §4.x.NN `OrgIPAllowlistEntry` entity (fields: `id`, `org_id`, `cidr`, `label`, `created_at/by`,… | engineering | M02.3 | S |

### Phase 4.3 (9 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH43-AC | 3 | D-4.3-013, D-4.3-019, D-4.3-024 | acceptance_criteria | §12.2, §12.9, §49 | §12.9 ACs are checkbox-style bullets without observable inputs / measurable thresholds / scope qualifiers. Mirrors D-4.6-022 / D-4.7-015 /… | Convert §12.9 to numbered observable ACs per the §13.10 / §14.9 / §17.8 / §20.7 baseline. Each AC: Given X, when Y, then Z within threshold… | engineering + QA | — | S |
| BL-P2-PH43-DOC | 2 | D-4.3-020, D-4.3-025 | documentation_gap | §12.5.1, §12.7.2 | The dedup pipeline cites "embedding-based comparison" without naming the embedding provider. Anthropic does not currently publish a first-p… | Name Voyage AI explicitly in §12.5.1 (or whichever embedding provider is contractually selected); register the `dedup_classifier` capabilit… | engineering | — | S |
| BL-P2-PH43-GLOSS | 1 | D-4.3-005 | glossary | §12 | "Policy Ingestion", "Framework Detection", "Control Extraction", "Semantic Deduplication", "Traceability Mapping", "Amendment Protocol", "C… | Author 9 Appendix K entries as a Phase-4.3 cluster: each entry includes a one-paragraph definition, a §12.X anchor cross-reference, related… | engineering | — | S |
| BL-P2-PH43-NUM | 1 | D-4.3-017 | numerical_singleton | §12.7.2 | Inline numerics: 7-day review deadline (§12.7.2 line 12870); ≥5 amendments batch threshold (§12.7.3 line 12875); inline page caps repeated… | 5`. Replace §12.7.2 / §12.7.3 inline values with anchor citations. | engineering | — | S |
| BL-P2-PH43-FW | 1 | D-4.3-022 | firewall_leakage | §12 | §12 silent on buyer-console scope. §4.7.1 Console Bridge carry list does not enumerate `policy_*` (correct — policy uploads are buyer-inter… | Add §12.X "Console Firewall Behavior" sub-section: explicitly assert §1.3 buyer-only scope; declare seller-console session HTTP 404 on ever… | engineering + security | M11.3 | S |
| BL-P2-PH43-MOB | 1 | D-4.3-023 | mobile_divergence | §12 | §12 silent on §38 cross-reference; §38 grep returns no Policy Ingestion row. Upload modal mobile parity, dedup review modal on small viewpo… | Add §38.X row "Policy Ingestion (§12)" with mobile parity declarations: upload modal `not_supported` (file-picker UX gap on mobile is accep… | engineering + design | — | S |

### Phase 44 (9 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH44-AC | 3 | D-44-009, D-44-010, D-44-018 | acceptance_criteria | §44.6.3, §44.6.7, §44.6.8 | AC #1 prescribes "DOM snapshot check excluding the suppressed selector set"; the selector set is never enumerated in §44.6, UX §8.1.2, or A… | Add §44.6.1.1 "Suppressed Selector Set" enumerating CSS selectors for each of the 10 §44.6.1 hide-list items (e.g., `[data-component="AIWal… | engineering | — | S |
| BL-P2-PH44-PERF | 1 | D-44-004 | performance_budget | §44.4 | §44.4 "Target p95 < 1s" under 500 concurrent users conflicts with §44.1 API Response Latency `p95 < 500ms`; the two are inconsistent with n… | Re-author §44.4 to declare load-test targets in terms of §44.1 budgets: "monthly load-test asserts §44.1 p95 budgets hold under 500 concurr… | engineering | — | S |
| BL-P2-PH44-PH | 1 | D-44-011 | posthog_event | §44.6.5 | The four §44.6.5 events declare their property schemas unevenly; only `solo.envelope.exhausted` carries an explicit 5-property list. `solo.… | Author a single §44.6.5.1 sub-section "Telemetry Event Property Schema" with one row per event × property; ensure each of the four events d… | engineering + analytics | M21.3 | S |
| BL-P2-PH44-MOB | 1 | D-44-014 | mobile_divergence | §44 | §44 declares zero mobile-specific performance budgets; §3.4 establishes mobile translation of the Linear Constraint but §44 does not bind m… | Author §44.1.1 "Mobile Performance Budgets" with per-network-quality rows (4G / 3G / Slow-3G targets); cite §3.4 / §38.4 / §38.8 as parent… | engineering + design | — | S |
| BL-P2-PH44-HOOK | 1 | D-44-015 | webhook | §44.6.5 | The four §44.6.5 events declare HMAC / idempotency / backoff / DLQ but no per-event rate-limit class binding; D-V8.3-003 already flagged th… | Author the §44.6.5 Appendix C / Appendix G sub-sections (close D-V8.3-003); declare each of the four events' rate-limit class explicitly at… | engineering | M02.3 | S |
| BL-P2-PH44-DATA | 1 | D-44-019 | data_model | §44.6.4 | effective_charge_cents = 0` is overloaded — a suppressed-because-throttled invocation and a standard Solo absorbed-by-engine invocation bot… | Author a 3-value enum `solo_aiop_disposition` on §4.8.1 AIOperation (`absorbed_by_envelope` / `suppressed_by_throttle` / `engine_absorbed_n… | engineering | M02.3 | S |
| BL-P2-PH44-AE | 1 | D-44-020 | authored_extension | §44.6.3 | §44.6 cites AE rows in prose ("Authored Extension — Phase 14.10; flagged in `_integration/RECONCILIATION.md`") at six prose points without… | Add inline `(AE-14.10-NN)` citation to each §44.6 AE callout: `surface_throttling_class` field cites `(AE-14.10-01)`; `solo_envelope_overri… | documentation + engineering | release-orchestration | S |

### Phase 51 (9 defects, 8 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH51-NUM | 2 | D-51-016, D-51-017 | numerical_singleton | §51.1.6, §51.3.7 | Export size ceilings (50 MB / 20 MB / 50 MB) are registered inline in §51 ACs without a §39 canonical row. §39 Object Size Constraints is t… | Add 3 rows to §39 Object Size Constraints: `usage_dashboard_org_export_max_bytes` = 50 MB (cite per-tier exceptions if Enterprise is uncapp… | engineering | — | S |
| BL-P2-PH51-ENUM | 1 | D-51-014 | enum | §51 | viewer_role` enum drift between Appendix G §51 additions registration and §51.3.1 access table. Appendix G registers `viewer_role ∈ {org_ow… | Reconcile to one model. Recommended: §51.3.1 is correct; Appendix G enum should be `viewer_role ∈ {org_owner, billing_admin, org_admin, pub… | engineering | M02.3 | S |
| BL-P2-PH51-PERF | 1 | D-51-015 | performance_budget | §51.3.7 | §51 inline performance budgets (1.5s dashboard first-load p95; 3.0s live-augmentation p95; 1.5s self-view first-paint p95; 300ms regression… | < 1.5s". Replace §51 inline values with `See §44.1 row {…}`. | engineering | — | S |
| BL-P2-PH51-PH | 1 | D-51-018 | posthog_event | §51.2.5 | usage_event_residency_mismatch` is named in §51.2.5 / §51.2.6 AC-7 as both an HTTP error code AND a paging alarm (`pages Ops observability`… | Either (a) register `usage_event_residency_mismatch` in Appendix G with full Trigger / Key Properties (paired with `usage_envelope_violatio… | engineering | M21.3 | S |
| BL-P2-PH51-AE | 1 | D-51-019 | authored_extension | §51.3.7 | usage_analytics_per_user_disclosure_viewed` AuditEvent action referenced by 4 §51 ACs is registered in §51.8.4 Authored Extension #10 ("Ext… | File AE ledger rows in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` for every §51.8.4 Authored Extension entry (11 total): AE-51-01 through… | ops + security | release-orchestration | S |
| BL-P2-PH51-OBS | 1 | D-51-021 | observability | §51.1 | §51 names 7 Sourcera-internal `analytics_meta`-family meta-events as observability signals but does not register Datadog metrics, SLO names… | Add §51.8.5 (new subsection) "Observability & Paging" registering: (a) Datadog service name `analytics-meta`; (b) per-meta-event Datadog mo… | engineering + ops | M21.3 | S |
| BL-P2-PH51-EDGE | 1 | D-51-022 | edge_case | §51.6.5 | §51 is silent on three third-party-outage failure modes required by audit-prompt §14 edge-case discipline: (a) PostHog ingest outage → outb… | Add 3 failure-mode entries to §51.6.5 (or new §51.8.5 third-party-outage block): FM6 PostHog ingest outage (mitigation: snapshot rendering… | engineering + ops | — | S |
| BL-P2-PH51-MOB | 1 | D-51-023 | mobile_divergence | §51.3.1 | §51.3.1 carries a single sentence on mobile ("Mobile surface is read-only with a condensed layout per §38 Responsive Design; mobile exports… | Add a "Device posture" paragraph to §51.4.1, §51.5.1, §51.6.3 mirroring §51.3.1: mobile read-only, condensed layout per §38, exports blocke… | engineering + design | — | S |

### Phase 12 (8 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH12-DRIFT | 2 | D-12-014, D-12-020 | consistency_drift | §12.4.2, §12.5.1 | §12.4.2 declares per-Anthropic-call retry as "up to 3x with exponential backoff (2s, 4s, 8s); if all fail, error toast". §31 / Appendix F (… | Disambiguate: (a) §12.4.2 retry curve governs synchronous Anthropic API retries inside the extraction worker — author this as the canonical… | engineering | — | S |
| BL-P2-PH12-OBS | 1 | D-12-008 | observability | §12.3.1 | §12 declares four Anthropic API calls (Opus framework inference, Opus full-document extraction, Haiku embedding-based dedup, Sonnet traceab… | Author §12.x.N "Observability & Resilience" sub-section: (a) per-stage SLO (e.g., framework inference p95 ≤ 30s on first 30 pages; extracti… | engineering + analytics | M21.3 | S |
| BL-P2-PH12-INST | 1 | D-12-015 | instrumentation_gap | §31 | Appendix G has 4 PostHog events (`policy_ingestion_started` / `_completed` / `_accepted` / `_failed` at lines 41954–41957) and Appendix C h… | (i) Rename Appendix C entry `policy_ingestion_complete` → `policy_ingestion_completed` to match Appendix G; (ii) author per-stage PostHog e… | engineering + analytics | M21.3 | S |
| BL-P2-PH12-EDGE | 1 | D-12-016 | edge_case_silence | §12.3 | §12 carries no statement on adversarial input handling for uploaded PDFs / DOCX. A Policy document containing prompt-injection text in `raw… | Author §12.x.N "Adversarial Input & Prompt-Injection Defense": (a) all uploaded PolicyDocument text routed through the §21.3 prompt-injecti… | security + engineering | — | S |
| BL-P2-PH12-ENUM | 1 | D-12-017 | enum | §12.3.1 | §12 inline-declares multiple numerical singletons that govern engine behavior: framework-confidence `≥0.80 accept` / `0.60–0.79 low_confide… | 100000`. Update §12.3.1 / §12.4.2 / §12.5.1 inline citations to `per §39`. | engineering | M02.3 | S |
| BL-P2-PH12-API | 1 | D-12-019 | api | §12.4.1 | §12 declares no idempotency keys for any of its mutation paths: (a) re-uploading the same PolicyDocument (§12.4.2 token-limit re-upload cas… | Author idempotency on each mutation: (a) PolicyDocument upload — `Idempotency-Key` header required, dedupe at the (org_id, idempotency_key)… | engineering | M02.3 | S |
| BL-P2-PH12-MOB | 1 | D-12-021 | mobile_divergence | §12 | Appendix M (mobile-parity rows lines 30864–30866) authoritatively declares: `Policy Ingestion — Upload | Author §12.x.N "Mobile Behavior": (a) mobile (≤768px) supports Upload step only; (b) at the Confirmation Modal / Dedup Modal / Batch Amendm… | design + engineering | — | S |

### Phase 1.6 (7 defects, 6 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH16-DOC | 2 | D-1.6-009, D-1.6-010 | documentation_gap | §4.7.1, §4.7.2 | The `qa_thread_post_appended` event kind carries `attachments_urls` (Convex Storage signed URLs). The redaction validator confirms structur… | Either (a) extend the §12.7 Amendment Content Classifier to cover Q&A post attachments under the `qa_thread_post_appended` event kind: clas… | security + engineering | — | S |
| BL-P2-PH16-DRIFT | 1 | D-1.6-005 | consistency_drift | §4.7.2 | §4.7.2 line 7524 declares the inline `cascade_status` enum as `pending, in_progress, complete, failed`. Appendix J `vendor_disqualification… | See Appendix J vendor_disqualification_cascade_status: pending, in_progress, complete, partial_failure`. Add CI gate `appendix_j_body_redun… | engineering | — | S |
| BL-P2-PH16-MAP | 1 | D-1.6-006 | surface_engine_mapping | §25.2.3 | Appendix M.1 row 103 declares Console Bridge Event "No surface — manifests as 'Syncing…' indicator + 'Buyer added a new requirement' inbox… | (a) Update row 103 to qualify "Internal-only, never surfaced" with "except the Bridge Health panel (buyer side, redacted) and Sync Health p… | design + engineering | release-orchestration | S |
| BL-P2-PH16-API | 1 | D-1.6-007 | api | §32 | §32 contains no Console Bridge Event read endpoint. The §25.2.3 Bridge Health panel and Sync Health panel must read events to render `pendi… | Author §32 sub-section "Console Bridge Event API" with the full §32-convention contract for both buyer and seller read endpoints, including… | engineering | M02.3 | S |
| BL-P2-PH16-SM | 1 | D-1.6-008 | state_machine | §4.7.1 | The Console Bridge Event state machine permits two paths into `pending`: (1) initial emit from buyer-side mutation handler, and (2) Ops man… | Author an explicit row in §4.7.1 Conflict Resolution: "Ops re-drive from `dlq` is atomic — the re-drive transition `dlq → pending` and any… | engineering | M02.3 | S |
| BL-P2-PH16-ENUM | 1 | D-1.6-011 | enum | §4.7.1 | Two inline enum declarations in §4.7.1 / §4.7.2 violate Convention #3 (every enum value used in §4–§51 is registered in Appendix J). (1) `s… | Add Appendix J registrations: `console_bridge_event_source_entity_type` (binding to §4.7.1) with the eight values; `vendor_disqualification… | engineering | M02.3 | S |

### Phase 3.1 (7 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH31-RBAC | 7 | D-3.1-002, D-3.1-009, D-3.1-010, + 4 | rbac | §5.1, §5.10, §5.4, §5.9 | §5.1 silent on cross-console role-overlay semantics. A user holding `workspace_owner` (Buyer Console) and a seller-side role (e.g., `seller… | Extend the §5.1 Role-Overlay Semantics sub-section (per D-3.1-001 recommendation) with an explicit clause: "A user holding both buyer-conso… | engineering | M11.3 | M |

### Phase CONS (7 defects, 3 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHCONS-AC | 4 | D-CONS-015, D-CONS-016, D-CONS-017, + 1 | acceptance_criteria | §34.10.4, §34.11.4, §34.2.5, §34.5 | Auto-topup per-period frequency cap missing. §4.8.3 has retry curve `1s, 5s, 30s, 2m, 10m; DLQ at attempt 5` — that's per-trigger retry. Th… | Add §4.8.3 fields `auto_topup_max_daily_count` (default 5) and `auto_topup_consumed_daily_count`. Add error code `wallet_topup_daily_freque… | engineering | — | M |
| BL-P2-PHCONS-DOC | 2 | D-CONS-003, D-CONS-014 | documentation_gap | §4.8.1, — | Compound classes appear in the long tail (e.g., `data_model / residency`, `data_model / acceptance_criteria / state_machine / retention / d… | For each compound-class row, choose the primary class that accounts for ≥ 80% of the defect's substance, drop the compound, and re-link the… | audit | — | S |
| BL-P2-PHCONS-OBS | 1 | D-CONS-019 | observability | §34.11 | Outcome Resolver outage / pending-backlog handling unspecified. §34.11.4 AC #1: "Every AIOperation MUST receive a settlement decision withi… | Author §34.11.5 "Outcome Resolver Liveness & Backlog Handling": (a) Resolver polling cadence — auto-accept timer fires via DB-trigger-backe… | engineering + analytics | M21.3 | S |

### Phase 5.7 (7 defects, 7 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH57-DRIFT | 1 | D-5.7-012 | consistency_drift | §49.1.6 | §49.1.6 step 1 self-acknowledges that `stage_5_stake_reveal_rendered_at` (named `stage_5_*` per §4.4.22 historical column-naming) is writte… | Update §4.4.22 line 6191 NOTES column to: `The Stake-Reveal Screen rendered. **Column name is `stage_5_*` for schema-stability (preserved f… | engineering | — | S |
| BL-P2-PH57-AE | 1 | D-5.7-013 | authored_extension | §49.1.7 | §49.1.7 introduces `win_loss_insight_synthesis` capability ("Authored Extension — new capability at §21.4, flagged in reconciliation log").… | Register `win_loss_insight_synthesis` in §21.4.2 with: capability_id, model_tier (Sonnet recommended), value_price ($), cost_price ($), rat… | engineering + pricing | release-orchestration | S |
| BL-P2-PH57-I18N | 1 | D-5.7-014 | i18n | §49.1.5 | Currency formatting and locale-aware display contracts are not specified. §49.1.6 step 2 computes `Y_value_priced_cents_accumulated` and di… | Add §49.1.x "Currency & Locale Formatting" sub-section: Stake-Reveal `Y_value_priced_cents_accumulated` displays in the seller's `data_resi… | engineering + design | — | S |
| BL-P2-PH57-HOOK | 1 | D-5.7-017 | webhook | §49.1 | §49.1 telemetry tables emit ~16 onboarding events (`seller_onboarding_stage_entered` × 7, `seller_first_requirement_response`, `seller_firs… | Author §49.1.x "External Webhook Surface" sub-section that registers `seller.onboarding.activated` (terminal milestone), `seller.onboarding… | engineering + analytics | M02.3 | S |
| BL-P2-PH57-MOB | 1 | D-5.7-018 | mobile_divergence | §49.1.10 | AC 15 covers landing page, progress-storytelling, and Stake-Reveal mobile parity. **Omits**: Stage 5 in-Workspace Review (per-requirement c… | Extend §49.1.10 AC 15 to include: **Stage 5 in-Workspace Review** mobile parity (per-requirement card touch-targets ≥ 44×44pt per §38; acce… | design + engineering | — | S |
| BL-P2-PH57-ERR | 1 | D-5.7-019 | error_code | §49.1.9 | §49.1.9 D-AP2 / D-AP3 / D-AP4 / D-AP6 detector tables reference HTTP 4xx response codes with semantic names (`onboarding_anti_pattern_viola… | Audit Appendix I for the four AP-violation HTTP error codes (`onboarding_anti_pattern_violation_ap1` through `_ap6`) and add any missing ro… | engineering | — | S |
| BL-P2-PH57-CIGATE | 1 | D-5.7-020 | ci_gate | §49.1.9 | §49.1.9 D-AP3 detector contract hardcodes the banned-phrase regex catalog inline: `"Only \d+ days? left"`, `"Limited time offer"`, countdow… | Register `dark_pattern_banned_phrase_regex` controlled vocabulary in Appendix J as an Ops-editable list (per §50.10 Taxonomy CMS pattern).… | engineering + ops | M02.3 | S |

### Phase PT (7 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHPT-DOC | 7 | D-PT-003, D-PT-004, D-PT-005, + 4 | documentation_gap | §34.1.1, §34.1.2, §34.2.5 | §34.2.5 Seller per-bid orchestration silent on the "New $199 bid resets the 90-day KB-persistence clock" provision present in SPS v3 §5.4.… | . Add corresponding QA test `solo_seller_per_bid_kb_persistence_clock_reset_on_new_charge`. | pricing + engineering | — | M |

### Phase 48.3 (7 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH483-NET | 4 | D-48.3-006, D-48.3-007, D-48.3-013, + 1 | network_effect_gap | §48.3, §48.3.2, §48.3.5 | §48.3.5 S3 row's secondary signal `s3_kb_entry_confidence_distribution_curve_per_seller_org` is described as "(signal: how peaky is the con… | Either (a) reduce the signal to a scalar with explicit definition (e.g., "kurtosis of confidence-score distribution after ≥ 10 bid closes"… | analytics | — | M |
| BL-P2-PH483-DRIFT | 1 | D-48.3-003 | consistency_drift | §48.3.2 | §48.3.2 effect #5 ("Certificates and shares compound trust") signal-source column cites stale "registered placeholder" entity refs for both… | Replace the §48.3.2 effect #5 "Source" column for both rows with explicit canonical refs: row 1 → "§4.5.x PublicSelectionReport entity (`sh… | engineering | — | S |
| BL-P2-PH483-AC | 1 | D-48.3-004 | acceptance_criteria | §48.3.4 | §48.3.4 AC #1 hardcodes the literal "twelve" against §48.3.2's signal table; the §48.3.5 expansion adds 7 primary signals + ~12 secondary/t… | Replace "All twelve §48.3.2 signals" with "All §48.3.2 platform-level signals AND all §48.3.5 seller-side loop signals (primary AND seconda… | engineering | — | S |
| BL-P2-PH483-AE | 1 | D-48.3-011 | authored_extension | §48.3.5 | Two §48.3.5 inline "Authored Extension" flags lack corresponding rows in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`. (a) Line 34739 "S4 G… | File two AE-ledger rows: (i) AE-48.3-01 "§48.3.5 S4 Gartner / G2 Baseline Refresh Cadence" — owner Ops Growth, ratification target v7.1.1 s… | analytics + ops | release-orchestration | S |

### Phase 34.PXC (6 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH34PXC-DOC | 6 | D-PXC-002, D-PXC-006, D-PXC-007, + 3 | documentation_gap | §34.1.2, §34.14.1, §34.17.1, §34.18.6, §34.2.3 | §34.1.2 "Direct Invite from Cohort (§27.9.8)" cell cites "SPS §3 / §7" but SPS v3 §7 (Seller Growth) and §8 (Seller Scale) do not document… | Replace "SPS §3 / §7" with either (a) "Master Spec §27.9.8 (canonical; not in SPS narrative)" or (b) author SPS v3 §8 (Seller Scale) to add… | pricing | — | M |

### Phase 34.19 (6 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH3419-DOC | 2 | D-34.19-013, D-34.19-014 | documentation_gap | §22.3.1, §4.4.4 | The §22.3.x KB entity retention blocks do not cross-reference §34.19's plan-upgrade carry-over guarantee. §22.3.1 retention reads "Lives fo… | Add a "Plan Carry-Over" line to each §22.3.x retention block: "Subject to §34.19.1 Class 1 (KB entries) [or Class 2 for confidence_score /… | engineering | — | S |
| BL-P2-PH3419-SM | 2 | D-34.19-015, D-34.19-016 | state_machine | §22.4.4, §34.5.1 | §22.4.4 Namespace Migration applies a `confidence_modifier × 0.7` rank penalty (clamped ≥ 0.1) to migrated KBEntries on `SellerSoftware` so… | Add to §34.19.6 a new failure mode: "SellerSoftware soft-delete during downgrade preservation window. Resolved: namespace-migration rank pe… | engineering | M02.3 | S |
| BL-P2-PH3419-AC | 1 | D-34.19-011 | acceptance_criteria | §34.20.16 | §34.20.16 AC #79 ("Honest-portability microcopy MUST appear on every upgrade AND downgrade confirmation UI; content-QA test `plan_transitio… | Tighten AC #79: "Honest-portability microcopy MUST appear on every upgrade AND downgrade confirmation UI per §34.19.4. Content-QA test `pla… | engineering + design | — | S |
| BL-P2-PH3419-DRIFT | 1 | D-34.19-012 | consistency_drift | §34.6.5 | §34.6.5 "Entities NEVER Subject to Downgrade Enforcement" lists 7 categories (Seats/Members, Published Seller Profile, Audit log, Billing/A… | Author a §34.19.1.B (or new top-level §34.6.A) "Composite Preservation Catalog" merging the §34.6.5 always-preserved set and the §34.19.1 1… | engineering | — | S |

### Phase 14.1 (6 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH141-DRIFT | 6 | D-14.1-004, D-14.1-005, D-14.1-006, + 3 | consistency_drift | §13.11, §34.18.5, §44.6.1, §44.6.4 | BPS v3 §11 publishes the Solo-tier silent-throttle event-rate target as a margin-protection signal: "Solo-tier silent-throttle event rate (… | > 5% = capability-registry envelope-override review per §44.6.3" with action on breach. Source the underlying metric from `solo.envelope.th… | analytics | — | M |

### Phase 1.7 (5 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH17-DATA | 3 | D-1.7-008, D-1.7-009, D-1.7-016 | data_model | §4.8.1, §4.8.3, §4.8.7 | auto_accept_after_seconds` on AIOperation (line 7664) constraint is "Integer | ≥ 60; ≤ 7776000 — mirrors §4.8.4 source field". Add Failure Mode entry: "OutcomeContract pre-publish race produces `auto_accept_after_secon… | engineering | M02.3 | S |
| BL-P2-PH17-AC | 2 | D-1.7-010, D-1.7-011 | acceptance_criteria | §4.8.1, §4.8.3 | AIWallet field `auto_topup_max_monthly_value_dollars` carries the constraint `≥ 5000; ≤ 50000000` (i.e., $50–$500K in cents). Appendix I er… | Add §4.8.3 AC #11: "`auto_topup_max_monthly_value_dollars` MUST be ≥ $50 and ≤ $500,000; values outside this range MUST be rejected with HT… | engineering | — | S |

### Phase 6.1 (5 defects, 5 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH61-FW | 1 | D-6.1-015 | firewall_leakage | §4.7.1 | source_entity_version` exposed full to seller leaks buyer-internal authoring history (e.g., version=47 reveals 47 amendments). Materializat… | Replace `source_entity_version` on the seller projection with an opaque `bridge_source_handle_token = HMAC(source_entity_id, source_entity_… | engineering | M11.3 | S |
| BL-P2-PH61-API | 1 | D-6.1-016 | api | §4.7.2 | vendor_disqualification_global_ban_requires_dual_signoff` HTTP 403 is conventionally HTTP 422 per §32 input-validation conventions: dual-si… | Audit and split: keep current `vendor_disqualification_global_ban_role_forbidden` (403) for "caller is not in `ops_leadership` group"; add… | engineering | M02.3 | S |
| BL-P2-PH61-OBS | 1 | D-6.1-017 | observability | §4.7.1 | Routine bridge state transitions (`pending → synced`, `pending → retrying`, `retrying → dlq`, `*→superseded`, `dlq → pending` re-drive) do… | Author §4.7.1.2 "AuditEvent Emission per Bridge Transition" enumerating per-transition audit-event-action types (`bridge_event_emitted`, `b… | engineering | M21.3 | S |
| BL-P2-PH61-ENUM | 1 | D-6.1-019 | enum | §25.3.10 | disqualification.notification_failed` `failure_reason` enum (`loops_5xx_exhausted`, `template_variable_missing`, `recipient_suppressed`, `s… | Register Appendix J `disqualification_notification_failure_reason`: `loops_5xx_exhausted`, `template_variable_missing`, `recipient_suppress… | engineering | M02.3 | S |
| BL-P2-PH61-MOB | 1 | D-6.1-020 | mobile_divergence | §25.2.3 | Mobile parity unstated for Bridge Health / Sync Health panels (§25.2.3) and reversal banner (§25.3.8). §25.3.7 explicitly handles disqualif… | Add mobile-parity rows to §25.2.3 (Bridge Health / Sync Health: parity-collapsed on mobile per §38; full DLQ table via deep link) and §25.3… | design + engineering | — | S |

### Phase EM (5 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHEM-AC | 2 | D-EM-012, D-EM-015 | acceptance_criteria | §34.8.5, §34.8.7 | Plan-tier columns contain prose annotations that contaminate the enum value. Examples: `verification_fetch` Seller cell (line 29241) = "`se… | (1) Strip parentheticals from Plan Tier cells. (2) Where multiple plan tiers apply per cell (e.g., `api_add_on` Seller side has different a… | engineering + ops | — | S |
| BL-P2-PHEM-DOC | 1 | D-EM-016 | documentation_gap | §34.8.5 | scenario_modeling` row in §34.8.5 is `enforcement_mode=hard`, `gated_at_plan_minimum=buyer_free`. But §34.1.1 cell **AI Budget** narrative… | Either (a) add a `solo_envelope_treatment` column to §34.8.5 documenting Solo engine-absorbed behavior per row (mirroring §4.8.2 `surface_t… | engineering | — | S |
| BL-P2-PHEM-ENT | 1 | D-EM-017 | entitlement | §34.8.5 | Two rows in §34.8.5 — `bid_workspace_respond` (line 29214), `seller_profile_publish` (line 29215) — are described as "free forever (SPS §1)… | Remove both rows from §34.8.5. Document the "free forever" contract for Bid Workspace and Seller Profile in §22 / §23 / §27 narrative, with… | engineering | M11.3 | S |
| BL-P2-PHEM-MAP | 1 | D-EM-019 | surface_engine_mapping | §44.6.1 | §44.6.1 enumerates 10 plan-gated surfaces hidden on Solo (AIWallet widget, wallet-overage UI, auto-topup UI, per-capability rate card, per-… | Document the §34.8.5 vs §5.11 scope split explicitly (per D-EM-006 disposition). Author §5.11 sub-table "Solo-Tier Surface Hides" cross-lin… | engineering | release-orchestration | S |

### Phase HM (5 defects, 4 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHHM-AC | 2 | D-HM-010, D-HM-015 | acceptance_criteria | §22.18.6.1, §49.1.5 | Three of the four Stake-Reveal Moments and all three Conversion Moments lack metric targets. Only the §48.8.5 Hero Moment Stake-Reveal Scre… | Author per-Moment SLOs: Moment 1 = view rate ≥ 95% of Free-tier Seller Panel renders (asserted via `stake_reveal_rendered` count vs `seller… | analytics | — | S |
| BL-P2-PHHM-GATE | 1 | D-HM-011 | plan_gating | §22.20 | The Buyer-Funded Pro Trial Seat (M17) inheritance of the Hero Moment Solo-tier surface compression is not fully specified. §22.20 Plan-tier… | Author a §22.20 / §48.8 reconciliation paragraph naming the precedence: during the Pro Trial Seat 30-day trial window, surface rendering =… | engineering + pricing | M11.3 | S |
| BL-P2-PHHM-PH | 1 | D-HM-012 | posthog_event | §49.1.5 | The activation-metric event has two canonical names: `seller_first_requirement_response` (§49.1.5, "canonical short form") and `seller_onbo… | Pick one canonical name. Recommended: `seller_onboarding_first_requirement_response` (matches the §48.8.4 / §4.4.22 column-name convention… | engineering | M21.3 | S |
| BL-P2-PHHM-DRIFT | 1 | D-HM-014 | consistency_drift | §46 | §46 Test Strategy table at line 33633 binds the Pulse / Pulse Health Score / Pulse Digest test family to "Hero Moment `hero_moment_complete… | Resolve ambiguity. If (a) drift: replace with the actual Pulse latency target from §44.1 (Pulse render p95 budget). If (b) implicit buyer H… | engineering | — | S |

### Phase 14.2 (5 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH142-DRIFT | 5 | D-14.2-006, D-14.2-007, D-14.2-008, + 2 | consistency_drift | §34.13.4, §34.6, §44.6.1, §48.1.6, §49.1.7 | SPS v3 §15.5 enumerates 14 distinct leading indicators trackable solo by founder. §48.1.6 has 8 leading + 2 Quality-Signal indicators; 8 of… | Add to §48.1.6 leading-indicators table (or §34.18.5 scorecard or both per the dashboard map at §48.1.6 closing paragraph) the 6 missing se… | engineering | — | M |

### Phase AE (5 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHAE-AE | 3 | D-AE-008, D-AE-009, D-AE-012 | authored_extension | §16, — | AE-12.4-DEF-02 ("§32.4 API-call quota Authored Extension ratification (separate from AE-12.4-01)") duplicates AE-12.4-01 with no documented… | Either (a) supersede AE-12.4-DEF-02 by AE-12.4-01 with a clarifying note ("AE-12.4-DEF-02 was authored as a Phase 12.5 follow-on tracker bu… | engineering | release-orchestration | S |
| BL-P2-PHAE-DOC | 2 | D-AE-003, D-AE-005 | documentation_gap | — | Ledger row format folds `originating_phase`, `evidence`, and `landing_location` into a single "Source artifact" column. The conflation degr… | Split the single "Source artifact" column into `originating_phase` (e.g., `Phase 12.3`), `evidence` (the verification log or defect ID that… | engineering | — | S |

### Phase V711 (5 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHV711-DOC | 4 | D-V711-005, D-V711-011, D-V711-012, + 1 | documentation_gap | Appendix G, — | RECONCILIATION P2-6 "Master Summary in Phase 14.19 Read-First list" is moot post-Phase 14.20 closeout. Master Summary was retired in v7.0.0… | Close RECONCILIATION P2-6 with a `superseded` marker referencing Phase 14.20 closeout entry: "**P2-6** — superseded 2026-04-28 by Phase 14.… | documentation | — | M |
| BL-P2-PHV711-DRIFT | 1 | D-V711-004 | consistency_drift | — | RECONCILIATION P2-5 "GTM_90DAY_SPRINT scope clarification" duplicates AE-14.0.1-01 (formal descope of GTM_POSITIONING.md / GTM_PLG_ARCHITEC… | Close RECONCILIATION P2-5 with a `superseded` marker referencing AE-14.0.1-01: "**P2-5** — superseded by AE-14.0.1-01 (`pending` Founder +… | documentation | — | S |

### Phase V14 (5 defects, 3 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHV14-DOC | 2 | D-V14-001, D-V14-003 | documentation_gap | — | Phase 14.4 (UX Design v2 ↔ Master Spec) audit ran and deposited findings into `CONSISTENCY_DELTA.md → "UX Design v2"` block + `DEFECT_LEDGE… | Author `_audit/PHASE14.4_FINDINGS.md` retroactively. Pattern: replicate 14.1 / 14.2 / 14.3 structure — Walk Methodology / Pre-Existing Defe… | audit | — | S |
| BL-P2-PHV14-DRIFT | 2 | D-V14-005, D-V14-007 | consistency_drift | §4.8.3, — | The AIWallet entity carries fields named `*_value_dollars` but stored as Integer cents (per §4.8.3 narrative: "Monthly included budget in i… | Either (a) rename `*_value_dollars` fields on AIWallet (and any sibling entities) to `*_value_cents` to align with §44.4.5 `*_usd_cents` co… | engineering | — | S |
| BL-P2-PHV14-NUM | 1 | D-V14-006 | numerical_singleton | §4.8.3 | The auto-topup `$500K` hard cap (`50000000` cents) is restated at 3 separate surfaces: (a) §4.8.3 L8402 entity field constraint `≤ 50000000… | Coordinate D-DEC-008 remediation across all 3 surfaces. Pattern: (a) §4.8.3 authors the override-aware constraint ("≤ 50000000 default; ≤ 2… | engineering | — | S |

### Phase DEC (4 defects, 3 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHDEC-DOC | 2 | D-DEC-009, D-DEC-011 | documentation_gap | §22.13.1, §22.16.7 | E-8 (SOFT BLOCKER for MCP server deployment config) recommendation is **partially implemented**. Spec at §22.13.1 line 18282 documents "60… | Author conservative-launch posture at §22.13.1: "Initial deployment targets: 30 rps sustained / 60 rps burst per `mcp.sourcera.com` server.… | engineering | — | S |
| BL-P2-PHDEC-AC | 1 | D-DEC-006 | acceptance_criteria | §50 | C-4 (NON-BLOCKING) recommendation guardrails for the Ops override on Pro Trial Seat allocation are **partially implemented**. The role gate… | Add 3 ACs to §50 / §38468 endpoint: AC-N1 "`expires_at` MUST be ≤ `now + 90 days`; over-window writes rejected with HTTP 422 `pro_trial_sea… | engineering + sales-ops | — | S |
| BL-P2-PHDEC-NUM | 1 | D-DEC-010 | numerical_singleton | §4.8.6 | F-1 (NON-BLOCKING) recommendation to adjust the auto-apply floor from 5% to 7% (anti-noise) is **not implemented**. Spec retains the 5/10/2… | Two paths: (a) **Adopt the F-1 recommendation** — re-author Appendix J `cost_base_recalc_drift_severity` enum cut points from 5/10/25 to 7/… | finance + engineering | — | S |

### Phase 1 (3 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH1-DRIFT | 2 | D-AS-007, D-AS-011 | consistency_drift | Appendix H, §34.14.1 | Appendix H still emits the v6.0.0 3-tier Stripe model: `sourcera-business` $499/month (annual) / $599/month (monthly); `sourcera_api_calls`… | Replace Appendix H tables with a redirect block: each row contains only the SKU id and a "see §34.x.y" pointer, no inline pricing or rate.… | engineering | — | S |
| BL-P2-PH1-DOC | 1 | D-1V2-003 | documentation_gap | §11.5 | The V1 §11.5 sign-off table reads "Final V1 verdict: PASS — sign-off granted" but the `AUDIT_README.md` run-log entry qualifies the verdict… | Append `[SUPERSEDED 2026-04-30 — Phase-1 sign-off rescinded by V1.2; see PHASE1_VERIFY.md §12.6]` to V1 §11.5 final-verdict block. Append t… | documentation | — | S |

### Phase 1.1 (3 defects, 3 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH11-GLOSS | 1 | D-1.1-016 | glossary | Appendix K | Per Authoring Convention #4 (Phase 12.3 amendment), every term used across more than one section appears in Appendix K. The four foundation… | Add four glossary entries to Appendix K under a new "### Foundational Org/Auth Terms (§4.2)" sub-section: **Organization** (the top-level S… | engineering | — | S |
| BL-P2-PH11-DATA | 1 | D-1.1-020 | data_model | §4.2.3 | role_context` is declared as `JSON \ | Either (a) drop `role_context` and require consumers to read Org Membership / Workspace Membership directly (recommended — denormalized JSO… | engineering | M02.3 | S |
| BL-P2-PH11-ENUM | 1 | D-1.1-021 | enum | — | seller`) is not registered in Appendix J as a foundational discriminator | Author Appendix J `### console (§4 per-entity scope discriminator)`: `buyer`, `seller`. Notes: "Per-entity scope discriminator on every con… | engineering | M02.3 | S |

### Phase 1.5 (2 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH15-RES | 1 | D-1.5-012 | residency | §4.6.1.1 | §4.6.1.1 says "Each row stored in the `org_id`'s `data_residency_region` partition; cross-region reads from customer surfaces blocked." Thi… | Author a §4.6.1.1 sub-block "Audit Event Residency Behavior" stating: (a) DR replication policy (e.g., "audit rows replicated within-region… | security | M11.3 | S |
| BL-P2-PH15-NUM | 1 | D-1.5-013 | numerical_singleton | §4.6.1.1 | §4.6.1.1 retention block inline-restates the plan-tier UI retention curve `30d / 30d / 1y / 1y / 3y / 7y` for Free / Solo / Starter / Growt… | Replace the §4.6.1.1 inline curve with: "Default UI retention: Per plan tier per §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)`; the §40… | engineering | — | S |

### Phase 3.2 (2 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH32-RBAC | 2 | D-3.2-026, D-3.2-029 | rbac | §5.11 | §5.11 row "Regenerate Defense View" (line 9223) restricts to `org_owner` ✓; all other roles ✗. §13.11.5 declares the capability `defense_vi… | Reconcile §5.11 line 9223 with §13.11.5 design intent. Most likely correct gate: `org_owner` ✓, `workspace_owner` ✓, `workspace_admin` ✓ (o… | engineering | M11.3 | S |

### Phase 11 (2 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH11-MAP | 2 | D-11.1-005, D-11.1-006 | surface_engine_mapping | §11.1, §3. | §11.1–§11.4 introduces the Buyer Console Navigation Shell (§11.1), Buyer Sidebar Navigation (§11.2), Buyer Content Layout Regions (§11.3),… | Author one consolidated M.1 row anchored at `§11.1, §11.2, §11.3, §11.4` named `Buyer Console Shell (Sidebar + Content Regions + Persistent… | engineering + design | release-orchestration | S |

### Phase 48 (2 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH48-INST | 1 | D-48-005 | instrumentation_gap | §48.7 | §51.1.3 declares: "Event names follow the convention `<family_prefix>_<domain>_<verb>` in snake_case." §48.5 (M1–M8) and §48.6 (M9–M13) Pos… | (a) Rewrite §48.7.1 / §48.7.2 / §48.7.3 / §48.7.4 telemetry tables in snake_case to match §48.5 / §48.6. (b) Move the Appendix G normalizat… | engineering | M21.3 | S |
| BL-P2-PH48-DOC | 1 | D-48-008 | documentation_gap | §48.5.3 | §48.5.3 AC #5 enforces buyer-anonymity at render time ("if `fully_anonymous`, the verification page MUST NOT contain the buyer Org name OR… | (a) Reorder Workflow steps 1–2 so signing happens AFTER the buyer's anonymity choice is recorded, OR explicitly author a two-stage signing… | engineering + security | — | S |

### Phase 9.2 (2 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH92-DSAR | 2 | D-9.2-004, D-9.2-012 | dsar | §6.8.5, §6.8.6.2 | Salt-rotation re-pseudonymization is contractually mandated within 7 days, but the spec is mute on whether per-row content-hash columns (AI… | Author a §6.8.5.x sub-section "Pseudonym Epoch Reconciliation" stating: (a) Pattern B User-row pseudonyms ARE rotated on salt rotation; (b)… | security | M11.3 | S |

### Phase 9.3 (2 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH93-RES | 2 | D-RES-012, D-RES-013 | residency | §1.6, §42.6 | §42.6 lists Datadog (logging + metrics + tracing + alerting), Sentry (error tracking), PagerDuty (incident routing), Statuspage.io (public… | Author §42.6.x "Observability Provider Residency Routing" specifying: (a) Datadog — US-Org telemetry routes to Datadog US (datadoghq.com);… | engineering + ops | M11.3 | S |

### Phase KB18 (2 defects, 2 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PHKB18-OBS | 1 | D-KB18-009 | observability | §22.16.4 | §22.16.4 audit-event mapping table omits 3 side-effectful state-persisting MCP tools. The §22.16.4 audit-log table at lines 18680–18684 lis… | Add three audit-event mappings to §22.16.4 audit-log table: `doc_attach → ai_document_attached`, `capability_declare_draft → ai_capability_… | engineering, security | M21.3 | S |
| BL-P2-PHKB18-AE | 1 | D-KB18-013 | authored_extension | §22.10.6 | §22.10.6 ghost-bid-ingestion agent's tool allowlist silently extends KB Spec §6.6 with two MCP tools. KB Spec §6.6 explicitly states: "Tool… | Amend §22.10.6 tool allowlist row to include the in-line Authored Extension note: "Authored Extension — KB Spec §6.6 said 'No MCP needed at… | engineering | release-orchestration | S |

### Phase 3.4 (1 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH34-OBS | 1 | D-3.4-007 | observability | §25.2.4 | Console-bridge layer carries per-event DLQ webhook `console_bridge.dlq_entered` (filed as D-1.6-003 P1 for Appendix C / Appendix G registra… | Author §25.2.6 "Console-Bridge Failure Storm Detection" with: (a) detector definition — fire `console_bridge.dlq_storm` (per D-3.4-004 Appe… | engineering | M21.3 | S |

### Phase 4.9 (1 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH49-DRIFT | 1 | D-4.9-011 | consistency_drift | §18.7.1 | Two direct conflicts between Appendix M.1 and §18: (a) Appendix M.1 line 47850 declares Agent Q&A Suggestion as "Hidden from tier(s): all b… | Resolve in favor of §18 (which is the operative authoring): update Appendix M.1 line 47850 to "Hidden from tier(s): None (universal capabil… | engineering | — | S |

### Phase 14.1 (re-verification) (1 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH141-DRIFT | 1 | D-14.1-011 | consistency_drift | §34.2.5 | §34.2.5 cross-cutting orchestration rule #5 first bullet contains an internal contradiction: opening sentence "Workspace creation is GATED… | Rewrite §34.2.5 cross-cutting orchestration rule #5 first bullet to remove the contradiction. Replace the opening sentence with: "**Workspa… | engineering | — | S |

### Phase 14.2 (re-verification) (1 defects, 1 clusters)

| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |
|---|---:|---|---|---|---|---|---|---|---|
| BL-P2-PH142-DRIFT | 1 | D-14.2-012 | consistency_drift | §34.2.5 | §34.2.5 cross-cutting orchestration rule #5 second bullet at line 29250 specifies that under Seller Solo per-bid mode the Bid Workspace ope… | Rewrite §34.2.5 cross-cutting orchestration rule #5 second bullet at line 29250 to remove the contradiction. Replace the entire bullet with… | engineering | — | S |

## P2 — Top-25 by size

| Cluster ID | Phase | Class | Count | Pack | Effort |
|---|---|---|---:|---|---|
| BL-P2-PH144-DRIFT | Phase 14.4 | consistency_drift | 12 | — | L |
| BL-P2-PH46-AC | Phase 4.6 | acceptance_criteria | 8 | — | M |
| BL-P2-PH51-AC | Phase 5.1 | acceptance_criteria | 8 | — | M |
| BL-P2-PH8-HOOK | Phase 8 | webhook | 8 | M02.3 | M |
| BL-P2-PH31-RBAC | Phase 3.1 | rbac | 7 | M11.3 | M |
| BL-P2-PH35-DSAR | Phase 3.5 | dsar | 7 | M11.3 | M |
| BL-P2-PHPT-DOC | Phase PT | documentation_gap | 7 | — | M |
| BL-P2-PH22-DATA | Phase 2.2 | data_model | 6 | M02.3 | M |
| BL-P2-PH34PXC-DOC | Phase 34.PXC | documentation_gap | 6 | — | M |
| BL-P2-PH2-AC | Phase 2 | acceptance_criteria | 6 | — | M |
| BL-P2-PH44-AC | Phase 4.4 | acceptance_criteria | 0 | Closed 2026-07-12 by scoring-resilience source contract; pending AE/runtime evidence remains. | M |
| BL-P2-PH45-AC | Phase 4.5 | acceptance_criteria | 6 | — | M |
| BL-P2-PH141-DRIFT | Phase 14.1 | consistency_drift | 6 | — | M |
| BL-P2-PH12-DATA | Phase 1.2 | data_model | 5 | M02.3 | M |
| BL-P2-PH33-DOC | Phase 3.3 | documentation_gap | 5 | — | M |
| BL-P2-PH45-DOC | Phase 45 | documentation_gap | 5 | — | M |
| BL-P2-PH3-DRIFT | Phase 3 (Audit, Second Pass) | consistency_drift | 5 | — | M |
| BL-P2-PH2-EDGE | Phase 2 | edge_case_silence | 5 | — | M |
| BL-P2-PHMD-DOC | Phase MD | documentation_gap | 5 | — | M |
| BL-P2-PH8-OBS | Phase 8 | observability | 5 | M21.3 | M |
| BL-P2-PH91-INST | Phase 9.1 | instrumentation_gap | 5 | M21.3 | M |
| BL-P2-PH37-A11Y | Phase 37 | accessibility | 5 | — | M |
| BL-P2-PH142-DRIFT | Phase 14.2 | consistency_drift | 5 | — | M |
| BL-P2-PHS17-NUM | Phase S17 | numerical_singleton | 4 | — | M |
| BL-P2-PHS17-DOC | Phase S17 | documentation_gap | 4 | — | M |

## P2 — Cross-phase programs (≥3 phases same class)

| Class | Phase Count | Defect Count | Sample Phases | Suggested Program |
|---|---:|---:|---|---|
| acceptance_criteria | 31 | 83 | Phase 4.6 (8), Phase 5.1 (8), Phase 2 (6), Phase 4.4 (6), Phase 4.5 (6) | Cross-phase acceptance_criteria sweep (pack=—) |
| documentation_gap | 29 | 74 | Phase PT (7), Phase 34.PXC (6), Phase 3.3 (5), Phase 45 (5), Phase MD (5) | Cross-phase documentation_gap sweep (pack=—) |
| consistency_drift | 30 | 68 | Phase 14.4 (12), Phase 14.1 (6), Phase 3 (Audit, Second Pass) (5), Phase 14.2 (5), Phase 5.2 (4) | Cross-phase consistency_drift sweep (pack=—) |
| data_model | 17 | 36 | Phase 2.2 (6), Phase 1.2 (5), Phase 1.7 (3), Phase 5.1 (3), Phase 4.4 (2) | Cross-phase data_model sweep (pack=M02.3) |
| numerical_singleton | 23 | 33 | Phase S17 (4), Phase 4 (3), Phase 8 (3), Phase 13V (3), Phase 51 (2) | Cross-phase numerical_singleton sweep (pack=—) |
| observability | 22 | 33 | Phase 8 (5), Phase 45 (3), Phase 3 (Audit, Second Pass) (2), Phase 2 (2), Phase 4 (2) | Cross-phase observability sweep (pack=M21.3) |
| mobile_divergence | 21 | 23 | Phase 38 (3), Phase 4.2 (1), Phase 3 (Audit) (1), Phase 3 (Audit, Second Pass) (1), Phase 12 (1) | Cross-phase mobile_divergence sweep (pack=—) |
| enum | 14 | 18 | Phase 6.2 (3), Phase 4.2 (2), Phase 23 (2), Phase 1.1 (1), Phase 1.6 (1) | Cross-phase enum sweep (pack=M02.3) |
| state_machine | 14 | 18 | Phase 4.7 (2), Phase 4 (Prompt 4.10) (2), Phase 4 (2), Phase 34.19 (2), Phase 1.2 (1) | Cross-phase state_machine sweep (pack=M02.3) |
| retention | 16 | 18 | Phase 4.5 (2), Phase 4 (2), Phase 1.2 (1), Phase 2.2 (1), Phase 3.3 (1) | Cross-phase retention sweep (pack=M11.3) |
| api | 11 | 16 | Phase 8 (4), Phase 5.3 (2), Phase 5.6 (2), Phase 1.2 (1), Phase 1.6 (1) | Cross-phase api sweep (pack=M02.3) |
| surface_engine_mapping | 13 | 16 | Phase 3 (Audit) (2), Phase 11 (2), Phase 13V (2), Phase 1.6 (1), Phase 2 (1) | Cross-phase surface_engine_mapping sweep (pack=release-orchestration) |
| firewall_leakage | 14 | 15 | Phase S17 (2), Phase 45 (1), Phase 41 (1), Phase 4.5 (1), Phase 4.7 (1) | Cross-phase firewall_leakage sweep (pack=M11.3) |
| plan_gating | 9 | 15 | Phase 24 (4), Phase 3 (Audit) (3), Phase 8 (2), Phase 3 (Audit, Second Pass) (1), Phase 4.7 (1) | Cross-phase plan_gating sweep (pack=M11.3) |
| authored_extension | 10 | 14 | Phase 5.3 (3), Phase AE (3), Phase 1.2 (1), Phase 2 (1), Phase 4.5 (1) | Cross-phase authored_extension sweep (pack=release-orchestration) |
| dsar | 7 | 14 | Phase 3.5 (7), Phase 9.2 (2), Phase 2.2 (1), Phase 41 (1), Phase 2 (1) | Cross-phase dsar sweep (pack=M11.3) |
| rbac | 6 | 13 | Phase 3.1 (7), Phase 3.2 (2), Phase 2.2 (1), Phase 4.5 (1), Phase 4 (Prompt 4.10) (1) | Cross-phase rbac sweep (pack=M11.3) |
| webhook | 6 | 13 | Phase 8 (8), Phase 41 (1), Phase 2 (1), Phase 5.6 (1), Phase 5.7 (1) | Cross-phase webhook sweep (pack=M02.3) |
| accessibility | 5 | 10 | Phase 37 (5), Phase S17 (2), Phase 5.1 (1), Phase 23 (1), Phase 24 (1) | Cross-phase accessibility sweep (pack=—) |
| instrumentation_gap | 5 | 9 | Phase 9.1 (5), Phase 48 (1), Phase 12 (1), Phase S17 (1), Phase 13V (1) | Cross-phase instrumentation_gap sweep (pack=M21.3) |
| residency | 7 | 8 | Phase 9.3 (2), Phase 1.5 (1), Phase 45 (1), Phase 4.7 (1), Phase 4 (Prompt 4.11) (1) | Cross-phase residency sweep (pack=M11.3) |
| glossary | 7 | 7 | Phase 1.1 (1), Phase 3.3 (1), Phase 3.5 (1), Phase 41 (1), Phase 4.6 (1) | Cross-phase glossary sweep (pack=—) |
| ci_gate | 4 | 6 | Phase 8 (2), Phase 37 (2), Phase 2 (1), Phase 5.7 (1) | Cross-phase ci_gate sweep (pack=M02.3) |
| notification | 4 | 5 | Phase 8 (2), Phase 4.2 (1), Phase 24 (1), Phase 6.2 (1) | Cross-phase notification sweep (pack=—) |
| i18n | 3 | 5 | Phase 37 (3), Phase 4.2 (1), Phase 5.7 (1) | Cross-phase i18n sweep (pack=—) |
| posthog_event | 5 | 5 | Phase 4.5 (1), Phase MD (1), Phase 44 (1), Phase 51 (1), Phase HM (1) | Cross-phase posthog_event sweep (pack=M21.3) |
| error_code | 3 | 4 | Phase 5.2 (2), Phase 5.7 (1), Phase MD (1) | Cross-phase error_code sweep (pack=—) |
| edge_case | 3 | 3 | Phase 4.2 (1), Phase 23 (1), Phase 51 (1) | Cross-phase edge_case sweep (pack=—) |
| performance_budget | 3 | 3 | Phase 4.5 (1), Phase 44 (1), Phase 51 (1) | Cross-phase performance_budget sweep (pack=—) |
| error_state | 3 | 3 | Phase 4.5 (1), Phase 23 (1), Phase 24 (1) | Cross-phase error_state sweep (pack=—) |

## P3 — Class roll-up (single hygiene sweep epic)

| Class | Count | Phases | Sample IDs | Recommendation | Linear ID |
|---|---:|---|---|---|---|
| documentation_gap | 62 | Phase 1.2, Phase 1.6, Phase 1.7, Phase 12, Phase 2, Phase 2.2… | D-1.2-020, D-1.6-012, D-1.7-013, + 59 | Resolve in tandem with D-1.2-001: when DefenseView is re-homed (or §13.11.7 re-cited), update Appendix M row 372 + §13.11.7 line 12188 + §1… | DOC-001 |
| consistency_drift | 47 | Phase 1, Phase 1.7, Phase 11, Phase 14.2, Phase 2.2, Phase 3 (Audit)… | D-1.7-012, D-11.1-008, D-14.2-011, + 44 | Normalize both §34.3.3 citations to "BPS v3 §2.6; SPS v3 §2.2" (the canonical margin-protection home). | DOC-002 |
| enum | 16 | Phase 1.5, Phase 1.7, Phase 2, Phase 2.1, Phase 24, Phase 4… | D-1.5-011, D-1.7-006, D-1.7-007, + 13 | Author a Phase X.Y "Since-Version Marker Backfill" sub-program: for every Appendix J enum that lacks a since-version marker, add `**Since.*… | DOC-003 |
| numerical_singleton | 14 | Phase 1, Phase 2.2, Phase 33, Phase 4, Phase 4.4, Phase 4.7… | D-2.2-028, D-2.2-032, D-2.2-033, + 11 | . Update §22 line 14782 to cite §39 instead of inline-restating. | DOC-004 |
| glossary | 9 | Phase 12, Phase 38, Phase 4, Phase 4.5, Phase 5.1, Phase 51… | D-12-026, D-38-023, D-4.12-023, + 6 | Author Appendix K entries: "Policy Ingestion", "PolicyDocument", "PolicyControl", "Framework Inference", "Amendment Protocol", "Batch Amend… | DOC-005 |
| webhook | 4 | Phase 2.2, Phase 8 | D-2.2-048, D-8.2-036, D-8.2-037, + 1 | Optional: author dedicated webhook event for SellerOrgPage cascade suppression. Otherwise, document explicit reuse of `vendor_opt_out.appli… | DOC-006 |
| plan_gating | 4 | Phase 2.2, Phase 4.7, Phase 6.1 | D-2.2-062, D-2.2-063, D-4.7-016, + 1 | Replace with `org_id.plan_tier ∈ §34.1.2 cell {seller_scale, seller_enterprise} plan-tier set`. | DOC-007 |
| documentation_drift | 4 | Phase 12, Phase 2 | D-12-023, D-12-025, D-2-040, + 1 | Replace "(Phase 14.6)" with "(Phase 14.9)". | DOC-008 |
| heading_syntax | 4 | Phase 23, Phase 24, Phase 38, Phase 5.1 | D-23-031, D-24-034, D-38-022, + 1 | Replace the single-line pipe row with a standalone four-column Field / Type / Constraints / Notes table per §4 conventions. Better: retire… | DOC-009 |
| authored_extension | 3 | Phase 2.2, Phase AE, Phase EM | D-2.2-052, D-AE-010, D-EM-008 | Confirm AE status in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`; if pending, ratify before next stamp; if ratified, remove "Authored Exte… | DOC-010 |
| state_machine | 3 | Phase 2, Phase 3 (Audit), Phase 4 | D-2-027, D-3UX-019, D-4.12-015 | Author §3.10.x State Machine table covering: `inactive` → `selecting` → `selecting_all_in_filter` → `dispatching` → `paused_network` / `pau… | DOC-011 |
| glossary_canonicality | 3 | Phase 37, Phase 5.7, Phase 6.2 | D-37-023, D-5.7-021, D-6.2-025 | Update §49.1.9 line 37655 prose to remove the "verbatim" claim and replace with: "§49.1.9 binds to §48.8.7 ban semantics; Appendix J enum i… | DOC-012 |
| acceptance_criteria | 2 | Phase 2.2, Phase 4.2 | D-2.2-056, D-4.2-035 | Reword §4.4.8 AC #1 to: "Live render paths MUST honor the opt-out within 60 seconds per §27.10.4 SLO; retroactive backfill of materialized… | DOC-013 |
| dsar | 2 | Phase 3.5 | D-3.5-034, D-3.5-035 | Re-author §6.8.1 line 9563 to: "All Workspaces (§4.3.1) and Bid Workspaces (§4.4.1) where user is Workspace Owner or invited participant; p… | DOC-014 |
| surface_engine_mapping | 2 | Phase 11, Phase 45 | D-11.1-007, D-45-015 | Sweep §45 surfaces against Appendix M.1; for any unmapped surface (DPA artefact, privacy-policy public page, subprocessor list, subprocesso… | DOC-015 |
| rbac | 2 | Phase 3 (Audit), Phase 5.1 | D-3UX-011, D-5.1-044 | Replace "Ops Director" with the canonical Ops role (likely `ops_admin` or §50.2 role) responsible for OrganizationPreference mutation. Cros… | DOC-016 |
| numerical_singleton / consistency_drift | 1 | Phase 1.5 | D-1.5-014 | Replace the inline retention column with: "Retention per §40.2 AuditEvent row + §34.1.1 / §34.1.2 cell `Audit Log Retention (UI)`." Add Sol… | DOC-017 |
| api | 1 | Phase 4.2 | D-4.2-036 | Replace `:workspaceId` with `{workspace_id}` per §32 convention. Roll into D-4.2-002 path rewrite. | DOC-018 |
| data_model | 1 | Phase 41 | D-41-022 | Add Reply-To column to §41.2 catalog table; populate per email type (transactional → workspace-inbox routing where applicable; marketing →… | DOC-019 |
| performance_budget | 1 | Phase 4 (Prompt 4.10) | D-4.10-030 | Specify required search index (e.g., `(org_id, lower(name)) gin_trgm_ops` for trigram-fuzzy search; `(org_id, source, category)` for filter… | DOC-020 |
| observability | 1 | Phase 9.1 | D-9.1-020 | Add a "Customer-visibility" paragraph to each block declaring which events are customer-visible (dual-emit) vs Sourcera-internal (Ops PostH… | DOC-021 |
| residency | 1 | Phase 9.3 | D-RES-014 | After §1.6 four-row update (D-RES-003), add a footnote on the `custom` row: "`custom` requires Enterprise plan plus `custom_sovereign_resid… | DOC-022 |
| ux_copy | 1 | Phase 38 | D-38-026 | Adopt §38.8.3 copy as canonical. Update §38.4 prose to cite §38.8.3 instead of repeating. | DOC-023 |
| firewall_leakage | 1 | Phase 48.3 | D-48.3-015 | Add scope-isolation note to both paragraphs: "Aggregated at Ops-rollup level only; never exposed to Buyer Console or Seller Console per §1.… | DOC-024 |

## P3 — Phase-by-phase roster (compact)

- **Phase 1**: D-AS-003, D-AS-006, D-AS-008, D-AS-009, D-AS-010, D-AS-013 (6 defects)
- **Phase 1.2**: D-1.2-020 (1 defects)
- **Phase 1.5**: D-1.5-011, D-1.5-014 (2 defects)
- **Phase 1.6**: D-1.6-012 (1 defects)
- **Phase 1.7**: D-1.7-006, D-1.7-007, D-1.7-012, D-1.7-013, D-1.7-014, D-1.7-015, D-1.7-017, D-1.7-018 (8 defects)
- **Phase 11**: D-11.1-007, D-11.1-008 (2 defects)
- **Phase 12**: D-12-023, D-12-024, D-12-025, D-12-026 (4 defects)
- **Phase 14.2**: D-14.2-011 (1 defects)
- **Phase 2**: D-2-019, D-2-027, D-2-034, D-2-035, D-2-040, D-2-041 (6 defects)
- **Phase 2.1**: D-AJ-017, D-AJ-018 (2 defects)
- **Phase 2.2**: D-2.2-026, D-2.2-028, D-2.2-032, D-2.2-033, D-2.2-034, D-2.2-048, D-2.2-050, D-2.2-052, D-2.2-056, D-2.2-058, D-2.2-062, D-2.2-063, D-2.2-064, D-2.2-065, D-2.2-066 (15 defects)
- **Phase 2.3**: D-2.3-004 (1 defects)
- **Phase 23**: D-23-030, D-23-031 (2 defects)
- **Phase 24**: D-24-001, D-24-033, D-24-034 (3 defects)
- **Phase 3 (Audit)**: D-3UX-002, D-3UX-011, D-3UX-013, D-3UX-014, D-3UX-015, D-3UX-017, D-3UX-018, D-3UX-019, D-3UX-020 (9 defects)
- **Phase 3 (Audit, Second Pass)**: D-3UX-036 (1 defects)
- **Phase 3.2**: D-3.2-024, D-3.2-025, D-3.2-027, D-3.2-028 (4 defects)
- **Phase 3.5**: D-3.5-033, D-3.5-034, D-3.5-035 (3 defects)
- **Phase 33**: D-33-015 (1 defects)
- **Phase 34.PXC**: D-PXC-008, D-PXC-012, D-PXC-019, D-PXC-020 (4 defects)
- **Phase 37**: D-37-020, D-37-021, D-37-022, D-37-023 (4 defects)
- **Phase 38**: D-38-022, D-38-023, D-38-024, D-38-026 (4 defects)
- **Phase 4**: D-4.12-003, D-4.12-010, D-4.12-011, D-4.12-015, D-4.12-017, D-4.12-022, D-4.12-023, D-4.12-032, D-4.12-038 (9 defects)
- **Phase 4 (Prompt 4.10)**: D-4.10-019, D-4.10-020, D-4.10-027, D-4.10-030 (4 defects)
- **Phase 4 (Prompt 4.11)**: D-4.11-031, D-4.11-032 (2 defects)
- **Phase 4 V4**: D-4V-003 (1 defects)
- **Phase 4.2**: D-4.2-035, D-4.2-036, D-4.2-037, D-4.2-039 (4 defects)
- **Phase 4.3**: D-4.3-021 (1 defects)
- **Phase 4.4**: D-4.4-019, D-4.4-026, D-4.4-027, D-4.4-028, D-4.4-029 (5 defects)
- **Phase 4.5**: D-4.5-016, D-4.5-021, D-4.5-022, D-4.5-023, D-4.5-033, D-4.5-034 (6 defects)
- **Phase 4.6**: D-4.6-025, D-4.6-026, D-4.6-027 (3 defects)
- **Phase 4.7**: D-4.7-016, D-4.7-023 (2 defects)
- **Phase 41**: D-41-015, D-41-022 (2 defects)
- **Phase 44**: D-44-013, D-44-016 (2 defects)
- **Phase 45**: D-45-015, D-45-021 (2 defects)
- **Phase 48**: D-48-007 (1 defects)
- **Phase 48.3**: D-48.3-012, D-48.3-015 (2 defects)
- **Phase 5.1**: D-5.1-041, D-5.1-042, D-5.1-043, D-5.1-044, D-5.1-045 (5 defects)
- **Phase 5.2**: D-5.2-015, D-5.2-019, D-5.2-020, D-5.2-022 (4 defects)
- **Phase 5.3**: D-5.3-017, D-5.3-020, D-5.3-021, D-5.3-022 (4 defects)
- **Phase 5.6**: D-5.6-012, D-5.6-020, D-5.6-021, D-5.6-024 (4 defects)
- **Phase 5.7**: D-5.7-021, D-5.7-022, D-5.7-023 (3 defects)
- **Phase 51**: D-51-024 (1 defects)
- **Phase 6.1**: D-6.1-021, D-6.1-022, D-6.1-023 (3 defects)
- **Phase 6.2**: D-6.2-008, D-6.2-022, D-6.2-023, D-6.2-024, D-6.2-025 (5 defects)
- **Phase 8**: D-8.2-036, D-8.2-037, D-8.2-038, D-8.2-039, D-V8.3-017, D-V8.3-018, D-V8.3-024, D-V8.3-028 (8 defects)
- **Phase 9.1**: D-9.1-015, D-9.1-020 (2 defects)
- **Phase 9.3**: D-RES-014 (1 defects)
- **Phase 9V**: D-V9-001, D-V9-002 (2 defects)
- **Phase AE**: D-AE-010, D-AE-014 (2 defects)
- **Phase CONS**: D-CONS-004, D-CONS-005, D-CONS-007 (3 defects)
- **Phase DEC**: D-DEC-012 (1 defects)
- **Phase EM**: D-EM-008 (1 defects)
- **Phase HM**: D-HM-013, D-HM-016 (2 defects)
- **Phase KB18**: D-KB18-006 (1 defects)
- **Phase MD**: D-MD-012, D-MD-015, D-MD-017 (3 defects)
- **Phase PT**: D-PT-010 (1 defects)
- **Phase S17**: D-S17-031 (1 defects)
- **Phase V14**: D-V14-002, D-V14-004 (2 defects)
