# Phase V12 — Adversarial Verification of Phase 12 (Operations, QA, Observability, DR) (Scratch Log)

**Phase prompt.** `Audit_Prompts.md` → Prompt V12. Scope: adversarial verification of the §42 / §43 / §46 / §50 structural audit work that closed on 2026-05-11. Three required blocks: (1) STRUCTURAL — §42 / §43 / §46 / §50 audited end-to-end (cross-check that the structural sweep is complete); (2) ADVERSARIAL — construct a P0 incident scenario and walk runbook → mitigation → comms → postmortem; construct an Ops impersonation and confirm audit + 2-person rule; (3) SIGN-OFF — zero P0 observability / ops.

**Defect-ID convention.** `D-12V-NNN` (sequential per Defect Ledger Format `D-<phase-mnemonic>-<seq>` form). Precedent: PHASE11V_FINDINGS uses `D-11V-NNN`; PHASE0V uses `D-0V-NNN`. Once published, IDs are immutable.

**Date.** 2026-05-11.

**Pre-edit backup.** Non-destructive audit pass. No Master Spec edits. No `/_versions/` snapshot required.

**Severity-rule application.** P0 reserved for `Audit_Prompts.md` Severity Rules (a)–(e). P1 for unbuildable-as-written contracts (missing entity, missing state machine, missing AC, missing API/webhook contract, missing error code, missing plan-gating row, missing retention/DSAR/residency, conflicting numerical singleton, surface introduced without Appendix-M row, CI gate runtime-unwireable). P2 for ambiguity that two staff engineers would resolve differently. P3 for cosmetic / heading anchor / nomenclature drift.

**Sources read end-to-end.** `Audit_Prompts.md` (Global Conventions Preamble + Defect Ledger Format + Severity Definitions + Global Verification Protocol + Prompt V12); `_audit/PHASE42_FINDINGS.md`; `_audit/PHASE43_FINDINGS.md`; `_audit/PHASE46_FINDINGS.md`; `_audit/PHASE50_FINDINGS.md`; `_audit/PHASE11V_FINDINGS.md` (V-prompt precedent); `_audit/DEFECT_LEDGER.md` Phase 42 / 43 / 46 / 50 blocks (lines 4364–4699); Master Spec §42.1–§42.7 (lines 32340–32613); §43.1–§43.5 (lines 32619–32711); §46.1–§46.5 (lines 32996–33116); §50.1–§50.19 (lines 38669–41423) with §50.4 Impersonation and §50.5 Ops-Tagged Audit Actor read line-by-line; Appendix J `ops_role_kind`, `ops_capability_kind`, `audit_event_actor_type`, `ops_session_justification_category`, `ops_session_state` (lines 47107–47180 enum block walked); Appendix I error-code registry walked for the §50.4 / §50.5 new rows; CLAUDE.md §13 / §16 (state of v7.1.0 + Phase V11 closeout context); `_integration/AUTHORED_EXTENSIONS_LEDGER.md` (v7.1.0 ratification queue).

**Self-challenge revisions logged at §6.** **Counterfactual pass logged at §7.**

---

## 1. Structural Pass — §42 / §43 / §46 / §50 Coverage Audit

The structural sweep landed on 2026-05-11 across four contiguous prompts. V12 confirms the sweep is complete; it does not re-file the inherited defects but it must reconcile their cumulative effect against the V-prompt sign-off rule.

### 1.1 Coverage of the four target sections

| § | Phase findings file | Defect count | P0 | P1 | P2 | P3 | Verdict |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| §42 Observability, Reliability & DR (32338–32613) | `_audit/PHASE42_FINDINGS.md` | 30 | **1** (D-42-001) | 19 | 8 | 2 | Structurally underbuilt for the load-bearing role §42 plays; the canonical home for SLO / log-schema / trace propagation / runbook inventory / RTO-RPO per service / DR-drill scope is each missing or thin. |
| §43 Internal Operations & Admin Tooling (32617–32711) | `_audit/PHASE43_FINDINGS.md` | 21 | **6** (D-43-001 RBAC, D-43-002 capability matrix, D-43-003 firewall, D-43-004 audit table, D-43-005 DSAR, D-43-006 firewall+export) | 12 | 1 | 2 | §43 is v6.0.0-era prose superseded by §50 but never marked as retired; structurally incompatible with §50.3 / §50.4 / §50.5 contracts. |
| §46 Test Strategy & QA Framework (32994–33116) | `_audit/PHASE46_FINDINGS.md` | 22 | 0 | 12 | 8 | 2 | §46 is the v6.0.0 test-strategy frozen since the v6→v7 integration; uncovers AIOperation evaluation, console-firewall scenarios, DSAR/GDPR scenarios, §M.4/§M.5 self-testing, AIWallet / OutcomeContract / Cost-Base testing, chaos / outage testing. |
| §50 Sourcera Ops Console (38660–41423) | `_audit/PHASE50_FINDINGS.md` | 40 | **1** (D-50-006 plan-tier manual override surface absent) | 28 | 9 | 2 | The most thoroughly authored of the four sections, but the §50.3.2 envelope matrix is incomplete, several customer-data-affecting Ops surfaces (plan-override, residency override, refund, AIWallet adjust, trial mgmt, marketplace moderation, user mgmt, AIOperation reversal, verification queue, chain-escape) are matrix-cell only and unauthored; quorum / impersonation / break-glass contracts are otherwise comprehensive. |
| **Aggregate** | | **113** | **8** | **71** | **26** | **8** | The four-section cohort. |

**Inherited P0 cluster (8 rows, the binding HALT-rule input to §3 sign-off).**

| Defect | Class | One-line |
| :---- | :---- | :---- |
| D-42-001 | observability / revenue | Revenue-affecting services (AIOperation accept, AIWallet debit, OutcomeContract settlement, Stripe meter-event submit, Solo per-eval / per-bid charge) have zero §42.2 alarms and zero §42.6 SLO bindings; the only Stripe alarm is charge-failure burst, which catches gross outage but not silent meter-event leakage. |
| D-43-001 | rbac | `is_staff: true` boolean gate at §43.2 is structurally incompatible with §50.3 six-role canonical Ops Role Matrix; bypass routes §50.3.2 envelope. |
| D-43-002 | rbac (CI gate) | ~14 customer-data-affecting Ops capabilities in §43.1 absent from Appendix J `ops_capability_kind` envelope; trips the `ops_capability_matrix_coverage_complete` CI gate per §M.5. |
| D-43-003 | firewall_leakage | "Customer Impersonation: 'Assume user session' button" at §43.3 lacks every §50.4 OpsSession safety: justification, time-box, step-up re-auth, quorum, customer Org Owner notification, customer revocation, OpsSession row. |
| D-43-004 | data_model | §43.4 parallel `admin_audit_log` table bifurcates the §4.6.1 Audit Event + §50.5 Ops-Tagged Audit Actor pattern; lacks `actor_type`, `ops_session_id`, `ops_role_at_write`, `ops_justification_ref`, `ops_impersonated_user_id`. |
| D-43-005 | dsar | "GDPR data export initiation (DSAR response generation)" at §43.1 omits §6.8.1 / §6.8.6 / §6.8.6.1; unverified DSAR fulfillment violates GDPR Article 12. |
| D-43-006 | firewall_leakage | "Workspace Export: One-click ... complete JSON snapshot" at §43.3 bypasses §50.2.3 (no Ops actor attribution, no OpsSession binding, no residency routing, no DSAR cascade check, no PII redaction). |
| D-50-006 | numerical_singleton / revenue | Plan-override / manual plan-tier adjustment Ops surface absent from §50; §43.1 (superseded) describes it; §34 has no plan-override path; "Sales-Ops manual provisioning" referenced without authoring. Allows revenue leakage by undefined Ops path. |

**Structural verdict.** The four-section sweep is complete (every prompt-mandated check ran end-to-end against §42 / §43 / §46 / §50 plus cross-cutting cites; the FINDINGS files carry per-check walks, self-challenge pass, counterfactual pass, and Coverage Matrix cell prescriptions). V12 confirms the structural pass. **V12 does not re-file the 113 inherited defects** — they are the binding remediation queue for the v7.1.1 stamp gate.

### 1.2 Cross-section consistency review (V12 sweep only)

V12 ran a cross-section consistency pass to identify defects that emerge only when §42 / §43 / §46 / §50 are read together (and that the per-section structural prompts did not catch because each was scoped to one section). Findings logged at §4 below.

---

## 2. Adversarial Scenario A — P0 Incident Walkthrough

**Premise.** Construct a P0 incident, walk it end-to-end against the spec as written, and identify operational gaps that prevent or impair the on-call's ability to detect, mitigate, communicate, and close out.

**Scenario constructed.** Anthropic MCP proxy latency hang. The proxy returns HTTP 200 responses but per-request latency rises from p95 = 4s to p95 = 60s+ over a 90-minute window. No 5xx, no timeouts; payload bodies eventually return. Effects: (a) AIOperation acceptance queue saturates (§4.8.1 metering rows accumulate `pending` status); (b) Buyer Maya Intake (§13.12) hits the §44.2 Sonnet 10–30s budget for every request; (c) First-Pass RFP response generator (§44.6.1 hide list item; §44.6.7 First-Pass RFP exemption) silently re-tries with exponential backoff; (d) Defense View generation (§44.1 p95 < 8s) breaches budget for ~20% of EU Enterprise tenants; (e) Stripe meter-event submission keeps up — no revenue leakage on the submission path, but value delivered ≠ value billed because some AIOperations are stuck in `pending` and not yet meter-event-emitted.

**Severity per §42.6.0 routing rule.** First-detection P3 (only if a detector fires) → P2 at 30 min sustained → P1 at 4h sustained → P0 if customer-visible primary surfaces are blocked. Per §42.3, severity per impact: SEV-1 (critical, < 15 min response) vs SEV-2 (major, < 1 h) vs SEV-3 (minor, < 4 h). The mapping between §42.6.0 PagerDuty P0–P3 and §42.3 SEV-1/2/3 is implicit (defect surfaced below).

### 2.1 Detection (T+0 → T+30 min)

**Spec contract.**
- §42.6.0 `anthropic_mcp_proxy_degraded` triggers on `(5xx + timeout) / total > 1% over 15-minute rolling window`.
- §42.2 has five platform-wide alarms (Error rate > 1%, API latency p95 > 2s, API latency p95 > 5s, Webhook delivery < 95%) — none catch the latency-only Anthropic surface.
- §44.1 declares an 8s p95 budget for Defense View, 2.5s/4.5s for EvalStarter materialization — these are budgets, not alarms.
- §42.6.1 audit-integrity background jobs are nightly-only — no real-time signal.

**Walk.** Anthropic latency rises but the §42.6.0 detector queries `(5xx + timeout) / total`. Latency-only mode produces zero 5xx and zero timeouts (because the proxy eventually returns 200). The detector denominator (`total`) is steady; the numerator stays at noise-floor. **No alert fires.** The §44.1 Defense View 8s budget is breached for ~20% of EU Enterprise tenants at T+45 min; §44.5 ACs describe the budget as a runtime SLO with no automated detector (per D-42-006 / D-42-008).

**Detection path that actually fires.**
1. Customer support ticket — an Enterprise SOC notices Defense View "loading" indefinitely and opens a Zendesk ticket at T+50 min. **But §42 has no customer-reported-incident ingest path that routes a Zendesk ticket to the on-call PagerDuty queue.** The §43.3 Support Tools row mentions Zendesk integration but §43 is superseded and §50 does not author the Zendesk → on-call escalation. **D-12V-003** filed.
2. Internal alert: at T+90 min the §42.2 `API latency p95 > 5s` alarm fires (because the AIOperation acceptance queue's API endpoints inherit the elevated latency); this is a platform-wide alarm, not per-service per D-42-001 / D-42-004. The on-call receives a single page that says "API latency p95 > 5s" with no per-service decomposition; the runbook anchor (per §42.6 row 7 — "Notion runbooks linked from Datadog alerts") is unresolvable per D-42-005 (no Runbook Inventory at §42.5 despite the §25.6.4 inbound citation).

**T+90 conclusion.** Detection latency from real customer impact (T+0 budget breach for EU Enterprise) to first internal page (T+90 min) is 90 minutes. §42.1 customer SLA target for Enterprise is "4-hour critical response" — formally not breached, but the §44.1 internal SLO budgets are breached for an hour before detection.

**Gap to existing defects.** Detection-side gaps (latency-only detector, per-service decomposition, FCP/TTI/Defense View alarms, runbook inventory, customer-reported ingest path) are covered by D-42-001 / D-42-004 / D-42-005 / D-42-006 — except the customer-reported-incident ingest path, which the structural sweep did not catch as a discrete defect. **D-12V-003** newly filed.

### 2.2 On-call paged → severity assignment → war room (T+90 → T+120 min)

**Spec contract.**
- §42.3 Process step 1 ("Incident detected (alert or customer report)"), step 2 ("On-call paged. Severity assigned."), step 3 ("War room opened (Slack + Zoom)").
- §42.5 page-timeout escalation: 10 minutes → escalate to secondary. Single-step; no manager-level escalation.
- §25.6.2 line 21134 cites "§42.3 escalation policy (primary 5m → secondary 10m → manager 15m)" — **broken citation** per D-42-005 (§42.3 does not author this three-step ladder; §42.5 carries only the single-step 10-min escalation).

**Walk.** The on-call primary acknowledges the page at T+92 min. **Who assigns severity per §42.3 step 2?** The spec does not name an actor — neither the on-call primary, the secondary, the team manager, the Ops Director, nor a triage role. The §43.5.4 incident-severity scale exists narratively but §43 is superseded by §50; §50.6.4 ¶1 says "the on-call `ops_admin` declares a P0/P1 incident via the Ops Console incident page" — but that creates a fourth severity namespace (P0/P1 in §50.6.4) on top of §42.3 (SEV-1/2/3), §42.6.0 (PagerDuty P0–P3 routing), and §43.5.4 (Sev0–Sev3 in the retired prose).

This is two coupled defects:
- **D-12V-001**: §42.3 incident-response process step 2 ("On-call paged. Severity assigned") and step 6 ("All-clear declared") name no actor. A junior reader cannot determine who declares vs who confirms vs who clears.
- **D-12V-008**: §42.3 (SEV-1/2/3), §42.6.0 (PagerDuty P0–P3 with timer-based escalation), §43.5.4 (Sev0–Sev3 retired prose), and §50.6.4 (P0/P1 incidents) are four severity-namespace authoring sites. The mapping between them is implicit. Two engineers will land on different runtime mappings.

**War room.** §42.3 step 3 names "Slack + Zoom." Both are third-party dependencies. **Slack is not in the §42.6.0 detector catalog** (the nine providers are Anthropic, Firecrawl, Stripe, WorkOS, PostHog, Loops.so, Convex, Perplexity, Zendesk). If Slack itself is down (the audit-checklist meta-observability concern), §42.3 step 3 has no fallback war-room channel. D-42-023 already captures the broader meta-observability gap (PagerDuty / Datadog / Statuspage / Sentry / Slack itself unmonitored); no new defect.

### 2.3 Customer notification → mitigation (T+120 → T+180 min)

**Spec contract.**
- §42.3 step 4: "Customer notified (Statuspage.io status update) for SEV-1/2." No SEV-3 customer-comms policy.
- §42.6.0 severity routing: P3 on first detection (= SEV-3 customer-comms — none); P2 if persisting > 30 min (= SEV-2 customer notification fires).
- §50.6.4 ¶5: "Incidents affecting customer data SHALL trigger the Customer Communication Workflow (referenced from §42 Observability + §6.6 Security Communication)." But §42 does not author a Customer Communication Workflow per D-50-030 (the citation is forward to an unauthored target).

**Walk.** At T+92 min the page fires; severity defaults to SEV-2 (the §42.2 alarm wording "API latency p95 > 5s" is platform-wide and matches SEV-2 "Service degraded or partial outage"). Per §42.3 step 4, the on-call posts a Statuspage update at T+93 min: "We are investigating elevated latency on the platform." Per the §42.3 SEV-2 update frequency ("Every 60 minutes"), the next Statuspage post is due at T+153 min.

But: between T+0 and T+92 the incident was at SEV-3 in customer-impact terms — Defense View was breaching the 8s budget for 20% of EU Enterprise tenants. **Per §42.3 step 4, SEV-3 has no customer-comms policy.** Customers see a degraded experience for 92 minutes without a Statuspage update. The in-surface banner contract at §42.4.1 ("Service degraded — read-only — your region's failover replica is recovering") is residency-failover-specific; there is no general-purpose "Service degraded — provider X is slow" customer-visible banner anywhere in §42 / §50. **D-12V-007** filed (P2): SEV-3 customer-visibility gap.

**Mitigation runbook.** §42.6 row 7 promises Notion runbooks linked from Datadog alerts; per D-42-005, the runbook inventory at §42.5 does not exist (§42.5 is only on-call rotation). The on-call has no document-of-record for "Anthropic MCP latency hang" mitigation. They improvise:
- Reduce parallel agent calls per the §22.8 retry curve (5s/30s/5m/30m).
- Suspend §44.6.1 First-Pass RFP exemption to absorb load.
- Toggle a feature flag (§46.4) to disable Defense View for a subset of Enterprise tenants.

Each of those mitigations corresponds to a customer-data-affecting Ops action that, per §50.5.1, MUST write `actor_type='ops'` Audit Events. **None of those mitigations are matrix-cells in §50.3.2 capability envelope.** They land in the same uncatalogued-capability hole that D-43-002 and D-50-001 / D-50-022 / D-50-024 already file.

**T+180 conclusion.** Mitigation succeeds (Anthropic latency normalizes after Sourcera reduces its load on the provider). On-call declares all-clear at T+180 min. **Per §42.3 step 6 ("All-clear declared"), no actor named.** Defect coupled with D-12V-001.

### 2.4 Postmortem (T+180 → T+24h → T+72h)

**Spec contract — two conflicting deadlines.**
- §42.3 step 7 ("Postmortem scheduled within 24 hours") and step 8 ("RCA completed within 48 hours"). 24h schedule / 48h RCA.
- §50.6.4 ¶6: "Every P0/P1 incident SHALL produce a blameless postmortem within 72 hours."
- §42.7 AC #2: "All SEV-1 incidents have RCA posted within 48 hours."
- §42.7 AC #3: "Postmortem action items tracked and closed within 30 days."

48 vs 72 hours for the same artifact. Two authoritative homes. **D-12V-002** filed (P1, consistency_drift). Severity P1 per Severity Rule (conflicting numerical singleton).

**Walk.** Per §42.3 step 7, the postmortem is scheduled by T+24h. Per §42.3 step 8, the RCA is completed by T+48h. Per §50.6.4 ¶6, the blameless postmortem is published by T+72h. The team reading §42 will hit T+48h; the team reading §50 will hit T+72h. The §43.5 ACs (retired prose) had no postmortem deadline. **The §50.6.4 72h citation says "blameless postmortem"; the §42.3 48h citation says "RCA completed". These could be sequential (RCA at 48h, blameless write-up at 72h) — but the spec does not say so.** Two staff engineers read this differently.

**Postmortem PII.** The narrative will reference specific Enterprise customers ("EU Enterprise tenant X's Defense View timed out 14 times"). Per D-42-016, the postmortem-narrative DSAR-cascade compatibility is unauthored. If one of the named users later issues a §6.8.4 erasure request, the cascade walker does not currently traverse postmortem narrative text. No new V12 defect; D-42-016 already captures.

**Action items.** §42.7 AC #3 says "Postmortem action items tracked and closed within 30 days." Where are they tracked? §50.6.4 ¶6 declares the postmortem registered as an `OpsActionRecord` with `action_kind = 'incident_postmortem_published'` — but action items are not declared as separate `OpsActionRecord` rows, not declared as Linear issues, not declared as Notion checklist items, not declared as anything. Already filed under D-42-012 AC #3 (§42.7 acceptance criteria thin / unbound); no new defect.

### 2.5 Scenario A — Surfaced defects

Three NEW defects emerged from the P0 incident walk that the per-section structural prompts did not catch:

| New defect | Severity | Class | Hook |
| :---- | :---- | :---- | :---- |
| D-12V-001 | P1 | acceptance_criteria | §42.3 incident process steps 1 / 2 / 6 ("Incident detected", "Severity assigned", "All-clear declared") name no actor; junior reader cannot determine declarer vs confirmer vs clearer. |
| D-12V-002 | P1 | consistency_drift | §42.3 step 8 (48h RCA) vs §50.6.4 ¶6 (72h blameless postmortem) — two homes for the postmortem deadline; engineering will pick one. |
| D-12V-003 | P1 | observability | §42 incident-response process has no customer-reported-incident ingest path; latency-only failures invisible to detectors require customer-initiated escalation, but Zendesk → on-call PagerDuty routing is not authored at §42 or §50. |
| D-12V-007 | P2 | acceptance_criteria | §42.3 step 4 customer-comms policy applies only to SEV-1/2; SEV-3 customer-visibility gap — customer-visible degradation persists at SEV-3 < 30 min without Statuspage update, with no general-purpose in-surface banner authored at §42. |
| D-12V-008 | P1 | consistency_drift | Four severity-namespace authoring sites: §42.3 (SEV-1/2/3), §42.6.0 (PagerDuty P0–P3 timer escalation), §43.5.4 (Sev0–Sev3 retired prose), §50.6.4 (P0/P1 incidents). Mapping between them is implicit; two engineers will land on different runtime severity ladders. |

Two further failure modes — Slack-as-war-room dependency + "all-clear declared by whom" — are covered by D-42-023 / D-12V-001 respectively.

---

## 3. Adversarial Scenario B — Ops Impersonation Walkthrough

**Premise.** Construct an Ops impersonation. Confirm audit + 2-person rule applies as documented.

**Scenario constructed.** An `ops_security_admin` (Marcus) wants to impersonate the Org Owner (Priya) of an Enterprise customer Org `acme-corp` to investigate a customer-reported anomaly in the Defense View output. The impersonation will:
- Open an OpsSession against `acme-corp` workspace.
- Read three SelectionRecord rows + one Defense View artifact (read-class actions).
- Mutate one tag on a RequirementResponse to test a hypothesis (mutation action).
- Close the session within 25 minutes.

### 3.1 Session-open contract (T+0)

**Spec contract walked end-to-end.**
- §50.4.1 #1: `justification_category ∈ ops_session_justification_category` enum; `justification_note ∈ [80, 4000]` chars; `linked_support_ticket_ref` SHOULD point to the canonical ticket. Missing → HTTP 422 `ops_session_justification_invalid`.
- §50.4.1 #2: `requested_duration_minutes` defaults to 30; values in `[5, 60]` auto-approve subject to role envelope §50.3.2; values in `[61, 240]` require quorum sign-off per §50.4.4; values in `[241, 480]` require an additional `ops_security_admin` signer.
- §50.4.1 #3: Audit. Every mutation writes a §4.6.1 Audit Event row with `actor_type = 'ops'`, `ops_session_id = session.id`. Every read emits a `read`-class Audit Event row (sample rate 1.0).
- §50.4.1 #4: Customer Org Owner notification dispatched within 300s of `started_at` via (a) in-app Inbox item with `actor_tag = 'sourcera_ops'`, (b) Loops.so transactional email `ops_session_started`.
- §50.4.1 AC #1: `auth_factor_evidence_json` populated; HTTP 422 on missing.
- §50.4.1 AC #2: Step-up re-auth freshness — `step_up_reauthed_at` within 5 min (300s) of `started_at`; HTTP 403 `ops_session_step_up_reauth_stale` on breach.

**Walk.** Marcus submits the session-open request at T+0 with `requested_duration_minutes = 30`. The system stamps `started_at`, transitions OpsSession state from `(none) → active` per §50.4.3 state machine row 2. **Per §50.4.4 quorum rules: a 30-minute session requires NO additional signer** (quorum applies only at `duration > 60 min` OR `console_scope = 'both'` OR `justification_category = 'enterprise_escape_hatch'`).

**This is the prompt's "2-person rule" confirmation.** The 2-person rule per §50.4.4 is **conditional, not universal**:
- ✓ Required for `61 ≤ duration ≤ 240 min` (one extra `ops_admin`).
- ✓ Required for `241 ≤ duration ≤ 480 min` (one `ops_admin` + one `ops_security_admin`).
- ✓ Required for `console_scope = 'both'`.
- ✓ Required for `justification_category = 'enterprise_escape_hatch'`.
- ✗ NOT required for default 30-minute sessions on a single console scope with a routine justification category.

For Marcus's session (30 min, single-console scope, `category = 'customer_support_investigation'`), no quorum signer is required. Marcus impersonates solo, audited but unquorumed.

**This is intentional per the spec** but it is worth surfacing because the customer-trust framing of "2-person rule" in the project instructions implies pre-action quorum. The actual contract is: pre-action quorum for the *small* fraction of sessions that exceed 60 min or cross consoles; post-action transparency (customer notification within 300s; revocation surface always available) for the remaining majority.

**Customer notification timing window.** The session is `active` at T+0. The notification dispatches "within 300s of `started_at`" (§50.4.1 #4) and the AC sets a p95 SLA of 300s on open-dispatch (§50.4.1 AC #4). **Marcus has at most 5 minutes of unannounced access to read PII / mutate state before the customer Org Owner is notified.**

For a routine session this is acceptable. For a malicious-Ops-user scenario, the 5-minute window is exploitable — read 17 SelectionRecord rows, mutate three RequirementResponse tags, close the session at T+4:55 with `mutation_count=3`, before the Loops.so dispatch completes its retry curve. The notification still fires (the session row exists), but the customer's first window to invoke revocation (§50.4.7) is at T+5:00, and by then the session is already closed.

**No pre-notification dwell is authored.** **D-12V-004** filed (P1, rbac — unannounced-access window).

### 3.2 Step-up re-auth (T+0 ± 5 min)

**Spec contract.** §50.4.1 AC #2 — `step_up_reauthed_at` within 5 min of `started_at`. §50.2.2 #3 — hardware-key MFA required.

**Walk.** Marcus's WorkOS session was step-up-re-authed at T-2 min. `auth_factor_evidence_json` is populated. AC satisfied.

### 3.3 Audit emission (T+1 → T+24 min)

**Spec contract.**
- §50.5.1: `actor_type = 'ops'` writes require `user_id IS NULL`, `ops_session_id IS NOT NULL`, `ops_role_at_write IS NOT NULL`, `ops_justification_ref IS NOT NULL`. Write-time validator `audit_event_actor_type_consistency_validator` asserts; violations return HTTP 422.
- §50.4.1 #3: Every read emits `read`-class Audit Event row (sample rate 1.0).
- §50.5.2: AIOperation with `actor_type = 'ops'` requires `ops_session_id` populated; HTTP 422 on missing.

**Walk.** Marcus reads three SelectionRecord rows + one Defense View artifact + mutates one tag. The system writes:
- 4× `read`-class Audit Event rows, each carrying `actor_type='ops'`, `ops_session_id=marcus.session.id`, `ops_role_at_write='ops_security_admin'`, `ops_justification_ref` populated, `ops_impersonated_user_id=priya.id`.
- 1× mutation Audit Event row with the same fields.

This is correct per §50.5.1. **But** the `read`-class Audit Event row is a category that §4.6.1 was not built for. D-50-011 already flagged this at P2: §4.6.1 schema is built for mutating actions; no read-verb registry, no projection rules, no retention partitioning between read and mutation audit rows.

**Audit chain integrity.** §42.6.1 declares an audit-integrity scan against "every entity that maintains hash-chained audit rows for forensic integrity — §25.3.5 Vendor Disqualification audit chain, §4.6.1 Audit Event hash-chain on high-impact mutations, and §17.8 Selection Record hash." The phrase "**high-impact mutations**" is undefined.

A junior engineer implementing the hash chain has three plausible interpretations:
1. Only mutations to `Plan`, `AIWallet`, `OutcomeContract`, and a fixed allow-list of billing entities are in the hash chain.
2. All `actor_type ∈ {'ops', 'managed_agent', 'system'}` mutations are in the hash chain.
3. All Audit Event rows with the `high_impact = true` boolean (which doesn't currently exist) are in the chain.

The §42.6.1 scan checks integrity but does not declare scope. **If interpretation (1) is implemented, Ops-tagged read-class rows are out-of-scope; the §50.5.1 forensic-grade invariant ("no sampling per the forensic-grade invariant applied to billing reads in §5.2.1.4 and extended here to all Ops reads") is structurally satisfied at write time but not at integrity-scan time.** **D-12V-006** filed (P1, observability / audit integrity).

### 3.4 Quorum (sub-pass — what would happen if duration were 90 min?)

**Spec contract.**
- §50.4.4 #1: 61–240 min requires one additional `ops_admin` signer (distinct from `ops_user_id`).
- §50.4.4 #6: Self-signoff forbidden.
- §50.4.5 #4(f): Break-glass-only — co-signer device-fingerprint distinctness; a co-signer whose WorkOS device fingerprint matches the impersonating Ops user's within 48h emits `ops_impersonation_co_signer_device_collision` PagerDuty page; session auto-force-closes.

**Walk-counterfactual.** If Marcus had requested 90 min, the system would have set `session_state = 'pending_quorum'` per §50.4.3 row 1. The quorum signer would be a second `ops_admin` (e.g., Lily). Lily signs within 24h. State transitions `pending_quorum → active`.

**The anti-collusion device-fingerprint check applies only to break-glass mode**, per §50.4.5 #4(f) explicit scope ("Break-glass attempts ... a co-signer whose WorkOS device fingerprint matches the impersonating Ops user's device fingerprint within a 48-hour window emits..."). For routine §50.4.4 quorum signing (the 61–240 min path that is the modal "2-person rule" trigger), there is no device-fingerprint distinctness check.

**Scenario.** Marcus and Lily share a workstation in a shared Ops office. Marcus is signed in to WorkOS on the workstation; Lily walks in, swaps WorkOS session, signs the quorum. The device fingerprint is identical between the two WorkOS sessions (same browser instance, same userAgent + IP). The collusion guard does NOT fire because §50.4.5 #4(f) scopes only break-glass mode.

**D-12V-005** filed (P1, rbac — anti-collusion device-fingerprint guard not extended to standard §50.4.4 quorum).

### 3.5 Session close + customer notification (T+24 → T+25 min)

**Spec contract.**
- §50.4.3 row 5: `active → closing` on "End session" click; `ended_at` stamped; close notification enqueued.
- §50.4.3 row 6: `closing → closed` on close notification dispatched (or retry curve exhausted).
- §50.4.7 #4: Revocation propagates within 15s of Org Owner's API call.

**Walk.** Marcus clicks "End session" at T+24:30. State transitions `active → closing`. Close-side notification dispatches per §50.4.5: in-app Inbox `ops_session_ended` + Loops.so transactional email. The session transitions `closing → closed` once the close notification is dispatched (in-app within seconds; Loops.so retry curve may take longer).

Per the §50.4.5 close-template body: `"...During the session: 4 reads, 1 mutation. Review the full activity log: {customer_visible_session_link}."`

Priya sees the notification at T+25:30. The customer-visible projection per §50.4.8 exposes the mutation-summary (entity_type, entity_id, action, changes_summary). Priya can challenge any specific mutation via the existing customer-side surfaces.

### 3.6 Force-close contention (sub-pass)

**Spec contract.** §50.7 #5 — concurrent Org Owner revocation + Ops Admin force-close + time-box expiry. Resolution: "force-close wins ties with time-box; customer-owner revoke wins ties with force-close (customer explicit intent); time-box is the passive default." Middleware resolves via Convex transaction ordering.

**Walk.** Not exercised in the routine scenario. Per §50.7 #5, the state-machine ambiguity is explicitly resolved. Coverage adequate.

### 3.7 Cross-section role-name consistency

**Spec contract.**
- §50.3.1 / Appendix J `ops_role_kind`: six canonical roles + variants — `ops_admin`, `ops_audit_reviewer`, `ops_security_admin`, `ops_finance`, `ops_support_agent`, `ops_fraud_analyst` plus pre-existing specialized roles.
- §50.6.4 ¶3 (Break-glass DB access): "Per §50.2.4 ¶4; **dual sign-off (Ops Director + Security Director)**; vaulted key; 72-hour postmortem."

**Walk.** "Ops Director" and "Security Director" are not enum values in `ops_role_kind`. They are **role-name drift** from the matrix. A junior engineer implementing §50.6.4 ¶3 has no canonical mapping — `Ops Director ≟ ops_admin`? `Security Director ≟ ops_security_admin`? Both are plausible. Neither is authoritative.

**D-12V-009** filed (P2, consistency_drift — role-name drift between §50.6.4 ¶3 and Appendix J `ops_role_kind`).

### 3.8 Scenario B — Surfaced defects

Three NEW defects emerged from the Ops impersonation walk:

| New defect | Severity | Class | Hook |
| :---- | :---- | :---- | :---- |
| D-12V-004 | P1 | rbac | No pre-notification dwell on Ops sessions; session is immediately `active` at `started_at` while customer notification has a 300s p95 SLA; a malicious Ops user has a 5-minute unannounced read/mutate window before customer revocation surface becomes invokable. |
| D-12V-005 | P1 | rbac | Anti-collusion device-fingerprint distinctness check at §50.4.5 #4(f) applies only to break-glass mode; standard §50.4.4 quorum (61–240 min and 241–480 min) has no device-fingerprint guard. Two Ops users sharing a workstation can sign a regular 4-hour OpsSession without triggering the collusion guard. |
| D-12V-006 | P1 | observability | §42.6.1 `Audit Event hash-chain on high-impact mutations` does not define "high-impact mutation" scope; whether `actor_type='ops'` rows (especially `read`-class per §50.4.1 #3) are in-scope for the integrity scan is unauthored. Three plausible interpretations produce three different implementations. |
| D-12V-009 | P2 | consistency_drift | §50.6.4 ¶3 names "Ops Director" + "Security Director" as the break-glass DB access dual signers; neither role is in Appendix J `ops_role_kind`. Role-name drift; no canonical mapping. |

**Audit + 2-person-rule confirmation (as required by the task prompt).** Audit emission is comprehensive at the write-time validator layer (§50.5.1), correctly bound across §4.6.1 Audit Event / §4.4.27 OpsActionRecord / §4.8.1 AIOperation extensions (§50.5.1 / §50.5.3 / §50.5.2). The 2-person rule is conditional (not universal) and intentional per §50.4.4; the modal session is solo + audited + post-hoc customer-notified, not solo + audited + pre-quorum. Three structural gaps — pre-notification dwell, anti-collusion guard scope, and audit hash-chain scope — undermine the contract in adversarial scenarios.

---

## 4. New Defect Filings — Cross-Section Consistency

V12 cross-section pass surfaced one additional defect not covered by the per-section structural sweep:

| Defect | Severity | Class | Hook |
| :---- | :---- | :---- | :---- |
| D-12V-010 | P2 | documentation_gap | §46.5 ACs claim "Sections 1-30 ... Sections 31-47 maintain parity"; the V12 cross-section pass confirms the false-parity claim for §42 / §43 / §50 specifically (which are within Sections 31-47 / 48-51 range) — but the V12 pass also surfaces that §50 carries §50.8 + §50.17 + §50.19 ACs that are deliberately consolidated, while §42 / §43 / §46 do not have an aggregate-AC pointer parallel to §50.19. The roll-up convention is inconsistent across the operations cohort. |

---

## 5. Aggregate Defects Filed in V12

10 new defects: 0 P0 · 7 P1 · 3 P2 · 0 P3. All promoted to `_audit/DEFECT_LEDGER.md` under a new "Phase V12 — Adversarial Verification of Phase 12 (Operations / QA / Observability / DR) (2026-05-11)" block.

| Defect ID | Severity | Class | Section anchor |
| :---- | :---- | :---- | :---- |
| D-12V-001 | P1 | acceptance_criteria | §42.3 |
| D-12V-002 | P1 | consistency_drift | §42.3 ↔ §50.6.4 |
| D-12V-003 | P1 | observability | §42 / §50 |
| D-12V-004 | P1 | rbac | §50.4.1 |
| D-12V-005 | P1 | rbac | §50.4.4 ↔ §50.4.5 |
| D-12V-006 | P1 | observability | §42.6.1 |
| D-12V-007 | P2 | acceptance_criteria | §42.3 |
| D-12V-008 | P1 | consistency_drift | §42.3 ↔ §42.6.0 ↔ §43.5.4 ↔ §50.6.4 |
| D-12V-009 | P2 | consistency_drift | §50.6.4 |
| D-12V-010 | P2 | documentation_gap | §46.5 + §42 + §43 |

---

## 6. Self-Challenge Pass (Opus-mandatory)

Re-read each new finding as a hostile reviewer. Severity, evidence, and recommendation tested against the Severity Definitions table and the Defect Ledger Format conventions.

- **D-12V-001 (P1, AC).** Severity tested: could be P2 (a thoughtful staff engineer would assume the on-call primary declares severity and the on-call primary clears the incident; "obvious" by ops convention). Rebuttal: Authoring Convention #2 ("Numbered, testable, observable, measurable, scope-bound") requires an actor to be observable. Junior engineer reading §42.3 in isolation cannot determine declarer; defaults to "on-call primary" implicitly, but the §25.6.2 three-step escalation (5m → 10m → 15m) implies a manager-level role. P1 stands.
- **D-12V-002 (P1, consistency_drift).** Severity tested: is the 48h-vs-72h conflict really a "conflicting numerical singleton" per the P1 rule? Rebuttal: yes — the deadline is the same artifact ("postmortem published") with two homes. Engineering implementing §42 will hit T+48h; engineering implementing §50 will hit T+72h. P1 stands. Recommendation considered for tightening: the §42.3 step 7-8 path declares "Postmortem scheduled within 24 hours; RCA completed within 48 hours" — could be read as RCA-at-48h, postmortem-publish-later (e.g., 72h). The §50.6.4 ¶6 "blameless postmortem within 72 hours" is a single deadline. If the resolution is "RCA at 48h, blameless write-up at 72h", the spec must say so. Recommendation sharpened to: author a unified two-stage timeline (RCA draft at 48h, blameless postmortem published at 72h) and remove the alternate reading.
- **D-12V-003 (P1, observability).** Severity tested: could be P2 (Zendesk → on-call routing is implementation-side, not spec-side). Rebuttal: Authoring Convention #14 (third-party dependency, customer-reported flows) requires the ingest path to be authored when the platform commits to an SLA. §42.1 commits Enterprise to 4-hour critical response; latency-only failures are invisible to detectors so customer-reported routes are load-bearing for the SLA. P1 stands.
- **D-12V-004 (P1, rbac).** Severity tested: is the 5-minute unannounced-access window really unbuildable? Rebuttal: yes — the spec authors the SLA on customer notification (300s p95) but does not author the dwell-before-action contract; an Ops user can read & mutate before the customer is informed; this is the same class of "ambiguous billing surface" → "ambiguous customer-trust surface". Could be P0 by Rule (b) — "exposes PII or PCI scope to an unintended actor" — but the Ops actor IS authorized; the issue is the unannounced window, not unauthorized access. P1 by tiebreaker stands. Recommendation: author a 60s pre-action dwell window where the session is `pending_customer_notified_open` (new enum state) before transitioning to `active`; or, alternatively, defer Ops-actor reads/mutations until `customer_owner_notified_open_at IS NOT NULL`.
- **D-12V-005 (P1, rbac).** Severity tested: could be P2 (collusion is rare in practice; physical-co-location of Ops users is observable via Slack / HR / company directory). Rebuttal: the §50.4.5 #4(f) device-fingerprint check exists *because* the corpus already treats co-location as a real threat, and it scopes the protection only to break-glass mode. The 61–240 min standard quorum signing is the modal "2-person rule" trigger — extending the device-fingerprint guard there is the high-leverage fix. P1 stands.
- **D-12V-006 (P1, observability).** Severity tested: could be P0 by Rule (c) — "violates a hard regulatory requirement (audit-log integrity)". Rebuttal: the audit log writes correctly per §50.5.1 validator; the integrity scan is a verifier on top of the writes. Whether the verifier covers Ops-tagged rows is a documentation gap; the runtime write integrity is preserved either way. P1 by tiebreaker stands. Recommendation: author a per-actor-type coverage column in §42.6.1 job catalog and bind to a CI gate.
- **D-12V-007 (P2, AC).** Severity tested: could be P1 (customer-comms gap on degraded experience). Rebuttal: §42.3 step 4 is explicitly SEV-1/2 scoped; SEV-3 customer-comms absence is intentional but the in-app surface contract is absent. Ambiguity-resolvable; P2 stands.
- **D-12V-008 (P1, consistency_drift).** Severity tested: confirmed. Four severity namespaces in the same corpus is unsustainable; engineering will pick a mapping and it will drift. P1 stands. Recommendation: collapse to one severity ladder (recommend the §42.6.0 PagerDuty P0–P3 ladder with timer-based escalation; map §42.3 SEV-1/2/3 to PagerDuty P1/P2/P3; deprecate the §43.5.4 retired-prose Sev0–Sev3; align §50.6.4 P0/P1 terminology with PagerDuty).
- **D-12V-009 (P2, consistency_drift).** Severity tested: could be P1 if break-glass DB access is plausibly mis-implemented to grant the wrong role. Rebuttal: §50.6.4 ¶3 is narrative reference text; the binding role enforcement is at §50.2.4 ¶4 (the "vaulted key" gate). Drift is documentation, not runtime. P2 stands.
- **D-12V-010 (P2, documentation_gap).** Severity tested: confirmed. Recommendation could be tightened to "author a §42.x + §43.x + §46.x consolidated-AC pointer paralleling §50.19" — done in the recommendation text.

No demotions to P3. No revisions to severity. Recommendation sharpening applied in-place on D-12V-002 (two-stage timeline) and D-12V-004 (pre-action dwell new state).

---

## 7. Counterfactual Pass

Per `Audit_Prompts.md` Global Conventions, three realistic failure modes per scenario; confirm spec coverage.

### 7.1 P0 Incident Walk — Three Failure Modes

1. **Anthropic MCP latency rises but the detector only watches 5xx + timeouts.** Latency-only mode produces no signal. Customer-reported escalation has no spec'd path to on-call. **Covered by D-42-004 / D-42-006 + new D-12V-003.**
2. **Postmortem deadline disagreement between teams.** §42 reader hits T+48h; §50 reader hits T+72h. **Covered by new D-12V-002.**
3. **Slack itself down during a P0 incident.** §42.3 step 3 names Slack as the war-room channel; no fallback authored. **Covered by D-42-023 (meta-observability cluster).**

### 7.2 Ops Impersonation Walk — Three Failure Modes

1. **Malicious Ops user uses the 5-min pre-notification window.** Reads PII, mutates state, closes session before Loops.so dispatch completes its retry curve. **Covered by new D-12V-004.**
2. **Two Ops users share a workstation during 4-hour quorum signing.** Anti-collusion device-fingerprint guard scoped only to break-glass mode. **Covered by new D-12V-005.**
3. **Audit-integrity scan implementation excludes `actor_type='ops'` rows.** The §42.6.1 "high-impact mutation" scope is undefined; three plausible interpretations. **Covered by new D-12V-006.**

All six failure modes resolved against the spec; new defect coverage closes the gaps not captured by per-section structural prompts.

---

## 8. Sign-Off Determination

**Prompt sign-off rule.** "SIGN-OFF — zero P0 observability / ops."

**Inherited P0 cluster (8 rows).**
- D-42-001 (observability): revenue-affecting services without SLO/alerting.
- D-43-001 (rbac): `is_staff` boolean incompatible with §50.3.
- D-43-002 (rbac / CI gate): 14 Ops capabilities absent from envelope; trips CI gate.
- D-43-003 (firewall_leakage): §43.3 customer impersonation bypasses §50.4 safety.
- D-43-004 (data_model): parallel `admin_audit_log` table bifurcates audit pattern.
- D-43-005 (dsar): unverified GDPR DSAR fulfillment violates Article 12.
- D-43-006 (firewall_leakage): one-click workspace export bypasses §50.2.3.
- D-50-006 (numerical_singleton / revenue): plan-tier manual override Ops surface unauthored.

**V12 new defect cluster (10 rows; 0 P0 · 7 P1 · 3 P2).** No new P0 surfaced by the V12 adversarial passes.

**Initial Verdict (V12 audit close, 2026-05-11): HALT.** The Global Verification Protocol rule applies: "If any V prompt finds an unresolved P0 or P1 defect, STOP. Do not advance. Append remediation tasks and resolve before continuing." The 8 inherited P0 defects alone trigger HALT; the additional 7 P1 defects from V12 strengthen the case. The cumulative §42 / §43 / §46 / §50 backlog at v7.1.0 is **8 P0 · 78 P1 · 29 P2 · 8 P3 = 123 defects**.

**Post-Remediation Verdict (V12 spec-side remediation pass close, 2026-05-11): HALT → PASS.** Following the V12 remediation pass (§43 retirement; §42 substantive rewrite; §46 full V12 rewrite; §50 extension with §50.20–§50.30 surfaces + §50.31 cross-cutting patches; Appendix J / K / I / M.5 / M.1 batch updates; 11 Authored Extensions AE-V12-01 through AE-V12-11 registered), all 123 defects transition `open → remediated 2026-05-11`. See `DEFECT_LEDGER.md → Phase V12 Remediation Closure (2026-05-11)` for per-defect closure citations and `_integration/RECONCILIATION.md → Phase V12 Remediation (2026-05-11)` for the integration-program decision record. v7.1.1 stamp gate inheritance set: AE-V12-01 through AE-V12-11 ratifications + 32 new CI gate runtime wirings (M02.3 / M11.3 / M21.3 / M24.3 / release-orchestration `tools/release/stamp_gate.ts`) + Appendix G V12 PostHog event registrations (mechanical hygiene pack).

**Path to sign-off.** The 8 inherited P0 defects map to two distinct remediation packs:

1. **§43 retirement pack** (closes D-43-001, D-43-002, D-43-003, D-43-004, D-43-005, D-43-006). §43 is superseded by §50 per the §50.1 preamble; the simplest remediation is to retire §43.1–§43.5 prose to a one-paragraph retirement banner that hard-routes all admin-tooling implementation to §50. This collapses six P0 defects to zero in one structural edit. Per PHASE43_FINDINGS coupling analysis: D-43-001 / -002 / -007 / -018 close via the same edit; D-43-003 / -006 close via the §50.4 / §50.2.3 contract enforcement; D-43-004 / -009 close via the `admin_audit_log` table retirement to §4.6.1.

2. **§50 Plan-Override + §42 Revenue-Metric pack** (closes D-50-006, D-42-001). Author the Plan-Tier Manual Override Ops Surface as §50.X (matching §50.12 Pricing Admin authoring fidelity); author the missing revenue-affecting alarms in §42.2 (AIOperation acceptance, AIWallet debit, OutcomeContract settlement, Stripe meter-event submission, Solo per-eval / per-bid charge) and bind to per-service SLOs.

**Downstream impact.**
- v7.1.1 stamp gate inherits the entire 123-defect backlog as v7.1.1 P0/P1-blockers. The v7.1.1 release cannot stamp until all 8 P0s close.
- Phase 11.5 M.1 Engine-Concept Backfill (the deferred Phase V11 carry-over) is unblocked by V12 — the V12 audit does not depend on the M.1 backfill landing first.
- §46 test-strategy P1 cluster (12 rows) maps to the §46 rewrite that must follow the §43 retirement (because §46's feature-flag catalog at §46.4 contains Solo-wallet conflicts that resolve only after §44.6 entitlement is consistent with §50 Ops Console authoring).

---

## 9. Promoted to DEFECT_LEDGER.md

10 defects promoted in a single block: `## Phase V12 — Adversarial Verification of Phase 12 (Operations / QA / Observability / DR) (2026-05-11)`. New IDs `D-12V-001` through `D-12V-010`. `status = open` on all rows. Coverage Matrix cell prescriptions are queued for the v7.1.1 mechanical hygiene pass (following the §50 / §46 precedent of deferring aggregate counter recomputation to the next mechanical apply).

---

## 10. Forward References

- v7.1.1 stamp gate inherits D-12V-001 through D-12V-010 as P1/P2-blocking remediations.
- §43 retirement pack (post-V12) is the highest-leverage closure path: it resolves 6 of the 8 inherited P0 defects in a single structural edit.
- §50.6.4 ¶3 role-name drift (D-12V-009) couples with PHASE50 D-50-029 (`ops_content_admin` drift). Both close via a single Appendix J `ops_role_kind` extension pass.
- §42.3 incident-process actor enumeration (D-12V-001) couples with PHASE42 D-42-012 (§42.7 AC #2 actor undefined). Both close via a single §42.3 rewrite that names actors per step.
- §42.6.1 hash-chain scope (D-12V-006) couples with PHASE50 D-50-011 (read-class Audit Event schema absent). Both require a §4.6.1 schema extension authored alongside the integrity-scan scope.
