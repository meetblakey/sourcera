# Research_MPP_Implementation_Gaps.md — From Brief to Buildable

**Status:** Implementation-readiness gap catalog v2 — comprehensive corpus-grounded rewrite. Companion to `Research_MPP.md` v2. Authored 2026-04-29 (v1) → 2026-05-01 (v2).

**v1 → v2 delta:** v1 named §7.2 / §22.16 / §27.6 / §27.10 incorrectly throughout, framed Decision Layer as a "third console," and required a substantial volume of new authoring that v2's reuse-of-primitives reframing eliminates. v2 corrects citations, reframes scope to "extend existing primitives, don't parallel them," and shrinks the engineering FTE-month estimate from 10–14 to 8–11. Total Spec authoring + ops + UX + GTM + security + QA work shrinks from ~21–25 FTE-months to ~14–18 FTE-months. Pre-rewrite snapshot at `_versions/Research_MPP_Implementation_Gaps.v1-pre-comprehensive-rewrite-2026-04-29.md`.

The v2 brief delivers the *thesis*, the *Marketplace-domain architecture*, the *integrity covenant*, the *commercial posture*, and *spec-fidelity authoring sketches* for every new entity / endpoint / webhook / capability. To ship the Decision Layer as an actual product capability end-to-end, the work below must be authored, scaffolded, ratified, or built. Each gap is sized, owner-assignable, and sequenced. **v2 reuses ~70% of the primitives the v1 gap doc treated as new** — the savings show up in shrinking the §52 sub-section count and collapsing several "new entity" rows into "extend existing entity" rows.

---

## 1. Authoritative Spec Authoring Still Required

### 1.1 New Section §52 — Full Authoring (scope reduced from v1)

| Sub-section | v2 brief authoring | What's left |
| :--- | :--- | :--- |
| §52.1 Purpose & Scope | Marketplace-domain framing; one-paragraph thesis | Full purpose-and-scope with cross-section dependency map; in-scope/out-of-scope list (now collapsing many out-of-scope items because v2 reuses, not parallels); source-of-truth precedence within §52 |
| §52.2 Architectural Overview | 11-step pipeline + Marketplace-domain framing + console-mapping-table | Layered model diagram (parallel to §22.2.1 KB stack); Mappings table (Master-Spec concept ↔ engineering realization); beta-header / version-pinning per §22.2.3 |
| §52.3 PolicyPack Entity | Full field table per Master-Spec convention; `console=marketplace` correction | State machine (`draft → published → deprecated → archived`) per Appendix L convention; required indexes; retention rules per §40.2; failure-modes counterfactual block; acceptance criteria (≥10) |
| §52.4 Decision Entity | Full field table | State machine (`pending_recommendation → recommended → {accepted | dismissed | overridden | superseded | regression_detected | archived}`); failure modes; ≥10 ACs |
| §52.5 AgentCaller Entity | Full field table | State machine; token-rotation semantics; revocation cascade; failure modes; ACs |
| §52.6 The MCP Server | §22.8 vault-JWT verbatim generalized; tool list | Per-tool full contract (input + output JSON Schemas, error codes, idempotency, examples) for the 6 tools beyond `decision.recommend` (which v2 §2.3 fully authors) |
| §52.7 Decision Engine Versioning | DecisionEngineVersion entity authored at parallel-to-§27.4.5 fidelity | State machine (`candidate → shadow → published → deprecated → retired | rolled_back`) per §27.4.8; publication dual-sign-off rules; rollback procedure |
| §52.8 Tier-1 Recommendation Surface | Bullet | Full surface contract with edge cases, failure modes, ACs |
| §52.9 Tier-2 Assisted Provisioning | Bullet | Same; plus partner-onboarding-URL allowlist authoring + state machine |
| §52.10 Tier-3 Agentic Transaction | Stripe Link + Agentic; payment-protocol-pluggable framing | Full per-payment-protocol integration contract (Stripe Link/Agentic, x402, Visa ICC, Mastercard Agent Pay, Google AP2 — each as a sub-section); `PaymentProtocolRegistration` entity authoring; chargeback / dispute path; per-category transaction-cap state machine |
| §52.11 Failure Modes | Eight modes from brief §11 | Numbered counterfactual-pass block matching §22.4.x convention |
| §52.12 Acceptance Criteria | Implicit | 30+ numbered observable testable criteria covering every entity, endpoint, webhook, plan-gate, CI gate |

### 1.2 Cross-Section Authoring (substantially reduced from v1)

| Section | v2 brief authoring | What's left |
| :--- | :--- | :--- |
| §22.10.x — `agent_sourcera_decision_recommender_v1` | Full field table + system-prompt extension + tool allowlist | Full system-prompt body (parallel to §22.10.2; system-prompt sized ≤8K chars); failure-modes block per §22.10.8 convention |
| §22.11.x — `emit_structured_rationale` custom tool | Mentioned | Full input/output schema, error codes, server-side validation, idempotency |
| §22.11.x — `match_score_inspect` internal tool | Mentioned | Full contract: feature values + contribution direction + magnitude bucket exposed; raw weights NEVER exposed; `match_score_inspect_no_weight_leakage` CI gate authored |
| §22.12 — Skill `skill_sourcera_decision_rationale` | Mentioned | Skill body (system-prompt-equivalent); progressive-disclosure rules; version |
| §22.13 — Environment `env_sourcera_decision_runner_v1` | Mentioned | Container image, allowed tools, resource limits, network egress allowlist |
| §27.4.3 — `policy_pack_alignment_score` feature | Field-table row authored | Computation methodology in detail (how policy-pack fields combine into 0.0–1.0); offline-eval guardrails for the new feature; backfill strategy for cold-start |
| §27.4.4 — `policy_pack_banned_flag` hard gate | Mentioned | Full hard-gate semantics; CI gate `policy_pack_banned_short_circuit` parallel to existing `match_score_hard_gate_short_circuit` |
| §27.4.5 — Decision Engine retraining cadence | Inherited from §27.4.5 | Whether Decision Engine has its own retraining cadence vs. inheriting Match Score's; what triggers a Decision-Engine version bump; rollout cohort sizing |
| §27.4.11 — `feedback_subject_kind=decision_layer_recommendation` | Mentioned (AE-MPP-25) | One enum value addition; 2 new dashboard rows authored (decision accept-rate, decision override-rate per category); 2 new metric rows in alert suite |
| §27.4.2 — `Decision-Recommend` trigger class | Mentioned (AE-MPP-27) | Full trigger-class row in §27.4.2 table: caching TTL (60s), invalidators, trigger event |
| §27.4.12 — Audit-receipt verifier endpoint | Inherited from §27.4.12 | The §27.4.12 `audit_receipt_payload` schema and the receiver-side verifier endpoint extends to Decision artifacts; HMAC key rotation policy; receipt-validity-after-key-rotation semantics |
| §27.5 — `EOI.decision_id` FK | Mentioned (AE-MPP-25c) | One nullable field addition to §4.5.2 EOI entity |
| §27.9 — `SellerSignal.contribution_kind=decision_layer_query` | Mentioned (AE-MPP-36) | One enum value addition; integration with §27.9.5 8-stage pipeline; k=5 floor enforcement (existing) |
| §32.10 — Decision Layer endpoint detail | v2 §2.7 lists all 24 endpoints | Per-endpoint authoring: full request/response/error/idempotency for ~24 endpoints (only `decision.recommend` is fully authored in v2 brief §2.3) |
| §34.3.4 — Pricing rate card | New rows tabled in v2 §2.5 | Full §4.8.2 CapabilityRegistryEntry rows for the 6 capabilities beyond `decision_recommend` (which v2 fully authors); cost-base seed values; OutcomeContract definitions for each |
| §34.10.3 — Solo-co-resident pool rule | Inherited verbatim | Confirm Decision Layer respects the Solo-co-resident exclusion (Solo's $5 envelope NEVER pools with contralateral console's customer-visible budget) |
| §34.11 — Outcome Resolver new signals | Mentioned | New signals registered: `decision_recommend`, `decision_justify`, `decision_alternatives`, `decision_policy_check`, `decision_transact_intent`, `decision_transact`, `policy_pack_parse` — each with §34.11.1 signal-name + ContractEvent linkage |
| §44.1 — Performance targets | New rows tabled in v2 §4.8 | Authoritative cell additions to §44.1 |
| §44.6 — Solo-Tier Surface Treatment | Capability flags `surface_throttling_class=active_workflow` + `solo_envelope_no_block=true` | Confirm registration in §44.6.4.1 active-workflow membership; CI gate `decision_layer_solo_envelope_compliance` (parallel to existing §44.6.8 #5 `solo_envelope_throttling_targets_low_priority_background_only`) |
| §39 — Object-size constraints | Rows authored in v2 §4.10 | Authoritative cell additions to §39 table |
| §6.8 / §40.2 — Retention | 2 new classes named in v2 §4.11 | Full retention table rows; DSAR right-to-erasure flow per §6.8.1; cold-storage migration semantics per §40.2 |
| Appendix C — Notification Event Catalog | 11 events listed | Per-event authoritative payload schema (parallel to §27.4.9); registration under "Decision-Layer-Domain Events" header |
| Appendix G — PostHog Event Taxonomy | Mentioned | Per-event property schema; super-property registration (`decision_engine_version`, `policy_pack_version`, `agent_harness_kind`, `agent_caller_id`) |
| Appendix I — Error codes | ~17 codes listed | Each registered with HTTP status, semantics, retry guidance |
| Appendix J — Enums | New enum-value additions to existing enums (per §4.12), no new console enum value | Each registered with full value list, source-section authority, cross-reference to consumers |
| Appendix K — Glossary | 6 new terms drafted in brief | Each polished to Master-Spec convention; inserted alphabetically |
| Appendix L — State Machines | 4 needed (Decision, PolicyPack, AgentCaller, DecisionEngineVersion) | Each as State Diagram + From/To/Trigger/Conditions/Notes table + Rejected Transitions + ACs |
| Appendix M — Surface/Engine Mapping | 12 new rows + 4 new CI gates + 6 mirror gates listed in v2 §4.15 | Polished to §M.1 column schema; inserted under new "Decision Layer (§52)" header; CI-gate cross-references registered to §M.4 / §M.5 |

### 1.3 New Concepts That Need Their Own Spec Home (reduced from v1)

| Concept | Spec home | Required authoring |
| :--- | :--- | :--- |
| `DecisionEngineVersion` entity | New §27.4.X (parallel to `MarketplaceMatchScoreModelVersion`) — not a new top-level §52 sub-section because the Decision Engine ranking itself piggybacks on the Match Score model | Full entity spec, state machine, publication dual-sign-off, rollback procedure, retention 7y for audit |
| Audit-receipt HMAC key rotation policy | Generalize §27.4.12 / §4.3.21 Selection Report pattern | Key-pair generation cadence, key-id field in receipts, multi-key validity window, rotation runbook (no Decision-Layer-specific authoring; the existing §27.4.12 audit-receipt primitive applies verbatim) |
| `policy_pack.parse` Opus capability | New §22.10.x agent definition | Full agent definition, system prompt, output JSON Schema, cite-verify-equivalent for parsed policy lineage |
| Vault-JWT scope-token issuance for Decision Layer | Generalize §22.8.3 KB-server pattern | Per-call token issuance vs. per-session; expiry default; rotation semantics; scope-claim contents per v2 §2.6; `DecisionMCPSessionTokenRecord` entity per §22.8.3.1 precedent |
| Decision Browser surface (`decisions.sourcera.com`) | New public surface | Render contract per v2 §2.1 + AE-MPP-26 (reuses §13.11 Defense View component); SEO posture; rate-limit class |
| OSS template `sourcera.toml` schema | New format | TOML schema, validation rules, default Org binding, abuse-prevention (one-shared-Org-id can't burn all Sourcera marketing budget per §27.8.12 SIM patterns) |
| Community-pool Org administration | New | Operational owner; marketing-budget allocation; abuse cutoff; cost-center routing (`platform_marketing` per §34.3.5 existing pattern) |
| Tier-3 per-category transaction cap pre-authorization | Mentioned | UI flow; audit-event shape; mid-decision cap-bump request flow with synchronous approval per §29 notification |
| `PaymentProtocolRegistration` entity | New §52.10.X (parallel to `MarketplaceMatchScoreModelVersion` per §27.4.5) | Versioned plugin spec: `protocol_kind`, `merchant_acceptance_predicate`, `consent_envelope_schema`, `settlement_latency_sla`, `dispute_path_url`, `risk_engine_attached_flag`, state machine |
| `SellerOrg.accepted_payment_protocols` field | Extension of existing §4.4 SellerOrg entity | Single new field; AE-MPP-23a |
| `cost_center=rev_decision_layer_transact` | Extension of existing §4.8.12 cost-center enum | Single enum value addition; AE-MPP-24 |
| `actor_type=external_harness` | Extension of existing §4.8.1 actor_type enum | Single enum value addition; AE-MPP-23 |

---

## 2. Engineering Scaffolding

### 2.1 Integration-Program Artifacts (volume reduced from v1)

| Artifact | Status | What's needed |
| :--- | :--- | :--- |
| `_integration/RECONCILIATION.md` Decision Layer block | Not started | Full reconciliation log entry per existing convention: decision-by-decision documenting why §52 is added (vs. extending §27); how cross-section refs were resolved; conflicts surfaced; AE rationale per row |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` rows | Not started | AE-MPP-01 through AE-MPP-37 (v2 expanded from v1's 22) each as ledger row: status (pending), proposed-by, ratification-gate, owner-notification-target, dependency on prior AEs, release-gate impact (v7.2.0 stamp blocker yes/no) |
| `_integration/Integration_Prompts_v7.2.md` (new program) | Not started | Phase 14.21 (Sprint 1 — entity + endpoint), Phase 14.22 (Sprint 2 — beta surfaces + webhook), Phase 14.23 (Sprint 3 — production hardening), Phase 14.24 (GA stamp) — each as Opus-optimized phase prompt with verification gate |
| `_integration/PHASE14_21_VERIFY.md` … `PHASE14_24_VERIFY.md` | Not started | Per-phase adversarial-review log (created during execution) |
| `_integration/Decisions.md` open-decisions queue | Needs 27 new entries (v2 expanded from v1's 20) | Each open question gets a row; advisory recommendation; status; owner; due date |
| `_integration/DELTA_INVENTORY.md` v7.2.0 inventory | Not started | Full delta walked out of `Research_MPP.md`: every new entity, endpoint, webhook, enum value (AEs only — no new enums), error code, plan-gate row, capability-registry row, OutcomeContract, PostHog event, audit-event-action, retention class, CI gate, glossary term, surface-mapping row |

### 2.2 Build-Execution Artifacts

| Artifact | What's needed |
| :--- | :--- |
| `Build_Execution_Strategy.md` v2.x — "Decision Layer Program" sub-section | Three-layer execution model adapted for the Decision Layer; how Decision Layer milestones bind to Linear cycles; Implementation Pack schemas; AGENTS.md content for each new package |
| `Linear_Execution_Blueprint.md` v2.1 program addition | Linear project `Decision Layer (M30+)` with milestones M30 (Engine v0), M31 (Beta surfaces), M32 (Production hardening), M33 (GA); cycle structure; issue templates; label set (`area:decision-layer`, `tier:t1`, `tier:t2`, `tier:t3`, `surface:mcp`, `surface:rest`, `integration:partner`); estimation approach; dependency edges to existing M-series milestones |
| Sprint-1 Implementation Pack | AGENTS.md for `packages/sourcera-decision-engine/`, `packages/sourcera-mcp-decision-server/`, `packages/sourcera-decision-sdk-ts/`; per-file scope; test matrix; acceptance gates |
| Sprint-2 Implementation Pack | Same for Tier-2 + webhooks + Decision Browser (note: Decision Browser leverages §13.11 Defense View component per AE-MPP-26 — substantially reduced scope) |
| Sprint-3 Implementation Pack | Same for Tier-3 + Stripe Link + Stripe Agentic + x402 + production hardening |
| Sprint-0 (concierge MVP) Implementation Pack | Concierge mechanics: feature-flag gating, manual-rank-override surface for Sourcera-internal operators, `ConciergeOverrideRecord` entity, override-logging schema, design-partner onboarding runbook |

### 2.3 Codebase Scaffolding (12 packages, same as v1)

| Package | Purpose | Sprint |
| :--- | :--- | :--- |
| `packages/sourcera-decision-engine/` | Decision Engine pipeline orchestrator | 1 |
| `packages/sourcera-mcp-decision-server/` | MCP server hosted at `mcp.sourcera.com/decision/v1` | 1 |
| `packages/sourcera-decision-sdk-ts/` | TypeScript SDK | 1 |
| `packages/sourcera-decision-sdk-py/` | Python SDK | 2 |
| `packages/sourcera-decision-sdk-go/` | Go SDK | 3 |
| `packages/sourcera-decision-sdk-rust/` | Rust SDK | 3 |
| `packages/sourcera-policy-pack-parser/` | Opus-driven free-text → structured PolicyPack | 2 |
| `packages/sourcera-agent-definitions/decision_recommender/` | Agent definition + system prompt + skill bodies | 1 |
| `packages/sourcera-payment-rails/stripe-link-agentic/` | Stripe Link credential + Stripe Agentic Checkout | 3 |
| `packages/sourcera-payment-rails/x402/` | Coinbase x402 | 3 |
| `packages/sourcera-decision-browser-web/` | Decision Browser at `decisions.sourcera.com` (leverages §13.11 Defense View component per AE-MPP-26) | 2 |
| `packages/sourcera-cli-decision/` | `sourcera decide ...` CLI | 2 |
| Distribution shims: `extensions/cursor-sourcera/`, `extensions/cline-sourcera/`, `extensions/claude-code-skill-sourcera/`, `templates/next-supabase-sourcera/` | Per-partner distribution | 2–3 |

### 2.4 Database Migration Scaffolding (corrected from v1)

| Migration | Sprint | v2 Note |
| :--- | :--- | :--- |
| Create `policy_packs`, `decisions`, `agent_callers`, `decision_mcp_session_token_records` tables | 1 | All `console=marketplace` per Path A (v2 §2.11) |
| Add `policy_pack_alignment_score`, `policy_pack_banned_flag` to feature registry | 1 | Per §27.4.3 / §27.4.4 |
| Register Decision Layer capabilities in CapabilityRegistryEntry with `surface_throttling_class=active_workflow` + `solo_envelope_no_block=true` | 1 | Per §44.6.4.1 + §4.8.2 |
| Add `actor_type=external_harness` to §4.8.1 enum | 1 | AE-MPP-23 |
| Add `cost_center=rev_decision_layer_transact` to §4.8.12 enum | 1 | AE-MPP-24 |
| Add `feedback_subject_kind=decision_layer_recommendation` to §27.4.11 enum | 1 | AE-MPP-25 |
| Add `EOI.decision_id` nullable FK field | 1 | AE-MPP-25c |
| Add `SellerSignal.contribution_kind=decision_layer_query` to §27.9 enum | 2 | AE-MPP-36 |
| Add `SellerOrg.accepted_payment_protocols` field | 3 | AE-MPP-23a |
| Create `decision_engine_versions` table (parallel to `marketplace_match_score_model_versions`) | 2 | Per §27.4.5 |
| Create `policy_pack_documents` join table | 2 | |
| Create `payment_protocol_registrations` table | 3 | Per §52.10 |
| Cold-storage retention scheduler for 60-day-hot → 7-year-cold Decision rows | 3 | Per `decision_60d_default_buyer_org` retention class |

**Removed from v1 list:** "Add `decision_layer` to `console` enum" (deleted — Path A in v2 §2.11 retains existing 5 console enum values; entity scoping uses `console=marketplace` which is already in §1.3.2).

---

## 3. Operational Artifacts

### 3.1 Ops Console (§50) Surface Additions (substantially same as v1)

Per §50 Ops Console scope rules: every new operational surface needs Ops-role authoring. v2 confirms the new role `ops_decision_layer_admin` (analogous to existing `ops_capability_admin`, `ops_finance_admin`, `ops_compliance_admin`).

| Surface | Sprint | Notes |
| :--- | :--- | :--- |
| Decision Layer dashboard (volume, latency, error-rate, override-rate, fairness-parity) | 2 | Parallel to existing §50 Marketplace dashboard |
| `DecisionEngineVersion` publish / shadow / deprecate / rollback control | 2 | Dual-sign-off (Applied ML + Founder) per §27.4.5 pattern |
| PolicyPack Ops admin (org-level inspection, no edit; support-escalation only for content access) | 2 | Privacy-respecting per §27.4.11 reporter-redaction pattern |
| AgentCaller Ops revoke (force-revoke a token if compromised) | 1 | Security incident response capability |
| Tier-3 transaction inspector (per-transaction audit, dispute path entry) | 3 | Per §4.8.12 marketplace-revenue inspection pattern |
| Decision-Feedback triage queue (extends existing `MarketplaceMatchScoreFeedback` triage per §27.4.11) | 2 | New `feedback_subject_kind=decision_layer_recommendation` value flows into existing triage; no parallel queue |
| Integrity-audit-finding management (publish, archive, link to remediation Linear ticket) | 3 | Annual third-party audit input/output |

### 3.2 Customer Support Runbooks (same as v1)

| Runbook | Trigger | Status |
| :--- | :--- | :--- |
| Customer says Decision was wrong | Decision Feedback filed (extends §27.4.11 existing) | Not authored |
| Customer says agent never received Decision | API-error report | Not authored |
| Tier-3 transaction failed mid-flight | Stripe Link / Stripe Agentic / x402 failure | Not authored |
| AgentCaller token may be leaked | Revoke + rotate; Ops audit | Not authored |
| Customer wants Decision Layer disabled | Org-Owner-initiated downgrade flow | Not authored |
| Seller claims unfair ranking | Routes to existing §27.8 Marketplace Abuse path | Not authored |
| Procurement-law dispute (kickback claim) | Legal escalation; preserve Decisions + PolicyPacks for audit | Not authored |
| Payment-rail dispute / chargeback | Surface chargeback evidence package; cooperate with payment rail | Not authored |

### 3.3 SRE / On-Call Runbooks (same as v1)

7 scenarios per v1 (Decision Engine latency / replay drift / Anthropic outage / Stripe outage / OpenSearch degraded / Vault outage / MCP server outage). Each needs runbook authoring at Sprint 2–3.

### 3.4 Observability + Alerting (mostly inherited from v1)

| Telemetry | Sprint | Notes |
| :--- | :--- | :--- |
| Decision Engine latency histogram (P50/P95/P99) per endpoint | 1 | OpenTelemetry to existing dashboards |
| Decision-accept-rate per AgentHarness | 2 | Cohort by `agent_harness_kind`; alert on accept-rate < 60% sustained 24h |
| Override-rate by category | 2 | Alert on > 50% override sustained 7d |
| `policy_pack_alignment_score` distribution by Org | 2 | Sanity check on policy-pack functioning |
| Tier-3 transaction success rate by payment protocol | 3 | Alert on < 95% success per protocol per 24h |
| Hard-gate firing rate (residency / banned / opt-out / policy_pack_banned) | 1 | Alert on anomalous spikes per category |
| KB-freshness-warning rate | 1 | Drives seller outreach |
| `decision.replay_drift_detected` rate | 2 | Should be 0; any non-zero is P0 |
| Margin-floor compliance per capability | 1 | Existing §34.3.3 cost-base recalc extended |
| Distribution-channel attribution per Decision | 2 | For GTM analytics |
| `MarketplaceMatchScoreFeedback` rate per `feedback_subject_kind=decision_layer_recommendation` | 2 | Triage queue health |

---

## 4. Security + Compliance

### 4.1 Threat Model (Sprint 1 — pre-build)

10 threats per v1 §4.1 — preserved verbatim. v2 addition: explicit `actor_type=external_harness` audit-trail completeness check (every Decision-Layer AIOperation row carries actor_type correctly per §4.8.1 frozen-snapshot pattern).

### 4.2 Pen Test + SOC2 Audit

- Pen-test scope per v1 §4.2; Sprint 3
- SOC2 audit scope expansion to include `policy_packs`, `decisions`, `agent_callers`, `decision_mcp_session_token_records` tables in existing TSC; Q3 2026 audit window
- Federal-state-funded-buyer disclaimer flow per v1 §6.9 + Tier-3 system-disable when `PolicyPack.is_federal_or_state_funded=true`; Sprint 2

### 4.3 Annual Third-Party Integrity Audit Framework (preserved from v1)

5 artifacts per v1 §4.3. Sprint 0 critical-path because audit-firm engagement is 12-month timeline.

---

## 5. UX/UI Spec (substantially reduced from v1)

The v2 reframing eliminates several UX surfaces because v2 reuses existing surfaces.

### 5.1 Buyer Console Surfaces

| Surface | Sprint | v2 Reuse | What's left |
| :--- | :--- | :--- | :--- |
| "Procurement Policy" tab in Org Settings (PolicyPack management) | 1 | New | Component spec, state catalog, interaction patterns, accessibility, mobile, all-states render |
| "Agent Access" tab in Org Settings (AgentCaller management) | 1 | New | Same as above; including token-issuance modal, rotation flow, revocation flow, monthly-budget picker |
| Decision History list view | 2 | New | List with filter (date, agent caller, category, accept-status); empty state |
| Decision Detail view | 2 | **Reuses §13.11 Defense View component (AE-MPP-26)** | The Defense View's existing rendering of rationale + evidence + audit receipt is reused; new `defense_view_lifecycle_state=decision_review` overlay |
| "Why was this chosen?" panel (embedded in agent harness UIs) | 2 | New | Component spec for embeddable panel; per-harness rendering rules (Cursor sidebar / Cline status / Claude Code conversation) |
| "Agentic Transactions" history (Tier 3) | 3 | Reuses §4.8.12 Marketplace Discovery Revenue inspection pattern | List + detail; per-transaction audit receipt; chargeback path |
| Solo-Tier billing-card binding | 1 | **Reuses §44.6.2 single-card surface** | No new surface; the existing single-card rendering binds Decision Layer consumption silently per §44.6.1 surface-hide list |
| Free-tier 50-decisions-used-counter | 1 | New | Inline counter on "Agent Access" tab; upgrade CTA at 80% |
| Defense View parity for Decision artifacts | 2 | **Reuses existing §13.11 Defense View** | No parallel surface needed (corrected from v1) |

### 5.2 Decision Browser (Public Surface) `decisions.sourcera.com`

| Surface | Sprint | v2 Reuse | What's left |
| :--- | :--- | :--- | :--- |
| Public-shared Decision render | 2 | **Reuses §13.11 Defense View component (AE-MPP-26)** | The Defense View's existing PDF + share-link primitives (per §13.11.6) extend to Decision artifacts; only the component overlay + share semantics are new |
| Non-shareable Decision render (404) | 2 | Existing §27.11.7 404-not-403 doctrine | 404 page; never reveals existence; analytics suppression |
| Audit-receipt verifier endpoint UI | 3 | **Reuses §27.4.12 audit-receipt verifier** | Public verifier UI extends from Match Score verifier to Decision verifier; same primitive |

### 5.3 Marketing / Pricing Site (same as v1)

| Surface | Sprint | What's needed |
| :--- | :--- | :--- |
| "Decision Layer" product page | 3 | Hero + value-prop + pricing + integrations + integrity-covenant + open-rubric link |
| Updated Buyer pricing page | 3 | Decision Layer access reflected in plan-tier comparison; free-tier 50/mo callout; Tier-3 take-rate disclosure |
| Open-rubric publication site (`/transparency/decision-rubric`) | 3 | Quarterly publication of §27.4.3 feature registry |
| Annual integrity-audit-report publication site (`/transparency/integrity-audit-2027`) | Year 1 | First report at month 12 |

### 5.4 Documentation Site (`docs.sourcera.com`)

8 sections per v1 §5.4 — preserved.

---

## 6. GTM Artifacts

### 6.1 Customer Discovery (per v2 brief §10)

Same 25-interview structure. Script + recruitment list + scheduling + synthesis framework. Sprint 0.

### 6.2 Partner Term Sheets (v2 corrected)

| Partner | v2 Update | Status |
| :--- | :--- | :--- |
| Anthropic — Claude Skills featured listing | Same as v1 | Not started |
| Cursor — extension distribution + co-marketing | Same as v1 | Not started |
| Cline / Smithery — MCP marketplace listings | Same as v1 | Not started |
| Vercel — `sourcera.toml` template integration | Same as v1 | Not started |
| **Stripe — Stripe Link-for-Business + Stripe Agentic Checkout co-launch (v2 dual-track)** | v2 expanded — Link is the credential, Agentic is the transaction; both required for Tier-3 v1 ship | Not started; **Sprint 0 critical-path conversation Week 2** |
| Coinbase — x402 default for OSS / consumption | Same as v1 | Not started |
| Visa Intelligent Commerce / Mastercard Agent Pay | Same as v1 (Year 2) | Deferred |
| Google AP2 | Same as v1 (Year 2+) | Deferred |
| Linear / Notion / GitHub | Same as v1 | Not started |

### 6.3 Launch Materials (same as v1)

8 assets per v1 §6.3 — preserved.

### 6.4 Updated GTM Corpus (same as v1, minor v2 refinements)

5 file updates per v1 §6.4. v2 refinement: `GTM_POSITIONING.md` adds Marketplace-domain framing (vs. v1's "third console") to the category-anchor narrative.

---

## 7. Validation + QA Framework

### 7.1 CI Gates (Sprint 1–3)

12 gates per v1 §7.1, **plus 6 mirror gates** from existing §M.5 (per v2 §4.15):
- `decision_layer_no_pay_for_placement` (Sprint 1) — new
- `decision_replay_byte_identical` (Sprint 2) — new
- `decision_layer_console_firewall` (Sprint 1) — new
- `decision_layer_policy_pack_residency_consistency` (Sprint 1) — new
- `match_score_inspect_no_weight_leakage` (Sprint 1) — new
- `policy_pack_banned_short_circuit` (Sprint 1) — new
- `decision_layer_excludes_promoted_placements` (Sprint 1) — new
- `decision_layer_solo_envelope_compliance` (Sprint 1) — new (mirror of §44.6.8 #5)
- `decision_layer_endpoint_size_constraints` (Sprint 1) — new
- `decision_layer_idempotency_60s_replay` (Sprint 1) — new
- `policy_pack_object_size_limit` (Sprint 1) — new
- `agent_caller_token_format` (Sprint 1) — new
- `decision_layer_no_console_bridge_emission` (Sprint 2) — new (mirror of `console_bridge_no_internal_comment_imports`)
- `decision_layer_jwt_claim_completeness` (Sprint 1) — new
- `decision_recommendation_citation_completeness` (Sprint 1) — new (mirror of `agent_output_uncited_sentence`)
- `decision_layer_firewall_no_draft_capability_reads` (Sprint 1) — new
- `webhook_payload_no_decision_rationale_body` (Sprint 2) — new (mirror of §31.6.1 `webhook_payload_no_selection_report_narrative`)
- `decision_engine_replay_immutability_post_settlement` (Sprint 2) — new (mirror of `ai_operation_immutable_after_settlement` doctrine)

**Total: ~18 new CI gates registered to §M.5** (up from v1's ~20 estimate — v2 collapsed several into mirror gates that re-use existing rule frameworks).

### 7.2 Test Strategy (same as v1)

8 test classes per v1 §7.2 — preserved.

### 7.3 Concierge MVP Instrumentation (same as v1)

4 mechanisms per v1 §7.3 — preserved.

---

## 8. Sequencing — Critical Path

Same 12-week timeline as v1, but with FTE compression:

```
Week  -2 ─ Sprint 0 begins (founder + 1 PM + 1 staff engineer + 1 senior backend; ~6 FTE-weeks):
              Customer-discovery interviews (25, 4 weeks)
              Technical spikes (4 spikes, 2 weeks parallel)
              Audit-firm RFP issued
              Phase 14.21 prompt authoring
              AE ledger seeding (37 entries, AE-MPP-01..37)
              Implementation Pack 1 authoring
              §52 / §22.10.x / §27.4.3 / §32.10 authoring (~2 FTE-weeks; reduced from v1's 3 because reuse depth)
              Stripe Link-for-Business partnership conversation (Week 2)
              Cursor / Anthropic / Cline / Smithery / Vercel partnership conversations (Week 2-3)
Week  +0 ─ Sprint 1 begins (Sprint 0 partially overlaps):
              Decision Engine v0
              MCP server v0
              `decision.recommend` REST endpoint
              `agent_sourcera_decision_recommender_v1` agent definition
              `policy_pack_alignment_score` Match-Score feature
              `policy_pack_banned_flag` hard gate
              `actor_type=external_harness` enum
              `cost_center=rev_decision_layer_transact` enum
              `EOI.decision_id` FK
              `feedback_subject_kind=decision_layer_recommendation` enum
              Decision Layer capability registry registrations (with `surface_throttling_class=active_workflow` + `solo_envelope_no_block=true`)
              Concierge MVP framework
              CI gates (12 of 18)
Week  +3 ─ Sprint 1 complete; Sprint 2 begins:
              Tier 2 surfaces
              `decision.justify` / `decision.alternatives` / `decision.replay`
              `policy_pack.parse` Opus capability
              Decision Browser (leveraging §13.11 Defense View component)
              All 11 webhook events
              Audit-receipt primitive (extends §27.4.12)
              Fairness audit suite extension (extends §27.4.11)
              `SellerSignal.contribution_kind=decision_layer_query` enum
              First 5 design partners onboarded
              `MarketplaceMatchScoreFeedback` extension to Decision Layer
              Implementation Pack 2 authoring
              Remaining 6 CI gates
Week  +7 ─ Sprint 2 complete; Sprint 3 begins:
              EU residency-scoped DecisionEngineVersion
              Stripe Link-for-Business + Stripe Agentic Checkout integration
              Coinbase x402 integration
              Tier-3 per-category cap configuration
              `PaymentProtocolRegistration` entity
              `SellerOrg.accepted_payment_protocols` field
              Production load test
              Pen test
              SOC2 audit kickoff
              Implementation Pack 3 authoring
Week +10 ─ Sprint 3 complete; Sprint 4 begins:
              Public Beta GA
              Anthropic Skills + Cursor + Cline + Smithery + Vercel + Stripe Link/Agentic co-launch
              Decision Browser public
              v7.2.0 stamp
              AE ledger ratification (37 entries)
              Year-1 integrity-audit window opens
Week +12 ─ GA stamp.
```

**Critical-path dependencies (v2 corrected):**

1. **Customer discovery → Sprint 1.** Cannot start Sprint 1 if §10.1 NO-GO thresholds breach.
2. **Sprint 1 entity authoring → Sprint 2 Tier-2 surface.** Decision entity must be live before Decision Browser ships.
3. **Sprint 2 webhook authoring → Sprint 3 Tier-3.** Webhook DLQ production-ready before agentic transactions fire.
4. **Sprint 3 EU residency → GA.** US-only GA loses EU design partners; if EU not ready, defer GA by 4 weeks.
5. **Stripe Link-for-Business availability (Q22) → Sprint 3.** If Stripe Link doesn't support B2B credentials by GA window, fall back to consumer Link with `billing_admin`-bound enrollment workflow (substantially more friction; reconsider Tier-3 timing).
6. **Audit-firm engagement → Year-1 integrity audit.** RFP issued at Sprint 0; firm engaged by Sprint 2; audit window opens at month 12.

---

## 9. Decision Gates — Founder + GTM Sign-Off Required Before Sprint 1

13 decisions per v1 §9 plus 7 v2 additions:

| Decision | Default | Owner | Trigger |
| :--- | :--- | :--- | :--- |
| Build vs. defer vs. kill | Defer pending §10.1 customer discovery | Founder | Discovery results week 4 |
| Org-context auth — vault-JWT vs. OAuth-OBO vs. both | Vault-JWT (per v1 §12 Q1) | Staff Engineer + Founder | Partner conversations week 2–3 |
| Tier-3 primary payment partner — Stripe Link+Agentic vs. x402 vs. both (v2 expanded) | Both — Stripe primary, x402 alt | Founder + GTM Lead | Partner conversation week 3 |
| Free-tier limit — 25 vs. 50 vs. 100 | 50 | Founder | Customer discovery week 4 |
| OSS template format — TOML vs. YAML | TOML | DevRel Lead | Maintainer conversation week 2 |
| Promoted-Listing inclusion | Excluded | Founder | Pre-Sprint 0 |
| Anthropic Skill — native or MCP plugin | Both | GTM Lead + Anthropic partner | Week 2 |
| EU residency at v1 vs. GA+1 | GA (Sprint 3) | Staff Engineer | Sprint 0 |
| `policy_pack.parse` priority | Sprint 2 | PM | Sprint 0 |
| Decision Browser default `is_publicly_shareable` | False | Founder + Legal | Sprint 0 |
| Tier-3 take-rate sensitivity | 1.5% capped at $50 with 0.5% rebate | Founder + GTM Lead | Customer discovery week 4 |
| Federal-state-funded-buyer Tier-3 disablement | Hard-disabled | Founder + Legal | Pre-Sprint 0 |
| Annual third-party audit firm | TBD; RFP at Sprint 0 | Founder | Audit-firm shortlist by Sprint 2 |
| **(v2 new) Path A vs. Path B on console scoping (per Q24)** | Path A — `console=marketplace` for entities | §1.3 / §4.8.1 entity owner | Pre-Sprint 1 |
| **(v2 new) `actor_type=external_harness` enum extension (Q23)** | Add new value | §4.8 entity owner | Pre-Sprint 1 |
| **(v2 new) `EOI.decision_id` FK addition (Q25)** | Add nullable FK | §27.5 entity owner | Pre-Sprint 1 |
| **(v2 new) `MarketplaceMatchScoreFeedback.feedback_subject_kind=decision_layer_recommendation` (Q25b)** | Add new value | §27.4.11 entity owner | Pre-Sprint 1 |
| **(v2 new) `Decision-Recommend` trigger class addition to §27.4.2 (Q27)** | Add as fourth trigger class | §27.4 entity owner | Pre-Sprint 1 |
| **(v2 new) Decision Browser leverages §13.11 Defense View component (Q26)** | Reuse | §13.11 entity owner | Pre-Sprint 2 |
| **(v2 new) Stripe Link-for-Business B2B availability (Q22)** | Confirm with Stripe | Founder + Stripe partner | Week 2 of Sprint 0 |

---

## 10. Open-Question Triage Summary (v2 expanded)

The brief's §12 enumerates 27 open questions (v2 added 7 to v1's 20). Triage:

| Resolution path | Question count | Sequenced |
| :--- | :--- | :--- |
| Resolved by §10.1 customer discovery | 9 (Q1, Q2, Q4, Q9, Q10, Q11, Q14, Q15, Q20) | Week 0–4 |
| Resolved by partner conversations | 5 (Q5 OSS template format, Q7 Anthropic Skills, Q12 Tier-3 take-rate sensitivity, Q18 Tier-3 reversibility, **(v2) Q22 Stripe Link B2B**) | Week 2–4 |
| Resolved by founder + GTM decision | 5 (Q3 determinism SLO, Q6 Promoted-Listing exclusion confirmed, Q8 EU residency timing, Q13 first-year-cost methodology, Q19 free-tier-abuse) | Week 0–2 |
| **(v2) Resolved by spec-entity owner sign-off** | 6 (Q21 PolicyPack ↔ Link sync, Q23 actor_type, Q24 console-scoping, Q25 EOI FK, Q26 Defense View reuse, Q27 trigger class) | Pre-Sprint 1 (entity-owner gate) |
| Defer to v7.3.0+ | 2 (Q16, Q17) | Year 2 |

All 27 must be decision-resolved (or explicitly deferred) before Sprint 1 begins.

---

## Closing — Total Authoring + Engineering Estimate (v2 reduced)

| Workstream | v1 estimate | v2 estimate | Reason for change |
| :--- | :--- | :--- | :--- |
| Master Spec authoring (§52 + cross-section deltas + AE ledger + RECONCILIATION + DELTA_INVENTORY + Phase prompts) | ~3.0 FTE-months | **~2.0 FTE-months** | v2 reuse of §27.4 Match Score / §27.4.11 feedback / §27.5 EOI / §27.9 Seller Signals / §22.8 vault-JWT / §44.6 Solo / §13.11 Defense View / §27.4.12 audit-receipt eliminates parallel authoring of these primitives |
| Engineering build (Sprints 1–3) | ~10–14 FTE-months | **~8–11 FTE-months** | v2 reuse of MCP infrastructure, vault infrastructure, AIWallet, Outcome Resolver, Defense View, audit-receipt, model-version registry |
| UX/UI spec authoring | ~1.5 FTE-months | **~1.0 FTE-months** | v2 Decision Browser reuses §13.11 Defense View component (AE-MPP-26); Solo billing surface reuses §44.6.2 single-card |
| GTM artifacts (discovery + partnerships + launch + content) | ~2.5 FTE-months | ~2.5 FTE-months | Unchanged |
| Ops + SRE runbooks + Ops Console | ~1.5 FTE-months | **~1.0 FTE-months** | v2 reuse of §50 Ops Console patterns + §27.4.11 triage queue extension (no parallel queue) |
| Security + compliance | ~1.0 FTE-months | ~1.0 FTE-months | Unchanged |
| QA framework + concierge MVP + CI gates | ~1.0 FTE-months | ~1.0 FTE-months | Unchanged (CI gate count similar) |
| **Total to GA** | **~21–25 FTE-months** | **~14–18 FTE-months** | **~30% reduction from v2 reuse depth** |

This sizes to ~5–6 full-time people for 12 weeks, with founder + 1 PM + 1 staff engineer driving Sprint 0 single-handedly. The engineering FTE-month range matches `Research_MPP.md` v2 §9.

If the program is greenlit, the immediate next deliverables (Week -2 of Sprint 0) — preserved from v1 with v2 corrections:

1. `_integration/RECONCILIATION.md` Decision Layer block (1 FTE-week)
2. `_integration/Integration_Prompts_v7.2.md` (Phase 14.21–14.24 prompts; 0.5 FTE-week)
3. AE ledger seeding (37 entries; 0.25 FTE-week — expanded from v1's 22 due to v2 surfacing)
4. §52 Purpose & Scope + Architectural Overview + Marketplace-domain framing (0.75 FTE-week — reduced from v1's 1 due to v2 framing being already authored in the brief)
5. Customer-discovery interview script + recruitment list (0.5 FTE-week)
6. Audit-firm RFP draft (0.25 FTE-week)
7. Sprint 0 Implementation Pack: Decision Engine v0 scaffolding + agent definition + concierge MVP framework (3 FTE-weeks; engineering)
8. **(v2 new) Stripe Link-for-Business partnership outreach + brief (0.5 FTE-week — Founder + GTM Lead, Week 2)**

That's the honest bridge from `Research_MPP.md` v2 to a buildable v7.2.0 stamp. The 30% FTE-month reduction from v2's reuse-depth reframing materially de-risks the 12-week pilot.
