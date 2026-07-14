# Research_MPP_Implementation_Gaps.md — From Brief to Buildable

**Status:** Implementation-readiness gap catalog. Authored 2026-04-29. Companion to `Research_MPP.md`.
**Purpose:** `Research_MPP.md` is a strategic exploration brief with embedded spec-fidelity authoring extensions. To ship the Decision Layer as an actual product capability end-to-end, the work below must be authored, scaffolded, ratified, or built. Each gap is sized, owner-assignable, and sequenced.

The brief delivers the *thesis*, the *architecture*, the *integrity covenant*, the *commercial posture*, and *roughed-in* spec deltas. It does not deliver: full Master-Spec sections, the integration-program scaffolding, the engineering implementation packs, the ops-console surface, the UX spec, the partner term sheets, the documentation site, or the QA framework. Below is the punch list.

---

## 1. Authoritative Spec Authoring Still Required

The brief sketches the new section §52 and the §22 / §27 / §32 / §34 / §44 / §39 / §6.8 / §40.2 / Appendix-J/K/M/I deltas. To get to v7.2.0 stamp readiness, every one of these needs a Master-Spec-fidelity full pass.

### 1.1 New Section §52 — Full Authoring

| Sub-section | What's authored in brief | What's left |
| :--- | :--- | :--- |
| §52.1 Purpose & Scope | One-paragraph thesis | Full purpose-and-scope authoring with cross-section dependency map; in-scope / out-of-scope list; source-of-truth precedence within §52 |
| §52.2 Architectural Overview | 11-step pipeline narrative | Layered model diagram (parallel to §22.2.1 KB stack diagram); Mappings table (Master-Spec concept ↔ engineering realization); beta-header / version-pinning discipline analogous to §22.2.3 |
| §52.3 PolicyPack Entity | Full field table | State machine (`draft → published → deprecated → archived`) rendered as From/To/Trigger; required indexes; retention rules per §40.2; failure-modes-addressed counterfactual block; acceptance criteria |
| §52.4 Decision Entity | Full field table | State machine (`pending → recommended → accepted | overridden | rejected | regression_detected`) — rendered; failure modes; acceptance criteria |
| §52.5 AgentCaller Entity | Full field table | State machine; token-rotation semantics; revocation cascade; failure modes; acceptance criteria |
| §52.6 The MCP Server | Architecture sketch | Per-tool full contract (input + output JSON Schemas, error codes, idempotency, examples) for `decision.recommend`, `decision.justify`, `decision.alternatives`, `decision.policy_check`, `decision.transact_intent`, `decision.replay`, `policy_pack.read` — only `decision.recommend` is fully authored in the brief |
| §52.7 Decision Engine Versioning | Determinism contract paragraph | `DecisionEngineVersion` entity (parallel to `MarketplaceMatchScoreModelVersion` per §27.4.5) — full field table, state machine (`candidate → shadow → published → deprecated → retired | rolled_back`), publication dual-signoff rules, rollback procedure |
| §52.8 Tier-1 surface | Bullet | Full surface-contract authoring with edge cases, failure modes, acceptance criteria |
| §52.9 Tier-2 surface | Bullet | Same; plus partner-onboarding-URL allowlist authoring + state machine |
| §52.10 Tier-3 surface | Bullet | Same; plus per-payment-protocol integration contract (Stripe Agentic, x402, Visa ICC, Mastercard Agent Pay, Google AP2 — each a sub-section); chargeback / dispute path; per-category transaction-cap state machine |
| §52.11 Failure Modes | Six categories listed | Numbered, counterfactual-pass-style block matching the §22.4.x convention (resolved/mitigation per failure) |
| §52.12 Acceptance Criteria | Implicit | 30+ numbered, observable, testable criteria covering every entity, every endpoint, every webhook, every plan-gate, every CI gate |

### 1.2 §22 / §27 / §32 / §34 — Cross-Section Authoring

| Section | Brief authoring | What's left |
| :--- | :--- | :--- |
| §22.10.x — `agent_sourcera_decision_recommender_v1` | Field table | Full system prompt (parallel to §22.10.2 — RAG-only inviolable rules; workflow per requirement; output format; tools JSON; MCP servers JSON; skills JSON; metadata JSON); failure-modes block per §22.10.8 convention |
| §22.11.x — `emit_structured_rationale` custom tool | Mentioned | Full input schema, output schema, error codes, server-side validation, idempotency |
| §22.11.x — `match_score_inspect` internal tool | Mentioned | Full contract — what fields it exposes (feature values, contribution direction/magnitude bucket per §27.4.6) and what it explicitly does NOT expose (weight magnitudes, raw model coefficients); CI-gate `match_score_inspect_no_weight_leakage` |
| §22.12 — Skills | Mentioned (`skill_sourcera_decision_rationale`) | Skill body authored (system-prompt-equivalent); progressive disclosure rules; version |
| §22.13 — Environments | Mentioned (`env_sourcera_decision_runner_v1`) | Environment definition: container image, allowed tools, resource limits, network egress allowlist |
| §27.4.3 — `policy_pack_alignment_score` feature | Field-table row | Computation methodology (how policy-pack fields combine into a 0.0–1.0 score; null handling for missing pack; per-feature contribution); offline-eval guardrails for the new feature |
| §27.4.4 — `policy_pack_banned_flag` hard gate | Mentioned | Full hard-gate semantics; CI-gate `policy_pack_banned_short_circuit` parallel to existing `match_score_hard_gate_short_circuit` |
| §27.4.5 — Decision-Engine retraining | Inherited | Whether the Decision Engine has its own retraining cadence vs. inheriting Match-Score's; what triggers a Decision-Engine version bump; rollout cohort sizing |
| §27.4.11 — Fairness audit suite extension | Mentioned | New metrics for Decision-Layer-specific fairness: per-PolicyPack parity, per-AgentHarness parity, per-Tier (T1/T2/T3) parity, override-rate-by-cohort drift |
| §27.4.12 — API extension | Mentioned | Audit-receipt verifier endpoint — full contract (signature verification, key rotation, replay-protection); HMAC key rotation policy; receipt-validity-after-key-rotation semantics |
| §32.10 — Decision Layer endpoint detail | Mentioned | Per-endpoint authoring: full request/response/error/idempotency for `POST /v1/decisions`, `GET /v1/decisions/{id}`, `POST /v1/decisions/{id}/accept`, `POST /v1/decisions/{id}/justify`, `POST /v1/decisions/{id}/alternatives`, `POST /v1/decisions/{id}/transact`, `GET /v1/decisions/{id}/replay`, `GET /v1/decisions/{id}/audit-receipt`, `GET /v1/decisions`, `POST /v1/policy-packs`, `GET /v1/policy-packs`, `GET /v1/policy-packs/{id}`, `PATCH /v1/policy-packs/{id}`, `DELETE /v1/policy-packs/{id}`, `POST /v1/policy-packs/{id}/parse-document`, `POST /v1/agent-callers`, `GET /v1/agent-callers`, `PATCH /v1/agent-callers/{id}`, `DELETE /v1/agent-callers/{id}`, `POST /v1/agent-callers/{id}/rotate-token`. Brief authors only `decision.recommend`; remaining ~19 endpoints are unfilled |
| §34.3.4 — Pricing rate card | New rows tabled | Per-capability cost-base seed values; `min_value_price_cents` and `min_cost_price_cents` floors; OutcomeContract definitions for `decision.recommend`, `decision.justify`, `decision.alternatives`, `decision.policy_check`, `decision.transact`, `policy_pack.parse` (what's the accept signal, what's the rejection condition, what's the window) |
| §34.10 — Wallet posting for `decision_layer` console | Inherited | Whether `decision_layer` AIOperations pool with `buyer` console wallet (proposed) or are separate; co-resident-pool rules analogous to §34.10.3 Solo-co-resident |
| §34.11 — Outcome Resolver new signals | Mentioned | New signals registered: `decision_recommend`, `decision_justify`, `decision_alternatives`, `decision_policy_check`, `decision_transact`, `policy_pack_parse` — each with the §34.11.1 signal-name + ContractEvent linkage |
| §34.13 — Pro Trial Seat Grant interaction | Not authored | Does the Decision Layer interact with M17 Pro Trial Seats? Probably not — Decision Layer is buyer-side; M17 grants seller-side. Confirm and document |
| §44.1 — Performance targets | New rows | Absorbed into §44.1 authoritatively; cross-reference from §52.7 |
| §44.6 — Solo-Tier Surface Treatment | Inherited | Decision Layer is `active_workflow` per §44.6.4.1 — register `decision.recommend`, `decision.justify`, `decision.alternatives`, `decision.policy_check`, `decision.transact` in the capability-registry with `surface_throttling_class=active_workflow` and confirm `solo_envelope_no_block` posture per capability |
| §39 — Object size constraints | New rows tabled | Authoritative cell additions to the §39 table |
| §6.8 / §40.2 — Retention | Two new classes mentioned | Full retention table rows; DSAR right-to-erasure flow; cold-storage migration semantics |
| Appendix C — Notification Event Catalog | 8 events listed | Per-event authoritative payload schema (parallel to §27.4.9); registration under "Decision-Layer-Domain Events" header |
| Appendix G — PostHog Event Taxonomy | Mentioned | Per-event property schema; super-property registration (`decision_engine_version`, `policy_pack_version`, `agent_harness_kind` carried on every event) |
| Appendix I — Error Codes | 14 codes listed | Each registered with HTTP status, semantics, retry guidance |
| Appendix J — Enums | 9 new enums listed | Each with full value list, source-section authority, cross-reference to consumers |
| Appendix K — Glossary | 6 new terms drafted | Each polished to Master-Spec convention; inserted alphabetically |
| Appendix L — State Machines | Three needed (Decision, PolicyPack, AgentCaller) | Each as From/To/Trigger/Conditions/Notes table |
| Appendix M — Surface/Engine Mapping | 12 new rows drafted | Polished to §M.1 column schema; inserted under new "Decision Layer (§52)" header; CI-gate cross-references registered to §M.4 / §M.5 |

### 1.3 New Concepts Surfaced in Brief That Need Their Own Spec Home

| Concept | Where it lives | Required authoring |
| :--- | :--- | :--- |
| `DecisionEngineVersion` entity | New, parallel to `MarketplaceMatchScoreModelVersion` (§27.4.5) | Full entity spec, state machine, publication dual-signoff, rollback procedure, retention 7y for audit |
| Audit-receipt HMAC key rotation policy | Generalized from §27.4.12 / §4.3.21 Selection Report | Key-pair generation cadence, key-id field in receipts, multi-key validity window, rotation runbook |
| `policy_pack.parse` Opus capability | New | Full agent definition, system prompt, output JSON Schema, cite-verify-equivalent for parsed policy lineage |
| Vault-JWT scope-token issuance for Decision Layer | Generalized from §22.8.3 KB-server vault pattern | Per-call token issuance vs. per-session; expiry default; rotation semantics; scope-claim contents (`buyer_org_id`, `agent_caller_id`, `policy_pack_id`, `tier`, `monthly_decision_budget_remaining`) |
| Marketplace Decision Browser surface (`decisions.sourcera.com`) | New public surface | Render contract; what's exposed for `is_publicly_shareable=true` decisions; what's exposed for `is_publicly_shareable=false` (404, not 403, per §7.2 firewall doctrine); SEO posture; rate-limit class |
| OSS template `sourcera.toml` schema | New format | TOML schema, validation rules, default Org binding, abuse-prevention (one-shared-Org-id-can't-burn-all-of-Sourcera's-marketing-budget) |
| Community-pool Org administration | New | Who owns it operationally; how marketing-budget is allocated; abuse cutoff; "Sourcera Cost Center: Decision Layer Distribution" |
| Tier-3 per-category transaction cap pre-authorization | Mentioned | UI flow, audit-event shape, mid-decision cap-bump request flow (when an agent wants to transact above the cap and needs synchronous human approval), notification routing per §29 |

---

## 2. Engineering Scaffolding

### 2.1 Integration-Program Artifacts

| Artifact | Status | What's needed |
| :--- | :--- | :--- |
| `_integration/RECONCILIATION.md` Decision Layer block | Not started | Full reconciliation log entry: decision-by-decision documenting why §52 is added (vs. extending §27); how cross-section refs were resolved; conflicts surfaced and resolved; AE rationale per row |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` rows | Not started | AE-MPP-01 through AE-MPP-22 each as ledger row: status (pending), proposed-by, ratification-gate, owner-notification-target, dependency on prior AEs, release-gate impact (v7.2.0 stamp blocker yes/no) |
| `_integration/Integration_Prompts_v7.2.md` (new program) | Not started | Phase 14.21 (Sprint 1 — entity + endpoint), Phase 14.22 (Sprint 2 — beta surfaces + webhook), Phase 14.23 (Sprint 3 — production hardening), Phase 14.24 (GA stamp) — each as Opus-optimized phase prompt with verification gate |
| `_integration/PHASE14_21_VERIFY.md` … `PHASE14_24_VERIFY.md` | Not started | Per-phase adversarial-review log (created during execution, not pre-authored) |
| `_integration/Decisions.md` open-decisions queue | Needs 20 new entries | The 20 open questions in §12 of the brief each need a row; advisory recommendation; status (`open`, `awaiting_partner_input`, `awaiting_founder_decision`); owner; due date |
| `_integration/DELTA_INVENTORY.md` v7.2.0 inventory | Not started | Full delta walked out of `Research_MPP.md`: every new entity, endpoint, webhook, enum, error code, plan-gate row, capability-registry row, OutcomeContract, PostHog event, Audit-event-action, retention class, CI gate, glossary term, surface-mapping row |

### 2.2 Build-Execution Artifacts

| Artifact | What's needed |
| :--- | :--- |
| `Build_Execution_Strategy.md` v2.x — "Decision Layer Program" sub-section | Three-layer execution model adapted for the Decision Layer; how the Decision Layer milestones bind to Linear cycles; Implementation Pack schemas |
| `Linear_Execution_Blueprint.md` v2.1 program addition | Linear project `Decision Layer (M30+)` with milestones M30 (Engine v0), M31 (Beta surfaces), M32 (Production hardening), M33 (GA); cycle structure; issue templates; label set (`area:decision-layer`, `tier:t1`, `tier:t2`, `tier:t3`, `surface:mcp`, `surface:rest`, `integration:partner`); estimation approach; dependency edges to existing M-series milestones |
| Sprint-1 Implementation Pack | Per `Build_Execution_Strategy.md` §11: AGENTS.md for `packages/sourcera-decision-engine/`, `packages/sourcera-mcp-decision-server/`, `packages/sourcera-decision-sdk-ts/`; per-file scope; test matrix; acceptance gates |
| Sprint-2 Implementation Pack | Same for Tier-2 + webhooks + Decision Browser |
| Sprint-3 Implementation Pack | Same for Tier-3 + Stripe Agentic + x402 + production hardening |
| Sprint-0 (concierge MVP) Implementation Pack | What "concierge" means concretely: feature-flag gating, manual-rank-override surface for Sourcera-internal operators, override-logging schema, design-partner onboarding runbook |

### 2.3 Codebase Scaffolding

| Package | Purpose | Sprint |
| :--- | :--- | :--- |
| `packages/sourcera-decision-engine/` | The Decision Engine pipeline orchestrator | Sprint 1 |
| `packages/sourcera-mcp-decision-server/` | The MCP server hosted at `mcp.sourcera.com/decision/v1` | Sprint 1 |
| `packages/sourcera-decision-sdk-ts/` | TypeScript SDK for Node-based agent harnesses | Sprint 1 |
| `packages/sourcera-decision-sdk-py/` | Python SDK for Python agent runtimes | Sprint 2 |
| `packages/sourcera-decision-sdk-go/` | Go SDK | Sprint 3 |
| `packages/sourcera-decision-sdk-rust/` | Rust SDK | Sprint 3 |
| `packages/sourcera-policy-pack-parser/` | Opus-driven free-text → structured PolicyPack | Sprint 2 |
| `packages/sourcera-agent-definitions/decision_recommender/` | Agent definition + system prompt + skill bodies | Sprint 1 |
| `packages/sourcera-payment-rails/stripe-agentic/` | Stripe Agentic Checkout integration | Sprint 3 |
| `packages/sourcera-payment-rails/x402/` | Coinbase x402 integration | Sprint 3 |
| `packages/sourcera-decision-browser-web/` | The Decision Browser at `decisions.sourcera.com` | Sprint 2 |
| `packages/sourcera-cli-decision/` | `sourcera decide ...` CLI for human / CI use | Sprint 2 |
| Distribution shims: `extensions/cursor-sourcera/`, `extensions/cline-sourcera/`, `extensions/claude-code-skill-sourcera/`, `templates/next-supabase-sourcera/` | Per-partner distribution package | Sprint 2–3 |

### 2.4 Database Migration Scaffolding

| Migration | Sprint |
| :--- | :--- |
| Add `decision_layer` to `console` enum (Postgres + Convex schema) | Sprint 1 |
| Create `policy_packs`, `decisions`, `agent_callers` tables with indexes | Sprint 1 |
| Add `policy_pack_alignment_score`, `policy_pack_banned_flag` to feature registry | Sprint 1 |
| Add `surface_throttling_class` registration on new capabilities | Sprint 1 |
| Add `decision_engine_versions` table | Sprint 2 |
| Add `policy_pack_documents` join table | Sprint 2 |
| Cold-storage retention scheduler for 60-day-hot → 7-year-cold Decision rows | Sprint 3 |

---

## 3. Operational Artifacts

### 3.1 Ops Console (§50) Surface Additions

| Surface | Sprint | Notes |
| :--- | :--- | :--- |
| Decision Layer dashboard (volume, latency, error-rate, override-rate, fairness-parity) | Sprint 2 | Parallel to existing §50 Marketplace dashboard |
| `DecisionEngineVersion` publish / shadow / deprecate / rollback control | Sprint 2 | Dual-signoff gate (Applied ML + Founder) |
| PolicyPack Ops admin (org-level inspection, no edit; Ops can only inspect for support) | Sprint 2 | Privacy-respecting — Ops can see schema, not preferred-vendor list contents, unless support escalation grants temporary access |
| AgentCaller Ops revoke (force-revoke a token if compromised) | Sprint 1 | Security incident-response capability |
| Tier-3 transaction inspector (per-transaction audit, dispute path entry) | Sprint 3 | |
| Decision-Feedback triage queue (analogous to §27.4.11 `MarketplaceMatchScoreFeedback` triage) | Sprint 3 | Applied-ML + Marketing dual-signoff for `escalated_to_engine_rollback` |
| Integrity-audit-finding management (publish, archive, link to remediation Linear ticket) | Sprint 3 | Annual third-party audit input/output |

### 3.2 Customer Support Runbooks

| Runbook | Trigger | Status |
| :--- | :--- | :--- |
| "Customer says Decision was wrong" | Customer-filed Decision Feedback | Not authored |
| "Customer says agent never received Decision" | API-error report | Not authored |
| "Customer says Tier-3 transaction failed mid-flight" | Stripe Agentic / x402 failure | Not authored |
| "Customer's AgentCaller token may be leaked" | Revoke + rotate; Ops audit | Not authored |
| "Customer wants Decision Layer disabled" | Org-Owner-initiated downgrade flow | Not authored |
| "Seller claims unfair ranking" | §27.8 Marketplace Abuse Report extended to Decision Layer | Not authored |
| "Procurement-law dispute (kickback claim)" | Legal escalation; preserve all Decisions and PolicyPacks for audit | Not authored |
| "Payment-rail dispute / chargeback" | Surface chargeback evidence package; cooperate with payment rail | Not authored |

### 3.3 SRE / On-Call Runbooks

| Scenario | Runbook needed |
| :--- | :--- |
| Decision Engine latency P95 > 800ms for 10 consecutive minutes | Yes (Sprint 3) |
| `decision_replay_drift_detected` event fires (P0) | Yes (Sprint 2) — engine bug; halt new model-version publishes; investigate determinism break |
| Anthropic Managed Agents outage degrades rationale generation | Yes (Sprint 3) — fall back to degraded-rationale mode; communicate to design partners |
| Stripe Agentic Checkout outage during Tier-3 transaction window | Yes (Sprint 3) — surface fallback to manual purchase; preserve `decision.transact_intent` for retry |
| OpenSearch BM25 index degraded during high-volume Decision burst | Yes (Sprint 3) — fall back to vector-only; recompute affected Decisions on recovery |
| Vault outage breaks scope-token issuance | Yes (Sprint 3) — emergency static-key fallback with shortened expiry; pages on-call immediately |
| MCP server outage at `mcp.sourcera.com/decision/v1` | Yes (Sprint 3) — REST endpoints continue to serve; agent-harness consumers retry-with-fallback |

### 3.4 Observability + Alerting

| Telemetry | Sprint | Notes |
| :--- | :--- | :--- |
| Decision Engine latency histogram (P50/P95/P99) per endpoint | Sprint 1 | OpenTelemetry export to existing dashboards |
| Decision-accept-rate per AgentHarness | Sprint 2 | Cohort by `agent_harness_kind`; alert on accept-rate < 60% sustained for 24h |
| Override-rate by category | Sprint 2 | Alert on > 50% override sustained for 7d |
| `policy_pack_alignment_score` distribution by Org | Sprint 2 | Sanity check that policy packs are functioning |
| Tier-3 transaction success rate by payment protocol | Sprint 3 | Alert on < 95% success per protocol per 24h |
| Hard-gate firing rate (residency / banned / opt-out) | Sprint 1 | Alert on anomalous spikes per category |
| KB-freshness-warning rate | Sprint 1 | Drives seller outreach |
| `decision.replay_drift_detected` rate | Sprint 2 | Should be 0; any non-zero is P0 |
| Margin-floor compliance per capability | Sprint 1 | Existing §34.3.3 cost-base recalc extended to Decision Layer capabilities |
| Distribution-channel attribution (which harness drove each Decision) | Sprint 2 | For GTM analytics |

---

## 4. Security + Compliance

### 4.1 Threat Model

Authoring needed (Sprint 1 — pre-build):

| Threat | Mitigation |
| :--- | :--- |
| Prompt injection in `requirements.summary` field | Input sanitization + agent system-prompt anti-injection guards (per §22.16.7) |
| MCP tool-call abuse (replay of prior calls) | Idempotency keys + scope-token expiry |
| Vault-JWT scope-token theft | Short expiry (≤ 1h), per-session rotation, IP-bound option for Enterprise |
| AgentCaller bearer leak (e.g., committed to a public repo) | Bearer rotation + monthly-budget cap limiting blast radius + GitHub Secret Scanning partnership |
| Tier-3 agentic transaction beyond cap | Pre-authorization required; sync human-approval flow for over-cap |
| Tier-3 chargeback fraud | Standard payment-rail dispute procedure; Sourcera does not adjudicate |
| Buyer Org enumeration via Decision Browser | 404-not-403 firewall doctrine for non-shareable decisions |
| Seller KB-content scraping via aggressive `decision.recommend` calls | Rate limits + per-Org KB-retrieval quota; detection of synthetic-Org-creation patterns |
| Competitor brigading on Decision Feedback | Same anti-brigading as §27.4.11 (rate-limit + SIM cluster detection) |
| Adversarial PolicyPack design (e.g., a Buyer authoring a pack that tries to unfairly suppress a competitor's customer) | Policy pack is private to Buyer Org; cannot affect rankings outside that Org's queries |

### 4.2 Pen Test + SOC2 Audit

- Pen test scope: Decision Layer MCP server + REST endpoints + vault-JWT issuance + Decision Browser. Sprint 3.
- SOC2 audit scope expansion: include `policy_packs`, `decisions`, `agent_callers` tables in the existing Trust Service Criteria. Q3 2026 audit window.
- Federal-state-funded-buyer disclaimer flow + automated Tier-3 disabling for `is_federal_or_state_funded=true`. Sprint 2.

### 4.3 Annual Third-Party Integrity Audit Framework

Authoring needed (Sprint 0 — pre-build, since the audit-firm engagement is on a 12-month timeline):

| Artifact | Status |
| :--- | :--- |
| Audit-firm RFP (procurement-law specialist + technical-fairness specialist) | Not started |
| Audit scope document (what's audited; what evidence is provided; what publication policy applies to findings) | Not started |
| Audit-finding remediation framework (a finding blocks a release until remediated; severity classification; public-finding-publication runbook) | Not started |
| Annual integrity-report template | Not started |
| Audit-trigger-to-`v7.x.x`-stamp release-gate connection | Not started |

---

## 5. UX/UI Spec

`UX_Design_of_Sourcera.md` v2.0.0 must be extended with Decision Layer surfaces. These are **net-new authoring** and must satisfy §3.13 Principle 9 (Surface Simplicity, Engine Complexity).

### 5.1 Buyer Console Surfaces

| Surface | Sprint | Authored in brief | What's left |
| :--- | :--- | :--- | :--- |
| "Procurement Policy" tab in Org Settings | Sprint 1 | One sentence | Component spec, state catalog (empty / loading / draft / published / deprecated), interaction patterns, accessibility, mobile translation, all-states render |
| "Agent Access" tab in Org Settings (AgentCaller management) | Sprint 1 | One sentence | Same as above; including token-issuance modal, rotation flow, revocation flow, monthly-budget picker |
| Decision History list view | Sprint 2 | Mentioned | List of Decisions with filter (date, agent caller, category, accept-status); empty state for new Orgs |
| Decision Detail view | Sprint 2 | Mentioned | Full rendering of rationale tokens, policy-gate outcomes, audit receipt, replay button, share button (gates `is_publicly_shareable`) |
| "Why was this chosen?" panel (embedded in agent harness UIs via partner integrations) | Sprint 2 | Mentioned | Component spec for the embeddable panel; per-harness rendering rules (Cursor sidebar vs. Cline status panel vs. Claude Code conversation surface) |
| "Agentic Transactions" history (Tier 3) | Sprint 3 | Mentioned | List + detail; per-transaction audit receipt; chargeback path entry; per-payment-protocol breakdown |
| Solo-Tier billing card extension | Sprint 1 | Mentioned | The §44.6.2 single-card surface unchanged; but consumption-source attribution may need a "via Decision Layer" line item — confirm with §44.6 owner |
| Free-tier 50-decisions-used-counter | Sprint 1 | Mentioned | Inline counter on the "Agent Access" tab; upgrade CTA when crossing 80% |
| Defense View parity for Decision artifacts | Sprint 2 | Not authored | Decisions have a defensible-explanation surface analogous to §13.11 Defense View — should they share the same Defense View component, or is this a separate surface? Decision required |

### 5.2 Decision Browser (Public Surface) `decisions.sourcera.com`

| Surface | Sprint | Authored | What's left |
| :--- | :--- | :--- | :--- |
| Public-shared Decision render | Sprint 2 | Mentioned | Full render including rationale, evidence, audit receipt; SEO meta; OpenGraph; share-to-LinkedIn / Twitter copy |
| Non-shareable Decision render (404) | Sprint 2 | Mentioned per firewall doctrine | 404 page; never reveals existence; analytics suppression |
| Audit-receipt verifier endpoint UI | Sprint 3 | Mentioned | Public verifier: paste a signed receipt, get back a green-or-red validation; matches Selection Report verifier (§32.7) UX |

### 5.3 Marketing / Pricing Site

| Surface | Sprint | What's needed |
| :--- | :--- | :--- |
| "Decision Layer" product page | Sprint 3 | Hero + value-prop + pricing-bullet-points + integration-list + integrity-covenant-callout + integrations-with-Anthropic-Cursor-Cline-Smithery-Vercel-Stripe-x402 logo wall + open-rubric link |
| Updated Buyer pricing page | Sprint 3 | Decision Layer access reflected in plan-tier comparison; free-tier-50-decisions/mo callout; Tier-3 take-rate disclosure |
| Open-rubric publication site (`/transparency/decision-rubric`) | Sprint 3 | Quarterly publication of §27.4.3 feature registry + null-handling rules + hard-gate set; archive of prior versions |
| Annual integrity-audit-report publication site (`/transparency/integrity-audit-2027`) | Year 1 (post-launch) | First report at month 12 |

### 5.4 Documentation Site (`docs.sourcera.com`)

| Section | Sprint | What's needed |
| :--- | :--- | :--- |
| "Quickstart — Decision Layer in 5 Minutes" | Sprint 2 | curl + TS-SDK + Cursor-extension code samples |
| "Authoring a PolicyPack" | Sprint 2 | Step-by-step: structured form + free-text upload; hand-authored vs. parsed-from-doc; example packs (OSS-friendly, enterprise-strict, fintech-compliant) |
| "Integrating into your agent harness" | Sprint 2 | Per-harness integration: Cursor / Cline / Claude Code / custom orchestrator |
| "Tier-3 — Authorizing agentic transactions" | Sprint 3 | Per-payment-protocol setup; per-category-cap configuration; chargeback path |
| API reference (auto-generated from OpenAPI) | Sprint 1 | OpenAPI spec maintained alongside §32.10 |
| MCP tool reference | Sprint 1 | Per-tool input/output JSON schemas published as a documentation page |
| OSS-template `sourcera.toml` reference | Sprint 2 | Schema, defaults, validation, abuse rules |
| Migration guide for existing Buyer customers | Sprint 4 | "If you're already on Sourcera Business Growth, here's how to enable Decision Layer for your engineering teams" |

---

## 6. GTM Artifacts

### 6.1 Customer Discovery (per `Research_MPP.md` §10.1)

| Artifact | Status |
| :--- | :--- |
| 25-interview script (one-per-archetype) — exact questions, signals, disqualifiers | Not authored |
| Interview-recruitment-source list (target Buyer-Org CTOs, target Sellers, target agent-harness owners) | Not authored |
| Interview-scheduling cadence + capacity (founder-led; ~8 hours/week for 4 weeks) | Not authored |
| Synthesis framework (per `design:research-synthesis` skill) for converting 25 interviews into Go/No-Go decision | Not authored |

### 6.2 Partner Term Sheets

| Partner | Term sheet status | Notes |
| :--- | :--- | :--- |
| Anthropic — Claude Skills featured listing | Not started | Strategic-partnership conversation; revenue-share TBD |
| Cursor — extension distribution + co-marketing | Not started | Default-on extension is the ask; alternative is opt-in |
| Cline / Smithery — MCP marketplace listings | Not started | Free listings; paid promotion if available |
| Vercel — `sourcera.toml` template integration | Not started | Inclusion in starter templates |
| Stripe — Stripe Agentic Checkout default Tier-3 partner + co-marketing | Not started | Engineering partnership; named launch integration |
| Coinbase — x402 default for OSS / consumption | Not started | Engineering partnership |
| Visa Intelligent Commerce / Mastercard Agent Pay | Deferred | Year 2 |
| Google AP2 | Deferred | Year 2+ |
| Linear / Notion / GitHub | Not started | Embed Decision rendering in artifacts |

### 6.3 Launch Materials

| Asset | Sprint | Status |
| :--- | :--- | :--- |
| Press release (positioning, integrity covenant, design-partner roster) | Sprint 4 | Not started |
| Founder-authored "category-defining" essay | Sprint 4 | Not started |
| Demo video (3 minutes — agent harness → Sourcera → ranked top-3 → Tier 3 transaction) | Sprint 3 | Not started |
| Investor briefing (if relevant) | Sprint 3 | Not started |
| Hacker News launch post + AMA prep | Sprint 4 | Not started |
| Twitter / LinkedIn launch sequence | Sprint 4 | Not started |
| `GTM/GTM_DECISION_LAYER_LAUNCH.md` (new GTM corpus file) | Sprint 4 | Not started |
| OSS template seed list + maintainer outreach roster | Sprint 3 | Not started |

### 6.4 Updated GTM Corpus

| File | Update needed |
| :--- | :--- |
| `GTM/GTM_POSITIONING.md` | Add "Decision Layer" as a category-anchor; reframe Sourcera positioning as "the procurement substrate for both humans and agents"; this is a v7.1.x descope per current CLAUDE.md drift notes — bring forward |
| `GTM/GTM_PLG_ARCHITECTURE.md` | New PLG loop: OSS template → free-tier Decision usage → Buyer Org signup → conversion |
| `GTM/GTM_NETWORK_EFFECTS.md` | New network effect: agent-harness adoption → Decision volume → ranking-quality flywheel; cross-feed to Mode-A buyer evaluations |
| `GTM/GTM_SALES_PLAYBOOK.md` | New ICP: VPE / CTO at Series-B+ SaaS with engineering teams making code-time vendor choices; Decision Layer as the wedge into the Sourcera bundle |
| `GTM/GTM_CONTENT_ENGINE.md` | Decision-Layer content series: open rubric, integrity audit, comparison-vs-registries |

---

## 7. Validation + QA Framework

### 7.1 CI Gates (all Sprint 1–3)

| Gate | Sprint | What it asserts |
| :--- | :--- | :--- |
| `decision_layer_no_pay_for_placement` | Sprint 1 | No monetary-feature in Match-Score registry has non-null weight; Promoted Listings excluded from Decision rendering paths |
| `decision_replay_byte_identical` | Sprint 2 | Replay output ≡ original output for fixed version tuple |
| `decision_layer_console_firewall` | Sprint 1 | No Decision Layer surface leaks Buyer private data to Sellers; cross-console reads return 404 |
| `decision_layer_policy_pack_residency_consistency` | Sprint 1 | Decision Engine routes per Buyer Org's `data_residency_region` |
| `match_score_inspect_no_weight_leakage` | Sprint 1 | The internal `match_score_inspect` tool exposes feature values + contribution direction + magnitude bucket but never raw weights |
| `policy_pack_banned_short_circuit` | Sprint 1 | `policy_pack_banned_flag=1` forces score to 0 |
| `decision_layer_excludes_promoted_placements` | Sprint 1 | No PromotedListing in Decision rendering paths |
| `decision_layer_solo_envelope_compliance` | Sprint 1 | Decision Layer capabilities respect §44.6 surface treatment |
| `decision_layer_endpoint_size_constraints` | Sprint 1 | Object-size limits per §39 enforced |
| `decision_layer_idempotency_60s_replay` | Sprint 1 | Idempotency-key replay within 60s returns the same `decision_id` |
| `policy_pack_object_size_limit` | Sprint 1 | PolicyPack ≤ 64KB total payload |
| `agent_caller_token_format` | Sprint 1 | Bearer tokens follow `srck_dl_{org_prefix}_{agent_caller_prefix}_{token}` and are bcrypt-hashed at rest |

(Total estimated: ~20 new CI gates registered to §M.5.)

### 7.2 Test Strategy

Authoring needed (Sprint 0 / pre-build):

| Test class | Coverage |
| :--- | :--- |
| Unit | Decision Engine pipeline steps, PolicyPack gate evaluation, AgentCaller authorization, vault-JWT issuance |
| Integration | End-to-end `decision.recommend` against a fixture KB / fixture seller corpus; cite-verify against real KB entries; Match-Score feature pipeline |
| Contract | Per-endpoint request/response/error contract tests; webhook payload-schema tests |
| Determinism | Replay byte-identical assertion across 1000-run regression cohort |
| Load | 100K decisions/day sustained; 1M decisions/day burst for 60 minutes; SLA targets held |
| Chaos | Anthropic Managed Agents outage; Stripe outage; OpenSearch outage; Vault outage; cross-region failover |
| Fairness | Per-PolicyPack parity; per-AgentHarness parity; per-Tier parity; small-seller / long-tail-category parity |
| Security | Pen-test scope per §4.2 |
| Smoke | Per-distribution-partner integration smoke (Cursor extension, Cline extension, Claude Code skill, Vercel template); runs nightly |

### 7.3 Concierge MVP Instrumentation

Authoring needed (Sprint 1):

| Mechanism | Description |
| :--- | :--- |
| Manual-rank-override surface for Sourcera operators | Internal-only Ops surface; allows an operator to manually compose a top-K when concierge mode is on; logs every override to `ConciergeOverrideRecord` (new entity, retained for forensic analysis) |
| Override-reason-capture | Per concierge override, the operator records why; feeds Sprint-2 model-training |
| Design-partner usage telemetry | Real-time PostHog dashboard showing per-design-partner decision volume, accept rate, override rate, rationale-token consumption |
| Weekly check-in cadence | Per-design-partner founder-led check-in for Sprint 1–2 |

---

## 8. Sequencing — Critical Path

The end-to-end timeline from greenlight to GA, with the longest critical path:

```
Week  -2 ─ Sprint 0 begins:
              Customer-discovery interviews (25, 4 weeks)
              Technical spikes (4 spikes, 2 weeks parallel)
              Audit-firm RFP issued
              Phase 14.21 prompt authoring
              AE ledger seeding
              Implementation Pack 1 authoring
              §52 / §22.10.x / §27.4.3 / §32.10 authoring (~3 FTE-weeks)
Week  +0 ─ Sprint 1 begins (Sprint 0 partially overlaps):
              Decision Engine v0
              MCP server v0
              `decision.recommend` REST endpoint
              `agent_sourcera_decision_recommender_v1` agent definition
              `policy_pack_alignment_score` Match-Score feature
              Concierge MVP framework
              CI gates (12 of 20)
Week  +3 ─ Sprint 1 complete; Sprint 2 begins:
              Tier 2 surfaces
              `decision.justify` / `decision.alternatives` / `decision.replay`
              `policy_pack.parse` Opus capability
              Decision Browser (public)
              All 8 webhook events
              Audit-receipt primitive
              Fairness audit suite extension
              First 5 design partners onboarded
              Implementation Pack 2 authoring
Week  +7 ─ Sprint 2 complete; Sprint 3 begins:
              EU residency-scoped model + Decision Engine path
              Stripe Agentic Checkout + x402 integration
              Tier-3 per-category cap configuration
              Final 8 CI gates
              Production load test
              Pen test
              SOC2 audit kickoff
              Implementation Pack 3 authoring
Week +10 ─ Sprint 3 complete; Sprint 4 begins:
              Public Beta GA
              Anthropic Skills + Cursor + Cline + Smithery + Vercel + Stripe co-launch
              Decision Browser public
              v7.2.0 stamp
              AE ledger ratification
              Year-1 integrity-audit window opens
Week +12 ─ GA stamp.
```

**Critical-path dependencies:**

1. **Customer discovery → Sprint 1.** Cannot start Sprint 1 if §10.1 NO-GO thresholds breach.
2. **Sprint 1 entity authoring → Sprint 2 Tier-2 surface.** Decision entity must be live before Decision Browser ships.
3. **Sprint 2 webhook authoring → Sprint 3 Tier-3.** Webhook DLQ must be production-ready before agentic transactions can fire.
4. **Sprint 3 EU residency → GA.** A US-only GA loses EU design partners; if EU residency is not ready, defer GA by 4 weeks.
5. **Audit-firm engagement → Year-1 integrity audit.** RFP issued at Sprint 0; firm engaged by Sprint 2; audit window opens at month 12.

---

## 9. Decision Gates — Founder + GTM Sign-Off Required Before Sprint 1

Sprint 1 cannot begin until each of the following is decided:

| Decision | Default | Owner | Trigger |
| :--- | :--- | :--- | :--- |
| Build vs. defer vs. kill | Defer pending §10.1 customer discovery | Founder | Discovery results week 4 |
| Org-context auth — vault-JWT vs. OAuth-OBO vs. both | Vault-JWT (per brief §12 Q1) | Staff Engineer + Founder | Partner conversations week 2–3 |
| Tier-3 primary payment partner — Stripe Agentic vs. x402 vs. both | Both (Stripe primary, x402 alt; per §12 Q2) | Founder + GTM Lead | Partner conversation week 3 |
| Free-tier limit — 25 vs. 50 vs. 100 | 50 (per §12 Q4) | Founder | Customer discovery week 4 |
| OSS template format — TOML vs. YAML | TOML (per §12 Q5) | DevRel Lead | Maintainer conversation week 2 |
| Promoted-Listing inclusion | Excluded (per §12 Q6) | Founder | Already decided in brief — confirm at Sprint 0 review |
| Anthropic Skill — native or MCP plugin | Both (publish as Skill if marketplace lights up; MCP server unconditionally) | GTM Lead + Anthropic partner | Partnership conversation week 2 |
| EU residency at v1 vs. GA+1 | GA (Sprint 3) | Staff Engineer | Sprint 0 |
| `policy_pack.parse` priority | Ship at Sprint 2 | PM | Sprint 0 |
| Decision Browser default `is_publicly_shareable` | False (private by default) | Founder + Legal | Sprint 0 |
| Tier-3 take-rate sensitivity (1.0% / 1.5% / 2.0%) | 1.5% capped at $50 with 0.5% rebate | Founder + GTM Lead | Customer discovery week 4 |
| Federal-state-funded-buyer Tier-3 disablement | Hard-disabled | Founder + Legal | Already decided in brief — confirm |
| Annual third-party audit firm | TBD; RFP at Sprint 0 | Founder | Audit-firm shortlist by Sprint 2 |

---

## 10. Open-Question Triage Summary

The brief's §12 enumerates 20 open questions blocking final commit. Triage:

| Resolution path | Question count | Sequenced |
| :--- | :--- | :--- |
| Resolved by §10.1 customer discovery | 9 (Q1, Q2, Q4, Q9, Q10, Q11, Q14, Q15, Q20) | Week 0–4 |
| Resolved by partner conversations | 4 (Q5 OSS template format with maintainers; Q7 Anthropic Skills integration; Q12 Tier-3 take-rate sensitivity; Q18 Tier-3 reversibility) | Week 2–4 |
| Resolved by founder + GTM decision | 5 (Q3 determinism SLO; Q6 Promoted-Listing exclusion confirmed; Q8 EU residency timing; Q13 first-year-cost methodology; Q19 free-tier-abuse mechanics) | Week 0–2 (most are confirm-only) |
| Defer to v7.3.0+ | 2 (Q16 cross-pollination with §10 Method engine; Q17 AgentCaller per-repo scoping) | Year 2 |

All 20 must be decision-resolved (or explicitly deferred) before Sprint 1 begins.

---

## Closing — Total Authoring + Engineering Estimate

| Workstream | FTE-months |
| :--- | :--- |
| Master Spec authoring (§52 + cross-section deltas + AE ledger + RECONCILIATION + DELTA_INVENTORY + Phase prompts) | ~3.0 |
| Engineering build (Sprints 1–3 per `Research_MPP.md` §9) | ~10–14 |
| UX/UI spec authoring | ~1.5 |
| GTM artifacts (discovery + partnerships + launch + content) | ~2.5 |
| Ops + SRE runbooks + Ops Console | ~1.5 |
| Security + compliance (threat model + pen test + SOC2 + audit framework) | ~1.0 |
| QA framework + concierge MVP instrumentation + CI gates | ~1.0 |
| **Total to GA** | **~21–25 FTE-months across ~12 calendar weeks** |

This sizes to ~7–8 full-time people for 12 weeks, with founder + 1 PM + 1 staff engineer driving Sprint 0 single-handedly. The engineering FTE-month range matches `Research_MPP.md` §9.2; the additional ~10 FTE-months above it is the spec/UX/GTM/ops/security/QA work that the engineering plan does not absorb.

If the program is greenlit, the immediate next deliverables (Week -2 of Sprint 0) are:

1. `_integration/RECONCILIATION.md` Decision Layer block (1 FTE-week)
2. `_integration/Integration_Prompts_v7.2.md` (Phase 14.21–14.24 prompts; 0.5 FTE-week)
3. AE ledger seeding (AE-MPP-01 → AE-MPP-22 with status, owner, ratification gate; 0.25 FTE-week)
4. §52 Purpose & Scope + Architectural Overview authoring (1 FTE-week)
5. Customer-discovery interview script + recruitment list (0.5 FTE-week)
6. Audit-firm RFP draft (0.25 FTE-week)
7. Sprint 0 implementation pack: Decision Engine v0 scaffolding + agent definition + concierge MVP framework (3 FTE-weeks; engineering)

That's the honest bridge from `Research_MPP.md` to a buildable v7.2.0 stamp.
